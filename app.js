/* PDF Everything Web: all file processing happens in the browser. */
(() => {
"use strict";
const $ = (id) => document.getElementById(id);
const state = { files: [], result: null, resultUrl: null, resultName: "", pageCount: 0, language: "fr", busy: false, db: null };
const messages = {
fr: {
 skip:"Aller au convertisseur", free:"100 % gratuit",language:"Langue",eyebrow:"Votre boîte à outils PDF, en toute simplicité",headline:"Tout en PDF.<br>Un clic. Gratuit.",subheadline:"Convertissez vos photos et textes, fusionnez vos PDF et gardez vos documents à portée de main. Sans compte et sans filigrane.",
 privacyTag:"Fichiers privés",noUpload:"Aucun envoi au serveur",noWatermark:"Sans filigrane",yourWorkspace:"ESPACE DE TRAVAIL",workTitle:"Que souhaitez-vous faire ?",workHint:"Ajoutez un ou plusieurs fichiers. L'ordre affiché sera celui du PDF final.",local:"Traitement sur votre appareil",chooseFiles:"Choisissez vos fichiers",
 dropTitle:"Glissez vos fichiers ici",dropSubtitle:"ou sélectionnez-les depuis votre appareil",browse:"Choisir des fichiers",types:"PDF · JPG · PNG · HEIC · TIFF · BMP · GIF · TXT · MD · CSV · JSON",takePhoto:"Photographier un document",addFiles:"Ajouter des fichiers",yourFiles:"Fichiers sélectionnés",clear:"Tout effacer",emptySelection:"Vos fichiers apparaîtront ici. Vous pourrez changer leur ordre.",convert:"Créer mon PDF",processNote:"Vos fichiers ne quittent pas cet appareil.",result:"Votre PDF",readyTitle:"Votre document est presque prêt",readyDescription:"Une fois vos fichiers convertis, prévisualisez et téléchargez votre PDF ici.",download:"↓ Télécharger le PDF",share:"↗ Partager",
 limitations:"Les documents Office (Word, Excel, PowerPoint) ne sont pas encore pris en charge. Aucun fichier n'est renommé artificiellement en PDF.",libraryKicker:"VOS DOCUMENTS",libraryTitle:"Votre bibliothèque locale",librarySubtitle:"Les PDF enregistrés restent dans ce navigateur, sur cet appareil.",libraryEmpty:"Les PDF créés apparaîtront ici automatiquement.",
 privacyTitle:"Vos fichiers restent à vous.",privacyDetail:"Conversion et fusion dans votre navigateur. Aucun document envoyé à nos serveurs, aucun compte, aucun suivi publicitaire. La bibliothèque utilise le stockage local de votre navigateur : effacer ses données peut supprimer les PDF enregistrés.",simpleTitle:"Une interface simple, pour tous.",simpleDetail:"Photos, texte et PDF. Réorganisez vos fichiers avant la fusion. Utilisez l'appareil photo sur mobile pour créer un PDF à partir d'une page papier.",
 privacyLink:"Confidentialité",official:"Site officiel",support:"Assistance",footerFree:"Gratuit. Sans filigrane.",
 processing:"Conversion en cours…",success:"Votre PDF est prêt.",unsupported:"Format non pris en charge",empty:"Veuillez ajouter au moins un fichier.",files:"fichiers",pages:"pages",file:"fichier",page:"page",up:"Monter",down:"Descendre",remove:"Retirer",open:"Ouvrir",save:"Enregistrer",deleted:"PDF supprimé de cette bibliothèque.",libraryFailed:"Le stockage local n'est pas disponible. Votre téléchargement fonctionne.",invalidPdf:"Impossible de lire ce PDF (protégé, endommagé ou non pris en charge).",error:"Impossible de convertir ce fichier",formatError:"Format non reconnu ou non pris en charge",textUnicode:"Ce texte contient des caractères que la police PDF standard ne sait pas représenter (par exemple arabe, emoji).",readyToUse:"Télécharger le PDF",shareFailed:"Le partage natif n'est pas disponible dans ce navigateur. Téléchargez le fichier.",allRemoved:"Tous les fichiers ont été retirés.",addWarn:"Certains formats ne sont pas pris en charge et ont été ignorés.",cameraMissing:"L'appareil photo n'est pas disponible.",none:"Aucun PDF à enregistrer."
},
en: {
 skip:"Skip to PDF tool",free:"100% free",language:"Language",eyebrow:"Your PDF toolkit, made simple",headline:"Everything to PDF.<br>One click. Free.",subheadline:"Convert photos and text, merge PDFs and keep your documents handy. No account and no watermarks.",
 privacyTag:"Private files",noUpload:"No server uploads",noWatermark:"No watermark",yourWorkspace:"YOUR WORKSPACE",workTitle:"What would you like to do?",workHint:"Add one or more files. The displayed order becomes the final PDF order.",local:"Processed on your device",chooseFiles:"Choose your files",
 dropTitle:"Drop your files here",dropSubtitle:"or select them from your device",browse:"Choose files",types:"PDF · JPG · PNG · HEIC · TIFF · BMP · GIF · TXT · MD · CSV · JSON",takePhoto:"Photograph a document",addFiles:"Add more files",yourFiles:"Selected files",clear:"Clear all",emptySelection:"Your files will appear here. You can change their order.",convert:"Create my PDF",processNote:"Your files never leave this device.",result:"Your PDF",readyTitle:"Your document is almost ready",readyDescription:"Once converted, preview and download your PDF here.",download:"↓ Download PDF",share:"↗ Share",
 limitations:"Office files (Word, Excel, PowerPoint) are not yet supported. Unsupported files are never simply renamed as PDFs.",libraryKicker:"YOUR DOCUMENTS",libraryTitle:"Your local library",librarySubtitle:"Saved PDFs stay in this browser on this device.",libraryEmpty:"PDFs you create will automatically appear here.",
 privacyTitle:"Your files stay yours.",privacyDetail:"Conversion and merging run in your browser. No files uploaded to our servers, no account, no ad tracking. The library uses browser local storage: clearing browser data may delete saved PDFs.",simpleTitle:"A simple interface for everyone.",simpleDetail:"Photos, text and PDFs. Reorder files before merging. Use your phone camera to create a PDF of a paper document.",
 privacyLink:"Privacy",official:"Official website",support:"Support",footerFree:"Free. No watermark.",
 processing:"Converting…",success:"Your PDF is ready.",unsupported:"Unsupported format",empty:"Please add at least one file.",files:"files",pages:"pages",file:"file",page:"page",up:"Move up",down:"Move down",remove:"Remove",open:"Open",save:"Save",deleted:"PDF deleted from this library.",libraryFailed:"Local storage is unavailable. You can still download your PDF.",invalidPdf:"Unable to read this PDF (encrypted, damaged or unsupported).",error:"Could not convert this file",formatError:"Unknown or unsupported format",textUnicode:"The text contains characters that the standard PDF font cannot represent (such as Arabic or emoji).",readyToUse:"Download PDF",shareFailed:"Native sharing is not available here. Download the file instead.",allRemoved:"All files removed.",addWarn:"Some unsupported file types were skipped.",cameraMissing:"Camera is not available.",none:"No PDF to save."
}};
if (window.JustPDFItI18n) window.JustPDFItI18n.registerBase(messages);
const t = (key) => {
 const localized = window.JustPDFItI18n?.t(key);
 if(localized && localized!==key) return localized;
 return (messages[state.language]||messages.en)[key] || messages.en[key] || key;
};
const esc = (value) => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt = (num) => num >= 1048576 ? (num/1048576).toFixed(1)+" MB" : num >= 1024 ? Math.round(num/1024)+" KB" : num+" B";
const allowed = new Set(["pdf","jpg","jpeg","png","heic","heif","tif","tiff","bmp","gif","txt","text","md","markdown","csv","json"]);
const extension = (name) => (name.split(".").pop()||"").toLowerCase();
const kind = (file) => { const ext = extension(file.name); if (allowed.has(ext)) return ext; if (file.type==="application/pdf") return "pdf"; if (/^image\/(jpeg|png|gif|bmp|tiff|heic|heif)$/.test(file.type)) return file.type.split("/")[1]; if(file.type==="text/plain")return "txt"; return ""; };
function status(msg, isError=false) { const el=$("status"); el.textContent=msg; el.classList.toggle("error",isError); }
function applyLanguage(lang) {
 state.language = window.JustPDFItI18n
   ? window.JustPDFItI18n.setLanguage(lang,{silent:true})
   : (lang==="fr"?"fr":"en");
 if(!window.JustPDFItI18n) {
   document.documentElement.lang=state.language;
   document.querySelectorAll("[data-i18n]").forEach(el=>{
     const key=el.dataset.i18n;
     if(key==="headline")el.innerHTML=t(key);else el.textContent=t(key);
   });
 }
 try{localStorage.setItem("justpdfit-language",state.language)}catch{}
 if(state.result && state.pageCount){
   $("resultInfo").textContent=state.pageCount+" "+t(state.pageCount===1?"page":"pages")+" · "+fmt(state.result.size);
 }
 renderFiles();renderLibrary();
}
function renderFiles(){
 const list=$("selectedFiles"); list.replaceChildren();
 state.files.forEach((file,i)=>{
  const item=document.createElement("li"); item.className="file-item";
  const icon=document.createElement("div"); icon.className="file-symbol";icon.textContent=(kind(file)==="pdf"?"PDF":kind(file).slice(0,4).toUpperCase());
  const info=document.createElement("div"); info.className="file-name";
  const name=document.createElement("strong");name.textContent=file.name;name.title=file.name;
  const size=document.createElement("small");size.textContent=fmt(file.size); info.append(name,size);
  item.append(icon,info);
  for(const [symbol,action,label,disabled] of [["↑","up",t("up"),i===0],["↓","down",t("down"),i===state.files.length-1],["×","remove",t("remove"),false]]){
   const button=document.createElement("button");button.type="button";button.className="icon-btn"+(action==="remove"?" danger":"");button.textContent=symbol;button.title=label;button.setAttribute("aria-label",label+" "+file.name);button.disabled=disabled||state.busy;
   button.addEventListener("click",()=>{
    if(action==="remove")state.files.splice(i,1);
    else{const j=action==="up"?i-1:i+1;[state.files[i],state.files[j]]=[state.files[j],state.files[i]];}
    renderFiles();
   });item.appendChild(button);
  }
  list.appendChild(item);
 });
 $("fileCount").textContent=state.files.length;
 $("selectionEmpty").hidden=state.files.length>0;
 $("processButton").disabled=!state.files.length||state.busy;
 $("clearButton").disabled=!state.files.length||state.busy;
}
function addFiles(incoming){
 const files=Array.from(incoming||[]);let ignored=0;
 for(const file of files){if(kind(file)){state.files.push(file)}else ignored++;}
 renderFiles();status(ignored?t("addWarn"):"",Boolean(ignored));
}
function readAsBytes(file){return file.arrayBuffer()}
function blobToImage(blob) {return new Promise((resolve,reject)=>{
 const url=URL.createObjectURL(blob);const img=new Image();
 img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};
 img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error(t("formatError")))};
 img.src=url;
});}
async function imageData(file,k){
 let blob=file;
 if(k==="heic"||k==="heif"||/hei[cf]/.test(file.type)){
   if(!window.heic2any)throw new Error(t("formatError"));
   const out=await window.heic2any({blob:file,toType:"image/jpeg",quality:.92});
   blob=Array.isArray(out)?out[0]:out;
 }
 if(k==="tif"||k==="tiff"){
   if(!window.UTIF)throw new Error(t("formatError"));
   const buffer=await readAsBytes(file);
   const pages=UTIF.decode(buffer);if(!pages.length)throw new Error(t("formatError"));
   const results=[];
   for(const page of pages){
     UTIF.decodeImage(buffer,page);
     const rgba=UTIF.toRGBA8(page);
     const canvas=document.createElement("canvas");canvas.width=page.width;canvas.height=page.height;
     canvas.getContext("2d").putImageData(new ImageData(new Uint8ClampedArray(rgba),page.width,page.height),0,0);
     results.push(await new Promise(resolve=>canvas.toBlob(resolve,"image/png")));
   }
   return results.filter(Boolean);
 }
 return [blob];
}
async function appendImage(pdf,blob){
 const image=await blobToImage(blob);
 const max=2500,scale=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight));
 const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
 const context=canvas.getContext("2d");context.fillStyle="#fff";context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);
 const encoded=await new Promise(resolve=>canvas.toBlob(resolve,"image/jpeg",.92));
 if(!encoded)throw new Error(t("error"));
 const pdfImage=await pdf.embedJpg(await encoded.arrayBuffer());
 const w=pdfImage.width,h=pdfImage.height;
 // Image dimensions are scaled to fit standard A4 with a small margin.
 const landscape=w>h;const pw=landscape?841.89:595.28;const ph=landscape?595.28:841.89;
 const margin=25;const fit=Math.min((pw-2*margin)/w,(ph-2*margin)/h);
 const iw=w*fit,ih=h*fit;
 const page=pdf.addPage([pw,ph]);page.drawImage(pdfImage,{x:(pw-iw)/2,y:(ph-ih)/2,width:iw,height:ih});
}
async function appendText(pdf,file){
 const content=await file.text();const font=await pdf.embedFont(PDFLib.StandardFonts.Helvetica);
 const A4=[595.28,841.89],margin=43,fontSize=10,lineHeight=15,maxWidth=A4[0]-2*margin;
 let page=pdf.addPage(A4),y=A4[1]-margin;const encoder=new TextEncoder();
 // Reject unsupported characters rather than silently substituting text.
 function pdfText(str){
   try{font.encodeText(str);return str;}catch{throw new Error(t("textUnicode"));}
 }
 function put(line){
   if(y<margin+lineHeight){page=pdf.addPage(A4);y=A4[1]-margin;}
   page.drawText(pdfText(line||" "),{x:margin,y,size:fontSize,font,color:PDFLib.rgb(.16,.21,.33)});
   y-=lineHeight;
 }
 const lines=content.replace(/\r\n?/g,"\n").replace(/\t/g,"    ").split("\n");
 if(!lines.length){put(" ");return;}
 for(const rawLine of lines){
   let line=rawLine || " ";
   while(line.length){
    // Width-aware wrapping, avoids breaking long CSV / JSON lines outside A4.
    let lo=1,hi=Math.min(line.length,800),fit=1;
    while(lo<=hi){const mid=(lo+hi)>>1;const chunk=line.slice(0,mid);const width=font.widthOfTextAtSize(pdfText(chunk),fontSize);if(width<=maxWidth){fit=mid;lo=mid+1;}else hi=mid-1;}
    if(fit<line.length){const space=line.lastIndexOf(" ",fit);if(space>Math.floor(fit*.5))fit=space;}
    put(line.slice(0,fit));line=line.slice(fit).replace(/^ +/,"");
   }
 }
 void encoder;
}
async function makePDF(){
 if(!state.files.length||state.busy)return;
 if(!window.PDFLib){status("Le moteur PDF n'a pas chargé. Vérifiez votre connexion Internet puis réessayez.",true);return;}
 state.busy=true;renderFiles();$("processLabel").textContent=t("processing");status(t("processing"));
 try{
  const pdf=await PDFLib.PDFDocument.create();const files=state.files.slice();
  for(const file of files){const k=kind(file);
   try{
    if(k==="pdf"){
      const source=await PDFLib.PDFDocument.load(await readAsBytes(file),{ignoreEncryption:false});
      const pages=await pdf.copyPages(source,source.getPageIndices());pages.forEach(page=>pdf.addPage(page));
    }else if(["jpg","jpeg","png","heic","heif","tif","tiff","bmp","gif"].includes(k)){
      for(const image of await imageData(file,k))await appendImage(pdf,image);
    }else if(["txt","text","md","markdown","csv","json"].includes(k))await appendText(pdf,file);
    else throw new Error(t("formatError"));
   }catch(e){throw new Error(file.name+": "+(e.message||t("error")));}
  }
  if(pdf.getPageCount()===0)throw new Error(t("empty"));
  const bytes=await pdf.save();
  if(state.resultUrl)URL.revokeObjectURL(state.resultUrl);
  const blob=new Blob([bytes],{type:"application/pdf"});
  state.result=blob;state.pageCount=pdf.getPageCount();state.resultUrl=URL.createObjectURL(blob);
  const basename=state.files.length===1?state.files[0].name.replace(/\.[^.]+$/,""):"PDFEverything-merged";
  state.resultName=(basename||"PDFEverything")+".pdf";
  $("resultName").textContent=state.resultName;
  $("resultInfo").textContent=pdf.getPageCount()+" "+t(pdf.getPageCount()===1?"page":"pages")+" · "+fmt(blob.size);
  $("resultEmpty").hidden=true;$("resultReady").hidden=false;
  $("pdfPreview").src=state.resultUrl+"#toolbar=0";
  status(t("success"));await saveToLibrary(state.resultName,blob);window.JustPDFItConfirmation?.open({blob,name:state.resultName,onRename:async name=>{state.resultName=name;$("resultName").textContent=name;}});
 }catch(err){console.error(err);status(err.message||t("error"),true)}
 finally{state.busy=false;$("processLabel").textContent=t("convert");renderFiles();}
}
function download(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;a.style.display="none";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
async function share(){
 if(!state.result)return;
 try{
  const file=new File([state.result],state.resultName,{type:"application/pdf"});
  if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:state.resultName});return;}
  status(t("shareFailed"),true);
 }catch(e){if(e.name!=="AbortError")status(t("shareFailed"),true);}
}
function openDB(){return new Promise((resolve,reject)=>{
 if(!window.indexedDB){reject(new Error("IndexedDB unavailable"));return;}
 const request=indexedDB.open("pdf-everything-library",1);
 request.onupgradeneeded=()=>{request.result.createObjectStore("pdfs",{keyPath:"id"})};
 request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
});}
function transaction(mode,job){
 return new Promise((resolve,reject)=>{
  if(!state.db)return reject(Error("DB unavailable"));
  const tx=state.db.transaction("pdfs",mode);
  const req=job(tx.objectStore("pdfs"));
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
 });}
