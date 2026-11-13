/* JustPDFit AI guide — privacy-first routing MVP. No PDF content is read or uploaded. */
(() => {
  "use strict";
  if (window.__justpdfitAiGuideLoaded) return;
  window.__justpdfitAiGuideLoaded = true;
  const lex = {
    en:{name:"JustPDFit Assistant",open:"Ask JustPDFit",intro:"Tell me what you want to do with your PDF. I'll guide you to the right tool.",placeholder:"e.g. Sign the last page of my PDF",send:"Find my tool",close:"Close assistant",privacy:"Your request is handled on this device. No PDF files or text are sent to an AI service.",noMatch:"I couldn't choose a tool confidently. Try one of the examples below.",suggestions:["Sign my PDF","Merge two PDFs","Add text to a PDF","Extract a page"],route:"Open this tool",notice:"I'll open the appropriate tool. Your document will not be edited automatically.",soon:"This feature is still being developed. No conversion will be simulated.",create:"Create a PDF",sign:"Sign a PDF",edit:"Edit a PDF",merge:"Merge PDFs",split:"Split a PDF",jpg:"JPG to PDF",compress:"Compress a PDF",pdfword:"PDF to Word",wordpdf:"Word to PDF",label:"Suggested next step",caption:"Guided assistant beta · automatic document editing is not yet enabled."},
    fr:{name:"Assistant JustPDFit",open:"Demander à JustPDFit",intro:"Décrivez ce que vous voulez faire avec votre PDF. Je vous guiderai vers le bon outil.",placeholder:"Ex. : signer la dernière page de mon PDF",send:"Trouver mon outil",close:"Fermer l'assistant",privacy:"Votre demande est traitée sur cet appareil. Aucun PDF ni texte n'est envoyé à un service d'IA.",noMatch:"Je n'ai pas pu identifier l'outil avec certitude. Essayez un exemple ci-dessous.",suggestions:["Signer mon PDF","Fusionner deux PDF","Ajouter du texte","Extraire une page"],route:"Ouvrir cet outil",notice:"Je vais ouvrir l'outil approprié. Votre document ne sera pas modifié automatiquement.",soon:"Cette fonction est encore en développement. Aucune conversion fictive ne sera réalisée.",create:"Créer un PDF",sign:"Signer un PDF",edit:"Modifier un PDF",merge:"Fusionner des PDF",split:"Diviser un PDF",jpg:"JPG vers PDF",compress:"Compresser un PDF",pdfword:"PDF vers Word",wordpdf:"Word vers PDF",label:"Prochaine étape suggérée",caption:"Assistant guidé bêta · modification automatique non disponible pour le moment."},
    ar:{name:"مساعد JustPDFit",open:"اسأل JustPDFit",intro:"صف ما تريد فعله بملف PDF وسأرشدك إلى الأداة المناسبة.",placeholder:"مثلاً: وقّع الصفحة الأخيرة من ملف PDF",send:"اعثر على الأداة",close:"إغلاق المساعد",privacy:"يُعالج طلبك على جهازك فقط. لا يتم إرسال الملفات أو النصوص إلى خدمة ذكاء اصطناعي.",noMatch:"لم أتمكن من تحديد الأداة بدقة. جرب أحد الأمثلة أدناه.",suggestions:["توقيع PDF","دمج ملفين PDF","إضافة نص إلى PDF","استخراج صفحة"],route:"افتح الأداة",notice:"سأفتح الأداة المناسبة. لن يتم تعديل مستندك تلقائيًا.",soon:"هذه الميزة قيد التطوير. لن نجري تحويلًا وهميًا.",create:"إنشاء PDF",sign:"توقيع PDF",edit:"تعديل PDF",merge:"دمج PDF",split:"تقسيم PDF",jpg:"JPG إلى PDF",compress:"ضغط PDF",pdfword:"PDF إلى Word",wordpdf:"Word إلى PDF",label:"الخطوة التالية المقترحة",caption:"مساعد إرشادي تجريبي · التعديل التلقائي غير متاح بعد."}
  };
  const routes = {
    sign:{href:"/sign/",live:true,rx:/sign|signature|initial|paraph|firmar|assin|unterschr|توقيع|وقّع|امضا|署名/i},
    merge:{href:"/merge-pdf/",live:true,rx:/merge|join|combine|fusion|réun|assembler|unir|juntar|دمج|اجمع|合并/i},
    split:{href:"/split-pdf/",live:true,rx:/split|extract|remove page|delete page|separ|extraire|supprim.{0,12}page|retir.{0,12}page|divis|sépar|تقسيم|استخراج|حذف.{0,12}صفح/i},
    edit:{href:"/edit-pdf/",live:true,rx:/edit|annotat|add text|checkbox|highlight|date|fill|rempl|modifier|modifi|ajouter|texte|formulaire|surlign|écrire|écri|تعديل|اضاف|إضافة|نص|تاريخ|تحرير/i},
    jpg:{href:"/jpg-to-pdf/",live:true,rx:/jpg|jpeg|png|image|photo|صورة|صور/i},
    compress:{href:"/compress-pdf/",live:false,rx:/compress|reduce size|smaller|compresser|réduire.{0,10}taille|ضغط|حجم/i},
    pdfword:{href:"/pdf-to-word/",live:false,rx:/pdf.{0,18}(to|vers|en|الى|إلى).{0,10}word|convert.{0,20}word|word.{0,15}from.{0,12}pdf/i},
    wordpdf:{href:"/word-to-pdf/",live:false,rx:/word.{0,18}(to|vers|en|الى|إلى).{0,10}pdf/i},
    create:{href:"/#workbench",live:true,rx:/creat|make (a )?pdf|convert|créer|creer|faire un pdf|إنشاء|اصنع/i}
  };
  function lang() {const q=new URLSearchParams(location.search).get("lang");const s=(q||document.documentElement.lang||navigator.language||"en").toLowerCase();return s.startsWith("ar")?"ar":s.startsWith("fr")?"fr":"en";}
  let lastFocus=null;
  const trigger=document.createElement("button");trigger.className="jpi-ai-trigger";trigger.type="button";trigger.setAttribute("aria-haspopup","dialog");
  const panel=document.createElement("section");panel.className="jpi-ai-panel";panel.hidden=true;panel.setAttribute("role","dialog");panel.setAttribute("aria-modal","true");
  const head=document.createElement("div");head.className="jpi-ai-head";
  const title=document.createElement("strong");const dismiss=document.createElement("button");dismiss.type="button";dismiss.className="jpi-ai-dismiss";dismiss.textContent="×";
  head.append(title,dismiss);
  const intro=document.createElement("p");intro.className="jpi-ai-intro";
  const form=document.createElement("form");form.className="jpi-ai-form";
  const input=document.createElement("textarea");input.rows=2;input.maxLength=500;input.required=true;input.setAttribute("aria-label","PDF request");
  const submit=document.createElement("button");submit.type="submit";submit.className="jpi-ai-submit";
  form.append(input,submit);
  const feedback=document.createElement("div");feedback.className="jpi-ai-feedback";feedback.setAttribute("aria-live","polite");
  const examples=document.createElement("div");examples.className="jpi-ai-examples";
  const privacy=document.createElement("p");privacy.className="jpi-ai-privacy";
  const caption=document.createElement("p");caption.className="jpi-ai-caption";
  panel.append(head,intro,form,feedback,examples,privacy,caption);
  document.body.append(trigger,panel);
  function copy(){return lex[lang()];}
  function refresh(){
    const t=copy();trigger.textContent="✦ "+t.open;title.textContent="✦ "+t.name;dismiss.setAttribute("aria-label",t.close);intro.textContent=t.intro;input.placeholder=t.placeholder;submit.textContent=t.send;privacy.textContent="🔒 "+t.privacy;caption.textContent=t.caption;
    examples.replaceChildren();
    t.suggestions.forEach(s=>{const b=document.createElement("button");b.type="button";b.textContent=s;b.addEventListener("click",()=>{input.value=s;recommend(s);});examples.append(b);});
  }
  function setOpen(open){panel.hidden=!open;trigger.setAttribute("aria-expanded",String(open));if(open){lastFocus=document.activeElement;refresh();input.focus();}else if(lastFocus&&typeof lastFocus.focus==="function"){lastFocus.focus();}}
  trigger.addEventListener("click",()=>setOpen(panel.hidden));dismiss.addEventListener("click",()=>setOpen(false));
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!panel.hidden)setOpen(false);});
  function recommend(question){
    const t=copy();const keys=Object.keys(routes).filter(k=>routes[k].rx.test(question));
    // Explicit PDF <-> Word requests take priority over generic conversion language.
    const key=keys.find(k=>k==="pdfword"||k==="wordpdf")||keys.find(k=>k==="split")||keys.find(k=>k==="merge")||keys.find(k=>k==="sign")||keys.find(k=>k==="edit")||keys.find(k=>k==="compress")||keys.find(k=>k==="jpg")||keys[0];
    feedback.replaceChildren();
    if(!key){const p=document.createElement("p");p.textContent=t.noMatch;feedback.append(p);return;}
    const info=routes[key],name=document.createElement("strong"),p=document.createElement("p");name.textContent=t.label+": "+t[key];p.textContent=info.live?t.notice:t.soon;feedback.append(name,p);
    if(info.live){const a=document.createElement("a");const workflow=key==="sign" || (key==="split" && /delete|remove|supprim|retir|حذف|احذف/i.test(question)) || (key==="edit" && /date|today|aujourd|تاريخ|اليوم/i.test(question));a.href=workflow?"/ai/?lang="+encodeURIComponent(lang())+"&request="+encodeURIComponent(question.slice(0,450)):info.href+(info.href.includes("#")?"":"?lang="+encodeURIComponent(lang()));a.className="jpi-ai-route";a.textContent=t.route+" →";feedback.append(a);}
  }
  form.addEventListener("submit",e=>{e.preventDefault();recommend(input.value.trim().slice(0,500));});
  document.addEventListener("justpdfit-language",refresh);
  new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
  refresh();
})();
