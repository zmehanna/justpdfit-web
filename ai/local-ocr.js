/* JustPDFit local OCR for scanned signature labels.
 * Rendered pages and recognized text never leave the current browser.
 * Tesseract model assets load from the CDN; no PDF image sent to the server.
 */
(()=>{"use strict";
 const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9\u0600-\u06ff ]/g," ").replace(/\s+/g," ").trim();
 function extractLine(doc){
  const lines=[...doc.querySelectorAll(".ocr_line,.ocrx_line")];
  const result=[];
  for(const el of lines){
   const raw=el.textContent||"",txt=norm(raw);
   if(!txt||!(/sign|assur|insured|توقيع|امضاء/.test(txt)))continue;
   const m=(el.getAttribute("title")||"").match(/bbox\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);
   if(!m)continue;
   const score=/(signature|signe|sign here|signataire|توقيع|امضاء)/.test(txt)?(/assur|insured/.test(txt)?0.96:0.75):0.35;
   if(score<0.70)continue;
   result.push({label:raw.trim().slice(0,120),score,bbox:m.slice(1).map(Number)});
  }
  return result;
 }
 async function search(pdfDoc,pageNumbers,onProgress){
  if(!pdfDoc||!window.Tesseract?.createWorker)throw Error("ocr_not_available");
  const selected=[...new Set(pageNumbers)].filter(n=>Number.isInteger(n)&&n>=1&&n<=pdfDoc.numPages).slice(0,4);
  if(!selected.length)return [];
  const worker=await Tesseract.createWorker("fra+eng",1);
  const anchors=[];
  try{
   for(const n of selected){
    if(onProgress)onProgress(n,selected.length);
    const page=await pdfDoc.getPage(n);
    const native=page.getViewport({scale:1});
    const scale=Math.min(2.2,1800/Math.max(native.width,native.height));
    const viewport=page.getViewport({scale});
    const canvas=document.createElement("canvas");
    canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
    await page.render({canvasContext:canvas.getContext("2d"),viewport}).promise;
    const response=await worker.recognize(canvas,{}, {hocr:true});
    const hocr=response?.data?.hocr||"";
    if(!hocr)continue;
    const parser=new DOMParser(),parsed=parser.parseFromString(hocr,"text/html");
    for(const line of extractLine(parsed)){
     const [x1,y1,x2,y2]=line.bbox;
     // Use PDF.js transformations, not the browser display dimensions.
     const [px,py]=viewport.convertToPdfPoint((x1+x2)/2,y2);
     if(!Number.isFinite(px)||!Number.isFinite(py))continue;
     anchors.push({page:n,label:line.label,x:px,y:py,source:"ocr",confidence:line.score});
    }
   }
  }finally{await worker.terminate();}
  return anchors.sort((a,b)=>b.confidence-a.confidence);
 }
 window.JustPDFitLocalOCR={search};
})();