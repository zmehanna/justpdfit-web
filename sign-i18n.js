/* Sign page copy is translated locally, using the same language flag selector as all JustPDFit pages.
   FR is the semantic HTML default; EN/AR are full workflow translations,
   and less common locales receive a clear English fallback where a key is not localized. */
(() => {
 "use strict";
 const phrases = [
 ["Signez un PDF, simplement.","Sign a PDF in a few easy steps.","وقّع ملف PDF بسهولة."],
 ["Une signature individuelle gratuite, directement sur votre appareil. Pour deux signataires à distance, invitations individuelles et vérification par email.","Sign your own PDF for free, directly on your device. Remote two-person signing with separate email invitations and verification is in preparation.","وقّع مستندك مجانًا على جهازك مباشرة. التوقيع عن بُعد لشخصين مع دعوات وتحقق عبر البريد الإلكتروني قيد التطوير."],
 ["✓ Sans compte pour signer seul","✓ No account needed for individual signing","✓ لا حاجة إلى حساب للتوقيع الفردي"],
 ["✓ Filigrane cliquable en version gratuite","✓ Clickable watermark on free signatures","✓ علامة مائية قابلة للنقر في النسخة المجانية"],
 ["✓ Optimisé mobile et tablette","✓ Works on phones and tablets","✓ مناسب للهاتف واللوحي"],
 ["VOTRE ESPACE DE SIGNATURE","YOUR SIGNING WORKSPACE","مساحة التوقيع"],
 ["Comment souhaitez-vous signer ?","How would you like to sign?","كيف تريد التوقيع؟"],
 ["Choisissez une option pour commencer.","Choose an option to get started.","اختر خيارًا للبدء."],
 ["✍️ Signature locale","✍️ Local signature","✍️ توقيع محلي"],
 ["Je signe seul","Sign by myself","أوقّع بمفردي"],
 ["Sans compte, sans envoi au serveur. Téléchargez votre PDF signé.","No account or server upload. Download your signed PDF.","دون حساب أو رفع الملف إلى الخادم. نزّل ملف PDF الموقّع."],
 ["Gratuit","Free","مجاني"],
 ["✉️ Deux personnes","✉️ Two people","✉️ شخصان"],
 ["Nous signons à distance","Sign remotely together","التوقيع عن بُعد لشخصين"],
 ["Un lien unique et un code email pour chaque signataire.","A personal link and email code for each signer.","رابط ورمز عبر البريد الإلكتروني لكل موقّع."],
 ["Dès 1,99 €","From €1.99","ابتداءً من 1.99 يورو"],
 ["Signer un PDF gratuitement","Sign a PDF for free","وقّع ملف PDF مجانًا"],
 ["Un parcours simple, étape par étape. Votre document reste sur votre appareil.","A simple step-by-step flow. Your document stays on your device.","خطوات بسيطة ومتسلسلة، ويبقى المستند على جهازك."],
 ["Importer le PDF","Upload PDF","استيراد PDF"],
 ["Créer la signature","Create signature","إنشاء التوقيع"],
 ["Positionner","Place signature","تحديد الموضع"],
 ["Télécharger","Download","تنزيل"],
 ["ÉTAPE 1 · VOTRE DOCUMENT","STEP 1 · YOUR DOCUMENT","الخطوة 1 · مستندك"],
 ["Importez le document à signer","Choose the PDF to sign","اختر ملف PDF للتوقيع"],
 ["Choisissez un fichier PDF (25 Mo maximum). Nous détecterons automatiquement toutes ses pages.","Choose a PDF (up to 25 MB). We will detect all its pages automatically.","اختر ملف PDF بحجم لا يزيد على 25 ميغابايت. سنكتشف جميع صفحاته تلقائيًا."],
 ["Votre document PDF","Your PDF document","مستند PDF الخاص بك"],
 ["🔒 Le fichier n'est pas envoyé à un serveur. Il reste dans votre navigateur pendant toute la signature.","🔒 Your PDF is not uploaded to a server. It remains in your browser while you sign.","🔒 لا يُرفع الملف إلى خادم، بل يبقى في متصفحك طوال عملية التوقيع."],
 ["ÉTAPE 2 · VOTRE SIGNATURE","STEP 2 · YOUR SIGNATURE","الخطوة 2 · توقيعك"],
 ["Saisissez votre nom, dessinez avec votre doigt ou importez une image. Choisissez ensuite votre style et votre couleur.","Type your name, draw with your finger or upload an image. Then choose a style and ink color.","اكتب اسمك أو ارسم توقيعك بإصبعك أو ارفع صورة، ثم اختر النمط ولون الحبر."],
 ["⌨️ Saisir","⌨️ Type","⌨️ كتابة"],
 ["✍️ Dessiner","✍️ Draw","✍️ رسم"],
 ["▧ Image","▧ Image","▧ صورة"],
 ["Votre nom et prénom","Your full name","الاسم الكامل"],
 ["Saisissez votre signature","Type your signature","اكتب توقيعك"],
 ["Choisissez votre style d'écriture","Choose your handwriting style","اختر نمط الكتابة"],
 ["Votre signature","Your signature","توقيعك"],
 ["Dessinez avec le doigt, la souris ou l'Apple Pencil.","Draw with your finger, mouse or Apple Pencil.","ارسم بإصبعك أو الفأرة أو قلم Apple Pencil."],
 ["Importer une signature existante","Import an existing signature","استيراد توقيع جاهز"],
 ["PNG transparent recommandé, JPG ou WebP acceptés (max. 5 Mo). L'image est traitée uniquement sur cet appareil.","Transparent PNG recommended; JPG and WebP accepted (up to 5 MB). Image processing happens on this device.","يُفضّل PNG بخلفية شفافة؛ تُقبل JPG وWebP حتى 5 ميغابايت. تُعالج الصورة على جهازك فقط."],
 ["Aperçu de votre signature","Signature preview","معاينة التوقيع"],
 ["Signature blanche","White signature","توقيع أبيض"],
 ["Aperçu sur fond noir","Preview on black background","معاينة على خلفية سوداء"],
 ["Le fond noir sert uniquement à visualiser votre signature. Il ne change pas le fond de votre PDF.","The black background only helps you preview the signature. It does not change the PDF background.","الخلفية السوداء للمعاينة فقط، ولا تغيّر خلفية ملف PDF."],
 ["Effacer la signature","Clear signature","مسح التوقيع"],
 ["Saisissez votre nom, puis choisissez un des quatre styles. Après chargement du PDF, touchez ou cliquez à l'endroit où placer votre signature, puis déplacez-la si besoin.","Type your name and select one of four styles. Tap the PDF to place your signature, then drag it to adjust its position.","اكتب اسمك واختر أحد الأنماط الأربعة. اضغط على المستند لوضع التوقيع واسحبه لتعديل موضعه."],
 ["ÉTAPE 3 · POSITIONNEMENT","STEP 3 · PLACEMENT","الخطوة 3 · الموضع"],
 ["Choisissez la page et placez la signature","Choose a page and place the signature","اختر الصفحة وحدّد مكان التوقيع"],
 ["Dans les PDF multipages, parcourez les pages, puis touchez ou cliquez sur le document pour positionner votre signature. Faites-la glisser pour l'ajuster.","For a multipage PDF, use the arrows to move between pages or type a page number. Tap the document to position the signature, then drag to adjust.","في ملف PDF متعدد الصفحات، استخدم الأسهم أو أدخل رقم الصفحة. اضغط على المستند لوضع التوقيع واسحبه لضبط موضعه."],
 ["Choisissez la page à signer","Choose the page to sign","اختر الصفحة للتوقيع"],
 ["Parcourez votre document et sélectionnez la page où vous souhaitez placer votre signature.","Use the arrows or enter a page number to select where to place your signature.","استخدم الأسهم أو أدخل رقم الصفحة لتحديد موضع التوقيع."],
 ["Page","Page","صفحة"],
 ["Positionnez votre signature","Place your signature","حدّد موضع توقيعك"],
 ["Taille de la signature","Signature size","حجم التوقيع"],
 ["Petite","Small","صغير"],
 ["Moyenne","Medium","متوسط"],
 ["Grande","Large","كبير"],
 ["✍️ Placez votre signature","✍️ Place your signature","✍️ ضع توقيعك"],
 ["Touchez le PDF à l'endroit où vous souhaitez signer.","Tap the PDF where you want to sign.","اضغط على ملف PDF في موضع التوقيع."],
 ["← Modifier la signature","← Edit signature","← تعديل التوقيع"],
 ["Placements enregistrés","Saved placements","مواضع التوقيع المحفوظة"],
 ["Vous n'avez pas encore placé de signature. Choisissez une page et cliquez à l'endroit souhaité.","No signature has been placed yet. Choose a page and tap where you want to sign.","لم تضع أي توقيع بعد. اختر صفحة واضغط على المكان المطلوب."],
 ["＋ Ajouter une autre position","＋ Add another position","＋ إضافة موضع آخر"],
 ["ÉTAPE 4 · VÉRIFICATION","STEP 4 · REVIEW","الخطوة 4 · المراجعة"],
 ["Votre PDF signé est prêt","Your signed PDF is ready","ملف PDF الموقّع جاهز"],
 ["Vérifiez l'emplacement de votre signature avant de télécharger le document.","Review each signed page before downloading your document.","راجع كل صفحة موقّعة قبل تنزيل المستند."],
 ["Vérifier la page signée","Review signed page","مراجعة الصفحة الموقّعة"],
 ["Fichier","File","الملف"],
 ["Pages signées","Signed pages","الصفحات الموقّعة"],
 ["Placements","Placements","المواضع"],
 ["Méthode","Method","الطريقة"],
 ["Couleur","Ink","اللون"],
 ["Filigrane","Watermark","العلامة المائية"],
 ["Tarif","Price","السعر"],
 ["JustPDFit.com · inclus","JustPDFit.com · included","JustPDFit.com · متضمن"],
 ["Choisissez votre téléchargement","Choose your download","اختر طريقة التنزيل"],
 ["PDF signé avec filigrane","Signed PDF with watermark","PDF موقّع بعلامة مائية"],
 ["Lien discret « JustPDFit.com » en bas de chaque page","Small clickable JustPDFit.com link at the bottom of every page","رابط JustPDFit.com صغير وقابل للنقر أسفل كل صفحة"],
 ["PDF signé sans filigrane","Signed PDF without watermark","PDF موقّع دون علامة مائية"],
 ["Une fois par document, sans abonnement","One-time per document, no subscription","دفعة واحدة لكل مستند دون اشتراك"],
 ["↓ Télécharger mon PDF signé · Gratuit","↓ Download signed PDF · Free","↓ تنزيل PDF الموقّع · مجاني"],
 ["Payer 1,99 € pour supprimer le filigrane","Pay €1.99 to remove watermark","ادفع 1.99 يورو لإزالة العلامة المائية"],
 ["Vérifier le paiement","Verify payment","التحقق من الدفع"],
 ["La signature blanche est prévue pour les zones sombres des PDF. Un fond blanc peut la rendre invisible.","White signatures work on dark PDF areas. They may be invisible on white backgrounds.","التوقيع الأبيض مناسب للمناطق الداكنة وقد لا يظهر على خلفية بيضاء."],
 ["Traitement local et sans compte. La version gratuite contient un filigrane cliquable en bas de chaque page. La signature est visuelle, non qualifiée.","Local processing, no account. The free version has a clickable watermark on every page. This is a visual, not a qualified electronic signature.","المعالجة محلية ودون حساب. تحتوي النسخة المجانية على علامة مائية قابلة للنقر على كل صفحة. التوقيع مرئي وليس توقيعًا إلكترونيًا مؤهلًا."],
 ["← Retour","← Back","← رجوع"],
 ["Importez votre PDF pour continuer.","Choose a PDF to continue.","اختر ملف PDF للمتابعة."],
 ["Créer ma signature →","Create my signature →","إنشاء توقيعي ←"],
 ["Signature à deux, entièrement en ligne","Two-person remote signing","توقيع شخصين عن بُعد"],
 ["Les deux signataires reçoivent un email personnel. Aucun compte ni application à installer. La signature à deux sera activée après raccordement sécurisé du service de paiement, des invitations email et du stockage temporaire.","Each signer will receive a personal email. No account or app required. Remote signing is not yet active: payments, email invitations and temporary storage are still being integrated.","سيتلقى كل موقّع بريدًا إلكترونيًا خاصًا دون الحاجة إلى حساب أو تطبيق. التوقيع عن بُعد غير مفعل بعد، إذ يجري تطوير الدفع والدعوات والتخزين المؤقت."],
 ["Document PDF","PDF document","مستند PDF"],
 ["Email du premier signataire","First signer's email","بريد الموقّع الأول"],
 ["Email du deuxième signataire","Second signer's email","بريد الموقّع الثاني"],
 ["Vérification par code email","Email code verification","التحقق برمز البريد"],
 ["Deux invitations indépendantes, consentement et rapport de preuve · 1,99 €","Two separate invitations, consent and evidence report · €1.99","دعوتان مستقلتان وموافقة وتقرير إثبات · 1.99 يورو"],
 ["Identification renforcée Didit","Enhanced Didit identity verification","التحقق المعزز من الهوية عبر Didit"],
 ["Vérification des pièces d'identité et du visage pour chaque signataire · 3,99 €","Identity document and face checks for each signer · €3.99","التحقق من الهوية والوجه لكل موقّع · 3.99 يورو"],
 ["Retirer le filigrane JustPDFit.com · +1,99 €","Remove the JustPDFit.com watermark · +€1.99","إزالة العلامة المائية JustPDFit.com · +1.99 يورو"],
 ["Par défaut, un lien JustPDFit.com cliquable figure en bas de chaque page du document final.","By default, a clickable JustPDFit.com link appears at the bottom of every page.","افتراضيًا يظهر رابط JustPDFit.com قابل للنقر أسفل كل صفحة."],
 ["Tarif par document","Price per document","السعر لكل مستند"],
 ["Paiement et envoi — bientôt disponibles","Payment and invitations — coming soon","الدفع والدعوات — قريبًا"],
 ["Le service à deux est en préparation. Aucun paiement ni invitation n'est envoyé actuellement.","Two-person signing is in preparation. No payment or invitation can be sent yet.","خدمة التوقيع لشخصين قيد الإعداد، ولا يمكن إرسال دعوات أو إجراء دفع حاليًا."],
 ["La signature individuelle ne téléverse pas votre PDF. Le service de signature à distance nécessitera un traitement sécurisé du document avec consentement explicite des deux signataires.","Individual signing does not upload your PDF. Future remote signing will require secure document processing with both signers' explicit consent.","لا يرفع التوقيع الفردي ملف PDF. ستتطلب خدمة التوقيع عن بُعد معالجة آمنة للمستند وموافقة صريحة من كلا الموقّعين."],
 ["Signature saisie","Typed signature","توقيع مكتوب"],
 ["Signature dessinée","Drawn signature","توقيع مرسوم"],
 ["Image importée","Uploaded image","صورة مرفوعة"],
 ["Blanche","White","أبيض"],
 ["Bleue","Blue","أزرق"],
 ["Noire","Black","أسود"],
 ["Couleurs originales","Original colors","الألوان الأصلية"],
 ["Positionner ma signature →","Place my signature →","تحديد موضع توقيعي ←"],
 ["Vérifier mon PDF →","Review my PDF →","مراجعة ملف PDF ←"],
 ["Votre PDF est prêt. Passez à votre signature.","Your PDF is ready. Create your signature.","ملف PDF جاهز. أنشئ توقيعك."],
 ["Choisissez un document PDF pour commencer.","Choose a PDF to get started.","اختر مستند PDF للبدء."],
 ["Votre signature est prête. Passez au positionnement.","Your signature is ready. Choose where to place it.","توقيعك جاهز. اختر مكان وضعه."],
 ["Créez votre signature pour continuer.","Create a signature to continue.","أنشئ توقيعًا للمتابعة."],
 ["Cliquez sur le PDF pour placer votre première signature.","Tap the PDF to place your first signature.","اضغط على PDF لوضع التوقيع الأول."],
 ["Vérifiez les pages signées, puis téléchargez votre document.","Review signed pages, then download your document.","راجع الصفحات الموقّعة ثم نزّل مستندك."],
 ["Aperçu impossible :","Unable to preview:","تعذرت المعاينة:"],
 ["Choisissez une page signée :","Choose a signed page:","اختر صفحة موقّعة:"],
 ["Numéro de la page à signer","Page number to sign","رقم صفحة التوقيع"],
 ["Saisir le numéro d'une page signée","Enter the number of a signed page","أدخل رقم الصفحة الموقّعة"],
 ["Page précédente","Previous page","الصفحة السابقة"],
 ["Page suivante","Next page","الصفحة التالية"],
 ["Page signée précédente","Previous signed page","الصفحة الموقّعة السابقة"],
 ["Page signée suivante","Next signed page","الصفحة الموقّعة التالية"]
 ];
 const map=new Map(phrases.map(([fr,en,ar])=>[fr,{en,ar}]));
 const originals=new WeakMap(), attributes=new WeakMap();
 const roots=()=>[document.querySelector(".sign-hero"),document.querySelector(".sign-shell"),document.querySelector("#paymentReturnNotice")].filter(Boolean);
 const ignored="SCRIPT,STYLE,SVG,CANVAS,OPTION,NOSCRIPT,TEXTAREA,IFRAME";
 let lastCode="fr",scheduled=false;
 const activeLanguage=()=>window.JustPDFItI18n?.getLanguage?.()||document.documentElement.lang||"fr";
 function translateText(original,code){
  const v=original.trim();
  if(!v)return original;
  let phrase=map.get(v);
  let translated=phrase?(code==="fr"?v:phrase[code==="ar"?"ar":"en"]):v;
  let dynamic=v.match(/^Étape (\d+) sur 4$/);
  if(dynamic)translated=code==="fr"?v:code==="ar"?"الخطوة "+dynamic[1]+" من 4":"Step "+dynamic[1]+" of 4";
  dynamic=v.match(/^Positionnez votre signature — page (\d+)$/);
  if(dynamic)translated=code==="fr"?v:code==="ar"?"حدّد موضع توقيعك — صفحة "+dynamic[1]:"Place your signature — page "+dynamic[1];
  dynamic=v.match(/^Page (\d+) sur (\d+) affichée\.$/);
  if(dynamic)translated=code==="fr"?v:code==="ar"?"الصفحة "+dynamic[1]+" من "+dynamic[2]+" معروضة.":"Page "+dynamic[1]+" of "+dynamic[2]+" displayed.";
  dynamic=v.match(/^(\d+) position(?:\(s\)|s)? enregistrée(?:\(s\)|s)?\.?$/);
  if(dynamic)translated=code==="fr"?v:code==="ar"?"تم حفظ "+dynamic[1]+" موضع":"Saved "+dynamic[1]+" placement(s).";
  dynamic=v.match(/^(\d+) position(?:s)?$/);
  if(dynamic)translated=code==="fr"?v:code==="ar"?dynamic[1]+" موضع":dynamic[1]+" placement(s)";
  dynamic=v.match(/^Style (\d+) \/ 4$/);
  if(dynamic)translated=code==="fr"?v:code==="ar"?"النمط "+dynamic[1]+" / 4":"Style "+dynamic[1]+" / 4";
  if(translated===v)return original;
  const lead=original.match(/^\s*/)?.[0]||"",tail=original.match(/\s*$/)?.[0]||"";
  return lead+translated+tail;
 }
 function walkText(root,code){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode())){
   const parent=node.parentElement;
   if(!parent||parent.closest("script,style,svg,canvas,option,noscript,textarea,iframe,.jpi-global-nav,.jpi-site-footer"))continue;
   let original=originals.get(node);
   if(original===undefined){original=node.nodeValue;originals.set(node,original);}
   const next=translateText(original,code);
   if(node.nodeValue!==next)node.nodeValue=next;
  }
  const elements=root.querySelectorAll("[placeholder],[aria-label],[title]");
  for(const el of elements){
   let attrs=attributes.get(el);
   if(!attrs){attrs={};for(const name of ["placeholder","aria-label","title"])if(el.hasAttribute(name))attrs[name]=el.getAttribute(name);attributes.set(el,attrs);}
   for(const [name,val] of Object.entries(attrs)){const next=translateText(val,code).trim();if(el.getAttribute(name)!==next)el.setAttribute(name,next);}
  }
 }
 function translate(){
  const code=activeLanguage().split("-")[0];lastCode=code;
  roots().forEach(root=>walkText(root,code));
  if(code==="fr")document.title="Signer un PDF gratuitement, sans compte | JustPDFit";
  else if(code==="ar")document.title="توقيع PDF مجانًا عبر الإنترنت | JustPDFit";
  else document.title="Sign a PDF Free Online, Privately | JustPDFit";
 }
 function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;translate();});}
 function init(){
  translate();
  // Sign engine replaces individual text nodes as users move through steps.
  // Retain translations without observing unrelated app controls or file data.
  for(const root of roots())new MutationObserver(schedule).observe(root,{characterData:true,childList:true,subtree:true});
  document.addEventListener("justpdfit-language",translate);
 }
 window.JustPDFItSignI18n={translate,getLanguage:()=>lastCode,translateText};
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();