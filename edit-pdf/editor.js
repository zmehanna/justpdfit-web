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
let file=null,source=null,viewer=null,total=0,current=1,objects=[],selected=null,history=[],future=[],paidFingerprint=null,pending=null,documentFingerprint=null,renderToken=0,mode="free",scale=1,changed=false;
ROOT.innerHTML='<div class="editor-shell"><div class="editor-top"><div><h2 id="editor-title"></h2><p id="editor-subtitle"></p></div><div><button class="editor-button" id="editor-undo" type="button"></button> <button class="editor-button" id="editor-redo" type="button"></button></div></div><div class="editor-upload"><label class="editor-button primary" for="editor-file" id="editor-pick"></label><input id="editor-file" type="file" accept="application/pdf,.pdf"><strong id="editor-filename"></strong></div><div class="editor-body"><div class="editor-toolbar" id="editor-tools"></div><div class="editor-workspace"><div class="editor-pagination"><button type="button" class="editor-button" id="editor-prev">‹</button><span id="editor-pagecount"></span><button type="button" class="editor-button" id="editor-next">›</button></div><div id="editor-stage-container" style="width:100%;display:flex;justify-content:center"><div id="editor-empty" class="editor-no-file"></div><div id="editor-stage" class="editor-page-view" hidden><canvas id="editor-canvas"></canvas><div id="editor-overlay" class="editor-overlay"></div></div></div><div id="editor-thumbs" class="editor-thumbs"></div></div><div id="editor-properties" class="editor-properties"></div></div><div class="editor-bottom"><div><div class="editor-pricing"><label><input type="radio" name="editor-price" value="free" checked> <span id="editor-free"></span></label><label><input type="radio" name="editor-price" value="paid"> <span id="editor-paid"></span></label></div><p id="editor-privacy"></p></div><div class="editor-actions"><button type="button" id="editor-checkout" class="editor-button" hidden></button><button type="button" id="editor-verify" class="editor-button" hidden></button><button type="button" id="editor-export" class="editor-button primary"></button></div></div><div id="editor-status" class="editor-status" role="status" aria-live="polite"></div></div>';
const toolTypes=[["text","T"],["date","▦"],["check","☑"],["initials","✎"],["signature","〰"],["image","▧"],["highlight","▰"]];
const status=(message,isError=false)=>{$("editor-status").textContent=message;$("editor-status").classList.toggle("error",isError);};
function updateLabels(){
 $("editor-title").textContent=tr("title");$("editor-subtitle").textContent=tr("subtitle");$("editor-pick").textContent=tr("pick");
 $("editor-empty").textContent=tr("empty");$("editor-undo").textContent="↶ "+tr("undo");$("editor-redo").textContent="↷ "+tr("redo");
 $("editor-prev").setAttribute("aria-label",tr("prev"));$("editor-next").setAttribute("aria-label",tr("next"));
 $("editor-free").textContent=tr("free");$("editor-paid").textContent=tr("paid");$("editor-privacy").textContent=tr("privacy");
 $("editor-export").textContent=tr("export");$("editor-checkout").textContent=tr("checkout");$("editor-verify").textContent=tr("verify");
 $("editor-tools").innerHTML='<h3>'+tr("tools")+'</h3>'+toolTypes.map(([kind,icon])=>'<button type="button" class="editor-tool" data-add="'+kind+'"><span>'+icon+'</span>'+tr(kind)+'</button>').join("");
 $("editor-tools").querySelectorAll("[data-add]").forEach(btn=>btn.onclick=()=>add(btn.dataset.add));
 updateNavigation();renderProperties();updatePaymentButtons();
}
function snapshot(){history.push(JSON.stringify(objects));if(history.length>60)history.shift();future.length=0;changed=true;}
function undo(){if(!history.length)return;future.push(JSON.stringify(objects));objects=JSON.parse(history.pop());selected=null;renderObjects();renderProperties();updateButtons();}
function redo(){if(!future.length)return;history.push(JSON.stringify(objects));objects=JSON.parse(future.pop());selected=null;renderObjects();renderProperties();updateButtons();}
function updateButtons(){$("editor-undo").disabled=!history.length;$("editor-redo").disabled=!future.length;$("editor-export").disabled=!source;}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function add(kind){
 if(!source)return;
 if(kind==="image"||kind==="signature"){const input=document.createElement("input");input.type="file";input.accept="image/png,image/jpeg";input.onchange=()=>{const f=input.files?.[0];if(!f||f.size>8*1024*1024){status(tr("error"),true);return;}const reader=new FileReader();reader.onload=()=>make(kind,"",String(reader.result));reader.readAsDataURL(f);};input.click();return;}
 make(kind,kind==="date"?new Date().toLocaleDateString(language()==="en"?"en-US":language()==="ar"?"ar":"fr-FR"):kind==="text"?tr("text"):kind==="initials"?tr("initials"):kind==="check"?"✓":"");
}
function make(kind,text,image){snapshot();const obj={id:Date.now()+"-"+Math.random(),page:current,kind,text,image:image||null,x:.15,y:.2,w:kind==="highlight"?.26:kind==="check"?.045:.25,h:kind==="check"?.045:kind==="highlight"?.035:.052,size:16,color:"#172746"};objects.push(obj);selected=obj.id;renderObjects();renderProperties();updateButtons();}
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
 if(o.kind==="highlight"){el.style.background=o.color;}else if(o.image){const img=document.createElement("img");img.src=o.image;el.append(img);}else el.textContent=o.text;
 el.tabIndex=0;el.setAttribute("aria-label",tr(o.kind));el.onpointerdown=e=>{e.preventDefault();selected=o.id;renderProperties();wrap.querySelectorAll(".editor-object").forEach(node=>node.classList.remove("selected"));el.classList.add("selected");let startX=e.clientX,startY=e.clientY,ox=o.x,oy=o.y,committed=false;const move=ev=>{if(!committed){snapshot();committed=true;}const rect=$("editor-stage").getBoundingClientRect();o.x=clamp(ox+(ev.clientX-startX)/rect.width,0,1-o.w);o.y=clamp(oy+(ev.clientY-startY)/rect.height,0,1-o.h);el.style.left=(o.x*100)+"%";el.style.top=(o.y*100)+"%";};const end=()=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",end);updateButtons();};window.addEventListener("pointermove",move);window.addEventListener("pointerup",end);};
 el.onkeydown=e=>{if(e.key==="Delete"||e.key==="Backspace"){e.preventDefault();removeSelected();}};wrap.append(el);
 });
}
const propInput=(label,id,value,type="text")=>'<label for="'+id+'">'+label+'</label><input id="'+id+'" type="'+type+'" value="'+String(value).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")+'">';
function renderProperties(){
 const panel=$("editor-properties"),o=objects.find(o=>o.id===selected);
 panel.innerHTML='<h3>'+tr("properties")+'</h3>';
 if(!o){const p=document.createElement("p");p.textContent=tr("selected");p.style.color="#8190a7";p.style.fontSize="13px";panel.append(p);return;}
 if(o.kind!=="image"&&o.kind!=="signature"&&o.kind!=="highlight"){const label=document.createElement("label");label.textContent=tr("name");panel.append(label);const area=document.createElement("textarea");area.value=o.text;area.onchange=()=>{snapshot();o.text=area.value;renderObjects();};panel.append(area);}
 if(!o.image)panel.insertAdjacentHTML("beforeend",propInput(tr("font"),"property-size",o.size,"number")+propInput(tr("color"),"property-color",o.color,"color"));
 panel.insertAdjacentHTML("beforeend",propInput(tr("width"),"property-width",Math.round(o.w*100),"number")+propInput(tr("height"),"property-height",Math.round(o.h*100),"number"));
 const select=document.createElement("select");select.id="property-page";for(let i=1;i<=total;i++){const option=document.createElement("option");option.value=i;option.textContent=tr("pages")+" "+i;if(i===current)option.disabled=true;select.append(option);}
 panel.append(Object.assign(document.createElement("label"),{textContent:tr("multi")}));panel.append(select);
 const copy=document.createElement("button");copy.type="button";copy.className="editor-button";copy.textContent=tr("multi");copy.onclick=()=>{const page=Number(select.value);if(!page||page===current)return;snapshot();objects.push({...o,id:Date.now()+"-"+Math.random(),page});updateButtons();status(tr("status"));};panel.append(copy);
 const del=document.createElement("button");del.type="button";del.className="editor-button";del.textContent=tr("delete");del.onclick=removeSelected;panel.append(del);
 for(const [id,key,transform] of [["property-size","size",v=>clamp(Number(v)||16,6,80)],["property-color","color",v=>v],["property-width","w",v=>clamp(Number(v)/100,.02,1-o.x)],["property-height","h",v=>clamp(Number(v)/100,.02,1-o.y)]]){
 const input=$(id);if(input)input.onchange=()=>{snapshot();o[key]=transform(input.value);renderObjects();updateButtons();};
 }
}
function removeSelected(){const idx=objects.findIndex(o=>o.id===selected);if(idx<0)return;snapshot();objects.splice(idx,1);selected=null;renderObjects();renderProperties();updateButtons();}
async function loadPdf(f){
 if(!f)return;try{
 if(f.size>80*1024*1024)throw Error("PDF exceeds 80 MB");file=f;const bytes=new Uint8Array(await f.arrayBuffer());source=bytes;
 viewer=await pdfjsLib.getDocument({data:bytes.slice()}).promise;total=viewer.numPages;objects=[];history=[];future=[];selected=null;current=1;paidFingerprint=null;pending=null;changed=false;
 documentFingerprint=await window.JustPDFitWatermark.fingerprint(source);$("editor-filename").textContent=f.name;
 await gotoPage(1);status(tr("status"));updatePaymentButtons();
 }catch(error){source=null;viewer=null;total=0;status(tr("error")+" "+error.message,true);updateNavigation();}
}
function updatePaymentButtons(){
 const paid=mode==="paid",unlocked=paidFingerprint===documentFingerprint&&!!documentFingerprint;
 $("editor-checkout").hidden=!paid||unlocked;$("editor-checkout").disabled=!source||!window.JustPDFitWatermark?.backendReady;
 $("editor-verify").hidden=!paid||unlocked||!pending;
 $("editor-export").hidden=paid&&!unlocked;
 if(paid&&!window.JustPDFitWatermark?.backendReady)status(tr("noBackend"),true);
}
function rasterizeText(o){const canvas=document.createElement("canvas"),ctx=canvas.getContext("2d");const px=o.size*3;const lines=String(o.text||" ").split("\n");ctx.font=px+"px Arial";const maxWidth=Math.max(...lines.map(l=>ctx.measureText(l).width),10);canvas.width=Math.ceil(maxWidth+12);canvas.height=Math.ceil(lines.length*px*1.35+12);ctx.fillStyle=o.color;ctx.font=px+"px Arial";lines.forEach((line,i)=>ctx.fillText(line,6,px*(i+1)*1.25));return canvas.toDataURL("image/png");}
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
 const image=o.image||rasterizeText(o);
 if(!imageCache.has(image)){const bytes=Uint8Array.from(atob(image.split(",")[1]),c=>c.charCodeAt(0));imageCache.set(image,image.startsWith("data:image/jpeg")?await doc.embedJpg(bytes):await doc.embedPng(bytes));}
 page.drawImage(imageCache.get(image),{x,y,width:w,height:h});
 }
 if(!clean)await addWatermarks(doc);
 const bytes=await doc.save(),blob=new Blob([bytes],{type:"application/pdf"}),url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download=(file?.name||"document.pdf").replace(/\.pdf$/i,"")+"-justpdfit.pdf";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);status(tr("ready"));
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
$("editor-file").onchange=e=>loadPdf(e.target.files?.[0]);
$("editor-prev").onclick=()=>gotoPage(current-1);$("editor-next").onclick=()=>gotoPage(current+1);
$("editor-undo").onclick=undo;$("editor-redo").onclick=redo;
document.querySelectorAll('input[name="editor-price"]').forEach(r=>r.onchange=()=>{mode=r.value;updatePaymentButtons();});
$("editor-export").onclick=async()=>{try{if(mode==="paid"&&paidFingerprint!==documentFingerprint)throw Error(tr("unpaid"));await exportPdf(mode==="paid");}catch(e){status(tr("error")+" "+e.message,true);}};
$("editor-checkout").onclick=checkout;$("editor-verify").onclick=verify;
window.addEventListener("resize",()=>{if(source)gotoPage(current).catch(()=>{});});
document.addEventListener("justpdfit-language",updateLabels);
updateLabels();updateButtons();status(tr("status"));
})();