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

function scaleFooter(pageWidth){
 const size=Math.max(6,Math.min(9,pageWidth/60));
 return size;
}
function stamp(doc){
 if(!window.PDFLib)throw Error("Moteur PDF indisponible");
 const {PDFString,StandardFonts,rgb}=PDFLib;
 return doc.embedFont(StandardFonts.Helvetica).then(font=>{
  for(const page of doc.getPages()){
   const {width,height}=page.getSize();
   if(width<80||height<45)continue;
   const size=scaleFooter(width);
   const textWidth=font.widthOfTextAtSize(TEXT,size);
   const x=Math.max(6,(width-textWidth)/2),y=Math.max(5,Math.min(12,height*.025));
   page.drawRectangle({x:0,y:Math.max(0,y-5),width,height:Math.min(22,height*.12),color:rgb(1,1,1),opacity:.86});
   page.drawText(TEXT,{x,y,size,font,color:rgb(.38,.42,.53)});
   const rect=[x-4,y-5,Math.min(width-2,x+textWidth+4),y+size+4];
   const action=doc.context.obj({
    Type:"Annot",Subtype:"Link",Rect:rect,Border:[0,0,0],
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
