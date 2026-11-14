/* Shared completion dialog for JustPDFit web tools. */
(() => {
"use strict";
const translations={
fr:{title:"Votre PDF est prêt !",subtitle:"Votre document a été créé avec succès.",name:"Nom du fichier",rename:"Renommer",save:"Enregistrer le nom",download:"Télécharger",share:"Partager",open:"Ouvrir le PDF",close:"Terminer",invalid:"Veuillez saisir un nom de fichier valide.",saved:"Nom mis à jour",email:"Envoyer par email",preview:"Aperçu du document",privacy:"Votre document reste sur votre appareil.",emailHint:"Utilisez le partage natif pour envoyer la pièce jointe, ou téléchargez le PDF puis joignez-le dans votre messagerie."},
en:{title:"Your PDF is ready!",subtitle:"Your document was created successfully.",name:"File name",rename:"Rename",save:"Save name",download:"Download",share:"Share",open:"Open PDF",close:"Done",invalid:"Enter a valid file name.",saved:"File name updated",email:"Send by email",preview:"Document preview",privacy:"Your document stays on this device.",emailHint:"Use your device share menu to attach the PDF, or download it and attach it in your email app."},
ar:{title:"ملف PDF جاهز!",subtitle:"تم إنشاء المستند بنجاح.",name:"اسم الملف",rename:"إعادة التسمية",save:"حفظ الاسم",download:"تنزيل",share:"مشاركة",open:"فتح PDF",close:"تم",invalid:"أدخل اسم ملف صالحًا.",saved:"تم تحديث اسم الملف",email:"إرسال بالبريد",preview:"معاينة المستند",privacy:"يبقى المستند على جهازك.",emailHint:"استخدم المشاركة لإرفاق الملف أو نزله وأرفقه في بريدك."}};
const renameWarnings={
 en:{question:"You have an unsaved file name. Save it before continuing?",save:"Save name and continue",discard:"Discard changes and continue",cancel:"Keep editing"},
 fr:{question:"Le nouveau nom du fichier n’est pas enregistré. Que souhaitez-vous faire ?",save:"Enregistrer le nom et continuer",discard:"Ignorer les modifications et continuer",cancel:"Continuer à modifier"},
 ar:{question:"لم يتم حفظ اسم الملف الجديد. ماذا تريد أن تفعل؟",save:"حفظ الاسم والمتابعة",discard:"تجاهل التغييرات والمتابعة",cancel:"متابعة التعديل"}
};
Object.assign(translations,window.JustPDFItConfirmLocales||{});
const lang=()=>{const raw=window.JustPDFItI18n?.getLanguage?.()||document.documentElement.lang||navigator.language||"en";const l=String(raw).toLowerCase().replace("_","-").split("-")[0];return translations[l]?l:"en"};
const safeName=v=>{const s=v.trim().replace(/[\\/:*?"<>|\x00-\x1f]/g,"").replace(/\.+$/,"").trim();return s?s.replace(/\.pdf$/i,"")+".pdf":""};
let active=null;
function open({blob,name,onRename,operation,watermarked}){
 if(!blob)return;
 active?.cleanup();
 const l=lang(),t=translations[l],url=URL.createObjectURL(blob);
 const overlay=document.createElement("div");overlay.className="jpi-confirm-overlay";overlay.setAttribute("role","presentation");
 overlay.innerHTML='<section class="jpi-confirm" role="dialog" aria-modal="true" aria-labelledby="jpi-confirm-title"><button class="jpi-confirm-x" type="button" data-act="close" aria-label="Close">×</button><div class="jpi-confirm-symbol" aria-hidden="true">✓</div><div class="jpi-confirm-kicker">JUST<span>PDF</span>it</div><h2 id="jpi-confirm-title"></h2><p class="jpi-confirm-subtitle"></p><div class="jpi-confirm-file"><span class="jpi-confirm-pdf">PDF</span><div class="jpi-confirm-filetext"><strong class="jpi-confirm-filename"></strong><small class="jpi-confirm-size"></small></div><button type="button" class="jpi-confirm-rename" data-act="edit"></button></div><form class="jpi-confirm-edit" hidden><label for="jpi-confirm-input"></label><input id="jpi-confirm-input" maxlength="180" autocomplete="off"><button type="submit"></button><p class="jpi-confirm-error" role="alert"></p></form><div class="jpi-confirm-rename-guard" role="alertdialog" aria-modal="true" aria-labelledby="jpi-confirm-guard-title" hidden><p id="jpi-confirm-guard-title"></p><div class="jpi-confirm-guard-actions"><button type="button" data-guard="save"></button><button type="button" data-guard="discard"></button><button type="button" data-guard="cancel"></button></div></div><div class="jpi-confirm-preview"><div class="jpi-confirm-preview-label"></div><iframe class="jpi-confirm-preview-frame" title="PDF preview" loading="lazy"></iframe></div><div class="jpi-confirm-actions"><button type="button" class="jpi-confirm-primary" data-act="download"></button><button type="button" class="jpi-confirm-secondary" data-act="share"></button></div><button type="button" class="jpi-confirm-email" data-act="email"></button><p class="jpi-confirm-privacy"></p><div class="jpi-confirm-bottom"><button type="button" data-act="open"></button><button type="button" data-act="close"></button></div></section>';
 const el=s=>overlay.querySelector(s);
 let filename=safeName(name)||"JustPDFit.pdf";
 el("h2").textContent=t.title;el(".jpi-confirm-subtitle").textContent=t.subtitle;el(".jpi-confirm-x").setAttribute("aria-label",t.close);
 el(".jpi-confirm-size").textContent=(blob.size/1024/1024>=1?(blob.size/1024/1024).toFixed(2)+" MB":Math.max(1,Math.round(blob.size/1024))+" KB");
 el(".jpi-confirm-preview-label").textContent=t.preview||translations.en.preview;el(".jpi-confirm-preview-frame").src=url+"#toolbar=0&navpanes=0";el(".jpi-confirm-email").textContent="✉ "+(t.email||translations.en.email);el(".jpi-confirm-privacy").textContent=t.privacy||translations.en.privacy;
 el(".jpi-confirm-rename").textContent=t.rename;el(".jpi-confirm-edit label").textContent=t.name;
 el(".jpi-confirm-edit button").textContent=t.save;
 for(const k of ["download","share","open","close"])el('[data-act="'+k+'"]:last-of-type')?.setAttribute("data-ready","1");
 el(".jpi-confirm-primary").textContent="↓ "+t.download;el(".jpi-confirm-secondary").textContent="↗ "+t.share;
 el('.jpi-confirm-bottom [data-act="open"]').textContent=t.open;el('.jpi-confirm-bottom [data-act="close"]').textContent=t.close;
 const guardLabels=renameWarnings[l]||renameWarnings.en;
 const guard=el(".jpi-confirm-rename-guard");
 el("#jpi-confirm-guard-title").textContent=guardLabels.question;
 for(const action of ["save","discard","cancel"])el('[data-guard="'+action+'"]').textContent=guardLabels[action];
 let pendingAction=null;
 let resolving=false;
 const update=()=>{el(".jpi-confirm-filename").textContent=filename;el("#jpi-confirm-input").value=filename};
 const draft=()=>el("#jpi-confirm-input").value;
 const hasUnsavedName=()=>!el(".jpi-confirm-edit").hidden&&draft()!==filename;
 const saveDraft=async()=>{
  const next=safeName(draft());
  if(!next){el(".jpi-confirm-error").textContent=t.invalid;return false;}
  if(next!==filename){
   try{await onRename?.(next);}catch(err){el(".jpi-confirm-error").textContent=err?.message||t.invalid;return false;}
   filename=next;
  }
  update();el(".jpi-confirm-edit").hidden=true;el(".jpi-confirm-error").textContent="";
  return true;
 };
 const hideGuard=()=>{pendingAction=null;guard.hidden=true;};
 const runAction=async act=>{
  if(act==="download")download();
  if(act==="open")window.open(url,"_blank","noopener");
  if(act==="close"){cleanup();return;}
  if(act==="share"||act==="email"){
   try{
    const file=new File([blob],filename,{type:"application/pdf"});
    if(navigator.canShare?.({files:[file]}))await navigator.share({files:[file],title:filename});
    else if(act==="share"&&navigator.share)await navigator.share({title:filename});
    else{download();el(".jpi-confirm-privacy").textContent=t.emailHint||translations.en.emailHint;}
   }catch(err){if(err.name!=="AbortError"){download();el(".jpi-confirm-privacy").textContent=t.emailHint||translations.en.emailHint;}}
  }
 };
 const guardedAction=async act=>{
  if(hasUnsavedName()){
   pendingAction=act;guard.hidden=false;el('[data-guard="save"]').focus();return;
  }
  await runAction(act);
 };
 update();overlay.dir=["ar","ur","fa"].includes(l)?"rtl":"ltr";
 const download=()=>{const a=document.createElement("a");a.href=url;a.download=filename;document.body.append(a);a.click();a.remove()};
 const cleanup=()=>{document.removeEventListener("keydown",key);overlay.remove();URL.revokeObjectURL(url);active=null};
 const key=e=>{if(e.key==="Escape"){if(!guard.hidden){hideGuard();el("#jpi-confirm-input").focus();}else cleanup();}};
 document.addEventListener("keydown",key);
 overlay.addEventListener("click",async e=>{
  if(resolving)return;
  if(e.target===overlay){await guardedAction("close");return;}
  const guardChoice=e.target.closest("[data-guard]")?.dataset.guard;
  if(guardChoice){
   if(guardChoice==="cancel"){hideGuard();el("#jpi-confirm-input").focus();return;}
   const continuation=pendingAction;
   resolving=true;
   try{
    if(guardChoice==="save"&&!await saveDraft()){hideGuard();el("#jpi-confirm-input").focus();return;}
    if(guardChoice==="discard"){update();el(".jpi-confirm-edit").hidden=true;el(".jpi-confirm-error").textContent="";}
    hideGuard();await runAction(continuation);
   }finally{resolving=false;}
   return;
  }
  if(!guard.hidden)return;
  const act=e.target.closest("[data-act]")?.dataset.act;
  if(act==="edit"){el(".jpi-confirm-edit").hidden=false;el("#jpi-confirm-input").focus();el("#jpi-confirm-input").select();return;}
  if(["download","share","email","open","close"].includes(act))await guardedAction(act);
 });
 el(".jpi-confirm-edit").addEventListener("submit",async e=>{e.preventDefault();if(resolving)return;resolving=true;try{await saveDraft();}finally{resolving=false;}});
 document.body.append(overlay);active={cleanup};el(".jpi-confirm-primary").focus();
}
window.JustPDFItConfirmation={open};
})();