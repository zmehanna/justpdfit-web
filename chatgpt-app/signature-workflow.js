import { PDFDocument } from "pdf-lib";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { fromBase64, LIMIT } from "./operations.js";

const markers = /\b(signature|signatures|signataire|signer|signed|sign here|bailleur|preneur|locataire|lu et approuv|approuv[eé])\b/i;
export async function analyzeSignatures(pdf64) {
 const bytes=fromBase64(pdf64);
 const doc=await PDFDocument.load(bytes,{ignoreEncryption:false});
 const count=doc.getPageCount();
 if(count<1||count>300)throw Error("PDF page count outside supported range");
 const candidates=[];
 let textPages=0;
 const loadingTask=getDocument({data:new Uint8Array(bytes),useSystemFonts:true,disableFontFace:true,isEvalSupported:false});
 const pdfjs=await loadingTask.promise;
 try{
   const indices=Array.from({length:Math.min(count,10)},(_,i)=>count-Math.min(count,10)+i);
   for(const i of indices){
     const page=await pdfjs.getPage(i+1);
     const content=await page.getTextContent();
     const items=content.items.filter(v=>typeof v.str==="string"&&v.str.trim());
     if(items.length>0)textPages++;
     // Join adjacent text items by y-coordinate so fragmented "Signature(s)" labels are found.
     const lines=new Map();
     for(const item of items){
       const y=Math.round(item.transform[5]/8)*8;
       const line=lines.get(y)||[];
       line.push({text:item.str,x:item.transform[4],y:item.transform[5]});
       lines.set(y,line);
     }
     for(const fragments of lines.values()){
       fragments.sort((a,b)=>a.x-b.x);
       const line=fragments.map(v=>v.text).join(" ");
       if(!markers.test(line))continue;
       const width=doc.getPage(i).getWidth(),height=doc.getPage(i).getHeight();
       const x=Math.min(Math.max(25,fragments[0].x),Math.max(25,width-220));
       const y=Math.max(35,Math.min(height-55,fragments[0].y-48));
       // Treat these coordinates as suggestions, never unattended final signature placements.
       candidates.push({page:i+1,x:Math.round(x),y:Math.round(y),source:"text-marker",context:line.slice(0,100),confidence:"medium",requiresConfirmation:true});
     }
     page.cleanup();
   }
 }finally{await loadingTask.destroy()}
 const unique=[];
 for(const c of candidates.reverse()){
   if(!unique.some(v=>v.page===c.page&&Math.abs(v.x-c.x)<35&&Math.abs(v.y-c.y)<35))unique.push(c);
   if(unique.length>=6)break;
 }
 const last=doc.getPage(count-1);
 return {
  pages:count,
  dimensions:doc.getPages().map((p,i)=>({page:i+1,width:Math.round(p.getWidth()),height:Math.round(p.getHeight())})),
  candidates:unique,
  scanOrImageOnly:textPages===0,
  requiresConfirmation:true,
  canAutoPlace:false,
  message:textPages===0
   ?"This appears to be a scanned or image-only PDF. Signature locations cannot be verified automatically. Select the page and position in the preview before signing."
   :unique.length
    ?"Suggested regions were inferred from text labels only. Visually verify that no text or original signature will be covered."
    :"No signature labels could be detected. Choose a location manually in the preview."
 };
}
export async function readChatFile(file){
 if(!file||typeof file!=="object"||typeof file.download_url!=="string"||typeof file.file_id!=="string")throw Error("Missing ChatGPT file reference");
 const url=new URL(file.download_url);
 const host=url.hostname.toLowerCase();
 if(url.protocol!=="https:"||url.username||url.password||url.port|| !(
   host==="chatgpt.com"||host==="files.oaiusercontent.com"||host.endsWith(".oaiusercontent.com")||
   host==="openai.com"||host.endsWith(".openai.com")
 ))throw Error("Untrusted file host. Select the file through the JustPDFit widget instead.");
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),12000);
 try{
   const response=await fetch(url,{redirect:"error",signal:controller.signal,headers:{accept:"application/pdf,application/octet-stream"}});
   if(!response.ok)throw Error("ChatGPT file could not be downloaded");
   const reader=response.body?.getReader();
   if(!reader)throw Error("Empty file response");
   const chunks=[];let size=0;
   for(;;){
     const {done,value}=await reader.read();
     if(done)break;
     size+=value.byteLength;
     if(size>LIMIT){reader.cancel();throw Error("PDF exceeds the 2MB server limit")}
     chunks.push(value);
   }
   const buffer=Buffer.concat(chunks.map(x=>Buffer.from(x)));
   if(buffer.subarray(0,5).toString("latin1")!=="%PDF-")throw Error("The selected file is not a PDF");
   return buffer.toString("base64");
 }finally{clearTimeout(timeout)}
}
