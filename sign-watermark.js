/* JustPDFit signature PDF footer: clickable annotation on each page.
   The PDF is processed in the browser; payment receipt verification requires a dedicated backend. */
(() => {
"use strict";
const SITE="https://justpdfit.com/";
const TEXT="Signé avec JustPDFit.com";
const PRICE=199;
const cfg=window.JustPDFitPaymentConfig || {};
const backend=typeof cfg.endpoint==="string"&&/^https:\/\/[a-z0-9.-]+\/?$/i.test(cfg.endpoint)
  ?cfg.endpoint.replace(/\/$/,""):null;

// Tiny horizontal attribution flush to the lower-right edge, below normal
// pagination/footer baselines. The paid option never calls stamp().
function stamp(doc){
 if(!window.PDFLib)throw Error("PDF engine unavailable");
 const {PDFString,StandardFonts,rgb}=PDFLib;
 return Promise.all([
  doc.embedFont(StandardFonts.Helvetica),
  doc.embedFont(StandardFonts.HelveticaBold)
 ]).then(([regular,bold])=>{
  const parts=[
   {text:"Just",font:regular,color:rgb(.12,.18,.32)},
   {text:"PDF",font:bold,color:rgb(.93,.07,.33)},
   {text:"it.com",font:regular,color:rgb(.12,.18,.32)}
  ];
  for(const page of doc.getPages()){
   const {width,height}=page.getSize();
   if(width<100||height<65)continue;
   // Reserve the bottommost 8 PDF points (2.8 mm) for this tiny credit.
   // Page numbers normally sit above this strip, so do not overlay them.
   const size=Math.max(4.5,Math.min(6.5,width/100));
   const gap=size*.12;
   const totalWidth=parts.reduce((sum,p)=>sum+p.font.widthOfTextAtSize(p.text,size),0)+gap*2;
   const x=Math.max(2,width-totalWidth-5),y=2.2;
   let offset=0;
   for(const part of parts){
    page.drawText(part.text,{x:x+offset,y,size,font:part.font,color:part.color,opacity:.78});
    offset+=part.font.widthOfTextAtSize(part.text,size)+gap;
   }
   const action=doc.context.obj({
    Type:"Annot",Subtype:"Link",
    Rect:[Math.max(0,x-2),0,Math.min(width,x+totalWidth+2),Math.min(height,10)],
    Border:[0,0,0],
    A:{Type:"Action",S:"URI",URI:PDFString.of(SITE)}
   });
   page.node.addAnnot(doc.context.register(action));
  }
 });
}
async function digestFingerprint(rawBytes){
 // The purchase applies to one original PDF, independently of later signature edits.
 const bytes=rawBytes instanceof Uint8Array?rawBytes:new Uint8Array(rawBytes);
 const hash=await crypto.subtle.digest("SHA-256",bytes);
 return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
async function jsonRequest(path,data){
 if(!backend)throw Error("Paiement sécurisé non activé pour JustPDFit.");
 const response=await fetch(backend+path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
 const result=await response.json().catch(()=>({error:"Service de paiement indisponible."}));
 if(!response.ok)throw Error(result.error||"Paiement non disponible.");
 return result;
}
window.JustPDFitWatermark={
 SITE,TEXT,PRICE,stamp,backendReady:!!backend,
 fingerprint:digestFingerprint,
 createCheckout:async fingerprint=>jsonRequest("/checkout",{fingerprint,kind:"solo-clean",locale:window.JustPDFItI18n?.getLanguage?.()||"en"}),
 verifyCheckout:async (sessionId,fingerprint)=>jsonRequest("/verify",{sessionId,fingerprint})
};
})();
