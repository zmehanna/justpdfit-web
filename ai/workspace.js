/* JustPDFit AI local PDF workshop: no network calls or AI credential required. */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const texts={
en:{badge:"PDF workspace · beta",heading:"Tell us what to do with your PDF",lead:"Describe the change, upload your PDF, review the actions, and preview the result before downloading. Your PDF stays on your device.",section1:"1. Document & instructions",fileLabel:"Choose a PDF",promptLabel:"Your instructions",interpret:"Understand request",limitations:"This version understands supported commands locally, not through a generative AI model. Confirm the actions below. Existing PDF text cannot be replaced, and signature fields are not detected automatically.",section2:"2. Confirm PDF actions",removeLabel:"Delete a page",removePageLabel:"Page to delete",numPagesLabel:"Pages in file",dateLabel:"Add today's date",datePageLabel:"On original page",datePositionLabel:"Position",signLabel:"Add my handwritten signature",signPageLabel:"On original page",signPositionLabel:"Position",signatureLabel:"Draw your signature here",clearSign:"Clear signature",security:"The original is never changed. A drawn signature is not an identity-verified electronic signature.",previewBtn:"Preview changes",resetBtn:"Reset",section3:"3. Preview & export",emptyPreview:"Your modified document will appear here after you click Preview changes.",priceNote:"Free export includes a clickable JustPDFit watermark. No payment required.",download:"Download PDF with watermark",advanced:"Advanced PDF editor",privacy:"Privacy: PDFs and signatures are processed in your browser, with no upload to an AI service.",initial:"Load a PDF to start.",loaded:"PDF loaded. Review your instructions and preview the result.",understood:"Actions detected. Check the selected pages and confirm with Preview changes.",unsupported:"No supported operation found. Use the action controls or the advanced PDF editor.",noFile:"Choose a PDF first.",invalid:"This file cannot be opened as a PDF.",noAction:"Select an action first.",deleteLast:"You cannot delete every page.",badPage:"One of the selected page numbers is invalid or refers to a deleted page.",signMissing:"Draw your signature before previewing.",working:"Preparing the preview locally…",ready:"Preview ready. Download when you are satisfied.",fail:"Could not prepare this PDF. Try a non-encrypted file.",positions:["Bottom right","Bottom left","Top right"],signatureAlt:"Signature drawing pad"},
fr:{badge:"Atelier PDF · bêta",heading:"Décrivez ce que vous voulez faire avec votre PDF",lead:"Décrivez la modification, ajoutez votre PDF, contrôlez les actions et prévisualisez le résultat avant de télécharger. Votre PDF reste sur votre appareil.",section1:"1. Document et instructions",fileLabel:"Choisir un PDF",promptLabel:"Votre demande",interpret:"Comprendre la demande",limitations:"Cette version comprend les commandes prises en charge localement, sans modèle d'IA générative. Vérifiez les actions. Le texte d'origine ne peut pas être remplacé et les champs de signature ne sont pas détectés automatiquement.",section2:"2. Vérifier les modifications",removeLabel:"Supprimer une page",removePageLabel:"Page à supprimer",numPagesLabel:"Nombre de pages",dateLabel:"Ajouter la date du jour",datePageLabel:"Sur la page d'origine",datePositionLabel:"Position",signLabel:"Ajouter ma signature manuscrite",signPageLabel:"Sur la page d'origine",signPositionLabel:"Position",signatureLabel:"Dessinez votre signature ici",clearSign:"Effacer la signature",security:"Le fichier original reste inchangé. Une signature dessinée ne vérifie pas automatiquement l'identité du signataire.",previewBtn:"Prévisualiser les modifications",resetBtn:"Réinitialiser",section3:"3. Aperçu et export",emptyPreview:"Le PDF modifié apparaîtra ici après prévisualisation.",priceNote:"L'export gratuit inclut un filigrane JustPDFit cliquable. Aucun paiement nécessaire.",download:"Télécharger avec filigrane",advanced:"Éditeur PDF avancé",privacy:"Confidentialité : PDF et signatures restent traités dans votre navigateur, sans envoi à une IA.",initial:"Ajoutez un PDF pour commencer.",loaded:"PDF chargé. Vérifiez les instructions et prévisualisez.",understood:"Actions identifiées. Vérifiez les pages et lancez la prévisualisation.",unsupported:"Aucune opération prise en charge identifiée. Utilisez les contrôles ou l'éditeur avancé.",noFile:"Sélectionnez un PDF.",invalid:"Impossible d'ouvrir ce fichier PDF.",noAction:"Sélectionnez une action.",deleteLast:"Impossible de supprimer toutes les pages.",badPage:"Un numéro de page est incorrect ou une action cible une page supprimée.",signMissing:"Dessinez votre signature avant de prévisualiser.",working:"Préparation de l'aperçu local…",ready:"Aperçu prêt. Téléchargez après vérification.",fail:"Impossible de préparer le fichier. Essayez un PDF non chiffré.",positions:["En bas à droite","En bas à gauche","En haut à droite"],signatureAlt:"Zone de dessin de signature"},
ar:{badge:"مساحة PDF · تجريبي",heading:"أخبرنا ماذا تريد أن تفعل بملف PDF",lead:"اكتب طلبك وارفع ملف PDF وراجع الخطوات وشاهد النتيجة قبل التنزيل. يبقى الملف على جهازك.",section1:"1. المستند والتعليمات",fileLabel:"اختر ملف PDF",promptLabel:"طلبك",interpret:"فهم الطلب",limitations:"تفهم هذه النسخة أوامر محددة محلياً من دون نموذج ذكاء اصطناعي توليدي. راجع الخطوات. لا يمكن استبدال النص الأصلي أو اكتشاف حقول التوقيع تلقائياً.",section2:"2. تأكيد التعديلات",removeLabel:"حذف صفحة",removePageLabel:"الصفحة المطلوب حذفها",numPagesLabel:"عدد الصفحات",dateLabel:"إضافة تاريخ اليوم",datePageLabel:"على الصفحة الأصلية",datePositionLabel:"الموقع",signLabel:"إضافة توقيعي بخط اليد",signPageLabel:"على الصفحة الأصلية",signPositionLabel:"الموقع",signatureLabel:"ارسم توقيعك هنا",clearSign:"مسح التوقيع",security:"لا يتم تغيير الملف الأصلي. التوقيع المرسوم ليس توقيعاً موثّق الهوية.",previewBtn:"معاينة التعديلات",resetBtn:"إعادة تعيين",section3:"3. معاينة وتصدير",emptyPreview:"ستظهر معاينة المستند بعد الضغط على زر المعاينة.",priceNote:"التصدير المجاني يتضمن علامة JustPDFit قابلة للنقر، دون دفع.",download:"تنزيل PDF بالعلامة",advanced:"محرر PDF المتقدم",privacy:"الخصوصية: يُعالج الملف والتوقيع داخل المتصفح ولا يُرسلان إلى خدمة ذكاء اصطناعي.",initial:"ارفع ملف PDF للبدء.",loaded:"تم تحميل PDF. راجع التعليمات ثم عاين.",understood:"تم تحديد الخطوات. تأكد من أرقام الصفحات ثم عاين.",unsupported:"لم أتعرف على أمر مدعوم. استخدم الخيارات أو المحرر.",noFile:"اختر ملف PDF أولاً.",invalid:"تعذر فتح ملف PDF.",noAction:"اختر تعديلاً أولاً.",deleteLast:"لا يمكن حذف كل الصفحات.",badPage:"رقم صفحة غير صالح أو تم حذف الصفحة المستهدفة.",signMissing:"ارسم توقيعك قبل المعاينة.",working:"جار إعداد المعاينة محلياً…",ready:"المعاينة جاهزة. نزّل الملف بعد التحقق.",fail:"تعذر تجهيز هذا الملف. جرب ملفاً غير مشفر.",positions:["أسفل اليمين","أسفل اليسار","أعلى اليمين"],signatureAlt:"لوحة رسم التوقيع"}};
const lang=(new URLSearchParams(location.search).get("lang")||navigator.language||"en").toLowerCase().slice(0,2);
const locale=Object.hasOwn(texts,lang)?lang:"en",t=texts[locale];document.documentElement.lang=locale;if(locale==="ar")document.documentElement.dir="rtl";
for(const [id,value] of Object.entries(t)){const el=$(id);if(el&&typeof value==="string"&&id!=="initial"){el.textContent=value;}}
$("status").textContent=t.initial;$("signature").setAttribute("aria-label",t.signatureAlt);
["datePosition","signPosition"].forEach(id=>Array.from($(id).options).forEach((o,i)=>o.textContent=t.positions[i]));
$("advanced").href="../edit-pdf/?lang="+locale;
const urlParams=new URLSearchParams(location.search);
if(urlParams.has("request"))$("prompt").value=(urlParams.get("request")||"").slice(0,600);
let fileBytes=null,fileName="document.pdf",pageTotal=0,previewBytes=null,previewUrl=null,drawing=false,hasInk=false;
function status(message,kind){const el=$("status");el.textContent=message;el.className="ai-status"+(kind?" "+kind:"");}
function invalidate(){previewBytes=null;$("download").disabled=true;$("preview").hidden=true;$("emptyPreview").hidden=false;if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl=null;}}
const canvas=$("signature"),ctx=canvas.getContext("2d");
ctx.strokeStyle="#182d50";ctx.lineWidth=3.4;ctx.lineCap="round";ctx.lineJoin="round";
function coords(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height};}
canvas.addEventListener("pointerdown",e=>{e.preventDefault();canvas.setPointerCapture(e.pointerId);drawing=true;hasInk=true;const p=coords(e);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+.15,p.y+.15);ctx.stroke();invalidate();});
canvas.addEventListener("pointermove",e=>{if(!drawing)return;e.preventDefault();const p=coords(e);ctx.lineTo(p.x,p.y);ctx.stroke();});
["pointerup","pointercancel"].forEach(event=>canvas.addEventListener(event,()=>drawing=false));
$("clearSign").addEventListener("click",()=>{ctx.clearRect(0,0,canvas.width,canvas.height);hasInk=false;invalidate();});
function pageNum(id){return Number($(id).value);}
async function load(){
invalidate();fileBytes=null;pageTotal=0;$("pageCount").value="—";
const f=$("file").files&&$("file").files[0];if(!f)return;
if(!/\.pdf$/i.test(f.name)&&f.type!=="application/pdf"){status(t.invalid,"error");return;}
try{fileBytes=new Uint8Array(await f.arrayBuffer());const pdf=await PDFLib.PDFDocument.load(fileBytes,{ignoreEncryption:false});pageTotal=pdf.getPageCount();if(pageTotal<1)throw Error("Empty PDF");fileName=f.name;$("pageCount").value=String(pageTotal);$("removePage").max=pageTotal;$("datePage").max=pageTotal;$("signPage").max=pageTotal;$("signPage").value=pageTotal;status(t.loaded,"ok");if($("prompt").value.trim())interpret();}
catch(e){fileBytes=null;status(t.invalid,"error");}
}
$("file").addEventListener("change",load);
function extractNumber(q,words){
 for(const word of words){const re=new RegExp("(?:"+word+")[^\\d]{0,25}(\\d{1,4})","i");const m=q.match(re);if(m)return Number(m[1]);}
 return null;
}
function interpret(){
 const q=$("prompt").value.trim().toLowerCase();if(!q){status(t.unsupported);return;}
 const deleteHit=/delete|remove|supprim|enlev|retir|effac|حذف|إزالة|احذف|امسح/.test(q)&&/page|صفح/.test(q);
 const dateHit=/today|current date|date du jour|aujourd|date|تاريخ|اليوم/.test(q);
 const signHit=/sign|signature|signer|signe|توقيع|وقّع|امضا/.test(q);
 $("remove").checked=deleteHit;$("date").checked=dateHit;$("sign").checked=signHit;
 if(deleteHit){const n=extractNumber(q,["(?:delete|remove|supprim\\w*|retir\\w*|حذف|احذف)[^\\d]{0,15}(?:page|صفح\\w*)?","(?:page|صفح\\w*)"]);if(n)$("removePage").value=n;}
 const last=/last page|derni[eè]re page|final page|الصفحة الأخيرة|آخر صفحة/.test(q);
 if(signHit)$("signPage").value=last&&pageTotal?pageTotal:1;
 if(dateHit)$("datePage").value=last&&pageTotal?pageTotal:1;
 invalidate();status(deleteHit||dateHit||signHit?t.understood:t.unsupported,deleteHit||dateHit||signHit?"ok":"");
}
$("interpret").addEventListener("click",interpret);
function position(page,width,height,where,margin=26){
 const {width:w,height:h}=page.getSize();const x=where.endsWith("left")?margin:Math.max(margin,w-width-margin);
 const y=where.startsWith("top")?Math.max(margin,h-height-margin):Math.max(margin,margin);
 return {x,y};
}
function hyperlink(pdf,page,x,y,w,h){
 const c=pdf.context;
 const dict=c.obj({Type:"Annot",Subtype:"Link",Rect:[x,y,x+w,y+h],Border:[0,0,0],A:{S:"URI",URI:PDFLib.PDFString.of("https://justpdfit.com/")}});
 const ref=c.register(dict);page.node.addAnnot(ref);
}
function watermark(pdf,font){
 for(const p of pdf.getPages()){
  const {width:w}=p.getSize();const size=7,label="JustPDFit.com";
  const tw=font.widthOfTextAtSize(label,size),x=Math.max(8,w-tw-13),y=10;
  p.drawText(label,{x,y,size,font,color:PDFLib.rgb(.88,.24,.38),opacity:.80});
  hyperlink(pdf,p,x,y,tw,11);
 }
}
function validate(){
 if(!fileBytes)throw Error(t.noFile);
 const del=$("remove").checked,dat=$("date").checked,sig=$("sign").checked;
 if(!del&&!dat&&!sig)throw Error(t.noAction);
 const d=pageNum("removePage"),a=pageNum("datePage"),s=pageNum("signPage");
 const valid=n=>Number.isInteger(n)&&n>=1&&n<=pageTotal;
 if(del&&(!valid(d)||pageTotal<=1))throw Error(pageTotal<=1?t.deleteLast:t.badPage);
 if(dat&&(!valid(a)||(del&&a===d)))throw Error(t.badPage);
 if(sig&&(!valid(s)||(del&&s===d)))throw Error(t.badPage);
 if(sig&&!hasInk)throw Error(t.signMissing);
 return {del,dat,sig,d,a,s};
}
async function generate(){
 const plan=validate();const pdf=await PDFLib.PDFDocument.load(fileBytes,{ignoreEncryption:false});
 const selectedDate=new Date().toLocaleDateString(locale==="ar"?"en-GB":locale==="fr"?"fr-FR":"en-GB");
 const font=await pdf.embedFont(PDFLib.StandardFonts.Helvetica);
 // Place content on original numbered pages BEFORE removing pages.
 if(plan.dat){
  const p=pdf.getPage(plan.a-1),size=12,tw=font.widthOfTextAtSize(selectedDate,size);
  const pos=position(p,tw,15,$("datePosition").value,35);
  p.drawText(selectedDate,{...pos,size,font,color:PDFLib.rgb(.10,.17,.28)});
 }
 if(plan.sig){
  const png=await pdf.embedPng(canvas.toDataURL("image/png"));
  const p=pdf.getPage(plan.s-1),maxW=Math.min(165,p.getWidth()*.35),maxH=66;
  const dims=png.scale(Math.min(maxW/png.width,maxH/png.height));
  const pos=position(p,dims.width,dims.height,$("signPosition").value,43);
  p.drawImage(png,{...pos,width:dims.width,height:dims.height});
 }
 if(plan.del)pdf.removePage(plan.d-1);
 watermark(pdf,font);
 return new Uint8Array(await pdf.save());
}
let busy=false;
$("previewBtn").addEventListener("click",async()=>{
 if(busy)return;busy=true;$("previewBtn").disabled=true;invalidate();status(t.working);
 try{previewBytes=await generate();previewUrl=URL.createObjectURL(new Blob([previewBytes],{type:"application/pdf"}));$("preview").src=previewUrl;$("preview").hidden=false;$("emptyPreview").hidden=true;$("download").disabled=false;status(t.ready,"ok");}
 catch(e){status(e&&e.message&&Object.values(t).includes(e.message)?e.message:t.fail,"error");}
 finally{busy=false;$("previewBtn").disabled=false;}
});
$("download").addEventListener("click",()=>{
 if(!previewBytes||!previewUrl)return;
 const a=document.createElement("a");a.href=previewUrl;a.download=fileName.replace(/\.pdf$/i,"")+"-justpdfit-ai.pdf";document.body.appendChild(a);a.click();a.remove();
});
$("resetBtn").addEventListener("click",()=>{["remove","date","sign"].forEach(id=>$(id).checked=false);invalidate();status(t.loaded);});
["remove","date","sign","removePage","datePage","signPage","datePosition","signPosition"].forEach(id=>$(id).addEventListener("change",invalidate));
window.addEventListener("pagehide",()=>{if(previewUrl)URL.revokeObjectURL(previewUrl);});
})();
