(() => {
"use strict";
const $=id=>document.getElementById(id), ROOT=$("edit-app");
if(!ROOT)return;
const dict={
en:{title:"Edit your PDF",subtitle:"Place elements directly on any page. Your document stays on this device.",pick:"Select PDF",empty:"Select a PDF to start editing.",tools:"Add elements",properties:"Element properties",text:"Text",date:"Date",check:"Checkbox",initials:"Initials",signature:"Signature",image:"Image",highlight:"Highlight",name:"File",font:"Size (pt)",color:"Color",width:"Width (%)",height:"Height (%)",copy:"Copy to page",delete:"Delete selected",prev:"Previous",next:"Next",free:"Free · 4 clickable corner watermarks per page",paid:"€1.99 · No watermark",export:"Download PDF",checkout:"Pay €1.99 with Stripe",verify:"Verify payment",undo:"Undo",redo:"Redo",status:"Add and drag items to edit this page.",selected:"Select an element to edit its properties.",error:"Unable to open or export this PDF.",ready:"Your PDF is ready.",unpaid:"Payment has not been confirmed. The clean PDF is locked.",pending:"Secure Stripe checkout opened. Return here and verify after payment.",pages:"Pages",privacy:"Local PDF editing. Only a document fingerprint is sent for optional Stripe payment.",multi:"Duplicate on page",noBackend:"Secure checkout is unavailable. Free download is still available."},
fr:{title:"Modifier votre PDF",subtitle:"Placez vos éléments sur chaque page. Votre document reste sur cet appareil.",pick:"Choisir un PDF",empty:"Sélectionnez un PDF pour commencer.",tools:"Ajouter des éléments",properties:"Propriétés de l’élément",text:"Texte",date:"Date",check:"Case à cocher",initials:"Initiales",signature:"Signature",image:"Image",highlight:"Surligner",name:"Contenu",font:"Taille (pt)",color:"Couleur",width:"Largeur (%)",height:"Hauteur (%)",copy:"Copier sur page",delete:"Supprimer",prev:"Précédente",next:"Suivante",free:"Gratuit · 4 filigranes cliquables par page",paid:"1,99 € · Sans filigrane",export:"Télécharger le PDF",checkout:"Payer 1,99 € avec Stripe",verify:"Vérifier le paiement",undo:"Annuler",redo:"Rétablir",status:"Ajoutez et déplacez les éléments sur cette page.",selected:"Sélectionnez un élément pour le modifier.",error:"Impossible de lire ou d’exporter ce PDF.",ready:"Votre PDF est prêt.",unpaid:"Paiement non confirmé. Le PDF sans filigrane reste verrouillé.",pending:"Stripe est ouvert. Revenez ici pour vérifier le paiement.",pages:"Pages",privacy:"Édition locale. Seule l’empreinte du document est transmise pour le paiement optionnel.",multi:"Dupliquer sur page",noBackend:"Paiement sécurisé indisponible. L’export gratuit reste possible."},
ar:{title:"تعديل ملف PDF",subtitle:"أضف العناصر مباشرة إلى صفحات المستند على جهازك.",pick:"اختيار PDF",empty:"اختر ملف PDF للبدء.",tools:"إضافة عناصر",properties:"خصائص العنصر",text:"نص",date:"تاريخ",check:"مربع اختيار",initials:"أحرف الاسم",signature:"توقيع",image:"صورة",highlight:"تمييز",name:"المحتوى",font:"الحجم",color:"اللون",width:"العرض",height:"الارتفاع",copy:"نسخ للصفحة",delete:"حذف",prev:"السابق",next:"التالي",free:"مجاني · ٤ علامات مائية قابلة للنقر",paid:"١٫٩٩ € · دون علامة مائية",export:"تنزيل PDF",checkout:"الدفع عبر Stripe",verify:"التحقق من الدفع",undo:"تراجع",redo:"إعادة",status:"اسحب العناصر لتحرير الصفحة.",selected:"اختر عنصراً لتعديله.",error:"تعذّر فتح الملف أو تصديره.",ready:"ملف PDF جاهز.",unpaid:"لم يتم تأكيد الدفع.",pending:"تم فتح Stripe. عد إلى هنا للتحقق.",pages:"الصفحات",privacy:"تتم معالجة الملف محلياً.",multi:"نسخ إلى الصفحة",noBackend:"الدفع غير متاح حالياً."}
};
const language=()=>{const s=window.JustPDFItI18n?.getLanguage?.()||new URLSearchParams(location.search).get("lang")||document.documentElement.lang||"en";return dict[s]?s:"en";};
const tr=k=>dict[language()][k]||dict.en[k];
const textMore={
 en:{heroTitle:"Edit a PDF, simply.",heroDesc:"Place text, dates, checkboxes, initials, signatures and images exactly where you need them, on any page.",trust1:"✓ No account required",trust2:"✓ Files stay on your device",trust3:"✓ Free or €1.99 without watermark",choose:"Choose your export",chooseHint:"The editor and all tools are free. You only pay if you want an export without JustPDFit watermarks.",freeTitle:"Free, unlimited",freePrice:"€0",freeDetails:"All editing tools, unlimited pages, 4 discreet clickable JustPDFit.com marks in the corners of each page.",paidTitle:"Without watermark",paidPrice:"€1.99",paidDetails:"One-time payment per document. Your PDF exports without JustPDFit branding. No subscription.",steps:"1 · Upload PDF   →   2 · Edit pages   →   3 · Export",fileLabel:"Choose your PDF",howTitle:"How it works",how1:"Choose a PDF from your device.",how2:"Add and position elements on any page.",how3:"Export free with 4 corner watermarks, or pay €1.99 to remove them.",privacyTitle:"Privacy & limitations",privacyText:"PDF editing takes place on your device. Text already in the original PDF cannot be replaced.",none:"No file selected",remove:"Remove file"},
 fr:{heroTitle:"Modifiez vos PDF, simplement.",heroDesc:"Placez du texte, des dates, des cases à cocher, des initiales, des signatures et des images sur toutes les pages.",trust1:"✓ Sans inscription",trust2:"✓ Fichiers conservés sur votre appareil",trust3:"✓ Gratuit ou 1,99 € sans filigrane",choose:"Choisissez votre export",chooseHint:"Tous les outils d'édition sont gratuits. Seul l'export sans filigrane JustPDFit est payant.",freeTitle:"Gratuit et illimité",freePrice:"0 €",freeDetails:"Tous les outils, toutes les pages, 4 filigranes discrets JustPDFit.com cliquables dans les coins de chaque page.",paidTitle:"Sans filigrane",paidPrice:"1,99 €",paidDetails:"Paiement unique par document. Export sans aucune marque JustPDFit. Aucun abonnement.",steps:"1 · Importer le PDF   →   2 · Modifier les pages   →   3 · Exporter",fileLabel:"Choisissez votre PDF",howTitle:"Comment ça marche ?",how1:"Choisissez un PDF depuis votre appareil.",how2:"Ajoutez et positionnez les éléments sur les pages.",how3:"Exportez gratuitement avec 4 filigranes ou payez 1,99 € pour les retirer.",privacyTitle:"Confidentialité et limites",privacyText:"Le PDF est modifié localement sur votre appareil. Le texte original ne peut pas être remplacé.",none:"Aucun fichier sélectionné",remove:"Retirer le fichier"},
 ar:{heroTitle:"عدّل ملف PDF بسهولة",heroDesc:"أضف النصوص والتواريخ ومربعات الاختيار والتواقيع والصور إلى أي صفحة.",trust1:"✓ دون تسجيل",trust2:"✓ تبقى ملفاتك على جهازك",trust3:"✓ مجاني أو 1.99 € دون علامة مائية",choose:"اختر طريقة التصدير",chooseHint:"كل أدوات التعديل مجانية. الدفع فقط لإزالة العلامات المائية.",freeTitle:"مجاني بلا حدود",freePrice:"0 €",freeDetails:"جميع الأدوات والصفحات، مع أربع علامات JustPDFit.com قابلة للنقر على كل صفحة.",paidTitle:"دون علامات مائية",paidPrice:"1.99 €",paidDetails:"دفعة واحدة لكل مستند. لا اشتراك.",steps:"١ · رفع الملف   ←   ٢ · التعديل   ←   ٣ · التصدير",fileLabel:"اختر ملف PDF",howTitle:"كيف يعمل؟",how1:"اختر ملف PDF من جهازك.",how2:"أضف العناصر إلى الصفحات وحرّكها.",how3:"التصدير مجاني مع العلامات أو 1.99 € لإزالتها.",privacyTitle:"الخصوصية والقيود",privacyText:"يتم تعديل ملف PDF على جهازك. لا يمكن استبدال النص الأصلي.",none:"لم يتم اختيار ملف",remove:"إزالة الملف"}
};
const more=k=>(textMore[language()]||textMore.en)[k];
function syncPageCopy(){
 const mapping={"edit-hero-title":"heroTitle","edit-hero-description":"heroDesc","edit-hero-trust1":"trust1","edit-hero-trust2":"trust2","edit-hero-trust3":"trust3","edit-how-title":"howTitle","edit-how-1":"how1","edit-how-2":"how2","edit-how-3":"how3","edit-privacy-title":"privacyTitle","edit-privacy-text":"privacyText"};
 for(const [id,key] of Object.entries(mapping)){const el=$(id);if(el)el.textContent=more(key);}
 for(const [id,key] of [["editor-offers-title","choose"],["editor-offers-hint","chooseHint"],["editor-offer-free-title","freeTitle"],["editor-offer-free-price","freePrice"],["editor-offer-free-description","freeDetails"],["editor-offer-paid-title","paidTitle"],["editor-offer-paid-price","paidPrice"],["editor-offer-paid-description","paidDetails"],["editor-steps","steps"],["editor-upload-title","fileLabel"],["editor-choose","fileLabel"],["editor-remove","remove"]]){const el=$(id);if(el)el.textContent=more(key);}
 if($("editor-file-empty"))$("editor-file-empty").textContent=file?file.name:more("none");
}

let file=null,source=null,viewer=null,total=0,current=1,objects=[],selected=null,history=[],future=[],paidFingerprint=null,pending=null,documentFingerprint=null,renderToken=0,mode="free",scale=1,changed=false,exported=false;
ROOT.innerHTML='<div class="editor-shell"><div class="editor-top"><div><h2 id="editor-title"></h2><p id="editor-subtitle"></p></div><div><button class="editor-button" id="editor-undo" type="button"></button> <button class="editor-button" id="editor-redo" type="button"></button></div></div><div class="editor-offers"><div class="editor-offers-heading"><h3 id="editor-offers-title"></h3><p id="editor-offers-hint"></p></div><div class="editor-offers-grid"><button type="button" class="editor-offer editor-offer--free" data-mode="free" aria-pressed="true"><span class="editor-offer-badge">✓</span><strong id="editor-offer-free-title"></strong><span class="editor-offer-price" id="editor-offer-free-price"></span><span class="editor-offer-description" id="editor-offer-free-description"></span><span class="editor-offer-radio" aria-hidden="true"></span></button><button type="button" class="editor-offer editor-offer--paid" data-mode="paid" aria-pressed="false"><span class="editor-offer-badge">✦</span><strong id="editor-offer-paid-title"></strong><span class="editor-offer-price" id="editor-offer-paid-price"></span><span class="editor-offer-description" id="editor-offer-paid-description"></span><span class="editor-offer-radio" aria-hidden="true"></span></button></div></div><div id="editor-steps" class="editor-steps"></div><div class="editor-upload"><div class="editor-upload-inner"><div class="editor-upload-title" id="editor-upload-title"></div><div class="jpi-file-picker editor-custom-picker"><input id="editor-file" type="file" accept="application/pdf,.pdf" class="jpi-file-picker__input" tabindex="-1"><button type="button" class="jpi-file-picker__choose" id="editor-choose"></button><span class="jpi-file-picker__name" id="editor-file-empty"></span><button type="button" class="jpi-file-picker__clear" id="editor-remove" hidden aria-label="Remove file"></button></div><strong id="editor-filename" hidden></strong></div></div><div class="editor-body"><div class="editor-toolbar" id="editor-tools"></div><div class="editor-workspace"><div class="editor-pagination"><button type="button" class="editor-button" id="editor-prev">‹</button><span id="editor-pagecount"></span><button type="button" class="editor-button" id="editor-next">›</button></div><div id="editor-stage-container" style="width:100%;display:flex;justify-content:center"><div id="editor-empty" class="editor-no-file"></div><div id="editor-stage" class="editor-page-view" hidden><canvas id="editor-canvas"></canvas><div id="editor-overlay" class="editor-overlay"></div></div></div><div id="editor-thumbs" class="editor-thumbs"></div></div><div id="editor-properties" class="editor-properties"></div></div><div class="editor-bottom"><div><div class="editor-pricing" hidden><label><input type="radio" name="editor-price" value="free" checked> <span id="editor-free"></span></label><label><input type="radio" name="editor-price" value="paid"> <span id="editor-paid"></span></label></div><p id="editor-privacy"></p></div><div class="editor-actions"><button type="button" id="editor-checkout" class="editor-button primary" hidden></button><button type="button" id="editor-verify" class="editor-button" hidden></button><button type="button" id="editor-export" class="editor-button primary"></button></div></div><div id="editor-status" class="editor-status" role="status" aria-live="polite"></div></div>';
/* Share Sign PDF's hierarchy: choice cards first, then a distinct guided workspace. */
const shell=ROOT.querySelector(".editor-shell");
const offers=shell.querySelector(".editor-offers");
const heading=document.createElement("div");heading.className="edit-section-heading";
heading.innerHTML='<div class="section-kicker" id="edit-workspace-kicker"></div><h2 id="edit-workspace-question"></h2><p id="edit-workspace-explainer"></p>';
ROOT.insertBefore(heading,shell);
const benefits=document.createElement("section");
benefits.className="edit-free-benefits";
benefits.innerHTML='<div class="edit-free-heading"><div><h3 id="edit-free-heading"></h3><p id="edit-free-subheading"></p></div><span class="edit-free-label" id="edit-free-label"></span></div><div class="edit-free-feature-grid" id="edit-free-feature-grid"></div>';
ROOT.insertBefore(benefits,shell);
shell.querySelector(".editor-body").after(offers);
offers.classList.add("edit-export-choices");
const exportContinue=document.createElement("button");exportContinue.type="button";exportContinue.className="editor-button edit-export-continue";exportContinue.id="edit-continue-export";
shell.querySelector(".editor-body").after(exportContinue);
exportContinue.addEventListener("click",()=>{offers.scrollIntoView({behavior:"smooth",block:"center"});offers.querySelector(".editor-offer")?.focus({preventScroll:true});});
function syncOptionB(){
 const l=language();
 const labels=l==="fr"?{heading:"Modifiez votre PDF gratuitement",subheading:"Tous les outils sont inclus, sans inscription ni abonnement.",tag:"Édition gratuite · Suppression payante des filigranes en option",features:["Texte et dates","Cases à cocher","Initiales et signatures","Images et annotations","PDF multipages","Modifications illimitées"],exportHeading:"Votre PDF est prêt ? Choisissez votre export",exportHint:"Les outils restent gratuits. Vous ne payez que si vous souhaitez supprimer les filigranes.",free:"Télécharger gratuitement",paid:"Télécharger sans filigrane",continue:"Continuer vers l'export",freeDetails:"4 filigranes JustPDFit.com discrets et cliquables par page.",paidDetails:"PDF propre, sans filigrane. Paiement unique de 1,99 € par document.",prompt:"Modifiez d'abord votre document, puis choisissez son export."}:l==="ar"?{heading:"عدّل ملف PDF مجاناً",subheading:"جميع الأدوات مجانية دون اشتراك.",tag:"تعديل مجاني · إزالة العلامة المائية اختيارية ومدفوعة",features:["النص والتاريخ","مربعات الاختيار","التوقيع والأحرف","الصور والتعليقات","صفحات متعددة","تعديل غير محدود"],exportHeading:"اختر طريقة تنزيل ملف PDF",exportHint:"الدفع فقط لإزالة العلامات المائية.",free:"تنزيل مجاني",paid:"تنزيل دون علامة مائية",continue:"متابعة إلى التنزيل",freeDetails:"أربع علامات JustPDFit.com قابلة للنقر على كل صفحة.",paidDetails:"دون علامات مائية، 1.99 € لكل مستند مرة واحدة.",prompt:"عدّل المستند أولاً ثم اختر طريقة تنزيله."}:{heading:"Edit your PDF for free",subheading:"Every editing tool is included. No account or subscription.",tag:"Free editing · Optional paid watermark removal",features:["Text & dates","Checkboxes","Initials & signatures","Images & annotations","Multiple pages","Unlimited edits"],exportHeading:"Ready to download? Choose your export",exportHint:"Editing is always free. Only removing the watermarks costs €1.99.",free:"Download for free",paid:"Download without watermarks",continue:"Continue to export",freeDetails:"4 discreet clickable JustPDFit.com corner watermarks per page.",paidDetails:"Clean PDF without watermarks. €1.99 one-time payment per document.",prompt:"Edit first. Choose your export when you're done."};
 $("edit-free-heading").textContent=labels.heading;$("edit-free-subheading").textContent=labels.subheading;$("edit-free-label").textContent=labels.tag;
 $("edit-free-feature-grid").replaceChildren(...labels.features.map(item=>{const node=document.createElement("div");node.className="edit-free-feature";const mark=document.createElement("span");mark.textContent="✓";mark.setAttribute("aria-hidden","true");const label=document.createElement("span");label.textContent=item;node.append(mark,label);return node;}));
 $("editor-offers-title").textContent=labels.exportHeading;$("editor-offers-hint").textContent=labels.exportHint;
 $("editor-offer-free-title").textContent=labels.free;$("editor-offer-paid-title").textContent=labels.paid;
 $("editor-offer-free-description").textContent=labels.freeDetails;$("editor-offer-paid-description").textContent=labels.paidDetails;
 $("edit-continue-export").textContent=labels.continue;
 $("edit-workspace-question").textContent=labels.heading;$("edit-workspace-explainer").textContent=labels.prompt;
 offers.hidden=!source;exportContinue.hidden=!source;
}
const wizard=document.createElement("div");wizard.className="edit-wizard";
wizard.innerHTML='<div class="edit-wizard-steps" id="edit-wizard-steps" aria-label="Editing progress"></div><div class="edit-wizard-step-copy"><span class="edit-wizard-kicker" id="edit-wizard-kicker"></span><h3 id="edit-wizard-headline"></h3><p id="edit-wizard-help"></p></div>';
shell.querySelector(".editor-top").after(wizard);
const privacyNote=document.createElement("div");privacyNote.className="edit-upload-privacy";privacyNote.id="edit-upload-privacy";
shell.querySelector(".editor-upload").after(privacyNote);
function syncWizard(){
 const labels=language()==="fr"?["Importer le PDF","Ajouter des éléments","Vérifier le document","Télécharger"]:language()==="ar"?["رفع PDF","إضافة عناصر","مراجعة الملف","تنزيل"]:["Upload PDF","Add elements","Review document","Download"];
 const stage=!source?1:exported?4:objects.length?3:2;
 const nav=$("edit-wizard-steps");
 nav.innerHTML="";
 labels.forEach((label,i)=>{const el=document.createElement("span");el.className="edit-wizard-step"+(i+1===stage?" is-current":"")+(i+1<stage?" is-complete":"");if(i+1===stage)el.setAttribute("aria-current","step");const n=document.createElement("b");n.textContent=i+1<stage?"✓":String(i+1);const s=document.createElement("span");s.textContent=label;el.append(n,s);nav.append(el);});
 const text=language()==="fr"?{kicker:["ÉTAPE 1 · VOTRE DOCUMENT","ÉTAPE 2 · MODIFIER","ÉTAPE 3 · VÉRIFICATION"],title:["Importez votre PDF à modifier","Ajoutez vos éléments sur le PDF","Vérifiez les modifications avant l'export"],help:["Choisissez un fichier PDF sur votre appareil. Toutes les pages seront disponibles automatiquement.","Utilisez les outils à gauche et déplacez les éléments sur la page.","Naviguez entre les pages, puis téléchargez votre document en bas de l'éditeur."],privacy:"🔒 Votre document reste sur votre appareil. Aucun fichier n'est envoyé à nos serveurs."}:language()==="ar"?{kicker:["الخطوة ١ · المستند","الخطوة ٢ · التعديل","الخطوة ٣ · المراجعة","الخطوة ٤ · تم"],title:["ارفع ملف PDF","أضف العناصر إلى الصفحات","راجع التغييرات قبل التصدير","ملف PDF جاهز"],help:["اختر الملف من جهازك.","اسحب العناصر إلى المكان المناسب.","راجع الصفحات ثم نزّل المستند.","نزّل الملف أو شاركه من نافذة التأكيد."],privacy:"🔒 يبقى المستند على جهازك."}:{kicker:["STEP 1 · YOUR DOCUMENT","STEP 2 · EDIT YOUR PDF","STEP 3 · REVIEW","STEP 4 · COMPLETE"],title:["Upload the PDF to edit","Add elements to your PDF","Review your edits before exporting","Your PDF is ready"],help:["Choose a PDF from your device. All pages are available automatically.","Use the tools on the left and drag elements into position.","Check the pages, then export your PDF using the button below.","Download or share your PDF from the confirmation window."],privacy:"🔒 Your file is never uploaded to a server. It stays in your browser."};
 $("edit-wizard-kicker").textContent=text.kicker[stage-1];$("edit-wizard-headline").textContent=text.title[stage-1];$("edit-wizard-help").textContent=text.help[stage-1];$("edit-upload-privacy").textContent=text.privacy;
 shell.querySelector(".editor-body").hidden=!source;shell.querySelector(".editor-bottom").hidden=!source;shell.querySelector(".editor-status").hidden=!source;
 if(typeof syncOptionB==="function")syncOptionB();
}

const toolTypes=[["text","T"],["date","▦"],["check","☑"],["initials","✎"],["signature","〰"],["image","▧"],["highlight","▰"]];
const status=(message,isError=false)=>{$("editor-status").textContent=message;$("editor-status").classList.toggle("error",isError);};
function updateLabels(){
 syncPageCopy();
 const label=language()==="fr"?["VOTRE ESPACE D'ÉDITION","Comment souhaitez-vous modifier votre PDF ?","Choisissez votre option avant de commencer."]:language()==="ar"?["مساحة تعديل PDF","كيف تريد تعديل ملف PDF؟","اختر طريقة التصدير قبل البدء."]:["YOUR PDF EDITING WORKSPACE","How would you like to edit your PDF?","Choose an option to get started."];
 $("edit-workspace-kicker").textContent=label[0];$("edit-workspace-question").textContent=label[1];$("edit-workspace-explainer").textContent=label[2];
 $("editor-title").textContent=tr("title");$("editor-subtitle").textContent=tr("subtitle");
 $("editor-empty").textContent=tr("empty");$("editor-undo").textContent="↶ "+tr("undo");$("editor-redo").textContent="↷ "+tr("redo");
 $("editor-prev").setAttribute("aria-label",tr("prev"));$("editor-next").setAttribute("aria-label",tr("next"));
 $("editor-free").textContent=tr("free");$("editor-paid").textContent=tr("paid");$("editor-privacy").textContent=tr("privacy");
 $("editor-export").textContent=tr("export");$("editor-checkout").textContent=tr("checkout");$("editor-verify").textContent=tr("verify");
 $("editor-tools").innerHTML='<h3>'+tr("tools")+'</h3>'+toolTypes.map(([kind,icon])=>'<button type="button" class="editor-tool" data-add="'+kind+'"><span>'+icon+'</span>'+tr(kind)+'</button>').join("");
 $("editor-tools").querySelectorAll("[data-add]").forEach(btn=>btn.onclick=()=>add(btn.dataset.add));
 updateNavigation();renderProperties();updatePaymentButtons();syncWizard();syncOptionB();
}
function snapshot(){history.push(JSON.stringify(objects));exported=false;if(history.length>60)history.shift();future.length=0;changed=true;}
function undo(){if(!history.length)return;future.push(JSON.stringify(objects));objects=JSON.parse(history.pop());selected=null;renderObjects();renderProperties();updateButtons();syncWizard();}
function redo(){if(!future.length)return;history.push(JSON.stringify(objects));objects=JSON.parse(future.pop());selected=null;renderObjects();renderProperties();updateButtons();}
function updateButtons(){$("editor-undo").disabled=!history.length;$("editor-redo").disabled=!future.length;$("editor-export").disabled=!source;}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function add(kind){
 if(!source)return;
 if(kind==="signature"||kind==="initials"){
  if(!window.JustPDFitSignatureCreator?.open){status(tr("error"),true);return;}
  window.JustPDFitSignatureCreator.open({initials:kind==="initials",onApply:image=>make(kind,"",image)});
  return;
 }
 if(kind==="image"){const input=document.createElement("input");input.type="file";input.accept="image/png,image/jpeg";input.onchange=()=>{const f=input.files?.[0];if(!f||f.size>8*1024*1024){status(tr("error"),true);return;}const reader=new FileReader();reader.onload=()=>make(kind,"",String(reader.result));reader.readAsDataURL(f);};input.click();return;}
 make(kind,kind==="date"?new Date().toLocaleDateString(language()==="en"?"en-US":language()==="ar"?"ar":"fr-FR"):kind==="text"?tr("text"):kind==="check"?"✓":"");
}
function make(kind,text,image){snapshot();const obj={id:Date.now()+"-"+Math.random(),page:current,kind,text,image:image||null,x:.15,y:.2,w:kind==="highlight"?.26:kind==="check"?.045:kind==="signature"?.34:kind==="initials"?.13:.25,h:kind==="check"?.045:kind==="highlight"?.035:kind==="signature"?.095:kind==="initials"?.06:.052,size:16,color:"#172746"};objects.push(obj);selected=obj.id;renderObjects();renderProperties();updateButtons();syncWizard();}
function updateNavigation(){
 $("editor-pagecount").textContent=source?current+" / "+total:"0 / 0";$("editor-prev").disabled=!source||current<=1;$("editor-next").disabled=!source||current>=total;
 $("editor-thumbs").innerHTML=source?Array.from({length:Math.min(total,150)},(_,i)=>'<button type="button" data-page="'+(i+1)+'" '+(i+1===current?'aria-current="page"':'')+'>'+(i+1)+'</button>').join(""):"";
 $("editor-thumbs").querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>gotoPage(Number(b.dataset.page)));
 updateButtons();
}
async function gotoPage(num){
 if(!viewer||num<1||num>total)return;current=num;selected=null;updateNavigation();renderProperties();
 const token=++renderToken;const page=await viewer.getPage(num);const width=$("editor-stage-container").clientWidth||700;const viewport=page.getViewport({scale:1});scale=Math.min(1.5,Math.max(.15,(width-20)/viewport.width));const view=page.getViewport({scale});const canvas=$("editor-canvas");canvas.width=Math.ceil(view.width);canvas.height=Math.ceil(view.height);
 $("editor-stage").style.width=canvas.width+"px";$("editor-stage").hidden=false;$("editor-empty").hidden=true;
 const context=canvas.getContext("2d");await page.render({canvasContext:context,viewport:view}).promise;if(token!==renderToken)return;
 renderObjects();
}
function renderObjects(){
 const wrap=$("editor-overlay");wrap.innerHTML="";
 objects.filter(o=>o.page===current).forEach(o=>{
 const el=document.createElement("div");el.className="editor-object "+(o.kind==="check"?"checkbox ":"")+(o.kind==="highlight"?"highlight ":"")+(o.id===selected?"selected":"");
 el.style.cssText="left:"+(o.x*100)+"%;top:"+(o.y*100)+"%;width:"+(o.w*100)+"%;height:"+(o.h*100)+"%;color:"+o.color+";font-size:"+Math.max(7,o.size*scale)+"px;";
 if(o.kind==="highlight"){el.style.background=o.color;}
 else if(o.kind==="check"){
  // Draw a real visible checkbox rather than a font glyph (some global
  // styles and PDF font fallbacks hide the Unicode tick).
  el.style.boxSizing="border-box";el.style.border="0";el.style.display="grid";el.style.placeItems="center";
  const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("viewBox","0 0 24 24");svg.setAttribute("width","100%");svg.setAttribute("height","100%");
  svg.setAttribute("aria-hidden","true");svg.style.pointerEvents="none";
  const rect=document.createElementNS("http://www.w3.org/2000/svg","rect");
  rect.setAttribute("x","2");rect.setAttribute("y","2");rect.setAttribute("width","20");rect.setAttribute("height","20");
  rect.setAttribute("rx","2");rect.setAttribute("fill","none");rect.setAttribute("stroke",o.color||"#172746");rect.setAttribute("stroke-width","1.8");svg.append(rect);
  if(o.text==="✓"){const tick=document.createElementNS("http://www.w3.org/2000/svg","path");tick.setAttribute("d","M6 12.5l4 4 8-9");tick.setAttribute("fill","none");tick.setAttribute("stroke",o.color||"#172746");tick.setAttribute("stroke-width","2.5");tick.setAttribute("stroke-linecap","round");tick.setAttribute("stroke-linejoin","round");svg.append(tick);}
  el.append(svg);
 }else if(o.image){const img=document.createElement("img");img.src=o.image;el.append(img);}else el.textContent=o.text;
 el.tabIndex=0;el.setAttribute("aria-label",tr(o.kind));el.onpointerdown=e=>{e.preventDefault();selected=o.id;renderProperties();wrap.querySelectorAll(".editor-object").forEach(node=>node.classList.remove("selected"));el.classList.add("selected");let startX=e.clientX,startY=e.clientY,ox=o.x,oy=o.y,committed=false;const move=ev=>{if(!committed){snapshot();committed=true;}const rect=$("editor-stage").getBoundingClientRect();o.x=clamp(ox+(ev.clientX-startX)/rect.width,0,1-o.w);o.y=clamp(oy+(ev.clientY-startY)/rect.height,0,1-o.h);el.style.left=(o.x*100)+"%";el.style.top=(o.y*100)+"%";};const end=()=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",end);updateButtons();};window.addEventListener("pointermove",move);window.addEventListener("pointerup",end);};
 el.onkeydown=e=>{if(e.key==="Delete"||e.key==="Backspace"){e.preventDefault();removeSelected();}};wrap.append(el);
 });
}
const propInput=(label,id,value,type="text")=>'<label for="'+id+'">'+label+'</label><input id="'+id+'" type="'+type+'" value="'+String(value).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")+'">';
function renderProperties(){
 const panel=$("editor-properties"),o=objects.find(o=>o.id===selected);
 panel.innerHTML='<h3>'+tr("properties")+'</h3>';
 if(!o){const p=document.createElement("p");p.textContent=tr("selected");p.style.color="#8190a7";p.style.fontSize="13px";panel.append(p);return;}
 if(o.kind!=="image"&&o.kind!=="signature"&&o.kind!=="initials"&&o.kind!=="highlight"){const label=document.createElement("label");label.textContent=tr("name");panel.append(label);const area=document.createElement("textarea");area.value=o.text;area.onchange=()=>{snapshot();o.text=area.value;renderObjects();};panel.append(area);}
 if(o.kind==="check"){
  const row=document.createElement("label");row.style.display="flex";row.style.alignItems="center";row.style.gap="9px";
  const toggle=document.createElement("input");toggle.type="checkbox";toggle.checked=o.text==="✓";toggle.style.width="auto";
  toggle.onchange=()=>{snapshot();o.text=toggle.checked?"✓":"";renderObjects();updateButtons();};
  row.append(toggle,document.createTextNode(language()==="fr"?"Case cochée":language()==="ar"?"مربع محدد":"Checked"));panel.append(row);
 }
 if(!o.image&&o.kind!=="check")panel.insertAdjacentHTML("beforeend",propInput(tr("font"),"property-size",o.size,"number")+propInput(tr("color"),"property-color",o.color,"color"));
 panel.insertAdjacentHTML("beforeend",propInput(tr("width"),"property-width",Math.round(o.w*100),"number")+propInput(tr("height"),"property-height",Math.round(o.h*100),"number"));
 const select=document.createElement("select");select.id="property-page";for(let i=1;i<=total;i++){const option=document.createElement("option");option.value=i;option.textContent=tr("pages")+" "+i;if(i===current)option.disabled=true;select.append(option);}
 panel.append(Object.assign(document.createElement("label"),{textContent:tr("multi")}));panel.append(select);
 const copy=document.createElement("button");copy.type="button";copy.className="editor-button";copy.textContent=tr("multi");copy.onclick=()=>{const page=Number(select.value);if(!page||page===current)return;snapshot();objects.push({...o,id:Date.now()+"-"+Math.random(),page});updateButtons();status(tr("status"));};panel.append(copy);
 const del=document.createElement("button");del.type="button";del.className="editor-button";del.textContent=tr("delete");del.onclick=removeSelected;panel.append(del);
 for(const [id,key,transform] of [["property-size","size",v=>clamp(Number(v)||16,6,80)],["property-color","color",v=>v],["property-width","w",v=>clamp(Number(v)/100,.02,1-o.x)],["property-height","h",v=>clamp(Number(v)/100,.02,1-o.y)]]){
 const input=$(id);if(input)input.onchange=()=>{snapshot();o[key]=transform(input.value);renderObjects();updateButtons();};
 }
}
function removeSelected(){const idx=objects.findIndex(o=>o.id===selected);if(idx<0)return;snapshot();objects.splice(idx,1);selected=null;renderObjects();renderProperties();updateButtons();syncWizard();}
async function loadPdf(f){
 if(!f)return;try{
 if(f.size>80*1024*1024)throw Error("PDF exceeds 80 MB");file=f;const bytes=new Uint8Array(await f.arrayBuffer());source=bytes;exported=false;
 viewer=await pdfjsLib.getDocument({data:bytes.slice()}).promise;total=viewer.numPages;objects=[];history=[];future=[];selected=null;current=1;paidFingerprint=null;pending=null;changed=false;
 documentFingerprint=await window.JustPDFitWatermark.fingerprint(source);$("editor-filename").textContent=f.name;
 await gotoPage(1);status(tr("status"));updatePaymentButtons();syncWizard();
 }catch(error){source=null;viewer=null;total=0;status(tr("error")+" "+error.message,true);updateNavigation();syncWizard();}
}
function updatePaymentButtons(){
 const paid=mode==="paid",unlocked=paidFingerprint===documentFingerprint&&!!documentFingerprint;
 $("editor-checkout").hidden=!paid||unlocked;$("editor-checkout").disabled=!source||!window.JustPDFitWatermark?.backendReady;
 $("editor-verify").hidden=!paid||unlocked||!pending;
 $("editor-export").hidden=paid&&!unlocked;
 if(paid&&!window.JustPDFitWatermark?.backendReady)status(tr("noBackend"),true);
}
function rasterizeText(o,pageWidth,pageHeight){
 // Rasterize to the actual PDF element rectangle. The previous implementation
 // rasterized to the natural width of the text and then stretched that bitmap
 // to the element box, distorting dates, names and signatures on export.
 const ratio=3,boxWidth=Math.max(1,o.w*pageWidth),boxHeight=Math.max(1,o.h*pageHeight);
 const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.ceil(boxWidth*ratio));canvas.height=Math.max(1,Math.ceil(boxHeight*ratio));
 const ctx=canvas.getContext("2d");ctx.scale(ratio,ratio);ctx.fillStyle=o.color||"#172746";
 const fontSize=Math.max(7,Number(o.size)||16);ctx.font=fontSize+"px Arial";ctx.textBaseline="top";
 const lineHeight=fontSize*1.15;let y=0;
 for(const paragraph of String(o.text||" ").split("\n")){
  let line="";
  for(const word of paragraph.split(/(\s+)/)){
   const candidate=line+word;
   if(line&&ctx.measureText(candidate).width>boxWidth){ctx.fillText(line,0,y);y+=lineHeight;line=word.trimStart();}
   else line=candidate;
   if(y>=boxHeight)break;
  }
  if(y>=boxHeight)break;
  ctx.fillText(line,0,y);y+=lineHeight;
 }
 return canvas.toDataURL("image/png");
}
async function addWatermarks(doc){
 const regular=await doc.embedFont(PDFLib.StandardFonts.Helvetica),bold=await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
 for(const page of doc.getPages()){
 const {width,height}=page.getSize(),size=Math.max(4.5,Math.min(6,width/95)),parts=[["Just",regular,PDFLib.rgb(.12,.18,.32)],["PDF",bold,PDFLib.rgb(.93,.16,.35)],["it.com",regular,PDFLib.rgb(.12,.18,.32)]];
 const full=parts.reduce((sum,p)=>sum+p[1].widthOfTextAtSize(p[0],size),0);
 for(const x of [3,Math.max(3,width-full-3)])for(const y of [2,Math.max(2,height-size-3)]){
 let dx=0;for(const [text,font,color] of parts){page.drawText(text,{x:x+dx,y,size,font,color,opacity:.7});dx+=font.widthOfTextAtSize(text,size);}
 const annot=doc.context.obj({Type:"Annot",Subtype:"Link",Rect:[x,Math.max(0,y-1),Math.min(width,x+full),Math.min(height,y+size+2)],Border:[0,0,0],A:{Type:"Action",S:"URI",URI:PDFLib.PDFString.of("https://justpdfit.com/")}});page.node.addAnnot(doc.context.register(annot));
 }
 }
}
async function exportPdf(clean){
 if(!source)return;const doc=await PDFLib.PDFDocument.load(source.slice());const imageCache=new Map();
 for(const o of objects){
 const page=doc.getPage(o.page-1);if(!page)continue;const width=page.getWidth(),height=page.getHeight(),x=o.x*width,y=(1-o.y-o.h)*height,w=o.w*width,h=o.h*height;
 if(o.kind==="highlight"){page.drawRectangle({x,y,width:w,height:h,color:PDFLib.rgb(1,.9,.2),opacity:.4});continue;}
 if(o.kind==="check"){page.drawRectangle({x,y,width:w,height:h,borderWidth:Math.max(1,w*.08),borderColor:PDFLib.rgb(.13,.2,.33)});if(o.text==="✓") {page.drawLine({start:{x:x+w*.15,y:y+h*.48},end:{x:x+w*.43,y:y+h*.18},thickness:Math.max(1,w*.09),color:PDFLib.rgb(.13,.2,.33)});page.drawLine({start:{x:x+w*.43,y:y+h*.18},end:{x:x+w*.88,y:y+h*.85},thickness:Math.max(1,w*.09),color:PDFLib.rgb(.13,.2,.33)});}continue;}
 const image=o.image||rasterizeText(o,width,height);
 if(!imageCache.has(image)){const bytes=Uint8Array.from(atob(image.split(",")[1]),c=>c.charCodeAt(0));imageCache.set(image,image.startsWith("data:image/jpeg")?await doc.embedJpg(bytes):await doc.embedPng(bytes));}
 const embedded=imageCache.get(image);
 if(o.image){
  // The editor uses object-fit:contain; preserve aspect ratio in the PDF too.
  const fit=Math.min(w/embedded.width,h/embedded.height);
  const iw=embedded.width*fit,ih=embedded.height*fit;
  page.drawImage(embedded,{x:x+(w-iw)/2,y:y+(h-ih)/2,width:iw,height:ih});
 }else page.drawImage(embedded,{x,y,width:w,height:h});
 }
 if(!clean)await addWatermarks(doc);
 const bytes=await doc.save(),blob=new Blob([bytes],{type:"application/pdf"});
 const name=(file?.name||"document.pdf").replace(/\.pdf$/i,"")+"-justpdfit.pdf";
 if(window.JustPDFItConfirmation?.open)window.JustPDFItConfirmation.open({blob,name,operation:"edit",watermarked:!clean});
 else{const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
 status(tr("ready"));exported=true;syncWizard();
}
async function checkout(){
 if(!source||!window.JustPDFitWatermark?.backendReady)return;const tab=window.open("about:blank","_blank");try{
 if(!tab)throw Error("Please allow popups.");const result=await window.JustPDFitWatermark.createCheckout(documentFingerprint);
 if(!/^https:\/\/checkout\.stripe\.com\//.test(result.checkoutUrl||"")||!result.sessionId)throw Error("Invalid checkout.");
 pending={sessionId:result.sessionId,fingerprint:documentFingerprint};tab.location.href=result.checkoutUrl;status(tr("pending"));updatePaymentButtons();
 }catch(e){tab?.close();status(e.message,true);}
}
async function verify(){
 if(!pending||pending.fingerprint!==documentFingerprint)return status(tr("unpaid"),true);
 try{const result=await window.JustPDFitWatermark.verifyCheckout(pending.sessionId,documentFingerprint);if(result.paid!==true)throw Error(tr("unpaid"));paidFingerprint=documentFingerprint;pending=null;updatePaymentButtons();status(tr("ready"));}
 catch(e){status(e.message||tr("unpaid"),true);}
}
$("editor-file").onchange=e=>{const selectedFile=e.target.files?.[0];$("editor-remove").hidden=!selectedFile;$("editor-file-empty").textContent=selectedFile?.name||more("none");if(selectedFile)loadPdf(selectedFile);else{$("editor-filename").textContent="";source=null;viewer=null;total=0;file=null;exported=false;objects=[];selected=null;$("editor-stage").hidden=true;$("editor-empty").hidden=false;updateNavigation();renderProperties();syncWizard();}};
$("editor-choose").onclick=()=> $("editor-file").click();
$("editor-remove").onclick=()=>{$("editor-file").value="";$("editor-file").dispatchEvent(new Event("change",{bubbles:true}));};
for(const b of ROOT.querySelectorAll(".editor-offer"))b.addEventListener("click",()=>{mode=b.dataset.mode;for(const radio of ROOT.querySelectorAll('[name="editor-price"]'))radio.checked=radio.value===mode;for(const card of ROOT.querySelectorAll(".editor-offer"))card.setAttribute("aria-pressed",String(card===b));updatePaymentButtons();if(source)document.querySelector(".editor-actions")?.scrollIntoView({behavior:"smooth",block:"nearest"});});

$("editor-prev").onclick=()=>gotoPage(current-1);$("editor-next").onclick=()=>gotoPage(current+1);
$("editor-undo").onclick=undo;$("editor-redo").onclick=redo;
document.querySelectorAll('input[name="editor-price"]').forEach(r=>r.onchange=()=>{mode=r.value;updatePaymentButtons();});
$("editor-export").onclick=async()=>{try{if(mode==="paid"&&paidFingerprint!==documentFingerprint)throw Error(tr("unpaid"));await exportPdf(mode==="paid");}catch(e){status(tr("error")+" "+e.message,true);}};
$("editor-checkout").onclick=checkout;$("editor-verify").onclick=verify;
window.addEventListener("resize",()=>{if(source)gotoPage(current).catch(()=>{});});
document.addEventListener("justpdfit-language",updateLabels);
updateLabels();updateButtons();syncWizard();status(tr("status"));
})();