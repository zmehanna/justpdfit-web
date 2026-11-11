/* Shared Sign PDF visual signature experience for the PDF editor.
   No upload to a remote service: all PNG assets remain in browser memory. */
(() => {
"use strict";
const strings={
 en:{title:"Create your signature",initials:"Create your initials",intro:"Type, draw or import your signature. Then position it on your PDF.",introI:"Type or draw your initials, or import an existing image.",type:"Type",draw:"Draw",image:"Image",yourName:"Name or signature",yourInitials:"Your initials",placeholder:"Type your name",placeholderI:"Type your initials",styles:"Choose handwriting style",preview:"Signature preview",previewI:"Initials preview",upload:"Import a signature image",uploadHelp:"PNG transparent recommended. JPG / PNG up to 5 MB.",drawHelp:"Draw with your finger, mouse, or Apple Pencil.",clear:"Clear",cancel:"Cancel",insert:"Add to PDF",black:"Black",blue:"Blue",white:"White ink",dark:"Preview on dark background",errorImage:"Choose a JPG or PNG smaller than 5 MB.",errorEmpty:"Create a signature before adding it.",privacy:"Private: your signature is created locally, never uploaded."},
 fr:{title:"Créer votre signature",initials:"Créer vos initiales",intro:"Saisissez, dessinez ou importez votre signature, puis positionnez-la sur le PDF.",introI:"Saisissez ou dessinez vos initiales, ou importez une image.",type:"Saisir",draw:"Dessiner",image:"Image",yourName:"Nom et prénom",yourInitials:"Vos initiales",placeholder:"Saisissez votre signature",placeholderI:"Saisissez vos initiales",styles:"Choisissez un style manuscrit",preview:"Aperçu de la signature",previewI:"Aperçu des initiales",upload:"Importer une signature existante",uploadHelp:"PNG transparent recommandé. JPG / PNG jusqu'à 5 Mo.",drawHelp:"Dessinez avec le doigt, la souris ou l'Apple Pencil.",clear:"Effacer",cancel:"Annuler",insert:"Ajouter au PDF",black:"Noir",blue:"Bleu",white:"Encre blanche",dark:"Aperçu sur fond noir",errorImage:"Choisissez un JPG ou PNG de moins de 5 Mo.",errorEmpty:"Créez une signature avant de l'ajouter.",privacy:"Privé : votre signature reste sur cet appareil."},
 ar:{title:"إنشاء توقيعك",initials:"إنشاء أحرف الاسم",intro:"اكتب أو ارسم أو استورد توقيعك ثم ضعه على الملف.",introI:"اكتب الأحرف الأولى أو ارسمها أو استورد صورة.",type:"كتابة",draw:"رسم",image:"صورة",yourName:"الاسم والتوقيع",yourInitials:"الأحرف الأولى",placeholder:"اكتب توقيعك",placeholderI:"اكتب الأحرف الأولى",styles:"اختر نمط الخط",preview:"معاينة التوقيع",previewI:"معاينة الأحرف",upload:"استيراد صورة",uploadHelp:"PNG شفاف أو JPG، حتى 5 ميغابايت.",drawHelp:"ارسم بإصبعك أو بالماوس أو بالقلم.",clear:"مسح",cancel:"إلغاء",insert:"إضافة إلى PDF",black:"أسود",blue:"أزرق",white:"حبر أبيض",dark:"معاينة على خلفية سوداء",errorImage:"اختر صورة JPG أو PNG أقل من 5 ميغابايت.",errorEmpty:"أنشئ توقيعاً أولاً.",privacy:"يتم إنشاء التوقيع محلياً على جهازك."}
};
const getLang=()=>{let key=window.JustPDFItI18n?.getLanguage?.()||document.documentElement.lang||"en";key=key.split("-")[0].toLowerCase();return strings[key]?key:"en";};
const FONTS=['"Brush Script MT","Segoe Script",cursive','"Segoe Script","Lucida Handwriting",cursive','"Lucida Handwriting","URW Chancery L",cursive','"Snell Roundhand","Apple Chancery",cursive'];
function open({initials=false,onApply}={}){
 const l=getLang(),t=strings[l];
 const layer=document.createElement("div");layer.className="jpi-sig-overlay";layer.setAttribute("role","presentation");
 layer.innerHTML='<section class="jpi-sig-dialog" role="dialog" aria-modal="true" aria-labelledby="jpi-sig-title" tabindex="-1"><div class="jpi-sig-header"><div><div class="jpi-sig-eyebrow">JUSTPDFIT · PDF EDITOR</div><h2 id="jpi-sig-title"></h2><p id="jpi-sig-intro"></p></div><button class="jpi-sig-close" type="button" data-action="cancel" aria-label="Close">×</button></div><div class="jpi-sig-body"><div class="jpi-sig-tabs" role="tablist"><button class="jpi-sig-tab" type="button" data-method="type" role="tab" aria-selected="true"></button><button class="jpi-sig-tab" type="button" data-method="draw" role="tab" aria-selected="false"></button><button class="jpi-sig-tab" type="button" data-method="image" role="tab" aria-selected="false"></button></div><div class="jpi-sig-type-panel"><label class="jpi-sig-label" for="jpi-sig-name"></label><input id="jpi-sig-name" maxlength="100" autocomplete="off"><div class="jpi-sig-label" id="jpi-sig-styles-label"></div><div class="jpi-sig-styles"></div></div><div class="jpi-sig-draw-panel" hidden><p class="jpi-sig-help" id="jpi-sig-draw-help"></p></div><div class="jpi-sig-image-panel" hidden><label class="jpi-sig-label" for="jpi-sig-file"></label><input type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" id="jpi-sig-file"><p class="jpi-sig-help" id="jpi-sig-upload-help"></p></div><div class="jpi-sig-preview-heading"><span id="jpi-sig-preview-label"></span><div class="jpi-sig-inks"><button type="button" data-ink="#151b34" class="jpi-sig-ink is-selected" aria-label="Black ink"></button><button type="button" data-ink="#1f4ca5" class="jpi-sig-ink" aria-label="Blue ink"></button></div></div><div class="jpi-sig-canvas-wrap"><canvas class="jpi-sig-canvas" width="700" height="220" aria-label="Signature preview"></canvas></div><div class="jpi-sig-options"><label><input type="checkbox" id="jpi-sig-white"> <span id="jpi-sig-white-label"></span></label><label><input type="checkbox" id="jpi-sig-dark"> <span id="jpi-sig-dark-label"></span></label></div><button class="jpi-sig-clear" type="button"></button><p class="jpi-sig-error" role="alert" aria-live="polite"></p><p class="jpi-sig-privacy" id="jpi-sig-privacy"></p></div><div class="jpi-sig-footer"><button class="jpi-sig-secondary" type="button" data-action="cancel"></button><button class="jpi-sig-primary" type="button" data-action="apply"></button></div></section>';
 const q=s=>layer.querySelector(s);
 q("#jpi-sig-title").textContent=initials?t.initials:t.title;q("#jpi-sig-intro").textContent=initials?t.introI:t.intro;
 q('[data-method="type"]').textContent="⌨ "+t.type;q('[data-method="draw"]').textContent="✍ "+t.draw;q('[data-method="image"]').textContent="▧ "+t.image;
 q('label[for="jpi-sig-name"]').textContent=initials?t.yourInitials:t.yourName;
 q("#jpi-sig-name").placeholder=initials?t.placeholderI:t.placeholder;
 q("#jpi-sig-styles-label").textContent=t.styles;q("#jpi-sig-draw-help").textContent=t.drawHelp;q('label[for="jpi-sig-file"]').textContent=t.upload;
 q("#jpi-sig-upload-help").textContent=t.uploadHelp;q("#jpi-sig-preview-label").textContent=initials?t.previewI:t.preview;
 q("#jpi-sig-white-label").textContent=t.white;q("#jpi-sig-dark-label").textContent=t.dark;q(".jpi-sig-clear").textContent=t.clear;
 q("#jpi-sig-privacy").textContent=t.privacy;q('[data-action="cancel"].jpi-sig-secondary').textContent=t.cancel;q('[data-action="apply"]').textContent=t.insert;
 q(".jpi-sig-close").setAttribute("aria-label",t.cancel);
 layer.dir=l==="ar"?"rtl":"ltr";
 const canvas=q("canvas"),ctx=canvas.getContext("2d");ctx.lineCap="round";ctx.lineJoin="round";ctx.lineWidth=3.5;
 const name=q("#jpi-sig-name"),fileInput=q("#jpi-sig-file"),error=q(".jpi-sig-error");
 let method="type",fontIdx=0,ink="#151b34",drawing=false,last=null,hasValue=false,image=null,closed=false;
 const realInk=()=>q("#jpi-sig-white").checked?"#ffffff":ink;
 const clear=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);hasValue=false;};
 const renderType=()=>{
  clear();const value=name.value.trim();if(!value)return;
  let px=initials?94:80;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle=realInk();
  do{ctx.font="italic "+px+"px "+FONTS[fontIdx];if(ctx.measureText(value).width<canvas.width-30)break;px-=3;}while(px>18);
  ctx.fillText(value,canvas.width/2,canvas.height/2+6,canvas.width-28);
  hasValue=true;
 };
 const renderImage=()=>{
  clear();if(!image)return;const scale=Math.min((canvas.width-28)/image.naturalWidth,(canvas.height-24)/image.naturalHeight);const w=image.naturalWidth*scale,h=image.naturalHeight*scale;ctx.drawImage(image,(canvas.width-w)/2,(canvas.height-h)/2,w,h);
  if(q("#jpi-sig-white").checked){const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),data=pixels.data;for(let i=0;i<data.length;i+=4){if(!data[i+3])continue;const light=.2126*data[i]+.7152*data[i+1]+.0722*data[i+2];data[i+3]=Math.round(data[i+3]*(255-light)/255);data[i]=255;data[i+1]=255;data[i+2]=255;}ctx.putImageData(pixels,0,0);}
  hasValue=true;
 };
 const refresh=()=>method==="type"?renderType():method==="image"?renderImage():undefined;
 const styles=q(".jpi-sig-styles");
 FONTS.forEach((font,i)=>{const b=document.createElement("button");b.type="button";b.className="jpi-sig-style";b.dataset.style=String(i);b.style.fontFamily=font;b.textContent=name.value.trim()||(initials?"AB":"Signature");b.setAttribute("aria-pressed",String(i===0));b.onclick=()=>{fontIdx=i;styles.querySelectorAll("button").forEach((el,j)=>el.setAttribute("aria-pressed",String(i===j)));renderType();};styles.append(b);});
 name.oninput=()=>{styles.querySelectorAll("button").forEach(b=>b.textContent=name.value.trim()||(initials?"AB":"Signature"));if(method==="type")renderType();};
 const select=next=>{
  method=next;clear();image=null;fileInput.value="";
  layer.querySelectorAll("[data-method]").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.method===next)));
  q(".jpi-sig-type-panel").hidden=next!=="type";q(".jpi-sig-draw-panel").hidden=next!=="draw";q(".jpi-sig-image-panel").hidden=next!=="image";
  canvas.style.cursor=next==="draw"?"crosshair":"default";if(next==="type")renderType();error.textContent="";
 };
 layer.querySelectorAll("[data-method]").forEach(b=>b.onclick=()=>select(b.dataset.method));
 const position=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height};};
 canvas.addEventListener("pointerdown",e=>{if(method!=="draw")return;e.preventDefault();canvas.setPointerCapture(e.pointerId);drawing=true;last=position(e);ctx.strokeStyle=realInk();ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(last.x+.1,last.y+.1);ctx.stroke();hasValue=true;});
 canvas.addEventListener("pointermove",e=>{if(!drawing||method!=="draw")return;e.preventDefault();const next=position(e);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(next.x,next.y);ctx.strokeStyle=realInk();last=next;});
 const stop=()=>{drawing=false;};canvas.addEventListener("pointerup",stop);canvas.addEventListener("pointercancel",stop);canvas.addEventListener("lostpointercapture",stop);
 fileInput.addEventListener("change",async()=>{const file=fileInput.files?.[0];if(!file)return;if(file.size>5*1024*1024||!["image/png","image/jpeg"].includes(file.type)){error.textContent=t.errorImage;return;}const url=URL.createObjectURL(file);try{const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url;});if(closed||method!=="image")return;image=img;renderImage();error.textContent="";}catch{error.textContent=t.errorImage;}finally{URL.revokeObjectURL(url);}});
 layer.querySelectorAll("[data-ink]").forEach(b=>{b.style.background=b.dataset.ink;b.onclick=()=>{ink=b.dataset.ink;layer.querySelectorAll("[data-ink]").forEach(v=>v.classList.toggle("is-selected",v===b));if(method==="draw"&&hasValue){ctx.save();ctx.globalCompositeOperation="source-in";ctx.fillStyle=realInk();ctx.fillRect(0,0,canvas.width,canvas.height);ctx.restore();}else refresh();};});
 q("#jpi-sig-white").addEventListener("change",()=>{const white=q("#jpi-sig-white").checked;if(white)q("#jpi-sig-dark").checked=true;updateDark();if(method==="draw"&&hasValue){ctx.save();ctx.globalCompositeOperation="source-in";ctx.fillStyle=realInk();ctx.fillRect(0,0,canvas.width,canvas.height);ctx.restore();}else refresh();});
 const updateDark=()=>q(".jpi-sig-canvas-wrap").classList.toggle("is-dark",q("#jpi-sig-dark").checked);
 q("#jpi-sig-dark").addEventListener("change",updateDark);
 q(".jpi-sig-clear").onclick=()=>{if(method==="type")name.value="";if(method==="image"){image=null;fileInput.value="";}clear();error.textContent="";};
 const previousFocus=document.activeElement;
 const cleanup=()=>{if(closed)return;closed=true;document.removeEventListener("keydown",keyHandler);layer.remove();previousFocus?.focus?.();};
 const keyHandler=e=>{if(e.key==="Escape"){e.preventDefault();cleanup();}if(e.key==="Tab"){const buttons=[...layer.querySelectorAll('button,input')].filter(el=>!el.disabled&&el.getClientRects().length);if(!buttons.length)return;const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};
 document.addEventListener("keydown",keyHandler);
 layer.addEventListener("click",e=>{if(e.target===layer||e.target.closest('[data-action="cancel"]'))cleanup();});
 q('[data-action="apply"]').onclick=()=>{if(!hasValue){error.textContent=t.errorEmpty;return;}const result=canvas.toDataURL("image/png");cleanup();onApply?.(result);};
 document.body.append(layer);q(".jpi-sig-dialog").focus();
}
window.JustPDFitSignatureCreator={open};
})();
