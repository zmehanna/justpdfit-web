/* JustPDFit AI v2 — cloud LLM planning; local PDF review and execution. */
(() => {
 "use strict";
 const API="https://justpdfit-ai-planner.zmehanna.workers.dev/interpret";
 const $=id=>document.getElementById(id);
 const lang=document.documentElement.lang.startsWith("ar")?"ar":document.documentElement.lang.startsWith("fr")?"fr":"en";
 const i18n={
 en:{title:"AI document assistant",intro:"The AI creates a proposal only. You choose what to apply; your PDF remains on this device.",send:"Ask AI to plan changes",allow:"I agree to send my written request to Cloudflare Workers AI for interpretation.",share:"Also share a limited text extract and form-field names from this PDF to help identify fields (optional). Never sends PDF bytes.",detect:"Detected locally",review:"Proposed operations — review each",confirm:"I have reviewed and approve the selected operations.",preview:"Apply to a preview",download:"Download reviewed PDF",none:"Upload a PDF and enter an instruction first.",consent:"Agree to sending your request before using the AI.",busy:"AI is preparing a plan…",bad:"The AI service is not available. Your document has not been changed.",noActions:"No supported change was proposed. Try a more specific request.",ready:"Review the plan, mark the operations you want, then approve it.",previewReady:"A new PDF preview is ready. Download only if it looks right.",signature:"Draw your signature in the pad above before applying the plan.",failed:"The preview could not be generated. Check pages and form values.",needsApproval:"Review and approve the operations before applying them.",privacy:"The original PDF and signature are never uploaded. Only the request and optional document text are sent after consent.",buttons:{delete_page:"Delete page",add_date:"Insert today's date",add_signature:"Place handwritten signature",add_text:"Insert text",fill_field:"Fill existing form field"},page:"original page",detected:"Possible signature/date labels",form:"AcroForm fields",invalid:"Invalid or deleted page in proposal",confirmNote:"The original file is never overwritten. AI suggestions are not automatically executed.",unavailable:"Document text extraction unavailable; form names may still be detected.",field:"Field"},
 fr:{title:"Assistant documentaire IA",intro:"L'IA prépare des propositions seulement. Vous décidez des modifications ; le PDF reste sur votre appareil.",send:"Préparer les modifications avec l'IA",allow:"J'accepte d'envoyer ma demande écrite à Cloudflare Workers AI pour interprétation.",share:"Partager également un extrait limité du texte et les noms des champs du PDF pour repérer les champs (facultatif). Aucun fichier PDF envoyé.",detect:"Détection locale",review:"Modifications proposées — vérifiez chacune",confirm:"J'ai vérifié et j'approuve les modifications sélectionnées.",preview:"Appliquer dans un aperçu",download:"Télécharger le PDF validé",none:"Ajoutez un PDF et saisissez une instruction.",consent:"Autorisez l'envoi de la demande pour utiliser l'IA.",busy:"L'IA prépare un plan…",bad:"Le service IA est indisponible. Votre document n'a pas changé.",noActions:"Aucune modification compatible n'est proposée. Reformulez votre demande.",ready:"Vérifiez le plan, sélectionnez les opérations et approuvez-les.",previewReady:"Un nouvel aperçu est prêt. Téléchargez seulement après vérification.",signature:"Dessinez votre signature dans le cadre ci-dessus avant de valider.",failed:"Impossible de générer l'aperçu. Vérifiez les pages et les valeurs.",needsApproval:"Vérifiez et approuvez les opérations avant leur application.",privacy:"Le PDF original et la signature ne sont jamais envoyés. Seules la demande et, avec accord, des données textuelles limitées sont transmises.",buttons:{delete_page:"Supprimer la page",add_date:"Insérer la date du jour",add_signature:"Placer la signature manuscrite",add_text:"Ajouter du texte",fill_field:"Remplir un champ du formulaire"},page:"page d'origine",detected:"Repères de signature/date",form:"Champs AcroForm",invalid:"Numéro de page invalide ou supprimé",confirmNote:"Le PDF original n'est jamais écrasé. Les suggestions de l'IA ne sont jamais exécutées automatiquement.",unavailable:"Extraction du texte indisponible ; les champs du formulaire peuvent néanmoins être reconnus.",field:"Champ"},
 ar:{title:"مساعد المستندات بالذكاء الاصطناعي",intro:"يقترح الذكاء الاصطناعي تعديلات فقط. أنت من يقرر تطبيقها ويبقى ملف PDF على جهازك.",send:"اطلب من الذكاء الاصطناعي إعداد الخطة",allow:"أوافق على إرسال طلبي المكتوب إلى Cloudflare Workers AI لتفسيره.",share:"أوافق أيضًا على مشاركة مقتطف محدود من النص وأسماء حقول النموذج لتحديد مواضعها (اختياري). لا يتم إرسال ملف PDF.",detect:"اكتشاف محلي",review:"التعديلات المقترحة — راجع كل تعديل",confirm:"راجعت التعديلات المحددة وأوافق عليها.",preview:"تطبيقها في معاينة",download:"تنزيل PDF بعد المراجعة",none:"ارفع PDF واكتب طلبًا أولاً.",consent:"يجب الموافقة على إرسال الطلب لاستخدام الذكاء الاصطناعي.",busy:"يجري الذكاء الاصطناعي إعداد خطة…",bad:"خدمة الذكاء الاصطناعي غير متاحة. لم يتغير المستند.",noActions:"لم تُقترح تعديلات مدعومة. جرب وصفًا أكثر تحديدًا.",ready:"راجع الخطة واختر العمليات ثم وافق.",previewReady:"المعاينة الجديدة جاهزة. نزّل الملف بعد التأكد.",signature:"ارسم توقيعك في المربع أعلاه أولاً.",failed:"تعذّر إنشاء المعاينة. تحقق من الصفحات والقيم.",needsApproval:"راجع العمليات ووافق عليها أولاً.",privacy:"لا يتم رفع ملف PDF أو التوقيع، بل الطلب ومقتطف النص بموافقتك فقط.",buttons:{delete_page:"حذف صفحة",add_date:"إضافة تاريخ اليوم",add_signature:"وضع التوقيع",add_text:"إضافة نص",fill_field:"تعبئة حقل النموذج"},page:"الصفحة الأصلية",detected:"علامات التوقيع والتاريخ",form:"حقول AcroForm",invalid:"رقم صفحة غير صالح أو محذوفة",confirmNote:"لا يتم تعديل الملف الأصلي. لا تُنفذ مقترحات الذكاء الاصطناعي تلقائياً.",unavailable:"تعذّر استخراج النص؛ قد تتوفر أسماء الحقول.",field:"حقل"}
 };
 const t=i18n[lang];
 const panel=document.createElement("section");panel.className="ai-card ai-v2";panel.style.marginTop="20px";
 panel.innerHTML='<h2></h2><p class="ai-note ai-v2-intro"></p><div class="ai-buttons"><button type="button" class="ai-btn" id="aiAsk"></button></div><label class="ai-check"><input type="checkbox" id="aiConsent"><span id="aiConsentText"></span></label><label class="ai-check"><input type="checkbox" id="aiShare"><span id="aiShareText"></span></label><p class="ai-note" id="aiPrivacy"></p><h3 id="aiDetectionTitle"></h3><div id="aiDetections" class="ai-note" aria-live="polite"></div><div id="aiMessage" class="ai-status" role="status" aria-live="polite"></div><div id="aiPlan" hidden><h3 id="aiReviewTitle"></h3><div id="aiActions"></div><label class="ai-check"><input type="checkbox" id="aiApprove"><span id="aiApproveText"></span></label><p class="ai-note" id="aiConfirmNote"></p><div class="ai-buttons"><button type="button" class="ai-btn" id="aiApply"></button><button type="button" class="ai-btn secondary" id="aiDownload" disabled></button></div><iframe class="ai-preview" id="aiPreview" hidden title="AI-reviewed PDF preview" style="margin-top:12px"></iframe></div>';
 const grid=document.querySelector(".ai-grid");
 const left=grid.querySelector(".ai-card:first-child"),right=grid.querySelector(".ai-card:last-child");
 left.querySelector("#prompt").closest(".ai-field").after(panel);
 // AI output belongs beside the document, rather than below the planning controls.
 const aiPreview=panel.querySelector("#aiPreview");
 const aiDownload=panel.querySelector("#aiDownload");
 right.querySelector("#emptyPreview").after(aiPreview);
 right.querySelector("#priceNote").after(aiDownload);
 aiDownload.classList.add("ai-ai-result-actions");
 const manual=$("manualTools");
 const signatureLabel=$("signature").closest(".ai-field");
 signatureLabel.hidden=true;$("clearSign").hidden=true;
 const toggleSignature=(enabled)=>{signatureLabel.hidden=!enabled;$("clearSign").hidden=!enabled;};
 manual.addEventListener("toggle",()=>{document.querySelectorAll(".ai-manual:not(details)").forEach(el=>el.style.display=manual.open?"block":"none");toggleSignature(manual.open||plan.some(a=>a.type==="add_signature"));});
 
 panel.querySelector("h2").textContent="✦ "+t.title;
 panel.querySelector(".ai-v2-intro").textContent=t.intro;
 for(const [id,label] of Object.entries({aiAsk:t.send,aiConsentText:t.allow,aiShareText:t.share,aiPrivacy:t.privacy,aiDetectionTitle:t.detect,aiReviewTitle:t.review,aiApproveText:t.confirm,aiConfirmNote:t.confirmNote,aiApply:t.preview,aiDownload:t.download}))$(id).textContent=label;
 $("aiMessage").textContent=t.none;
 const css=document.createElement("style");css.textContent='.ai-v2{background:linear-gradient(130deg,#fff,#fff9fb);border-color:#f5c7d1}.ai-v2 h3{font-size:15px;margin:17px 0 8px}.ai-v2 #aiActions{display:grid;gap:8px}.ai-v2 .ai-action{display:grid;grid-template-columns:auto 1fr auto;gap:9px;align-items:center;border:1px solid #e3e7f0;background:white;border-radius:11px;padding:12px;font-size:13px}.ai-v2 .ai-action input[type=checkbox]{accent-color:#ed465c}.ai-v2 .ai-action input[type=text]{max-width:190px;border-radius:6px;border:1px solid #cbd5e4;padding:6px}.ai-v2 .ai-action input[type=number]{width:75px;border-radius:6px;border:1px solid #cbd5e4;padding:6px}.ai-v2 .ai-action select{max-width:130px;border:1px solid #cbd5e4;border-radius:6px;padding:6px}.ai-v2 .ai-action div{display:flex;flex-wrap:wrap;gap:5px;justify-content:flex-end}@media(max-width:700px){.ai-v2 .ai-action{grid-template-columns:auto 1fr}.ai-v2 .ai-action div{grid-column:2;justify-content:flex-start}}';document.head.appendChild(css);
 let plan=[],pageCount=0,fieldInfo=[],detected=[],anchors=[],localBytes=null,previewUrl=null,previewBytes=null,inspectId=0;
 const message=(msg,bad=false)=>{$("aiMessage").textContent=msg;$("aiMessage").className="ai-status"+(bad?" error":"");};
 function clearPreview(){previewBytes=null;$("emptyPreview").hidden=false;$("aiDownload").disabled=true;$("aiPreview").hidden=true;if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl=null;}}
 function reset(){toggleSignature(manual.open);plan=[];$("aiPlan").hidden=true;$("aiApprove").checked=false;clearPreview();message(t.none);}
 async function inspectPDF(){
  reset();localBytes=null;fieldInfo=[];detected=[];anchors=[];pageCount=0;
  const f=$("file").files?.[0];const id=++inspectId;if(!f)return;
  try{
   localBytes=new Uint8Array(await f.arrayBuffer());
   const doc=await PDFLib.PDFDocument.load(localBytes);
   pageCount=doc.getPageCount();
   try{
    fieldInfo=doc.getForm().getFields().slice(0,35).map(field=>({name:field.getName(),type:field.constructor?.name||"Field"}));
   }catch{}
   if(window.pdfjsLib){
    window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    try{
     const pdf=await pdfjsLib.getDocument({data:localBytes.slice()}).promise;
     for(let p=1;p<=Math.min(30,pageCount);p++){
      const page=await pdf.getPage(p);const content=await page.getTextContent();
      const matches=content.items.map(i=>String(i.str||"").trim()).filter(v=>/sign(ature)?|initial|date|sign here|توقيع|التاريخ|إمضاء/i.test(v)).slice(0,4);
      if(matches.length)detected.push({page:p,labels:matches});
      for(const item of content.items){
       const label=String(item.str||"").trim(),tr=item.transform;
       if(!label||!Array.isArray(tr)||tr.length<6)continue;
       if(/assur[ée]|insured|signature|sign here|signataire|توقيع|إمضاء/i.test(label))anchors.push({page:p,label,x:Number(tr[4]),y:Number(tr[5])});
      }
     }
     if(id!==inspectId)return;
    }catch{}
   }
   const fields=fieldInfo.map(f=>f.name).slice(0,12),labels=detected.slice(0,12).map(f=>t.page+" "+f.page+": "+f.labels.join(", "));
   $("aiDetections").textContent=(fields.length?t.form+": "+fields.join(" · ")+"\n":"")+(labels.length?t.detected+": "+labels.join(" · "):"")||"—";
   message(t.intro);
  }catch(e){message(t.failed,true);}
 }
 $("file").addEventListener("change",inspectPDF);
 function safePlan(items){
  const arr=Array.isArray(items)?items.slice(0,8):[];
  return arr.filter(a=>a&&["delete_page","add_date","add_text","add_signature","fill_field"].includes(a.type)&&Number.isInteger(Number(a.page))&&Number(a.page)>=1&&Number(a.page)<=pageCount).map(a=>({type:a.type,page:Number(a.page),position:["top-left","top-right","bottom-left","bottom-right"].includes(a.position)?a.position:"bottom-right",text:String(a.text||"").slice(0,180),fieldName:String(a.fieldName||"").slice(0,90)}));
 }
 function signatureAnchor(page,request){
  const list=anchors.filter(a=>a.page===page);
  return /assur[ée]|insured|assurance/i.test(request)?(list.find(a=>/signature.*assur[ée]|assur[ée].*signature|insured.*sign|sign.*insured/i.test(a.label))||list.find(a=>/assur[ée]|insured/i.test(a.label))||null):(list.find(a=>/signature|sign here|توقيع|إمضاء/i.test(a.label))||null);
 }
 function renderPlan(){
  $("aiActions").replaceChildren();$("aiPlan").hidden=!plan.length;$("aiApprove").checked=false;clearPreview();
  toggleSignature(manual.open||plan.some(a=>a.type==="add_signature"));
  plan.forEach((a,i)=>{
   const wrapper=document.createElement("label");wrapper.className="ai-action";
   const check=document.createElement("input");check.type="checkbox";check.checked=true;check.addEventListener("change",invalidateApproval);
   const desc=document.createElement("span");desc.textContent=(t.buttons[a.type]||a.type)+" · "+t.page;
   const fields=document.createElement("div");
   const page=document.createElement("input");page.type="number";page.min=1;page.max=pageCount;page.value=a.page;page.setAttribute("aria-label",t.page);page.addEventListener("change",()=>{a.page=Number(page.value);invalidateApproval();});
   if(a.type!=="fill_field")fields.append(page);else {desc.textContent=(t.buttons[a.type]||a.type)+" · "+a.fieldName;}
   if(a.type==="add_text"||a.type==="fill_field"){const val=document.createElement("input");val.type="text";val.value=a.text;val.maxLength=180;val.addEventListener("input",()=>{a.text=val.value;invalidateApproval();});fields.append(val);}
   if(a.type==="add_signature"){
    const choose=document.createElement("button");choose.type="button";choose.className="ai-btn secondary";
    choose.textContent=lang==="fr"?"Cliquer sur la page pour placer":lang==="ar"?"حدد الموقع بالنقر على الصفحة":"Click on page to place";
    choose.style.fontSize="11px";fields.append(choose);
    const holder=document.createElement("div");holder.style.cssText="grid-column:1/-1;width:100%;display:none;background:#f5f7fa;border:1px solid #dbe3ee;border-radius:9px;padding:8px;position:relative";
    const hint=document.createElement("p");hint.className="ai-note";hint.textContent=lang==="fr"?"Cliquez où placer le coin inférieur gauche de la signature.":"Click where the lower-left of the signature should go.";
    const pdfCanvas=document.createElement("canvas");pdfCanvas.style.cssText="width:100%;height:auto;display:block;cursor:crosshair;touch-action:manipulation";
    holder.append(hint,pdfCanvas);wrapper.append(holder);
    choose.addEventListener("click",async()=>{
     if(!localBytes||!window.pdfjsLib)return;
     holder.style.display=holder.style.display==="none"?"block":"none";if(holder.style.display==="none")return;
     try{
      const pdf=await pdfjsLib.getDocument({data:localBytes.slice()}).promise;
      const pg=await pdf.getPage(a.page),view=pg.getViewport({scale:Math.min(1.4,520/pg.view[2])});
      pdfCanvas.width=Math.ceil(view.width);pdfCanvas.height=Math.ceil(view.height);
      await pg.render({canvasContext:pdfCanvas.getContext("2d"),viewport:view}).promise;
      pdfCanvas.dataset.scale=String(view.scale);
     }catch(e){hint.textContent=lang==="fr"?"Prévisualisation indisponible.":"Page rendering unavailable.";}
    });
    pdfCanvas.addEventListener("click",e=>{
      const rect=pdfCanvas.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width*pdfCanvas.width,y=(e.clientY-rect.top)/rect.height*pdfCanvas.height;
      const scale=Number(pdfCanvas.dataset.scale)||1;
      a.point={x:x/scale,y:(pdfCanvas.height-y)/scale};a.anchor=null;invalidateApproval();
      hint.textContent=lang==="fr"?"Emplacement choisi. Vérifiez-le dans l'aperçu avant de télécharger.":"Location selected. Check the preview before download.";
      const ctx=pdfCanvas.getContext("2d");ctx.save();ctx.strokeStyle="#ed465c";ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,11,0,Math.PI*2);ctx.stroke();ctx.restore();
    });
    const matches=anchors.filter(v=>v.page===a.page);
    if(matches.length){
     const select=document.createElement("select");select.setAttribute("aria-label",lang==="fr"?"Emplacement détecté":"Detected location");
     const def=document.createElement("option");def.value="";def.textContent=lang==="fr"?"Placement manuel":"Manual corner";select.append(def);
     matches.forEach((m,idx)=>{const opt=document.createElement("option");opt.value=String(idx);opt.textContent=m.label.slice(0,65);select.append(opt);});
     const suggested=signatureAnchor(a.page,$("prompt").value);
     if(suggested){a.anchor=suggested;select.value=String(matches.indexOf(suggested));}
     select.addEventListener("change",()=>{a.anchor=select.value===""?null:matches[Number(select.value)];invalidateApproval();});
     fields.append(select);
    }
   }
   if(a.type!=="delete_page"&&a.type!=="fill_field"){
    const pos=document.createElement("select");["bottom-right","bottom-left","top-right","top-left"].forEach(k=>{const opt=document.createElement("option");opt.value=k;opt.textContent=k.replace("-"," ");pos.append(opt);});pos.value=a.position;pos.addEventListener("change",()=>{a.position=pos.value;a.anchor=null;a.point=null;invalidateApproval();});fields.append(pos);
   }
   wrapper.append(check,desc,fields);$("aiActions").append(wrapper);a.check=check;
  });
 }
 function invalidateApproval(){$("aiApprove").checked=false;clearPreview();}
 $("aiApprove").addEventListener("change",clearPreview);
 $("aiAsk").addEventListener("click",async()=>{
  const instruction=$("prompt").value.trim();
  if(!localBytes||!instruction){message(t.none,true);return;}
  if(!$("aiConsent").checked){message(t.consent,true);return;}
  $("aiAsk").disabled=true;reset();message(t.busy);
  try{
   const sharing=$("aiShare").checked;
   let excerpt="";
   if(sharing&&window.pdfjsLib){
    try{
     const pdf=await pdfjsLib.getDocument({data:localBytes.slice()}).promise;
     for(let i=1;i<=Math.min(pdf.numPages,20)&&excerpt.length<6000;i++){
      const page=await pdf.getPage(i),tc=await page.getTextContent();
      excerpt+="\n[Page "+i+"] "+tc.items.map(x=>x.str||"").join(" ").slice(0,1100);
     }
    }catch{}
   }
   const payload={instruction:instruction.slice(0,600),pages:pageCount,lang,consent:true,shareDocument:sharing,documentExcerpt:sharing?excerpt.slice(0,6000):"",fields:sharing?fieldInfo:[]};
   const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),18000);
   let res;try{res=await fetch(API,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload),signal:controller.signal,cache:"no-store"});}finally{clearTimeout(timeout);}
   if(!res.ok)throw Error("api "+res.status);
   const data=await res.json();plan=safePlan(data.actions);
   if(!plan.length){message(t.noActions,true);return;}
   renderPlan();
   message((data.explanation?data.explanation+" ":"")+(data.uncertainty?data.uncertainty+" ":"")+t.ready);
  }catch(e){message(t.bad,true);}
  finally{$("aiAsk").disabled=false;}
 });
 function stampPos(p,w,h,where){
  const {width,height}=p.getSize(),left=where.endsWith("left"),top=where.startsWith("top");
  return {x:left?28:Math.max(28,width-w-28),y:top?Math.max(28,height-h-28):28};
 }
 function watermark(pdf,font){
  for(const page of pdf.getPages()){
   const text="JustPDFit.com",size=7,w=font.widthOfTextAtSize(text,size),x=Math.max(8,page.getWidth()-w-12),y=9;
   page.drawText(text,{x,y,size,font,color:PDFLib.rgb(.88,.23,.36),opacity:.8});
   const a=pdf.context.obj({Type:"Annot",Subtype:"Link",Rect:[x,y,x+w,y+11],Border:[0,0,0],A:{S:"URI",URI:PDFLib.PDFString.of("https://justpdfit.com/")}});
   page.node.addAnnot(pdf.context.register(a));
  }
 }
 async function preview(){
  if(!$("aiApprove").checked){message(t.needsApproval,true);return;}
  const operations=plan.filter(a=>a.check.checked);
  if(!operations.length){message(t.noActions,true);return;}
  const deleted=new Set(operations.filter(a=>a.type==="delete_page").map(a=>a.page));
  if(deleted.size>=pageCount||operations.some(a=>!Number.isInteger(a.page)||a.page<1||a.page>pageCount||(a.type!=="delete_page"&&deleted.has(a.page)))){message(t.invalid,true);return;}
  if(operations.some(a=>a.type==="add_signature")){
   const signature=$("signature");
   const alpha=signature.getContext("2d").getImageData(0,0,signature.width,signature.height).data;
   let ink=false;for(let i=3;i<alpha.length;i+=4)if(alpha[i]>0){ink=true;break;}
   if(!ink){message(t.signature,true);return;}
  }
  clearPreview();$("aiApply").disabled=true;
  try{
   const pdf=await PDFLib.PDFDocument.load(localBytes),font=await pdf.embedFont(PDFLib.StandardFonts.Helvetica);
   for(const a of operations.filter(a=>a.type!=="delete_page")){
    if(a.type==="fill_field"){
     if(!fieldInfo.some(f=>f.name===a.fieldName))throw Error("Unknown field");
     const field=pdf.getForm().getField(a.fieldName);
     if(typeof field.setText==="function")field.setText(a.text);
     else if(typeof field.check==="function"){if(/^(true|yes|oui|1|checked|نعم)$/i.test(a.text))field.check();else field.uncheck();}
     else throw Error("Unsupported form field");
     continue;
    }
    const p=pdf.getPage(a.page-1);
    if(a.type==="add_signature"){
     const png=await pdf.embedPng($("signature").toDataURL("image/png"));
     const scale=Math.min(160/png.width,64/png.height,1),w=png.width*scale,h=png.height*scale;
     const anchor=a.anchor&&a.anchor.page===a.page?a.anchor:null;
     const xy=a.point?{x:Math.min(Math.max(16,a.point.x),Math.max(16,p.getWidth()-w-16)),y:Math.min(Math.max(16,a.point.y),Math.max(16,p.getHeight()-h-16))}:anchor?{x:Math.min(Math.max(16,anchor.x),Math.max(16,p.getWidth()-w-16)),y:Math.min(Math.max(16,anchor.y-h-10),Math.max(16,p.getHeight()-h-16))}:stampPos(p,w,h,a.position);
     p.drawImage(png,{...xy,width:w,height:h});
    }else{
     const value=a.type==="add_date"?new Date().toLocaleDateString(lang==="ar"?"en-GB":lang==="fr"?"fr-FR":"en-GB"):a.text;
     if(!value||/[^\u0000-\u00ff]/.test(value)){throw Error("PDF standard font cannot render this text");}
     const size=12,w=font.widthOfTextAtSize(value,size);
     p.drawText(value,{...stampPos(p,w,15,a.position),font,size,color:PDFLib.rgb(.13,.20,.32)});
    }
   }
   [...deleted].sort((a,b)=>b-a).forEach(n=>pdf.removePage(n-1));
   watermark(pdf,font);
   previewBytes=new Uint8Array(await pdf.save());
   previewUrl=URL.createObjectURL(new Blob([previewBytes],{type:"application/pdf"}));
   $("aiPreview").src=previewUrl;$("aiPreview").hidden=false;$("emptyPreview").hidden=true;$("aiDownload").disabled=false;
   message(t.previewReady);
  }catch(e){message((e&&e.message)||t.failed,true);}
  finally{$("aiApply").disabled=false;}
 }
 $("aiApply").addEventListener("click",preview);
 $("aiDownload").addEventListener("click",()=>{
  if(!previewUrl||!previewBytes)return;const a=document.createElement("a");a.href=previewUrl;a.download=($("file").files?.[0]?.name||"document.pdf").replace(/\.pdf$/i,"")+"-justpdfit-ai.pdf";document.body.appendChild(a);a.click();a.remove();
 });
 window.addEventListener("pagehide",()=>{if(previewUrl)URL.revokeObjectURL(previewUrl);});
 if($("file").files?.[0])inspectPDF();
})();