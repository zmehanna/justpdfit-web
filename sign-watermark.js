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

// Small branded, diagonal and clickable attribution in the bottom-right corner
// of free signed documents. Nothing is stamped on an unlocked paid document.
function stamp(doc){
 if(!window.PDFLib)throw Error("PDF engine unavailable");
 const {PDFString,StandardFonts,rgb,degrees}=PDFLib;
 return Promise.all([
  doc.embedFont(StandardFonts.Helvetica),
  doc.embedFont(StandardFonts.HelveticaBold)
 ]).then(([regular,bold])=>{
  const segments=[
   {text:"Just",font:regular,color:rgb(.12,.18,.32)},
   {text:"PDF",font:bold,color:rgb(.93,.07,.33)},
   {text:"it.com",font:regular,color:rgb(.12,.18,.32)}
  ];
  const radians=Math.PI/6,cos=Math.cos(radians),sin=Math.sin(radians);
  for(const page of doc.getPages()){
   const {width,height}=page.getSize();
   if(width<100||height<65)continue;
   const size=Math.max(6,Math.min(10,width/65));
   const gap=size*.17;
   const textWidth=segments.reduce((n,part)=>n+part.font.widthOfTextAtSize(part.text,size),0)+gap*2;
   // Fit the entire rotated annotation inside the PDF crop area.
   const margin=Math.max(7,Math.min(12,width*.018));
   const x=Math.max(size*.65,width-margin-textWidth*cos);
   const y=Math.max(8,Math.min(12,height*.02));
   let advance=0;
   for(const part of segments){
    page.drawText(part.text,{
     x:x+advance*cos,y:y+advance*sin,size,font:part.font,color:part.color,
     rotate:degrees(30),opacity:.82
    });
    advance+=part.font.widthOfTextAtSize(part.text,size)+gap;
   }
   // PDF link annotations must use an axis-aligned rectangle. Allow for
   // glyph ascent above the baseline and modest padding for touch targets.
   const left=Math.max(0,x-size*sin-3),bottom=Math.max(0,y-4);
   const right=Math.min(width,x+textWidth*cos+3);
   const top=Math.min(height,y+textWidth*sin+size*cos+4);
   const action=doc.context.obj({
    Type:"Annot",Subtype:"Link",Rect:[left,bottom,right,top],Border:[0,0,0],
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
