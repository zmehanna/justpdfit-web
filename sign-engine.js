/* JustPDFit - local, multipage PDF signing with independent placements and white ink. */
(() => {
"use strict";
const init=()=>{
 const $=id=>document.getElementById(id);
 const sig=$("sigCanvas"),ctx=sig.getContext("2d");
 ctx.lineCap="round";ctx.lineJoin="round";ctx.lineWidth=3;
 let bytes=null,pdfDoc=null,pdfView=null,pdfLoadGeneration=0,pageRenderGeneration=0,pageRenderedNumber=0;
 let sigData=null,method="type",ink="#151b34",fontIndex=0,imageSignature=null,imageLoadGeneration=0;
 let drawing=false,last=null,wizardCurrent=1,drag=null,addMode=true,activePlacementId=null,nextPlacementId=1;
 let placements=[],finalRenderGeneration=0;
 const watermark=window.JustPDFitWatermark;
 let paidDocumentFingerprint=null, pendingPaymentSession=null, pendingPaymentFingerprint=null;
 let paymentVerifying=false,checkoutStarting=false;
 const paymentStatus=message=>$("signPaymentStatus").textContent=message;
 const params=new URLSearchParams(location.search);
 if(params.get("payment")==="success"||params.get("payment")==="cancelled"){
  const notice=$("paymentReturnNotice");
  if(notice){
   notice.hidden=false;
   if(params.get("payment")==="cancelled")notice.textContent="Paiement annulé. Aucun téléchargement sans filigrane n’a été débloqué. Revenez à l’onglet d’origine pour continuer avec la version gratuite.";
  }
 }

 function pricingIsPaid(){return $("signWatermarkPaid").checked;}
 function cleanUnlocked(){return !!(paidDocumentFingerprint&&paidDocumentFingerprint===documentFingerprint);}
 let documentFingerprint=null;
 function syncDownloadPricing(){
  const enabled=!!(pdfDoc&&sigData&&placements.length);
  const paid=pricingIsPaid();
  const unlocked=cleanUnlocked();
  $("downloadSigned").hidden=paid&&!unlocked;
  $("startCleanCheckout").hidden=!paid||unlocked;
  $("startCleanCheckout").disabled=!enabled||!watermark?.backendReady||checkoutStarting;
  $("verifyCleanPayment").hidden=!paid||unlocked||!pendingPaymentSession;
  $("verifyCleanPayment").disabled=paymentVerifying||!enabled;
  $("downloadSigned").disabled=!enabled;
  $("downloadSigned").textContent=paid?"↓ Télécharger mon PDF signé · Sans filigrane":"↓ Télécharger mon PDF signé · Gratuit";
  $("finalWatermarkLabel").textContent=paid?"Sans filigrane":"JustPDFit.com · cliquable";
  $("finalPriceLabel").textContent=paid?"1,99 €":"Gratuit";
  if(!paid)paymentStatus("Le filigrane JustPDFit.com est cliquable et apparaît en bas de chaque page.");
  else if(unlocked)paymentStatus("Paiement vérifié. Vous pouvez télécharger ce PDF sans filigrane.");
  else if(!watermark?.backendReady)paymentStatus("Le paiement sécurisé sera activé dès la connexion du compte Stripe JustPDFit. Aucun débit n'est effectué.");
  else if(pendingPaymentSession)paymentStatus("Terminez le paiement dans l'onglet Stripe, puis cliquez sur « Vérifier le paiement ».");
  else paymentStatus("La version sans filigrane coûte 1,99 € par document, paiement unique via Stripe.");
 }

 const methods=["type","draw","image"];
 const fontDefs=[
  {name:"Dancing Script",weight:"600",size:94},
  {name:"Caveat",weight:"600",size:110},
  {name:"Great Vibes",weight:"400",size:96},
  {name:"Pacifico",weight:"400",size:78}
 ];
 const currentPage=()=>Number($("pageNo").value)||1;
 const realInk=()=>$("whiteSignature").checked?"#ffffff":ink;
 const currentPlacement=()=>placements.find(p=>p.id===activePlacementId)||null;
 const positionStatus=text=>$("positionStatus").textContent=text;
 const status=text=>$("soloStatus").textContent=text;
 const orderedPlacements=()=>placements.slice().sort((a,b)=>a.page-b.page||a.id-b.id);
 const signedPages=()=>[...new Set(placements.map(p=>p.page))].sort((a,b)=>a-b);
 const clamp=(v,min,max)=>Math.min(Math.max(v,min),max);

 function showMode(duo){
  $("solo").hidden=duo;$("duo").hidden=!duo;
  $("soloTab").setAttribute("aria-pressed",String(!duo));
  $("duoTab").setAttribute("aria-pressed",String(duo));
 }
 $("soloTab").addEventListener("click",()=>showMode(false));
 $("duoTab").addEventListener("click",()=>showMode(true));

 function signaturePoint(event,canvas){
  const r=canvas.getBoundingClientRect();
  return {x:(event.clientX-r.left)*canvas.width/r.width,y:(event.clientY-r.top)*canvas.height/r.height};
 }
 function clearCanvas(){ctx.clearRect(0,0,sig.width,sig.height);}
 function refreshSig(){
  sigData=sig.toDataURL("image/png");
  renderPlacementOverlays();
  syncWizard();
 }
 function clearSignatureOutput(){
  clearCanvas();sigData=null;renderPlacementOverlays();syncWizard();
 }
 function updateStylePreview(){
  const name=$("typedName").value.trim()||"Votre signature";
  document.querySelectorAll(".sig-style").forEach(button=>{
   button.textContent=name;
   button.setAttribute("aria-pressed",String(Number(button.dataset.font)===fontIndex));
  });
  $("styleSelected").textContent="Style "+(fontIndex+1)+" / 4";
 }
 function renderTyped(){
  clearCanvas();
  const value=$("typedName").value.trim();
  if(!value){clearSignatureOutput();return;}
  const def=fontDefs[fontIndex];
  const family=document.fonts.check('22px "'+def.name+'"')?'"'+def.name+'"':"cursive";
  let size=def.size;
  do{
   ctx.font=def.weight+" "+size+"px "+family;
   if(ctx.measureText(value).width<=sig.width-30)break;
   size-=2;
  }while(size>18);
  ctx.fillStyle=realInk();ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.fillText(value,sig.width/2,sig.height/2+6,sig.width-30);
  refreshSig();
 }
 function renderImage(){
  clearCanvas();
  if(!imageSignature){clearSignatureOutput();return;}
  const maxW=sig.width-24,maxH=sig.height-16;
  const scale=Math.min(maxW/imageSignature.naturalWidth,maxH/imageSignature.naturalHeight);
  const w=imageSignature.naturalWidth*scale,h=imageSignature.naturalHeight*scale;
  const x=(sig.width-w)/2,y=(sig.height-h)/2;
  ctx.drawImage(imageSignature,x,y,w,h);
  if($("whiteSignature").checked){
   // Preserve transparency for PNG/WebP. For opaque JPG/PNG on white, remove the pale background.
   const region=ctx.getImageData(0,0,sig.width,sig.height),data=region.data;
   let hasTransparency=false;
   for(let row=Math.floor(y);row<Math.ceil(y+h)&&!hasTransparency;row++){
    for(let col=Math.floor(x);col<Math.ceil(x+w);col++){
     const at=(row*sig.width+col)*4;
     if(data[at+3]<248){hasTransparency=true;break;}
    }
   }
   for(let i=0;i<data.length;i+=4){
    const alpha=data[i+3];
    if(!alpha)continue;
    if(!hasTransparency){
     const luminosity=.2126*data[i]+.7152*data[i+1]+.0722*data[i+2];
     data[i+3]=Math.round(alpha*(255-luminosity)/255);
    }
    data[i]=255;data[i+1]=255;data[i+2]=255;
   }
   ctx.putImageData(region,0,0);
  }
  refreshSig();
 }
 async function loadSignatureImage(file){
  const generation=++imageLoadGeneration;
  imageSignature=null;
  if(!file){clearSignatureOutput();return;}
  if(file.size>5*1024*1024)throw Error("L'image ne peut pas dépasser 5 Mo.");
  if(!/^image\/(png|jpeg|webp)$/.test(file.type)&&!/\.(png|jpe?g|webp)$/i.test(file.name))throw Error("Choisissez une image PNG, JPG ou WebP.");
  const url=URL.createObjectURL(file);
  try{
   const img=new Image();
   await new Promise((ok,fail)=>{img.onload=ok;img.onerror=()=>fail(Error("Impossible de lire cette image."));img.src=url;});
   if(!img.naturalWidth||!img.naturalHeight||img.naturalWidth*img.naturalHeight>20000000)throw Error("Image trop grande ou invalide.");
   if(generation!==imageLoadGeneration||method!=="image")return;
   imageSignature=img;renderImage();
  }finally{URL.revokeObjectURL(url);}
 }
 function recolorDrawing(){
  ctx.strokeStyle=realInk();
  if(!sigData)return;
  ctx.save();ctx.globalCompositeOperation="source-in";
  ctx.fillStyle=realInk();ctx.fillRect(0,0,sig.width,sig.height);
  ctx.restore();ctx.strokeStyle=realInk();refreshSig();
 }
 function changeInk(){
  document.querySelectorAll(".sig-color").forEach(b=>{
   b.disabled=$("whiteSignature").checked;
   b.setAttribute("aria-pressed",String(!$("whiteSignature").checked&&b.dataset.ink===ink));
  });
  if(method==="type")renderTyped();
  else if(method==="draw")recolorDrawing();
  else if(method==="image")renderImage();
 }
 function updateDarkPreview(){
  sig.classList.toggle("preview-dark",$("darkPreview").checked);
 }
 function selectMethod(next){
  if(!methods.includes(next)||next===method)return;
  method=next;imageLoadGeneration++;
  for(const id of methods){
   $(id+"SigTab").setAttribute("aria-selected",String(id===next));
   $(id+"SigPanel").hidden=id!==next;
  }
  $("sigPreviewLabel").textContent=next==="draw"?"Dessinez votre signature":"Aperçu de votre signature";
  $("sigInstructions").textContent=next==="type"?"Saisissez votre nom et choisissez un style. Vous pourrez ensuite le placer sur plusieurs pages.":next==="draw"?"Dessinez au doigt, à la souris ou avec l'Apple Pencil. Votre dessin sera réutilisable sur plusieurs pages.":"Importez votre image de signature (PNG, JPG, WebP). Chaque page pourra avoir sa propre position.";
  sig.style.cursor=next==="draw"?"crosshair":"default";
  document.querySelector(".sig-colors").hidden=next==="image";
  if(next==="type")renderTyped();
  else if(next==="image")renderImage();
  else{clearSignatureOutput();ctx.strokeStyle=realInk();}
 }
 methods.forEach(id=>$(id+"SigTab").addEventListener("click",()=>selectMethod(id)));
 $("typedName").addEventListener("input",()=>{updateStylePreview();if(method==="type")renderTyped();});
 document.querySelectorAll(".sig-style").forEach(button=>button.addEventListener("click",()=>{
  fontIndex=Number(button.dataset.font);updateStylePreview();if(method==="type")renderTyped();
 }));
 document.querySelectorAll(".sig-color").forEach(button=>button.addEventListener("click",()=>{
  if($("whiteSignature").checked)return;
  ink=button.dataset.ink;changeInk();
 }));
 $("whiteSignature").addEventListener("change",()=>{
  if($("whiteSignature").checked)$("darkPreview").checked=true;
  updateDarkPreview();changeInk();
 });
 $("darkPreview").addEventListener("change",updateDarkPreview);
 $("imageSigFile").addEventListener("change",async event=>{
  try{await loadSignatureImage(event.target.files?.[0]);status("");}
  catch(error){imageSignature=null;clearSignatureOutput();status("Erreur : "+error.message);}
 });
 sig.addEventListener("pointerdown",event=>{
  if(method!=="draw")return;
  drawing=true;sig.setPointerCapture(event.pointerId);last=signaturePoint(event,sig);
  ctx.strokeStyle=realInk();ctx.beginPath();ctx.moveTo(last.x,last.y);
  ctx.lineTo(last.x+.1,last.y+.1);ctx.stroke();refreshSig();
 });
 sig.addEventListener("pointermove",event=>{
  if(method!=="draw"||!drawing)return;
  const next=signaturePoint(event,sig);
  ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(next.x,next.y);ctx.stroke();
  last=next;refreshSig();
 });
 sig.addEventListener("pointerup",()=>{drawing=false;});
 sig.addEventListener("pointercancel",()=>{drawing=false;});
 $("clearSig").addEventListener("click",()=>{
  if(method==="type"){$("typedName").value="";updateStylePreview();}
  if(method==="image"){$("imageSigFile").value="";imageSignature=null;imageLoadGeneration++;$("imageSigFile").dispatchEvent(new Event("change",{bubbles:true}));}
  clearSignatureOutput();
 });
 updateStylePreview();updateDarkPreview();
 document.fonts.ready.then(()=>{if(method==="type"&&$("typedName").value.trim())renderTyped();});

 function maxWizardStep(){
  if(!pdfDoc||!pdfView||!pageRenderedNumber)return 1;
  if(!sigData)return 2;
  if(!placements.length)return 3;
  return 4;
 }
 function syncWizard(){
  const maximum=maxWizardStep();
  const names=["","Créer ma signature →","Positionner ma signature →","Vérifier mon PDF →"];
  for(const button of document.querySelectorAll("[data-wizard-step]")){
   const step=Number(button.dataset.wizardStep),current=step===wizardCurrent;
   button.disabled=step>maximum;
   button.dataset.state=step<wizardCurrent?"done":current?"current":"pending";
   if(current)button.setAttribute("aria-current","step");else button.removeAttribute("aria-current");
   button.querySelector(".wizard-step__number").textContent=step<wizardCurrent?"✓":String(step);
  }
  for(let step=1;step<=4;step++)$("wizardStep"+step).hidden=step!==wizardCurrent;
  $("wizardCounter").textContent="Étape "+wizardCurrent+" sur 4";
  $("wizardBack").hidden=wizardCurrent===1;
  $("wizardNext").hidden=wizardCurrent===4;
  if(wizardCurrent<4){
   $("wizardNext").textContent=names[wizardCurrent];
   $("wizardNext").disabled=maximum<=wizardCurrent;
  }
  const hints=[
   "",
   pdfDoc?"Votre PDF est prêt. Passez à votre signature.":"Choisissez un document PDF pour commencer.",
   sigData?"Votre signature est prête. Passez au positionnement.":"Créez votre signature pour continuer.",
   placements.length?placements.length+" position(s) enregistrée(s). Vous pouvez en ajouter.":"Cliquez sur le PDF pour placer votre première signature.",
   "Vérifiez les pages signées, puis téléchargez votre document."
  ];
  $("wizardFooterHint").textContent=hints[wizardCurrent];
  $("addPlacement").disabled=!sigData;
  syncDownloadPricing();
 }
 function showWizardStep(step,{scroll=true}={}){
  const target=Number(step);
  if(target<1||target>maxWizardStep())return false;
  wizardCurrent=target;syncWizard();
  if(target===4)prepareFinalPreview();
  if(scroll)$("soloTitle").scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
  return true;
 }
 document.querySelectorAll("[data-wizard-step]").forEach(button=>button.addEventListener("click",()=>showWizardStep(button.dataset.wizardStep)));
 $("wizardBack").addEventListener("click",()=>showWizardStep(wizardCurrent-1));
 $("wizardNext").addEventListener("click",()=>showWizardStep(wizardCurrent+1));
 $("changeSignature").addEventListener("click",()=>showWizardStep(2));

 function resetPdf(){
  pageRenderGeneration++;pageRenderedNumber=0;bytes=null;pdfDoc=null;pdfView=null;
  placements=[];activePlacementId=null;nextPlacementId=1;drag=null;addMode=true;
  documentFingerprint=null;paidDocumentFingerprint=null;pendingPaymentSession=null;pendingPaymentFingerprint=null;
  $("previewArea").hidden=true;$("documentInfo").hidden=true;
  $("pageNo").disabled=true;
  $("previewPageNo").disabled=true;
  $("signPageJump").value="1";$("signPageJump").max="1";$("signPageJump").disabled=true;
  $("finalPageJump").value="1";$("finalPageJump").max="1";
  $("previousPage").disabled=true;$("nextPage").disabled=true;
  $("finalPreviousPage").disabled=true;$("finalNextPage").disabled=true;
  $("placementLayer").replaceChildren();
  renderPlacementList();syncWizard();
 }
 $("soloFile").addEventListener("change",async event=>{
  const generation=++pdfLoadGeneration,file=event.target.files?.[0];
  resetPdf();wizardCurrent=1;syncWizard();status("");
  if(!file)return;
  status("Ouverture du PDF…");
  try{
   if(file.size>25*1024*1024)throw Error("Le PDF doit faire 25 Mo maximum.");
   if(!window.PDFLib||!window.pdfjsLib)throw Error("Bibliothèques PDF indisponibles, rechargez la page.");
   const raw=new Uint8Array(await file.arrayBuffer());
   if(generation!==pdfLoadGeneration)return;
   const documentPdf=await PDFLib.PDFDocument.load(raw.slice(),{ignoreEncryption:false});
   const view=await pdfjsLib.getDocument({data:raw.slice()}).promise;
   if(generation!==pdfLoadGeneration)return;
   bytes=raw;pdfDoc=documentPdf;pdfView=view;
   documentFingerprint=await watermark.fingerprint(raw);
   if(generation!==pdfLoadGeneration)return;
   try{
    const stored=JSON.parse(sessionStorage.getItem("justpdfit-pending-clean-payment")||"null");
    if(stored?.fingerprint===documentFingerprint&&typeof stored.sessionId==="string"){
     pendingPaymentSession=stored.sessionId;pendingPaymentFingerprint=stored.fingerprint;
    }
   }catch{}

   const internal=$("pageNo"),picker=$("previewPageNo");
   internal.replaceChildren();picker.replaceChildren();
   for(let page=1;page<=view.numPages;page++){
    const option=document.createElement("option");option.value=String(page);option.textContent="Page "+page;
    internal.append(option);picker.append(option.cloneNode(true));
   }
   internal.disabled=false;picker.disabled=false;internal.value="1";picker.value="1";
   $("signPageJump").disabled=false;$("signPageJump").max=String(view.numPages);
   $("previewArea").hidden=false;syncPager();
   await renderPage();
   if(generation!==pdfLoadGeneration)return;
   $("documentName").textContent=file.name;
   $("documentPages").textContent=view.numPages+" page"+(view.numPages===1?"":"s")+" · "+(file.size/1024/1024).toFixed(2)+" Mo";
   $("documentInfo").hidden=false;
   positionStatus("Touchez le PDF pour placer votre première signature.");
   status("");showWizardStep(2);
  }catch(error){
   if(generation!==pdfLoadGeneration)return;
   resetPdf();wizardCurrent=1;syncWizard();status("Erreur : "+error.message);
  }
 });

 function syncPager(){
  if(!pdfView)return;
  const page=currentPage(),total=pdfView.numPages;
  $("previewPageNo").value=String(page);
  $("signPageJump").value=String(page);
  $("signPageJump").max=String(total);
  $("pageCounter").textContent="/ "+total;
  $("previewPageTitle").textContent="Positionnez votre signature — page "+page;
  $("previousPage").disabled=page<=1;
  $("nextPage").disabled=page>=total;
 }
 async function selectPage(value){
  if(!pdfView)return;
  const next=clamp(Number(value)||1,1,pdfView.numPages);
  if(next===currentPage()&&next===pageRenderedNumber){syncPager();return;}
  $("pageNo").value=String(next);syncPager();
  drag=null;activePlacementId=placements.find(p=>p.page===next)?.id||null;
  addMode=!activePlacementId;
  pageRenderedNumber=0;updatePlacementHint();syncWizard();
  try{
   await renderPage();
   status("Page "+next+" sur "+pdfView.numPages+" affichée.");
  }catch(error){status("Erreur d'affichage : "+error.message);}
 }
 async function renderPage(){
  if(!pdfView)return;
  const generation=++pageRenderGeneration,view=pdfView,page=currentPage();
  pageRenderedNumber=0;syncWizard();
  const source=await view.getPage(page);
  if(generation!==pageRenderGeneration||view!==pdfView)return;
  const basic=source.getViewport({scale:1});
  const scale=Math.min(1.45,Math.max(.45,650/basic.width));
  const viewport=source.getViewport({scale});
  const temp=document.createElement("canvas");temp.width=Math.round(viewport.width);temp.height=Math.round(viewport.height);
  await source.render({canvasContext:temp.getContext("2d"),viewport}).promise;
  if(generation!==pageRenderGeneration||view!==pdfView)return;
  const dest=$("pdfPage");dest.width=temp.width;dest.height=temp.height;
  dest.getContext("2d").drawImage(temp,0,0);
  pageRenderedNumber=page;
  renderPlacementOverlays();renderPlacementList();updatePlacementHint();syncWizard();
 }
 $("pageNo").addEventListener("change",()=>selectPage($("pageNo").value));
 $("previewPageNo").addEventListener("change",()=>selectPage($("previewPageNo").value));
 $("signPageJump").addEventListener("change",()=>selectPage($("signPageJump").value));
 $("signPageJump").addEventListener("keydown",event=>{
  if(event.key==="Enter"){event.preventDefault();selectPage($("signPageJump").value);$("signPageJump").blur();}
 });
 $("previousPage").addEventListener("click",()=>selectPage(currentPage()-1));
 $("nextPage").addEventListener("click",()=>selectPage(currentPage()+1));

 function boundPosition(x,y,w,h){
  const canvas=$("pdfPage");
  return {x:clamp(x,0,Math.max(0,canvas.width-w)),y:clamp(y,0,Math.max(0,canvas.height-h))};
 }
 function defaultPlacement(x,y){
  const canvas=$("pdfPage"),w=Math.min(Number($("sigWidth").value),canvas.width*.7),h=w*sig.height/sig.width;
  const point=boundPosition(x-w/2,y-h/2,w,h);
  return {id:nextPlacementId++,page:currentPage(),x:point.x,y:point.y,w,h,canvasWidth:canvas.width,canvasHeight:canvas.height};
 }
 function renderPlacementOverlays(){
  const layer=$("placementLayer");
  layer.replaceChildren();
  if(!sigData||!pageRenderedNumber)return;
  const canvas=$("pdfPage");
  for(const item of placements.filter(p=>p.page===currentPage())){
   const marker=document.createElement("div");
   marker.className="placement-marker";marker.dataset.placementId=String(item.id);
   marker.dataset.selected=String(item.id===activePlacementId);marker.tabIndex=0;
   marker.setAttribute("role","img");marker.setAttribute("aria-label","Signature sur page "+item.page+", emplacement "+item.id+". Glissez pour déplacer.");
   const index=document.createElement("span");index.className="placement-marker__number";
   index.textContent=String(item.id);
   const image=document.createElement("img");image.src=sigData;image.alt="";
   marker.append(image,index);layer.append(marker);
   marker.style.left=item.x/canvas.width*100+"%";
   marker.style.top=item.y/canvas.height*100+"%";
   marker.style.width=item.w/canvas.width*100+"%";
   marker.style.height=item.h/canvas.height*100+"%";
   marker.addEventListener("keydown",event=>{
    if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key))return;
    event.preventDefault();
    const dx=event.key==="ArrowLeft"?-3:event.key==="ArrowRight"?3:0;
    const dy=event.key==="ArrowUp"?-3:event.key==="ArrowDown"?3:0;
    const next=boundPosition(item.x+dx,item.y+dy,item.w,item.h);
    item.x=next.x;item.y=next.y;activePlacementId=item.id;
    renderPlacementOverlays();renderPlacementList();syncWizard();
    layer.querySelector('[data-placement-id="'+item.id+'"]')?.focus();
   });
  }
 }
 function renderPlacementList(){
  const list=$("placementsList");list.replaceChildren();
  const ordered=orderedPlacements(),counts=new Map();
  for(const item of ordered){
   const nr=(counts.get(item.page)||0)+1;counts.set(item.page,nr);
   const li=document.createElement("li");li.className="placement-list-row";
   li.dataset.active=String(item.id===activePlacementId);
   const label=document.createElement("span");label.className="placement-list-label";
   const icon=document.createElement("span");icon.className="placement-list-index";icon.textContent=String(ordered.indexOf(item)+1);
   const title=document.createElement("span");title.textContent="Page "+item.page+" · position "+nr;
   label.append(icon,title);
   const actions=document.createElement("span");actions.className="placement-list-actions";
   const edit=document.createElement("button");edit.type="button";edit.textContent="Modifier";edit.setAttribute("aria-label","Modifier la position "+nr+" sur la page "+item.page);
   edit.addEventListener("click",async()=>{
    await selectPage(item.page);
    activePlacementId=item.id;addMode=false;
    renderPlacementOverlays();renderPlacementList();updatePlacementHint();
    $("pdfStage").scrollIntoView({behavior:"smooth",block:"nearest"});
   });
   const remove=document.createElement("button");remove.type="button";remove.textContent="Supprimer";remove.setAttribute("aria-label","Supprimer la position "+nr+" sur la page "+item.page);
   remove.addEventListener("click",()=>{
    placements=placements.filter(p=>p.id!==item.id);
    if(activePlacementId===item.id)activePlacementId=placements.find(p=>p.page===currentPage())?.id||null;
    addMode=!activePlacementId;
    renderPlacementOverlays();renderPlacementList();updatePlacementHint();syncWizard();
   });
   actions.append(edit,remove);li.append(label,actions);list.append(li);
  }
  $("placementCount").textContent=ordered.length+" position"+(ordered.length===1?"":"s");
  $("placementsEmpty").hidden=ordered.length>0;
  $("addPlacement").dataset.armed=String(addMode);
 }
 function updatePlacementHint(){
  if(!pdfView)return;
  if(addMode)positionStatus("Cliquez sur la page "+currentPage()+" pour ajouter une position. Chaque page peut avoir un emplacement différent.");
  else positionStatus("✓ Placement sélectionné sur la page "+currentPage()+". Déplacez-le ou cliquez sur « Ajouter une autre position ».");
  $("addPlacement").dataset.armed=String(addMode);
 }
 $("addPlacement").addEventListener("click",()=>{
  if(!sigData||!pdfView)return;
  addMode=true;activePlacementId=null;
  renderPlacementOverlays();renderPlacementList();updatePlacementHint();
  $("pdfStage").scrollIntoView({behavior:"smooth",block:"nearest"});
 });
 function stagePoint(event){
  const rect=$("pdfPage").getBoundingClientRect(),canvas=$("pdfPage");
  return {x:(event.clientX-rect.left)*canvas.width/rect.width,y:(event.clientY-rect.top)*canvas.height/rect.height};
 }
 $("pdfStage").addEventListener("pointerdown",event=>{
  if(!pdfDoc||!sigData||currentPage()!==pageRenderedNumber)return;
  const point=stagePoint(event);
  const target=event.target.closest(".placement-marker");
  let placement=target?placements.find(p=>p.id===Number(target.dataset.placementId)):null;
  if(placement){
   activePlacementId=placement.id;addMode=false;
   drag={id:placement.id,dx:point.x-placement.x,dy:point.y-placement.y};
  }else if(addMode||!placements.some(p=>p.page===currentPage())){
   placement=defaultPlacement(point.x,point.y);placements.push(placement);
   activePlacementId=placement.id;addMode=false;
   drag={id:placement.id,dx:point.x-placement.x,dy:point.y-placement.y};
  }else{
   placement=currentPlacement();
   if(!placement||placement.page!==currentPage()){
    positionStatus("Pour créer une nouvelle position, cliquez sur « Ajouter une autre position ».");
    return;
   }
   const next=boundPosition(point.x-placement.w/2,point.y-placement.h/2,placement.w,placement.h);
   placement.x=next.x;placement.y=next.y;
   drag={id:placement.id,dx:point.x-placement.x,dy:point.y-placement.y};
  }
  renderPlacementOverlays();renderPlacementList();updatePlacementHint();syncWizard();
  $("pdfStage").setPointerCapture(event.pointerId);
 });
 $("pdfStage").addEventListener("pointermove",event=>{
  if(!drag)return;
  const item=placements.find(p=>p.id===drag.id);
  if(!item||item.page!==currentPage())return;
  const point=stagePoint(event);
  const next=boundPosition(point.x-drag.dx,point.y-drag.dy,item.w,item.h);
  item.x=next.x;item.y=next.y;
  // Move only the marker during drag to keep a stable pointer capture.
  const marker=$("placementLayer").querySelector('[data-placement-id="'+item.id+'"]');
  if(marker){
   const canvas=$("pdfPage");
   marker.style.left=item.x/canvas.width*100+"%";
   marker.style.top=item.y/canvas.height*100+"%";
  }
 });
 function finishDrag(){if(!drag)return;drag=null;renderPlacementList();syncWizard();}
 $("pdfStage").addEventListener("pointerup",finishDrag);
 $("pdfStage").addEventListener("pointercancel",finishDrag);
 $("sigWidth").addEventListener("change",()=>{
  const item=currentPlacement();if(!item||item.page!==currentPage())return;
  const canvas=$("pdfPage");
  const w=Math.min(Number($("sigWidth").value),canvas.width*.7),h=w*sig.height/sig.width;
  const next=boundPosition(item.x,item.y,w,h);
  Object.assign(item,next,{w,h});
  renderPlacementOverlays();syncWizard();
 });

 function prepareFinalPreview(){
  const pages=signedPages(),selector=$("finalPreviewPage"),previous=Number(selector.value);
  selector.replaceChildren();
  for(const page of pages){
   const option=document.createElement("option");option.value=String(page);option.textContent="Page "+page;
   selector.append(option);
  }
  selector.value=String(pages.includes(previous)?previous:pages[0]);
  syncFinalPager();
  $("finalFileName").textContent=$("soloFile").files?.[0]?.name||"Document PDF";
  $("finalPageName").textContent=pages.join(", ");
  $("finalPlacementCount").textContent=placements.length+" position"+(placements.length===1?"":"s");
  $("finalMethodName").textContent=method==="type"?"Signature saisie":method==="draw"?"Signature dessinée":"Image importée";
  $("finalInkName").textContent=$("whiteSignature").checked?"Blanche":method==="image"?"Couleurs originales":ink==="#1f4ca5"?"Bleue":"Noire";
  $("finalWhiteHint").hidden=!$("whiteSignature").checked;
  syncDownloadPricing();
  renderFinalPreview().catch(error=>status("Aperçu impossible : "+error.message));
 }
 function syncFinalPager(){
  const pages=signedPages(),current=Number($("finalPreviewPage").value)||pages[0]||1;
  const index=pages.indexOf(current);
  $("finalPageJump").value=String(current);
  $("finalPageJump").max=String(pdfView?.numPages||1);
  $("finalPageCount").textContent="/ "+(pdfView?.numPages||1);
  $("finalPreviousPage").disabled=index<=0;
  $("finalNextPage").disabled=index<0||index>=pages.length-1;
 }
 function navigateFinalPage(direction){
  const pages=signedPages(),current=Number($("finalPreviewPage").value);
  const next=pages[pages.indexOf(current)+direction];
  if(next==null)return;
  $("finalPreviewPage").value=String(next);
  $("finalPreviewPage").dispatchEvent(new Event("change",{bubbles:true}));
 }
 function jumpFinalPage(){
  const value=Number($("finalPageJump").value);
  const pages=signedPages();
  if(!pages.includes(value)){
   syncFinalPager();
   $("finalPageJump").setAttribute("aria-invalid","true");
   $("finalPageJump").title="Choisissez une page signée : "+pages.join(", ");
   return;
  }
  $("finalPageJump").removeAttribute("aria-invalid");
  $("finalPageJump").title="";
  $("finalPreviewPage").value=String(value);
  $("finalPreviewPage").dispatchEvent(new Event("change",{bubbles:true}));
 }
 async function renderFinalPreview(){
  if(!pdfView||!sigData||!placements.length)return;
  syncFinalPager();
  const generation=++finalRenderGeneration,view=pdfView,page=Number($("finalPreviewPage").value)||signedPages()[0];
  const original=await view.getPage(page),unit=original.getViewport({scale:1});
  const viewport=original.getViewport({scale:Math.min(1,420/unit.width)});
  const temporary=document.createElement("canvas");temporary.width=Math.round(viewport.width);temporary.height=Math.round(viewport.height);
  await original.render({canvasContext:temporary.getContext("2d"),viewport}).promise;
  if(generation!==finalRenderGeneration||wizardCurrent!==4||view!==pdfView)return;
  const canvas=$("finalPreviewCanvas");canvas.width=temporary.width;canvas.height=temporary.height;
  const pen=canvas.getContext("2d");pen.drawImage(temporary,0,0);
  const image=new Image();image.src=sigData;
  if(image.decode)await image.decode();
  else await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;});
  if(generation!==finalRenderGeneration||wizardCurrent!==4)return;
  for(const item of placements.filter(p=>p.page===page)){
   pen.drawImage(image,item.x/item.canvasWidth*canvas.width,item.y/item.canvasHeight*canvas.height,item.w/item.canvasWidth*canvas.width,item.h/item.canvasHeight*canvas.height);
  }
  if(!pricingIsPaid()){
   pen.save();
   const footerText="Signé avec JustPDFit.com";
   const size=Math.max(7,Math.min(10,canvas.width/60));
   pen.font=size+"px Arial, sans-serif";
   const textWidth=pen.measureText(footerText).width;
   const baseline=canvas.height-10;
   pen.fillStyle="rgba(255,255,255,.87)";
   pen.fillRect(0,canvas.height-23,canvas.width,23);
   pen.fillStyle="#636c87";
   pen.fillText(footerText,(canvas.width-textWidth)/2,baseline);
   pen.restore();
  }
 }
 $("finalPreviewPage").addEventListener("change",()=>{
  syncFinalPager();
  renderFinalPreview().catch(error=>status("Aperçu impossible : "+error.message));
 });
 $("finalPreviousPage").addEventListener("click",()=>navigateFinalPage(-1));
 $("finalNextPage").addEventListener("click",()=>navigateFinalPage(1));
 $("finalPageJump").addEventListener("change",jumpFinalPage);
 $("finalPageJump").addEventListener("keydown",event=>{
  if(event.key==="Enter"){event.preventDefault();jumpFinalPage();$("finalPageJump").blur();}
 });

 $("signWatermarkFree").addEventListener("change",()=>{
  syncDownloadPricing();
  if(wizardCurrent===4)renderFinalPreview().catch(error=>status("Aperçu impossible : "+error.message));
 });
 $("signWatermarkPaid").addEventListener("change",()=>{
  syncDownloadPricing();
  if(wizardCurrent===4)renderFinalPreview().catch(error=>status("Aperçu impossible : "+error.message));
 });
 $("startCleanCheckout").addEventListener("click",async()=>{
  if(!watermark?.backendReady||!documentFingerprint||checkoutStarting)return;
  checkoutStarting=true;syncDownloadPricing();
  // Open synchronously as a consequence of the click, so browsers do not block Stripe.
  const tab=window.open("about:blank","_blank");
  if(tab){
   try{tab.document.write("<!doctype html><html lang='fr'><title>Stripe</title><body style='font:16px Arial;padding:32px'>Ouverture du paiement sécurisé Stripe…</body></html>");tab.document.close();}catch{}
  }
  try{
   if(!tab)throw Error("Autorisez les fenêtres contextuelles pour ouvrir Stripe, puis réessayez.");
   const result=await watermark.createCheckout(documentFingerprint);
   if(!result?.sessionId||!/^https:\/\/checkout\.stripe\.com\//.test(result.checkoutUrl||""))throw Error("Réponse du service de paiement non valide.");
   pendingPaymentSession=result.sessionId;pendingPaymentFingerprint=documentFingerprint;
   try{sessionStorage.setItem("justpdfit-pending-clean-payment",JSON.stringify({fingerprint:documentFingerprint,sessionId:result.sessionId}));}catch{}
   tab.location.href=result.checkoutUrl;
   paymentStatus("Paiement ouvert dans un nouvel onglet. Gardez cet onglet JustPDFit ouvert et revenez vérifier votre paiement.");
  }catch(error){
   try{tab?.close();}catch{}
   paymentStatus("Erreur : "+error.message);
  }finally{checkoutStarting=false;syncDownloadPricing();}
 });
 $("verifyCleanPayment").addEventListener("click",async()=>{
  if(!watermark?.backendReady||!documentFingerprint||!pendingPaymentSession||paymentVerifying)return;
  paymentVerifying=true;syncDownloadPricing();
  try{
   if(documentFingerprint!==pendingPaymentFingerprint)throw Error("Ce paiement correspond à un autre document.");
   const verified=await watermark.verifyCheckout(pendingPaymentSession,documentFingerprint);
   if(verified?.paid!==true)throw Error("Le paiement n'est pas encore confirmé. Terminez-le sur Stripe puis réessayez.");
   paidDocumentFingerprint=documentFingerprint;
   pendingPaymentSession=null;pendingPaymentFingerprint=null;
   try{sessionStorage.removeItem("justpdfit-pending-clean-payment");}catch{}
   paymentStatus("Paiement validé : téléchargement sans filigrane disponible.");
  }catch(error){paymentStatus("Vérification : "+error.message);}
  finally{paymentVerifying=false;syncDownloadPricing();}
 });

 $("downloadSigned").addEventListener("click",async()=>{
  if(!pdfDoc||!sigData||!placements.length||!bytes)return;
  const button=$("downloadSigned");button.disabled=true;
  try{
   const copy=await PDFLib.PDFDocument.load(bytes.slice());
   const png=await copy.embedPng(sigData);
   for(const item of orderedPlacements()){
    const page=copy.getPages()[item.page-1];
    if(!page)throw Error("Page introuvable : "+item.page);
    const dims=page.getSize();
    const sx=dims.width/item.canvasWidth,sy=dims.height/item.canvasHeight;
    page.drawImage(png,{
     x:item.x*sx,
     y:dims.height-(item.y+item.h)*sy,
     width:item.w*sx,
     height:item.h*sy
    });
   }
   // A paid option cannot be unlocked by just selecting a radio button.
   if(pricingIsPaid()&&!cleanUnlocked())throw Error("Le paiement sans filigrane doit être vérifié avant le téléchargement.");
   if(!pricingIsPaid())await watermark.stamp(copy);
   const out=await copy.save();
   const blob=new Blob([out],{type:"application/pdf"});
   const url=URL.createObjectURL(blob),a=document.createElement("a");
   a.href=url;a.download=($("soloFile").files[0].name.replace(/\.pdf$/i,"")||"document")+"-signe.pdf";
   document.body.append(a);a.click();a.remove();
   setTimeout(()=>URL.revokeObjectURL(url),10000);
   status("PDF signé : "+placements.length+" position"+(placements.length===1?"":"s")+" sur "+signedPages().length+" page(s). "+(pricingIsPaid()?"Sans filigrane (paiement vérifié).":"Filigrane JustPDFit.com cliquable sur chaque page.")+" Téléchargement démarré.");
  }catch(error){status("Erreur : "+error.message);}
  finally{syncWizard();}
 });
 function syncDuoPrice(){
  const base=$("verifyDidit").checked?3.99:1.99;
  $("duoTotal").textContent=(base+($("duoNoWatermark").checked?1.99:0)).toFixed(2).replace(".",",")+" €";
 }
 document.querySelectorAll('input[name="verify"]').forEach(input=>input.addEventListener("change",syncDuoPrice));
 $("duoNoWatermark").addEventListener("change",syncDuoPrice);
 renderPlacementList();syncWizard();
};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
else init();
})();
