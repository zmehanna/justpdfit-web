/* JustPDFit AI guided workflow. PDF bytes always stay in this browser. */
(()=>{"use strict";
const $=id=>document.getElementById(id),lang=(new URLSearchParams(location.search).get("lang")||navigator.language||"fr").slice(0,2).toLowerCase();
const words={
fr:{file:"Chargez votre PDF pour commencer.",analyzing:"Analyse locale du document…",ready:(n,f,c)=>n+" page(s) analysée(s), "+f+" champ(s) de formulaire, "+c+" repère(s) de signature.",failed:"Impossible d'ouvrir ce document PDF.",instruction:"Décrivez la modification souhaitée.",consent:"Autorisez d'abord l'envoi de votre demande à l'IA.",working:"L'IA prépare la liste des actions…",plan:"Plan proposé. Vérifiez la page, puis cliquez dans l'aperçu pour placer votre signature.",local:"Plan préparé localement. Choisissez la position sur la page.",unrecognized:"Aucune action reconnue. Précisez la demande.",modelFailed:"L'IA est indisponible. Utilisez « Préparer sans IA ».",position:"Position sélectionnée sur la page ",positionNeeded:"Cliquez sur la page pour indiquer la position exacte de la signature.",draw:"Dessinez la signature avant de créer l'aperçu.",noPlan:"Préparez d'abord les modifications.",invalid:"Vérifiez le numéro de page et les actions proposées.",previewing:"Génération du PDF modifié…",previewReady:"Aperçu prêt. Examinez le PDF à droite, puis approuvez le téléchargement.",approval:"Validez le résultat après avoir vu l'aperçu.",export:"Impossible de générer le PDF. Vérifiez votre document et les emplacements.",modified:"Aperçu modifié",original:"PDF original",manual:"Placement manuel obligatoire si aucun repère fiable n'est détecté.",auto:"Repère textuel trouvé. Cliquez dessus dans la page pour confirmer l'emplacement.",select:"Modifications prévues",page:"Page",sign:"Signature manuscrite",date:"Date du jour",delete:"Suppression de page",text:"Ajout de texte",field:"Remplir champ",mark:"Signature ici",noPosition:"Aucun emplacement choisi",changed:"Les modifications ont changé. Générez un nouvel aperçu.",notSigned:"La signature manuscrite doit être dessinée.",unsupported:"Cette action n'est pas encore prise en charge ici."},
en:{file:"Upload a PDF to start.",analyzing:"Analyzing your PDF locally…",ready:(n,f,c)=>n+" page(s) analyzed, "+f+" form field(s), "+c+" signature label(s).",failed:"Could not open this PDF.",instruction:"Describe the changes you want.",consent:"Please consent to sending your request to AI.",working:"AI is preparing actions…",plan:"Suggested plan. Verify the page and click the document to place your signature.",local:"Prepared locally. Choose the position on the document.",unrecognized:"No recognized action. Please be more specific.",modelFailed:"AI is unavailable. Try the local option.",position:"Position selected on page ",positionNeeded:"Click the page to place the signature exactly.",draw:"Draw your signature before creating the preview.",noPlan:"Prepare an edit plan first.",invalid:"Verify page numbers and proposed operations.",previewing:"Generating modified PDF…",previewReady:"Preview ready. Review the PDF on the right, then approve for download.",approval:"Approve the result after seeing the preview.",export:"Unable to prepare this PDF. Check the document and placement.",modified:"Modified preview",original:"Original PDF",manual:"For scanned PDFs, click the exact position manually.",auto:"Text label detected. Click the document to confirm signature position.",select:"Planned edits",page:"Page",sign:"Handwritten signature",date:"Today's date",delete:"Delete page",text:"Add text",field:"Fill field",mark:"Sign here",noPosition:"No position selected",changed:"Edits changed. Create a new preview.",notSigned:"Draw your signature before previewing.",unsupported:"This operation is not available yet."},
ar:{file:"ارفع ملف PDF للبدء.",analyzing:"يجري تحليل الملف على جهازك…",ready:(n,f,c)=>n+" صفحة، "+f+" حقل، "+c+" موضع توقيع.",failed:"تعذر فتح ملف PDF.",instruction:"اكتب التعديلات المطلوبة.",consent:"وافق على إرسال طلبك إلى الذكاء الاصطناعي.",working:"الذكاء الاصطناعي يجهّز التعديلات…",plan:"راجع الصفحة ثم انقر على مكان التوقيع في المعاينة.",local:"تم إعداد التعديلات محلياً. اختر موقع التوقيع.",unrecognized:"لم أتعرف على تعديل. وضح طلبك.",modelFailed:"خدمة الذكاء الاصطناعي غير متاحة. جرب التحضير المحلي.",position:"تم تحديد موقع التوقيع في الصفحة ",positionNeeded:"انقر على الصفحة لتحديد موقع التوقيع.",draw:"ارسم توقيعك قبل المعاينة.",noPlan:"حضّر خطة التعديل أولاً.",invalid:"تحقق من أرقام الصفحات والتعديلات.",previewing:"يجري إعداد معاينة PDF…",previewReady:"المعاينة جاهزة. راجع الملف ثم وافق على التنزيل.",approval:"وافق على النتيجة بعد المعاينة.",export:"تعذر إنشاء PDF. تحقق من المستند والموضع.",modified:"معاينة التعديلات",original:"PDF الأصلي",manual:"انقر يدوياً لتحديد موقع التوقيع في الملفات الممسوحة.",auto:"تم العثور على وصف. انقر للتأكد من موقع التوقيع.",select:"التعديلات",page:"صفحة",sign:"توقيع بخط اليد",date:"تاريخ اليوم",delete:"حذف صفحة",text:"إضافة نص",field:"تعبئة حقل",mark:"التوقيع هنا",noPosition:"لم يُحدد موقع",changed:"تم تغيير التعديلات. أنشئ معاينة جديدة.",notSigned:"ارسم توقيعك قبل المعاينة.",unsupported:"هذه العملية غير متاحة حالياً."}};
const t=words[lang]||words.fr;
const labels={fr:["Fichier","Analyse","Instructions","Emplacement","Aperçu","Valider & télécharger"],en:["File","Analysis","Instructions","Placement","Preview","Approve & download"],ar:["الملف","التحليل","الطلب","الموقع","المعاينة","التحميل"]};
document.documentElement.lang=lang;if(lang==="ar")document.documentElement.dir="rtl";
[...document.querySelectorAll(".step")].forEach((e,i)=>e.lastElementChild.textContent=(labels[lang]||labels.fr)[i]);
let bytes=null,source=null,pdfDoc=null,pages=0,fields=[],anchors=[],selectedPage=1,viewport=null,
 activeStep=1,plan=[],point=null,datePoint=null,signatureWidth=155,placementMode="signature",previewUrl=null,previewBytes=null,previewDoc=null,hasInk=false,renderSerial=0;
const API="https://justpdfit-ai-planner.zmehanna.workers.dev/interpret";
const signature=$("signature"),ink=signature.getContext("2d");ink.lineWidth=3.5;ink.lineCap="round";ink.lineJoin="round";ink.strokeStyle="#1c3055";let drawing=false;
function status(id,msg,error=false){$(id).textContent=msg;$(id).className="status"+(error?" error":"");}
// Compact completed steps, retaining a one-line summary and an explicit Edit action.
const stages=[...document.querySelectorAll(".layout > .card:first-child > .stage")];
const overrides=new Set();
const summaries=[
 ()=>$("file").files?.[0]?.name||"",
 ()=>pages?(pages+" "+(lang==="fr"?"pages analysées":lang==="ar"?"صفحات محللة":"pages analyzed")):"",
 ()=>$("request").value.trim().replace(/\\s+/g," ").slice(0,90),
 ()=>point?(lang==="fr"?"Signature placée sur la page ":lang==="ar"?"التوقيع في الصفحة ":"Signature placed on page ")+point.page:(lang==="fr"?"Emplacement à vérifier":lang==="ar"?"تحقق من الموضع":"Review placement"),
 ()=>previewBytes?(lang==="fr"?"Aperçu généré":lang==="ar"?"تم إنشاء المعاينة":"Preview generated"):"",
 ()=>""
];
const editLabels={fr:"Modifier",en:"Edit",ar:"تعديل"};
stages.forEach((stage,i)=>{
 stage.dataset.stage=String(i+1);
 const heading=stage.querySelector("h3");
 const body=document.createElement("div");body.className="stage-body";
 while(heading.nextSibling)body.appendChild(heading.nextSibling);
 stage.appendChild(body);
 const summary=document.createElement("div");summary.className="stage-summary";summary.hidden=true;
 const textNode=document.createElement("span");textNode.className="stage-summary-text";
 const edit=document.createElement("button");edit.type="button";edit.className="stage-edit";
 edit.textContent=editLabels[lang]||editLabels.fr;
 edit.setAttribute("aria-expanded","false");
 edit.setAttribute("aria-label",(editLabels[lang]||editLabels.fr)+" "+(heading.textContent||"").trim());
 edit.addEventListener("click",()=>{
  if(overrides.has(i)){overrides.delete(i);}else{overrides.add(i);}
  updateStageDisplay();
  if(overrides.has(i)&&i===2)$("request").focus({preventScroll:true});
 });
 summary.append(textNode,edit);stage.insertBefore(summary,body);
});
function updateStageDisplay(){
 stages.forEach((stage,i)=>{
  const finished=i<activeStep-1&&i<5;
  const collapsed=finished&&!overrides.has(i);
  stage.classList.toggle("is-collapsed",collapsed);
  stage.classList.toggle("is-complete",finished);
  const summary=stage.querySelector(".stage-summary");
  summary.hidden=!collapsed;
  summary.querySelector(".stage-summary-text").textContent=(summaries[i]?.()||"");
  stage.querySelector(".stage-edit").setAttribute("aria-expanded",String(!collapsed));
 });
}
function step(n){
 activeStep=n;
 document.querySelectorAll(".step").forEach(e=>{
  const num=Number(e.dataset.step);e.classList.toggle("done",num<n);e.classList.toggle("active",num===n);
 });
 // A new step folds earlier ones; the user can always reopen any completed step.
 overrides.clear();updateStageDisplay();
}
function planChange(){point=null;datePoint=null;invalidate();$("positionLabel").textContent=t.noPosition;drawMark();}
function invalidate(){previewDoc=null;if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl=null;}previewBytes=null;$("approve").checked=false;$("approve").disabled=true;$("download").disabled=true;$("pdfPreview").style.display="none";$("paper").hidden=!source;$("empty").hidden=!!source;$("previewMode").textContent=t.original;$("backToSource").hidden=true;drawMark();}
function drawMark(){
 const canvas=$("pageCanvas"),rect=canvas.getBoundingClientRect();
 const sourceVisible=!previewDoc&&!!viewport&&rect.width>0&&rect.height>0;
 const show=(id,p,widthPdf,heightPdf)=>{
  const mark=$(id);
  if(!sourceVisible||!p||p.page!==selectedPage){mark.style.display="none";return;}
  const [x,y]=viewport.convertToViewportPoint(p.x,p.y);
  const ratio=rect.width/canvas.width;
  const width=Math.min(rect.width-8,Math.max(28,widthPdf*viewport.scale*ratio));
  const height=Math.min(rect.height-8,Math.max(17,heightPdf*viewport.scale*ratio));
  const left=Math.max(4,Math.min(x*ratio-width/2,rect.width-width-4));
  const top=Math.max(4,Math.min(y*ratio-height/2,rect.height-height-4));
  mark.style.display="block";mark.style.left=left+"px";mark.style.top=top+"px";
  mark.style.width=width+"px";mark.style.height=height+"px";
 };
 show("placementMark",point,effectiveSignatureWidth(),signatureHeight());
 show("dateMark",datePoint,86,20);
 $("moveSignature").hidden=!plan.some(a=>a.type==="add_signature"&&a.enabled);
 $("moveDate").hidden=!plan.some(a=>a.type==="add_date"&&a.enabled);
 $("editHint").hidden=$("moveSignature").hidden&&$("moveDate").hidden;
}
function effectiveSignatureWidth(){return Math.min(signatureWidth,200/Math.max(.1,signatureInkAspect||.34));}
function signatureHeight(){return Math.min(200,effectiveSignatureWidth()*(signatureInkAspect||.34));}
let signatureInkAspect=.34;
function updateSignatureAspect(){
 const d=ink.getImageData(0,0,signature.width,signature.height).data;
 let x0=signature.width,y0=signature.height,x1=-1,y1=-1;
 for(let y=0;y<signature.height;y++)for(let x=0;x<signature.width;x++)if(d[(y*signature.width+x)*4+3]>25){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
 if(x1>=x0)signatureInkAspect=Math.min(2,Math.max(.1,(y1-y0+16)/(x1-x0+16)));
}
function canPlan(){const ok=!!bytes&&$("request").value.trim().length>2;$("planButton").disabled=!ok;$("localButton").disabled=!ok;}
$("request").addEventListener("input",()=>{canPlan();if(plan.length){plan=[];point=null;$("plans")?.remove();invalidate();status("planStatus",t.changed);step(3);}});
$("file").addEventListener("change",async()=>{
 const f=$("file").files?.[0];renderSerial++;bytes=null;source=null;pdfDoc=null;fields=[];anchors=[];plan=[];point=null;datePoint=null;signatureWidth=155;pages=0;
 $("pagePicker").replaceChildren();$("pagePicker").disabled=true;$("prevPage").disabled=true;$("nextPage").disabled=true;$("plans")?.remove();$("fieldCandidates").textContent="";
 $("analysis").textContent=t.analyzing;step(2);invalidate();canPlan();
 if(!f){status("analysis",t.file);step(1);return;}
 try{
  if(!window.PDFLib||!window.pdfjsLib)throw Error("PDF libraries unavailable");
  const data=new Uint8Array(await f.arrayBuffer());bytes=data;
  source=await PDFLib.PDFDocument.load(data,{ignoreEncryption:false});
  pages=source.getPageCount();if(pages<1||pages>500)throw Error("page count");
  pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  pdfDoc=await pdfjsLib.getDocument({data:data.slice()}).promise;
  try{fields=source.getForm().getFields().slice(0,35).map(x=>({name:x.getName(),type:x.constructor.name}));}catch{}
  // Text extraction never leaves the device unless the second consent checkbox is ticked.
  for(let n=1;n<=Math.min(pages,40);n++){
   const pg=await pdfDoc.getPage(n),content=await pg.getTextContent();
   for(const item of content.items){
    const label=String(item.str||"").trim(),matrix=item.transform;
    if(label&&matrix?.length>=6&&/assur[ée]|insured|signature|signataire|sign here|date|fait en|exemplaire|تاريخ|توقيع|إمضاء/i.test(label)){
     anchors.push({page:n,label,x:Number(matrix[4]),y:Number(matrix[5]),kind:/date|fait en|exemplaire|تاريخ/i.test(label)?"date":"signature",source:"native",confidence:.85});
    }
   }
  }
  for(let i=1;i<=pages;i++){const opt=document.createElement("option");opt.value=String(i);opt.textContent=t.page+" "+i;$("pagePicker").append(opt);}
  $("pagePicker").disabled=false;selectedPage=1;$("pagePicker").value="1";
  status("analysis",t.ready(pages,fields.length,anchors.length));
  $("fieldCandidates").textContent=anchors.length?anchors.slice(0,5).map(a=>t.page+" "+a.page+": "+a.label).join(" · "):t.manual;
  canPlan();step(3);await showSource(1);
 }catch(e){bytes=null;source=null;pdfDoc=null;status("analysis",t.failed,true);step(1);}
});
async function showModified(pageNum){
 if(!previewDoc)return;
 const id=++renderSerial,all=previewDoc.numPages;
 selectedPage=Math.min(Math.max(1,pageNum),all);
 $("currentPage").textContent=t.page+" "+selectedPage+" / "+all;
 $("prevPage").disabled=selectedPage<=1;$("nextPage").disabled=selectedPage>=all;
 $("empty").hidden=true;$("paper").hidden=false;$("pdfPreview").style.display="none";
 $("previewMode").textContent=t.modified;$("placementMark").style.display="none";$("previewNote").textContent=lang==="fr"?"PDF modifié : vérifiez la signature et chaque page avant de valider.":lang==="ar"?"راجع الملف المعدّل والتوقيع قبل الموافقة.":"Modified PDF: review the signature and all pages before approving.";
 const page=await previewDoc.getPage(selectedPage);
 const bounds=page.view,width=Math.max(240,Math.min(610,$("viewer").clientWidth-28));
 const v=page.getViewport({scale:Math.min(1.6,width/Math.max(1,bounds[2]-bounds[0]))});
 const canvas=$("pageCanvas");canvas.width=Math.ceil(v.width);canvas.height=Math.ceil(v.height);
 await page.render({canvasContext:canvas.getContext("2d"),viewport:v}).promise;
 if(id!==renderSerial)return;viewport=v;
}
async function showSource(pageNum){
 if(!pdfDoc)return;const id=++renderSerial;selectedPage=pageNum;
 $("pagePicker").value=String(pageNum);$("currentPage").textContent=t.page+" "+pageNum+" / "+pages;
 $("prevPage").disabled=pageNum<=1;$("nextPage").disabled=pageNum>=pages;
 $("empty").hidden=true;$("paper").hidden=false;$("pdfPreview").style.display="none";$("previewMode").textContent=t.original;$("previewNote").textContent=lang==="fr"?"Cliquez sur la page pour ajuster l’emplacement, puis générez le nouvel aperçu.":lang==="ar"?"اضغط على الصفحة لتعديل الموضع ثم أنشئ معاينة جديدة.":"Click on the document to adjust the position, then generate a new preview.";
 const pdfPage=await pdfDoc.getPage(pageNum);
 const bounds=pdfPage.view,width=Math.max(240,Math.min(610,$("viewer").clientWidth-28));
 const scale=Math.min(1.6,width/Math.max(1,bounds[2]-bounds[0]));
 const v=pdfPage.getViewport({scale});
 const canvas=$("pageCanvas");canvas.width=Math.ceil(v.width);canvas.height=Math.ceil(v.height);
 await pdfPage.render({canvasContext:canvas.getContext("2d"),viewport:v}).promise;
 if(id!==renderSerial)return;viewport=v;drawMark();
}
$("pagePicker").addEventListener("change",()=>{if(previewDoc)return;const n=Number($("pagePicker").value);if(Number.isInteger(n)){if(plan.some(a=>a.type==="add_signature")){plan.find(a=>a.type==="add_signature").page=n;point=null;datePoint=null;invalidate();$("positionLabel").textContent=t.noPosition;step(4);}showSource(n);}});
$("prevPage").addEventListener("click",()=>{if(selectedPage>1){if(previewDoc)showModified(selectedPage-1);else $("pagePicker").value=String(selectedPage-1),$("pagePicker").dispatchEvent(new Event("change"));}});
$("nextPage").addEventListener("click",()=>{if(selectedPage<(previewDoc?previewDoc.numPages:pages)){if(previewDoc)showModified(selectedPage+1);else $("pagePicker").value=String(selectedPage+1),$("pagePicker").dispatchEvent(new Event("change"));}});
function inkPos(e){const r=signature.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*signature.width,y:(e.clientY-r.top)/r.height*signature.height};}
signature.addEventListener("pointerdown",e=>{e.preventDefault();drawing=true;hasInk=true;signature.setPointerCapture(e.pointerId);const p=inkPos(e);ink.beginPath();ink.moveTo(p.x,p.y);ink.lineTo(p.x+.1,p.y+.1);ink.stroke();invalidate();});
signature.addEventListener("pointermove",e=>{if(!drawing)return;e.preventDefault();const p=inkPos(e);ink.lineTo(p.x,p.y);ink.stroke();});
["pointerup","pointercancel"].forEach(n=>signature.addEventListener(n,()=>{drawing=false;updateSignatureAspect();drawMark();}));
$("clearSignature").addEventListener("click",()=>{ink.clearRect(0,0,signature.width,signature.height);hasInk=false;signatureInkAspect=.34;invalidate();});
const centerFromPointer=e=>{
 const canvas=$("pageCanvas"),rect=canvas.getBoundingClientRect();
 const x=(e.clientX-rect.left)/rect.width*canvas.width;
 const y=(e.clientY-rect.top)/rect.height*canvas.height;
 const [px,py]=viewport.convertToPdfPoint(x,y);
 const pg=source.getPage(selectedPage-1);
 return {page:selectedPage,x:Math.max(8,Math.min(pg.getWidth()-8,px)),y:Math.max(8,Math.min(pg.getHeight()-8,py))};
};
function positionItem(mode,position){
 if(!position||previewDoc)return;
 if(mode==="date"){
  const action=plan.find(a=>a.type==="add_date"&&a.enabled);
  if(!action)return;
  datePoint=position;action.page=selectedPage;
  status("positionStatus",lang==="fr"?"Date placée sur la page "+selectedPage+" — déplacez-la si nécessaire.":"Date positioned on page "+selectedPage);
 }else{
  const action=plan.find(a=>a.type==="add_signature"&&a.enabled);
  if(!action)return;
  point=position;action.page=selectedPage;
  $("positionLabel").textContent=t.position+selectedPage;
  status("positionStatus",t.position+selectedPage);
 }
 invalidate();step(4);drawMark();$("previewButton").disabled=false;
}
$("pageCanvas").addEventListener("click",e=>{
 if(previewDoc||!viewport||!plan.length)return;
 positionItem(placementMode,centerFromPointer(e));
});
function switchPlacementMode(mode){
 placementMode=mode;
 $("moveSignature").style.outline=mode==="signature"?"2px solid #ef4c65":"none";
 $("moveDate").style.outline=mode==="date"?"2px solid #397bc9":"none";
 $("editHint").textContent=lang==="fr"?(mode==="date"?"Cliquez sur la page ou faites glisser la date.":"Glissez la signature pour la déplacer ; tirez le coin pour ajuster sa taille."):(mode==="date"?"Click or drag the date.":"Drag the signature; pull its corner to resize.");
}
$("moveSignature").addEventListener("click",()=>switchPlacementMode("signature"));
$("moveDate").addEventListener("click",()=>switchPlacementMode("date"));
switchPlacementMode("signature");
for(const [id,mode] of [["placementMark","signature"],["dateMark","date"]]){
 const mark=$(id);let drag=null;
 mark.addEventListener("pointerdown",e=>{
  if(previewDoc||!viewport)return;
  e.preventDefault();e.stopPropagation();
  const resize=mode==="signature"&&!!e.target.closest(".resize-handle");
  drag={resize,startX:e.clientX,initialWidth:signatureWidth};
  switchPlacementMode(mode);mark.setPointerCapture(e.pointerId);
 });
 mark.addEventListener("pointermove",e=>{
  if(!drag)return;
  e.preventDefault();
  if(drag.resize){
   const ratio=$("pageCanvas").getBoundingClientRect().width/$("pageCanvas").width;
   signatureWidth=Math.max(45,Math.min(240,drag.initialWidth+(e.clientX-drag.startX)/(Math.max(.01,viewport.scale*ratio))));
   invalidate();drawMark();
  }else{
   positionItem(mode,centerFromPointer(e));
  }
 });
 const finish=()=>{drag=null;};
 mark.addEventListener("pointerup",finish);mark.addEventListener("pointercancel",finish);
 mark.addEventListener("click",e=>e.stopPropagation());
}
$("backToSource").addEventListener("click",()=>{const n=point?.page||datePoint?.page||plan.find(a=>a.type==="add_signature")?.page||1;invalidate();showSource(n);step(4);});
function localActions(){
 const q=$("request").value.trim();if(!q)return [];
 let num=1;const match=q.match(/(?:page|p\.|صفحة)\s*(\d+)/i),last=/derni[eè]re|last page|آخر صفحة/i.test(q),first=/premi[eè]re|first page|الصفحة الأولى/i.test(q);
 if(match)num=Math.max(1,Math.min(pages,Number(match[1])));else if(last)num=pages;else if(first)num=1;
 else if(/assur[ée]|insured/i.test(q)){const candidate=anchors.find(x=>/signature.*assur[ée]|assur[ée].*signature|insured.*sign/i.test(x.label));if(candidate)num=candidate.page;}
 const items=[];
 if(/sign|signe|signer|signature|paraph|tوقيع|توقيع|إمضاء/i.test(q))items.push({type:"add_signature",page:num,enabled:true});
 if(/date du jour|date d.aujourd|aujourd.hui|today.s date|add date|ajoute.*date|mets.*date|أضف.*تاريخ/i.test(q))items.push({type:"add_date",page:num,position:"bottom-right",enabled:true});
 const del=q.match(/(?:supprim|delete|remove|حذف)[^\d]{0,20}(?:page\s*)?(\d+)/i);if(del)items.push({type:"delete_page",page:Number(del[1]),enabled:true});
 return items.filter(a=>a.page>=1&&a.page<=pages);
}
async function detectRequestedSignature(){
 const q=$("request").value.toLowerCase();
 if(!pdfDoc||!/sign|signe|signature|paraph|توقيع|إمضاء|date|aujourd|today|تاريخ/i.test(q))return;
 const needSign=/sign|signe|signature|paraph|توقيع|إمضاء/i.test(q);
 const needDate=/date|aujourd|today|تاريخ/i.test(q);
 const signFound=anchors.some(a=>a.kind!=="date"&&(/assur[ée]|insured/i.test(q)?/assur[ée]|insured/i.test(a.label):/signature|sign here|توقيع|إمضاء/i.test(a.label)));
 const dateFound=anchors.some(a=>a.kind==="date"||/date|fait en|exemplaire|تاريخ/i.test(a.label));
 if((!needSign||signFound)&&(!needDate||dateFound))return;
 if(!window.JustPDFitLocalOCR){
  status("planStatus",lang==="fr"?"OCR indisponible. Vous pourrez placer la signature manuellement.":"OCR unavailable; place the signature manually.",true);return;
 }
 const m=q.match(/(?:page|p\\.|صفحة)\\s*(\\d+)/i);
 const forced=m?Number(m[1]):/premi[eè]re|first page|الأولى/.test(q)?1:/derni[eè]re|last page|الأخيرة/.test(q)?pages:0;
 const candidate=forced?[forced]:Array.from({length:Math.min(pages,3)},(_,i)=>i+1);
 status("planStatus",lang==="fr"?"Document scanné : recherche locale de l’emplacement de signature…":"Scanning locally for the signature location…");
 try{
  const result=await JustPDFitLocalOCR.search(pdfDoc,candidate,n=>status("planStatus",(lang==="fr"?"Reconnaissance visuelle de la page ":"Scanning page ")+n+"…"));
  anchors.push(...result.filter(a=>!anchors.some(b=>b.page===a.page&&b.label===a.label&&b.kind===a.kind)));
  if(result.length){
   $("fieldCandidates").textContent=(lang==="fr"?"Emplacement(s) reconnus dans le scan : ":"Detected on scan: ")+result.map(a=>(lang==="fr"?"page ":"page ")+a.page+" — "+a.label).join(" · ");
  }else{
   status("planStatus",lang==="fr"?"Aucun repère fiable reconnu sur le scan. Placement manuel disponible.":"No reliable label detected; manual placement available.");
  }
 }catch(e){
  status("planStatus",lang==="fr"?"Analyse visuelle indisponible. Placement manuel toujours possible.":"Local visual analysis unavailable; manual placement remains available.");
 }
}
function setPlan(items,sourceMode){
 plan=items.slice(0,8).filter(a=>a&&["add_signature","add_date","delete_page","add_text","fill_field"].includes(a.type)&&Number.isInteger(Number(a.page))&&a.page>=1&&a.page<=pages).map(a=>({...a,enabled:true,page:Number(a.page)}));
 point=null;datePoint=null;signatureWidth=155;invalidate();$("plans")?.remove();if(!plan.length){status("planStatus",t.unrecognized,true);return;}
 const holder=document.createElement("div");holder.id="plans";holder.className="status";
 const heading=document.createElement("strong");heading.textContent=t.select;holder.append(heading);
 for(const item of plan){
  const label=document.createElement("label");label.className="checkbox";
  const box=document.createElement("input");box.type="checkbox";box.checked=true;box.addEventListener("change",()=>{item.enabled=box.checked;invalidate();});
  const title=document.createElement("span");title.textContent=({add_signature:t.sign,add_date:t.date,delete_page:t.delete,add_text:t.text,fill_field:t.field})[item.type]+" — "+t.page+" "+item.page;
  label.append(box,title);holder.append(label);
 }
 $("planStatus").after(holder);
 const sig=plan.find(a=>a.type==="add_signature");
 $("signatureControls").hidden=!sig;
 if(sig){const requested=$("request").value.toLowerCase(),hint=anchors.find(a=>a.page===sig.page&&(/assur[ée]|insured/i.test(requested)?/signature.*assur[ée]|assur[ée].*signature|assur[ée]|insured/i.test(a.label):/signature|sign/i.test(a.label)));
  selectedPage=sig.page;$("pagePicker").value=String(sig.page);
  if(hint&&(!hint.source||hint.confidence>=0.85)){
   const page=source.getPage(sig.page-1);
   point={page:sig.page,x:Math.max(24,Math.min(page.getWidth()-60,hint.x+(hint.source==="ocr"?0:35))),y:Math.max(24,Math.min(page.getHeight()-24,hint.y-(hint.source==="ocr"?32:27)))};
   $("positionLabel").textContent=t.position+sig.page;
  }
  showSource(sig.page);
  status("positionStatus",hint?(hint.source==="ocr"?(lang==="fr"?"Emplacement proposé par reconnaissance visuelle (« "+hint.label+" »). Vérifiez et déplacez-le si nécessaire.":"Visual OCR proposal (“"+hint.label+"”). Check and reposition if needed."):t.auto):t.positionNeeded);
 } else status("positionStatus",t.local);
 const dateAction=plan.find(a=>a.type==="add_date");
 if(dateAction){
  const dates=anchors.filter(a=>a.page===dateAction.page&&(a.kind==="date"||/date|fait en|exemplaire|تاريخ/i.test(a.label)));
  const named=dates.find(a=>/date|fait en|exemplaire|تاريخ/i.test(a.label));
  const dateAnchor=named||dates[0];
  const pg=source.getPage(dateAction.page-1);
  if(dateAnchor&&(!dateAnchor.source||dateAnchor.confidence>=.82)){
   datePoint={page:dateAction.page,x:Math.max(25,Math.min(pg.getWidth()-55,dateAnchor.x+70)),y:Math.max(20,Math.min(pg.getHeight()-20,dateAnchor.y-2))};
   status("positionStatus",lang==="fr"?"Date proposée près du repère « "+dateAnchor.label+" ». Vérifiez et ajustez les deux éléments dans l’aperçu.":"Date proposed near “"+dateAnchor.label+"”. Review both placements.");
  }else if(point&&point.page===dateAction.page){
   datePoint={page:dateAction.page,x:Math.max(28,Math.min(pg.getWidth()-55,point.x+95)),y:Math.max(18,Math.min(pg.getHeight()-18,point.y+35))};
   status("positionStatus",lang==="fr"?"Aucun champ date fiable : position proposée près de la signature, à vérifier.":"No reliable date field: suggested near the signature; please review.");
  }else{
   datePoint=null;
   status("positionStatus",lang==="fr"?"Champ date introuvable : cliquez sur « Déplacer la date », puis choisissez sa position sur le PDF.":"Date field not found: select Move date and click its location.");
  }
 }
 switchPlacementMode(sig?"signature":"date");
 drawMark();
 $("previewButton").disabled=false;
 status("planStatus",sourceMode==="ai"?t.plan:t.local);step(sig?4:5);
}
$("localButton").addEventListener("click",async()=>{
 if(!bytes)return;
 $("localButton").disabled=true;
 try{await detectRequestedSignature();setPlan(localActions(),"local");}
 finally{canPlan();}
});
$("planButton").addEventListener("click",async()=>{
 if(!bytes)return;if(!$("requestConsent").checked){status("planStatus",t.consent,true);return;}
 $("planButton").disabled=true;status("planStatus",t.working);
 try{
  await detectRequestedSignature();
  let excerpt="";
  const share=$("docConsent").checked;
  if(share&&pdfDoc){
   for(let p=1;p<=Math.min(pages,12)&&excerpt.length<6000;p++){
    const data=await(await pdfDoc.getPage(p)).getTextContent();
    excerpt+="\n[Page "+p+"] "+data.items.map(i=>i.str||"").join(" ").slice(0,800);
   }
  }
  const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),22000);
  let resp;try{resp=await fetch(API,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({instruction:$("request").value.trim().slice(0,600),pages,lang:words[lang]?lang:"fr",consent:true,shareDocument:share,documentExcerpt:share?excerpt.slice(0,6000):"",fields:share?fields:[]}),signal:ctrl.signal,cache:"no-store"});}finally{clearTimeout(timer);}
  if(!resp.ok)throw Error("AI "+resp.status);
  const data=await resp.json();let actions=Array.isArray(data.actions)?data.actions:[];
  // An explicit page request is authoritative. Never quietly override it with AI output.
  const q=$("request").value.toLowerCase(),m=q.match(/(?:page|p\.|صفحة)\s*(\d+)/i);
  const forced=m?Number(m[1]):/premi[eè]re|first page|الصفحة الأولى/.test(q)?1:/derni[eè]re|last page|آخر صفحة/.test(q)?pages:null;
  if(forced!==null)actions=actions.map(a=>a.type==="add_signature"?{...a,page:forced}:a);
  else if(/assur[ée]|insured/i.test(q)){
   const target=anchors.find(a=>/signature.*assur[ée]|assur[ée].*signature|insured.*sign|sign.*insured/i.test(a.label));
   if(target)actions=actions.map(a=>a.type==="add_signature"?{...a,page:target.page}:a);
  }
  setPlan(actions,"ai");
  if(data.uncertainty&&!point&&!datePoint)status("positionStatus",data.uncertainty);
 }catch(e){status("planStatus",t.modelFailed,true);}finally{canPlan();}
});
function croppedSignature(){
 const data=ink.getImageData(0,0,signature.width,signature.height),d=data.data;
 let left=signature.width,top=signature.height,right=-1,bottom=-1;
 for(let y=0;y<signature.height;y++)for(let x=0;x<signature.width;x++){const a=d[(y*signature.width+x)*4+3];if(a>25){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}}
 if(right<left)return null;
 const pad=8,w=right-left+pad*2,h=bottom-top+pad*2,cn=document.createElement("canvas");cn.width=w;cn.height=h;
 cn.getContext("2d").drawImage(signature,left-pad,top-pad,w,h,0,0,w,h);
 return cn.toDataURL("image/png");
}
function linkMark(pdf,font){for(const page of pdf.getPages()){const text="JustPDFit.com",size=7,w=font.widthOfTextAtSize(text,size),x=Math.max(8,page.getWidth()-w-12),y=9;page.drawText(text,{x,y,size,font,color:PDFLib.rgb(.89,.23,.38),opacity:.78});try{const a=pdf.context.obj({Type:"Annot",Subtype:"Link",Rect:[x,y,x+w,y+10],Border:[0,0,0],A:{S:"URI",URI:PDFLib.PDFString.of("https://justpdfit.com/")}});page.node.addAnnot(pdf.context.register(a));}catch{}}}
$("previewButton").addEventListener("click",async()=>{
 if(!source||!plan.length){status("positionStatus",t.noPlan,true);return;}
 const edits=plan.filter(a=>a.enabled);
 if(!edits.length){status("positionStatus",t.noPlan,true);return;}
 const sig=edits.find(a=>a.type==="add_signature");
 const dateAction=edits.find(a=>a.type==="add_date");
 if(dateAction&&(!datePoint||datePoint.page!==dateAction.page)){
  status("positionStatus",lang==="fr"?"Choisissez la position de la date sur l’aperçu avant de continuer.":"Choose the date position on the preview first.",true);
  return;
 }
 if(sig&&(!point||point.page!==sig.page)){status("positionStatus",t.positionNeeded,true);return;}
 const signaturePng=sig?croppedSignature():null;
 if(sig&&!signaturePng){status("positionStatus",t.draw,true);return;}
 const deleted=new Set(edits.filter(a=>a.type==="delete_page").map(a=>a.page));
 if(deleted.size>=pages||edits.some(a=>a.page<1||a.page>pages||(a.type!=="delete_page"&&deleted.has(a.page)))){status("positionStatus",t.invalid,true);return;}
 $("previewButton").disabled=true;invalidate();status("planStatus",t.previewing);step(5);
 try{
  const pdf=await PDFLib.PDFDocument.load(bytes),font=await pdf.embedFont(PDFLib.StandardFonts.Helvetica);
  for(const a of edits.filter(a=>a.type!=="delete_page")){
   if(a.type==="fill_field"){
    if(!fields.some(x=>x.name===a.fieldName))throw Error("Unknown form field");
    const field=pdf.getForm().getField(a.fieldName);
    if(typeof field.setText==="function")field.setText(String(a.text||""));else if(typeof field.check==="function"){if(/^(yes|true|oui|1)$/i.test(a.text))field.check();else field.uncheck();}
    continue;
   }
   const p=pdf.getPage(a.page-1);
   if(a.type==="add_signature"){
    const img=await pdf.embedPng(signaturePng);
    const aspect=img.height/img.width;
    const width=Math.min(effectiveSignatureWidth(),p.getWidth()*.8,200/Math.max(.1,aspect));
    const height=width*aspect;
    const x=Math.max(10,Math.min(p.getWidth()-width-10,point.x-width/2));
    const y=Math.max(10,Math.min(p.getHeight()-height-10,point.y-height/2));
    p.drawImage(img,{x,y,width,height});
   }else{
    const str=a.type==="add_date"?new Date().toLocaleDateString(lang==="fr"?"fr-FR":"en-GB"):String(a.text||"");
    if(!str||/[^\u0000-\u00ff]/.test(str))throw Error(t.unsupported);
    const size=12,w=font.widthOfTextAtSize(str,size);
    const dateCoord=a.type==="add_date"?datePoint:null;
    const x=dateCoord?Math.max(10,Math.min(p.getWidth()-w-10,dateCoord.x-w/2)):Math.max(10,p.getWidth()-w-30);
    const y=dateCoord?Math.max(12,Math.min(p.getHeight()-size-10,dateCoord.y-size/3)):28;
    p.drawText(str,{x,y,size,font,color:PDFLib.rgb(.13,.20,.32)});
   }
  }
  [...deleted].sort((a,b)=>b-a).forEach(n=>pdf.removePage(n-1));
  linkMark(pdf,font);previewBytes=new Uint8Array(await pdf.save());
  previewUrl=URL.createObjectURL(new Blob([previewBytes],{type:"application/pdf"}));
  previewDoc=await pdfjsLib.getDocument({data:previewBytes.slice()}).promise;
  await showModified(Math.min(point?.page||datePoint?.page||1,previewDoc.numPages));
  $("backToSource").hidden=false;$("approve").disabled=false;
  status("planStatus",t.previewReady);step(6);
 }catch(e){status("planStatus",e?.message||t.export,true);step(4);invalidate();}
 finally{$("previewButton").disabled=false;}
});
$("approve").addEventListener("change",()=>{$("download").disabled=!previewBytes||!$("approve").checked;});
$("download").addEventListener("click",()=>{
 if(!previewUrl||!previewBytes||!$("approve").checked){status("planStatus",t.approval,true);return;}
 const a=document.createElement("a");a.href=previewUrl;a.download=($("file").files?.[0]?.name||"document.pdf").replace(/\.pdf$/i,"")+"-justpdfit-ai.pdf";document.body.append(a);a.click();a.remove();
});
window.addEventListener("resize",drawMark);
window.addEventListener("pagehide",()=>{if(previewUrl)URL.revokeObjectURL(previewUrl);});
updateStageDisplay();
status("analysis",t.file);
})();
