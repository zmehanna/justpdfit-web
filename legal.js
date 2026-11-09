/* JustPDFit public pages: 27 languages matching the iOS app and website. */
(() => {
"use strict";
const CATALOG=[
["en","🇬🇧","English","English","gb"],["fr","🇫🇷","Français","French","fr"],
["es","🇪🇸","Español","Spanish","es"],["ar","🇸🇦","العربية","Arabic","sa"],
["de","🇩🇪","Deutsch","German","de"],["it","🇮🇹","Italiano","Italian","it"],
["pt","🇵🇹","Português","Portuguese","pt"],["nl","🇳🇱","Nederlands","Dutch","nl"],
["ru","🇷🇺","Русский","Russian","ru"],["pl","🇵🇱","Polski","Polish","pl"],
["tr","🇹🇷","Türkçe","Turkish","tr"],["zh","🇨🇳","简体中文","Chinese (Simplified)","cn"],
["ja","🇯🇵","日本語","Japanese","jp"],["ko","🇰🇷","한국어","Korean","kr"],
["hi","🇮🇳","हिन्दी","Hindi","in"],["ur","🇵🇰","اردو","Urdu","pk"],
["fa","🇮🇷","فارسی","Persian","ir"],["id","🇮🇩","Bahasa Indonesia","Indonesian","id"],
["vi","🇻🇳","Tiếng Việt","Vietnamese","vn"],["th","🇹🇭","ไทย","Thai","th"],
["ms","🇲🇾","Bahasa Melayu","Malay","my"],["fil","🇵🇭","Filipino","Filipino","ph"],
["sv","🇸🇪","Svenska","Swedish","se"],["el","🇬🇷","Ελληνικά","Greek","gr"],
["ro","🇷🇴","Română","Romanian","ro"],["bn","🇧🇩","বাংলা","Bengali","bd"],
["sw","🇰🇪","Kiswahili","Swahili","ke"]
].map(([code,flag,native,english,country])=>({code,flag,native,english,country,rtl:["ar","fa","ur"].includes(code)}));
const catalog=new Map(CATALOG.map(l=>[l.code,l]));
const staticPacks={
 en:{nav:["PDF tools","Privacy Policy","Support","Free. Private. No watermark.","Choose language","Search languages…"],pTitle:"Privacy Policy",sTitle:"Help & Support"},
 fr:{nav:["Outils PDF","Confidentialité","Assistance","Gratuit. Privé. Sans filigrane.","Choisir la langue","Rechercher une langue…"],pTitle:"Politique de confidentialité",sTitle:"Aide et assistance"}
};
const isPrivacy=/\/privacy(?:\/|\/index\.html)?$/.test(location.pathname);
const hero=document.querySelector(".legal-hero-inner"),article=document.querySelector(".legal-card");
const otherHero=document.createElement("div"),otherArticle=document.createElement("div");
otherHero.dataset.legalLanguage="custom";otherArticle.dataset.legalLanguage="custom";
otherHero.hidden=otherArticle.hidden=true;hero.append(otherHero);article.append(otherArticle);
const cache=new Map();let current="en",version=0,trigger,menu,search,options;
const ocrAvailability={
  "es": "El reconocimiento óptico de texto (OCR) todavía no está disponible.",
  "ar": "التعرّف الضوئي على النصوص (OCR) غير متاح في هذه النسخة.",
  "de": "Die optische Texterkennung (OCR) ist noch nicht verfügbar.",
  "it": "Il riconoscimento ottico del testo (OCR) non è ancora disponibile.",
  "pt": "O reconhecimento óptico de texto (OCR) ainda não está disponível.",
  "nl": "Optische tekstherkenning (OCR) is nog niet beschikbaar.",
  "ru": "Оптическое распознавание текста (OCR) пока не поддерживается.",
  "pl": "Rozpoznawanie tekstu OCR nie jest jeszcze dostępne.",
  "tr": "Optik karakter tanıma (OCR) henüz desteklenmiyor.",
  "zh": "光学字符识别（OCR）功能目前尚未提供。",
  "ja": "文字の光学認識（OCR）にはまだ対応していません。",
  "ko": "광학 문자 인식(OCR)은 아직 지원하지 않습니다.",
  "hi": "ऑप्टिकल कैरेक्टर रिकग्निशन (OCR) अभी उपलब्ध नहीं है।",
  "ur": "متن کی خودکار شناخت (OCR) فی الحال دستیاب نہیں ہے۔",
  "fa": "تشخیص نوری نویسه‌ها (OCR) هنوز پشتیبانی نمی‌شود.",
  "id": "Pengenalan teks optik (OCR) belum tersedia.",
  "vi": "Tính năng nhận dạng ký tự quang học (OCR) hiện chưa khả dụng.",
  "th": "ยังไม่รองรับการรู้จำข้อความด้วยเทคโนโลยี OCR",
  "ms": "Pengecaman teks optik (OCR) belum tersedia.",
  "fil": "Hindi pa sinusuportahan ang optical character recognition (OCR).",
  "sv": "Optisk teckenigenkänning (OCR) stöds inte ännu.",
  "el": "Η οπτική αναγνώριση κειμένου (OCR) δεν υποστηρίζεται ακόμη.",
  "ro": "Recunoașterea optică a textului (OCR) nu este încă disponibilă.",
  "bn": "অপটিক্যাল ক্যারেক্টার রিকগনিশন (OCR) এখনো উপলব্ধ নয়।",
  "sw": "Utambuzi wa maandishi kwa picha (OCR) bado haupatikani."
};
function normal(raw){
 const value=String(raw||"").trim().toLowerCase().replace(/_/g,"-");
 if(value==="tl"||value.startsWith("tl-"))return "fil";
 const base=value.split("-")[0];return catalog.has(base)?base:"";
}
function initial(){
 try{const q=normal(new URL(location.href).searchParams.get("lang"));if(q)return q}catch{}
 try{const s=normal(localStorage.getItem("justpdfit-language")||localStorage.getItem("pdf-everything-lang"));if(s)return s}catch{}
 for(const raw of navigator.languages||[navigator.language||"en"]){const s=normal(raw);if(s)return s}
 return "en";
}
function element(tag,content,cls){
 const node=document.createElement(tag);
 if(content!==undefined&&content!==null)node.textContent=content;
 if(cls)node.className=cls;
 return node;
}
function link(txt,url,cls){
 const node=element("a",txt,cls);node.href=url;
 if(url.startsWith("https://kl-mehanna.com/")){node.target="_blank";node.rel="noopener noreferrer"}
 return node;
}
function renderPrivacy(pack){
 otherHero.replaceChildren(element("div","JUSTPDFIT · "+pack.pTitle,"legal-kicker"),element("h1",pack.pTitle),element("p",pack.pIntro));
 const frag=document.createDocumentFragment();
 frag.append(element("div",pack.updated+" · iOS / Web","legal-stamp"));
 for(let i=0;i<pack.p.length;i+=2)frag.append(element("h2",(i/2+1)+". "+pack.p[i]),element("p",pack.p[i+1]));
 const box=element("div",null,"legal-contact");
 box.append(element("h3",pack.pContact[0]),element("p",pack.pContact[1]),link(pack.pContact[2],"https://kl-mehanna.com/#contact","legal-primary"));
 frag.append(box,element("p",null,"legal-operator-link"));
 const tail=frag.lastChild;tail.append(link("KL-MEHANNA LLC · "+pack.nav[1],"https://kl-mehanna.com/privacy/"));
 otherArticle.replaceChildren(frag);
}
function renderSupport(pack,code){
 otherHero.replaceChildren(element("div","JUSTPDFIT · "+pack.sTitle,"legal-kicker"),element("h1",pack.sTitle),element("p",pack.sIntro));
 const frag=document.createDocumentFragment(),box=element("div",null,"legal-contact");
 box.append(element("h2",pack.sContact[0]),element("p",pack.sContact[1]),link(pack.sContact[2],"https://kl-mehanna.com/#contact","legal-primary"));
 frag.append(box,element("h2",pack.faqTitle));
 for(let i=0;i<pack.faq.length;i+=2){
  const faqText=i===2?pack.faq[i+1]+" "+(ocrAvailability[code]||""):pack.faq[i+1];
  const d=element("details",null,"legal-faq");d.append(element("summary",pack.faq[i]),element("p",faqText));frag.append(d)
 }
 const note=element("div",null,"legal-note");note.append(element("p",pack.sNote),link(pack.nav[1],"../privacy/"));
 frag.append(note,element("h2",pack.sAboutTitle),element("p",pack.sAbout));otherArticle.replaceChildren(frag);
}
function applyNavigation(pack){
 const header=document.querySelectorAll(".legal-top-actions>a");
 if(header[0])header[0].textContent=pack.nav[0];
 if(header[1])header[1].textContent=isPrivacy?pack.nav[2]:pack.nav[1];
 const bottom=document.querySelectorAll(".legal-bottom-nav a");
 if(bottom[0])bottom[0].textContent=pack.nav[0];
 if(bottom[1])bottom[1].textContent=isPrivacy?pack.nav[2]:pack.nav[1];
 const footer=document.querySelectorAll(".legal-footer .footer-links>a");
 if(footer[0])footer[0].textContent=pack.nav[1];
 if(footer[1])footer[1].textContent=pack.nav[2];
 const tagline=document.querySelector(".legal-footer .footer-inner>span:last-child");
 if(tagline)tagline.textContent=pack.nav[3];
 search.placeholder=pack.nav[5];search.setAttribute("aria-label",pack.nav[5]);
 menu.querySelector(".language-menu-header").textContent="🌍 "+pack.nav[4];
}
async function packFor(code){
 if(staticPacks[code])return staticPacks[code];
 if(cache.has(code))return cache.get(code);
 const result=await fetch("../legal-locales/"+encodeURIComponent(code)+".json",{cache:"force-cache"});
 if(!result.ok)throw new Error("Missing translation "+code);
 const pack=await result.json();
 if(!Array.isArray(pack.nav)||pack.nav.length!==6||!Array.isArray(pack.p)||pack.p.length!==14||!Array.isArray(pack.faq)||pack.faq.length!==12||
 !Array.isArray(pack.pContact)||pack.pContact.length!==3||!Array.isArray(pack.sContact)||pack.sContact.length!==3)throw new Error("Incomplete translation "+code);
 cache.set(code,pack);return pack;
}
function flag(lang){
 const box=element("span",null,"language-flag");box.setAttribute("aria-hidden","true");
 const image=element("img",null,"language-flag-image");
 image.src="../flags/"+lang.country+".svg";image.width=24;image.height=18;image.alt="";image.loading="lazy";
 const emoji=element("span",lang.flag,"language-emoji");emoji.hidden=true;
 image.onerror=()=>{image.hidden=true;emoji.hidden=false};box.append(image,emoji);return box;
}
function populate(q=""){
 options.replaceChildren();const needle=q.trim().toLocaleLowerCase();
 for(const lang of CATALOG){
  if(needle&&![lang.native,lang.english,lang.code].join(" ").toLocaleLowerCase().includes(needle))continue;
  const b=element("button",null,"language-option"+(lang.code===current?" selected":""));
  b.type="button";b.setAttribute("role","option");b.lang=lang.code;
  b.setAttribute("aria-selected",String(lang.code===current));
  b.append(flag(lang),element("span",lang.native,"language-name"),element("span",lang.english,"language-code"));
  b.addEventListener("click",()=>{close();activate(lang.code,true);trigger.focus()});options.append(b)
 }
 if(!options.children.length)options.append(element("p","No results","language-no-results"));
}
function close(){menu.hidden=true;trigger.setAttribute("aria-expanded","false")}
function makePicker(){
 const slot=document.getElementById("legal-language-slot");slot.className="language-picker";slot.dir="ltr";
 trigger=element("button",null,"language-switcher");trigger.type="button";trigger.setAttribute("aria-expanded","false");trigger.setAttribute("aria-haspopup","listbox");
 trigger.setAttribute("aria-label","Choose language");
 menu=element("div",null,"language-menu");menu.hidden=true;
 search=element("input",null,"language-search");search.type="search";search.placeholder="Search languages…";
 options=element("div",null,"language-options");options.setAttribute("role","listbox");options.setAttribute("aria-label","Languages");
 menu.append(element("div","🌍 Choose language","language-menu-header"),search,options);slot.append(trigger,menu);
 trigger.addEventListener("click",()=>{
  if(!menu.hidden){close();return}
  menu.hidden=false;trigger.setAttribute("aria-expanded","true");search.value="";populate();search.focus()
 });
 search.addEventListener("input",()=>populate(search.value));
 slot.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&!menu.hidden){event.preventDefault();close();trigger.focus()}
  if(event.key==="ArrowDown"&&menu.hidden){event.preventDefault();trigger.click()}
 });
 document.addEventListener("pointerdown",event=>{if(!slot.contains(event.target)&&!menu.hidden)close()});
}
async function activate(value,persist=false){
 const code=normal(value)||"en",seq=++version;
 let pack;
 try{pack=await packFor(code)}catch(error){
  console.warn("JustPDFit legal localization",error);
  if(seq===version)return activate("en");
  return;
 }
 if(seq!==version)return;
 current=code;
 if(code!=="en"&&code!=="fr"){if(isPrivacy)renderPrivacy(pack);else renderSupport(pack,code)}
 const visible=code==="en"||code==="fr"?code:"custom";
 document.querySelectorAll("[data-legal-language]").forEach(e=>{e.hidden=e.dataset.legalLanguage!==visible});
 document.documentElement.lang=code;document.documentElement.dir=catalog.get(code).rtl?"rtl":"ltr";
 document.title=(isPrivacy?pack.pTitle:pack.sTitle)+" | JustPDFit";
 const meta=document.querySelector('meta[name="description"]');
 if(meta&&code!=="en"&&code!=="fr")meta.content=isPrivacy?pack.pIntro:pack.sIntro;
 applyNavigation(pack);
 const native=element("span",catalog.get(code).native,"language-native");
 trigger.replaceChildren(flag(catalog.get(code)),native,element("span","⌄","language-chevron"));
 populate();
 if(persist){
  try{localStorage.setItem("justpdfit-language",code)}catch{}
  try{const url=new URL(location.href);url.searchParams.set("lang",code);history.replaceState(null,"",url.pathname+url.search+url.hash)}catch{}
 }
}
makePicker();activate(initial());
})();