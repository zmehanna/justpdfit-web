/* Localized trust and FAQ copy for the existing JustPDFit home page.
   Static French HTML remains crawlable without JavaScript. */
(() => {
"use strict";
const section=document.getElementById("pdf-securite");if(!section)return;
const selectors=[
".seo-trust-intro .section-kicker",".seo-trust-intro h2",".seo-trust-intro p",
".seo-trust-card:nth-child(1) h3",".seo-trust-card:nth-child(1) p",
".seo-trust-card:nth-child(2) h3",".seo-trust-card:nth-child(2) p",
".seo-trust-card:nth-child(3) h3",".seo-trust-card:nth-child(3) p",
".seo-trust-clarity",".seo-faq h2",
".seo-faq details:nth-of-type(1) summary",".seo-faq details:nth-of-type(1) p",
".seo-faq details:nth-of-type(2) summary",".seo-faq details:nth-of-type(2) p",
".seo-faq details:nth-of-type(3) summary",".seo-faq details:nth-of-type(3) p",
".seo-faq details:nth-of-type(4) summary",".seo-faq details:nth-of-type(4) p"
];
const nodes=selectors.map(s=>section.querySelector(s)),fr=nodes.map(el=>el?.innerHTML||"");
const en=[
"FREE · PRIVATE · LOCAL PROCESSING",
"Free PDF tools designed for privacy",
"Create PDFs, merge documents, split PDFs, extract pages, convert JPG/PNG and add simple text directly in your browser. Your documents stay on your device when using supported local tools. No account required.",
"🔒 Your documents stay on your device",
"Supported local operations are processed in your browser. Original documents are not sent to a conversion server.",
"✓ Free essential PDF tools",
"Create, merge, split, annotate and convert image files to PDF without a subscription or account.",
"🌍 A multilingual PDF tool",
"Available in 27 interface languages for desktop and mobile. Built by ",
"Transparent pricing: individual signing is free with a clickable JustPDFit.com watermark; removing it is an optional €1.99 choice. Two-person remote signing and selected Office conversions are still being developed. Visual signing is not a qualified electronic signature.",
"Frequently asked questions about our PDF tools",
"Is JustPDFit free?",
"Yes. Creating, merging, splitting, text annotation and JPG/PNG conversion are free without an account. Individual signing is free with a clickable site watermark; optional removal costs €1.99.",
"Are my PDF files uploaded to a server?",
"No for supported local tools: creating, merging, splitting, annotating and individual signing happen in your browser. Sharing a file with another service is a separate, voluntary action.",
"Can I use JustPDFit on my phone?",
"Yes. JustPDFit works in modern mobile browsers, and an iPhone and iPad app is also available.",
"Can I convert PDF to Word or compress a PDF?",
"Editable PDF-to-Word, Word-to-PDF and true PDF compression are still being developed. Only features marked as available can be used."
];
const ar=[
"مجاني · خاص · معالجة محلية",
"أدوات PDF مجانية تحافظ على الخصوصية",
"أنشئ ملفات PDF وادمج المستندات وقسّمها واستخرج الصفحات وحوّل صور JPG وPNG وأضف النصوص مباشرة في متصفحك. تبقى مستنداتك على جهازك عند استخدام الأدوات المحلية المدعومة، دون حاجة إلى حساب.",
"🔒 تبقى مستنداتك على جهازك",
"تُعالج العمليات المحلية المدعومة داخل المتصفح، ولا تُرسل الملفات الأصلية إلى خادم تحويل.",
"✓ أدوات PDF أساسية مجانية",
"أنشئ ملفات PDF وادمجها وقسّمها وأضف النصوص وحوّل الصور دون اشتراك أو حساب.",
"🌍 أداة PDF متعددة اللغات",
"متاحة بواجهة تدعم 27 لغة للحاسوب والهاتف. من تطوير ",
"تسعير واضح: التوقيع الفردي مجاني مع علامة JustPDFit.com قابلة للنقر، وإزالتها خيار إضافي مقابل 1.99 يورو. التوقيع عن بُعد لشخصين وبعض تحويلات Office ما زالت قيد التطوير. التوقيع المرئي ليس توقيعًا إلكترونيًا مؤهلًا.",
"الأسئلة الشائعة حول أدوات PDF",
"هل JustPDFit مجاني؟",
"نعم. إنشاء PDF ودمجه وتقسيمه وإضافة نصوص إليه وتحويل صور JPG وPNG كلها مجانية دون حساب. التوقيع الفردي مجاني مع علامة الموقع، ويمكن إزالتها اختياريًا مقابل 1.99 يورو.",
"هل تُرفع ملفات PDF إلى خادم؟",
"ليس في الأدوات المحلية المدعومة: إنشاء الملفات ودمجها وتقسيمها والتعليق عليها والتوقيع الفردي تتم داخل المتصفح. مشاركة الملف مع خدمة أخرى إجراء منفصل تختاره بنفسك.",
"هل يعمل JustPDFit على الهاتف؟",
"نعم، يعمل JustPDFit في المتصفحات الحديثة على الهواتف، ويتوفر أيضًا تطبيق لأجهزة iPhone وiPad.",
"هل يمكن تحويل PDF إلى Word أو ضغط PDF؟",
"تحويل PDF إلى Word قابل للتحرير وWord إلى PDF وضغط PDF الحقيقي ما تزال قيد التطوير. لا تتوفر إلا الأدوات المشار إليها بأنها جاهزة."
];
function render(){
const raw=window.JustPDFItI18n?.getLanguage?.()||document.documentElement.lang||"fr";
const lang=raw.split("-")[0];
const data=lang==="fr"?null:lang==="ar"?ar:en;
nodes.forEach((el,i)=>{
 if(!el)return;
 if(!data){el.innerHTML=fr[i];return;}
 el.textContent=data[i];
 if(i===8){const a=document.createElement("a");a.href="https://kl-mehanna.com/";a.target="_blank";a.rel="noopener noreferrer";a.textContent="KL-MEHANNA LLC";el.appendChild(a);}
});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render);else render();
document.addEventListener("justpdfit-language",render);
new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
})();