async function saveToLibrary(name,blob){
 try{await transaction("readwrite",s=>s.put({id:crypto.randomUUID?crypto.randomUUID():String(Date.now())+"-"+Math.random(),name,blob,date:Date.now(),size:blob.size}));await renderLibrary();}
 catch{status(t("success")+" "+t("libraryFailed"));}
}
async function renderLibrary(){
 if(!state.db)return;
 try{
  const docs=(await transaction("readonly",s=>s.getAll())).sort((a,b)=>b.date-a.date);
  $("libraryCount").textContent=docs.length+" PDF";
  $("libraryEmpty").hidden=docs.length>0;
  const target=$("libraryList");target.replaceChildren();
  for(const doc of docs){
   const row=document.createElement("div");row.className="library-row";
   const icon=document.createElement("div");icon.className="file-symbol";icon.textContent="PDF";
   const info=document.createElement("div");info.className="file-name";
   const name=document.createElement("strong");name.textContent=doc.name;name.title=doc.name;
   const size=document.createElement("small");size.textContent=new Date(doc.date).toLocaleDateString(state.language)+" · "+fmt(doc.size);
   info.append(name,size);row.append(icon,info);
   const actions=document.createElement("div");actions.className="library-actions";
   const dl=document.createElement("button");dl.className="icon-btn";dl.textContent="↓";dl.title=t("save");dl.setAttribute("aria-label",t("save")+" "+doc.name);
   dl.addEventListener("click",()=>download(doc.blob,doc.name));
   const del=document.createElement("button");del.className="icon-btn danger";del.textContent="×";del.title=t("remove");del.setAttribute("aria-label",t("remove")+" "+doc.name);
   del.addEventListener("click",async()=>{await transaction("readwrite",s=>s.delete(doc.id));await renderLibrary();status(t("deleted"));});
   actions.append(dl,del);row.append(actions);target.append(row);
  }
 }catch(err){console.warn("Local library",err);}
}
function init(){
 document.addEventListener("justpdfit-language", ev=>applyLanguage(ev.detail.language));
 const picker=$("filePicker"),drop=$("dropzone");
 const browse=()=>picker.click();
 drop.addEventListener("click",ev=>{if(ev.target.closest("button"))return;browse()});
 drop.addEventListener("keydown",ev=>{if(ev.target===drop&&(ev.key==="Enter"||ev.key===" ")){ev.preventDefault();browse()}});
 $("browseButton").addEventListener("click",ev=>{ev.stopPropagation();browse()});
 $("addMoreButton").addEventListener("click",browse);
 picker.addEventListener("change",ev=>{addFiles(ev.target.files);picker.value=""});
 $("cameraButton").addEventListener("click",()=>$("cameraPicker").click());
 $("cameraPicker").addEventListener("change",ev=>{addFiles(ev.target.files);ev.target.value=""});
 ["dragenter","dragover"].forEach(type=>drop.addEventListener(type,ev=>{ev.preventDefault();drop.classList.add("dragover")}));
 ["dragleave","drop"].forEach(type=>drop.addEventListener(type,ev=>{ev.preventDefault();drop.classList.remove("dragover")}));
 drop.addEventListener("drop",ev=>addFiles(ev.dataTransfer.files));
 $("clearButton").addEventListener("click",()=>{state.files=[];renderFiles();status(t("allRemoved"))});
 $("processButton").addEventListener("click",makePDF);
 $("downloadButton").addEventListener("click",()=>{if(state.result)download(state.result,state.resultName)});
 $("shareButton").addEventListener("click",share);
 applyLanguage(window.JustPDFItI18n?.getLanguage()||((navigator.language||"").startsWith("fr")?"fr":"en"));
 openDB().then(db=>{state.db=db;renderLibrary()}).catch(()=>{});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();