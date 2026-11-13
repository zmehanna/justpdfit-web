/* JustPDFit local OCR for scanned signature labels.
 * Rendered pages and recognized text never leave the current browser.
 * Tesseract model assets load from the CDN; no PDF image sent to the server.
 */
(()=>{"use strict";
 const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9\u0600-\u06ff ]/g," ").replace(/\s+/g," ").trim();
 function extractLine(doc){
  const lines=[...doc.querySelectorAll(".ocr_line,.ocrx_line")],result=[];
  for(const el of lines){
   const words=[...el.querySelectorAll(".ocrx_word")].map(w=>{
    const bbox=(w.getAttribute("title")||"").match(/bbox\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);
    return {text:norm(w.textContent),raw:String(w.textContent||"").trim(),bbox:bbox?bbox.slice(1).map(Number):null};
   }).filter(w=>w.text&&w.bbox);
   const line=norm(el.textContent||"");
   const dateLabel=/(?:\bdate\b|fait en|exemplaire|dated|le\s*:\s*$|التاريخ)/i.test(line);
   if(!/signature|sign here|signe|توقيع|امضاء/.test(line)&&!dateLabel)continue;
   if(dateLabel&&!/signature|sign here|signe|توقيع|امضاء/.test(line)){
    const dateWords=words.filter(w=>/date|fait|exemplaire|le|التاريخ/.test(w.text));
    const target=dateWords.length?dateWords:words;
    if(target.length){
     result.push({label:el.textContent.trim().slice(0,110),score:/date|fait en deux|exemplaire/.test(line)?.89:.66,bbox:[Math.min(...target.map(w=>w.bbox[0])),Math.min(...target.map(w=>w.bbox[1])),Math.max(...target.map(w=>w.bbox[2])),Math.max(...target.map(w=>w.bbox[3]))],kind:"date"});
    }
   }
   // Detect the specific insured signature words, rather than centering a line
   // that may also contain a subcontractor's signature in a second column.
   for(let i=0;i<words.length;i++){
    if(!/^(signature|signe|sign)$/.test(words[i].text))continue;
    const follow=words.slice(i,i+5),phrase=follow.map(w=>w.text).join(" ");
    let end=i,confidence=.68;
    if(/assur|insured/.test(phrase)){
     end=Math.min(words.length-1,i+4);
     const insured=words.findIndex((w,j)=>j>=i&&j<i+5&&/assur|insured/.test(w.text));
     if(insured>=0)end=insured;
     confidence=.96;
    }else if(/sous traitant|subcontractor|sous traitance/.test(phrase))continue;
    const subset=words.slice(i,end+1);
    const box=[Math.min(...subset.map(w=>w.bbox[0])),Math.min(...subset.map(w=>w.bbox[1])),Math.max(...subset.map(w=>w.bbox[2])),Math.max(...subset.map(w=>w.bbox[3]))];
    result.push({label:subset.map(w=>w.raw).join(" ").slice(0,110),score:confidence,bbox:box,kind:"signature"});
   }
  }
  return result.sort((a,b)=>b.score-a.score);
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
     anchors.push({page:n,label:line.label,x:px,y:py,source:"ocr",kind:line.kind||"signature",confidence:line.score});
    }
   }
  }finally{await worker.terminate();}
  return anchors.sort((a,b)=>b.confidence-a.confidence);
 }
 window.JustPDFitLocalOCR={search};
})();