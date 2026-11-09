/* JustPDFIt localization. Static, privacy-preserving, and shared by all pages. */
(() => {
"use strict";
// Bundle country flags alongside our localization code so the menu works without external image services.
const FLAG_ASSET_BASE = new URL("./flags/", document.currentScript?.src || document.querySelector('script[src$="i18n.js"]')?.src || document.baseURI);
const LANGUAGES = [
 ["en","🇬🇧","English","English"],
 ["fr","🇫🇷","Français","French"],
 ["es","🇪🇸","Español","Spanish"],
 ["ar","🇸🇦","العربية","Arabic"],
 ["de","🇩🇪","Deutsch","German"],
 ["it","🇮🇹","Italiano","Italian"],
 ["pt","🇵🇹","Português","Portuguese"],
 ["nl","🇳🇱","Nederlands","Dutch"],
 ["ru","🇷🇺","Русский","Russian"],
 ["pl","🇵🇱","Polski","Polish"],
 ["tr","🇹🇷","Türkçe","Turkish"],
 ["zh","🇨🇳","简体中文","Chinese (Simplified)"],
 ["ja","🇯🇵","日本語","Japanese"],
 ["ko","🇰🇷","한국어","Korean"],
 ["hi","🇮🇳","हिन्दी","Hindi"],
 ["ur","🇵🇰","اردو","Urdu"],
 ["fa","🇮🇷","فارسی","Persian"],
 ["id","🇮🇩","Bahasa Indonesia","Indonesian"],
 ["vi","🇻🇳","Tiếng Việt","Vietnamese"],
 ["th","🇹🇭","ไทย","Thai"],
 ["ms","🇲🇾","Bahasa Melayu","Malay"],
 ["fil","🇵🇭","Filipino","Filipino"],
 ["sv","🇸🇪","Svenska","Swedish"],
 ["el","🇬🇷","Ελληνικά","Greek"],
 ["ro","🇷🇴","Română","Romanian"],
 ["bn","🇧🇩","বাংলা","Bengali"],
 ["sw","🇰🇪","Kiswahili","Swahili"]
].map(([code,flag,native,english])=>({
 code,flag,native,english,
 country:[...flag].map(part=>String.fromCharCode(part.codePointAt(0)-0x1F1E6+65)).join("").toLowerCase(),
 rtl:["ar","fa","ur"].includes(code)
}));
const ALLOWED=new Map(LANGUAGES.map(lang=>[lang.code,lang]));
const TEXT=window.JustPDFItPacks||{en:{}};
let base={};
let current="en", button, menu, menuTitle, search, entries;
const tools={
 "pdf-to-word":{desc:"descPdfWord",action:"comingSoon"},
 "jpg-to-pdf":{desc:"descJpg",action:"submitJpg"},
 "word-to-pdf":{desc:"descWordPdf",action:"comingSoon"},
 "compress-pdf":{desc:"descCompress",action:"comingSoon"},
 "merge-pdf":{desc:"descMerge",action:"submitMerge"},
 "edit-pdf":{desc:"descEdit",action:"submitEdit"},
 "split-pdf":{desc:"descSplit",action:"submitSplit"}
};
const synonyms={
  eyebrow:"toolsTitle",yourWorkspace:"toolsTitle",privacyTag:"privacyTitle",
  noUpload:"local",noWatermark:"benefitNoWatermark",processNote:"local",
  libraryKicker:"libraryTitle",
  skip:"openWorkbench",openWorkbench:"workTitle",types:"types",
  toolsAll:"toolsTitle",freeTool:"free",comingSoon:"toolSoon",
  benefitNoWatermark:"benefitNoWatermark",benefitSimple:"simpleTitle",
  benefitLocal:"local",otherTools:"toolsTitle",otherToolsText:"toolsIntro",
  privacyLimits:"privacyTitle",privacyLimitsDetail:"privacyDetail",
  exploreTools:"toolsTitle",returnHome:"home",
  toolAction:"workTitle",chooseFilesPdf:"chooseFiles",downloadResult:"download",
  submitJpg:"convert",submitMerge:"convert",submitSplit:"convert",submitEdit:"convert",
  toolWait:"processing",toolReadyMsg:"success",tryTools:"toolReady",
  step1:"chooseFiles",step2:"convert",step3:"download",
  localNote:"local",faqAPrivate:"privacyDetail",faqACost:"free",
  editPlaceholder:"editText",errorSingle:"errorFiles",errorTwo:"errorFiles",
  errorLongText:"errorText",errorNoPages:"errorRange",errorManyPages:"errorRange"
};
function canonical(value) {
 if(!value)return"";
 const v=String(value).trim().replace(/_/g,"-").toLowerCase();
 if(ALLOWED.has(v))return v;
 if(v==="zh-cn"||v==="zh-sg"||v==="zh-hans"||v.startsWith("zh-"))return"zh";
 if(v.startsWith("pt-"))return"pt";
 if(v.startsWith("fil-")||v==="tl"||v.startsWith("tl-"))return"fil";
 const short=v.split("-")[0];
 return ALLOWED.has(short)?short:"";
}
function getInitial(){
 try { const url=new URL(location.href);const fromURL=canonical(url.searchParams.get("lang"));if(fromURL)return fromURL; } catch {}
 try {const saved=canonical(localStorage.getItem("justpdfit-language")||localStorage.getItem("pdf-everything-lang"));if(saved)return saved;}catch{}
 const choices=navigator.languages||[navigator.language||"en"];
 for(const choice of choices){const code=canonical(choice);if(code)return code;}
 return"en";
}
current=getInitial();
function t(key){
 if(key==="types")return "PDF · JPG · PNG · HEIC · TIFF · BMP · GIF · TXT · MD · CSV · JSON";
 const chain=[key];let next=key;
 for(let i=0;i<4;i++){next=synonyms[next];if(!next||chain.includes(next))break;chain.push(next);}
 const localized=TEXT[current]||{}, english=TEXT.en||{};
 for(const k of chain)if(localized[k])return localized[k];
 for(const k of chain)if(base[current]?.[k])return base[current][k];
 for(const k of chain)if(english[k])return english[k];
 for(const k of chain)if(base.en?.[k])return base.en[k];
 return key;
}
function write(selector,key,root=document){
 const elements=root.querySelectorAll(selector);
 for(const el of elements)el.textContent=t(key);
}
function writeFirst(selector,key,root=document){
 const el=root.querySelector(selector);if(el)el.textContent=t(key);
}
function translateHome(){
 for(const el of document.querySelectorAll("[data-i18n]")){
  const key=el.dataset.i18n;
  if(key==="headline")el.innerHTML=escapeHTML(t(key)).replace(/\n/g,"<br>");
  else el.textContent=t(key);
 }
 writeFirst(".seo-tools .section-kicker","toolsTitle");
 writeFirst(".seo-tools #tools-title","toolsTitle");
 writeFirst(".seo-tools .section-header p","toolsIntro");
 const cards=document.querySelectorAll(".seo-tool-card");
 const ids=["pdf-to-word","jpg-to-pdf","word-to-pdf","compress-pdf","merge-pdf","edit-pdf","split-pdf"];
 cards.forEach((card,index)=>{
  const meta=tools[ids[index]];if(!meta)return;
  writeFirst("p",meta.desc,card);
  writeFirst(".tool-badge",meta.action==="comingSoon"?"toolSoon":"toolReady",card);
 });
 const drop=document.getElementById("dropzone");if(drop)drop.setAttribute("aria-label",t("addFiles"));
 const iframe=document.getElementById("pdfPreview");if(iframe)iframe.title=t("result");
}
function escapeHTML(str){return String(str).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
function replaceFaq(){
 const block=document.querySelector(".tool-faq");if(!block)return;
 block.replaceChildren();
 const h=document.createElement("h2");h.textContent=t("faq");block.appendChild(h);
 for(const [q,a] of [["faqQPrivate","faqAPrivate"],["faqQCost","faqACost"]]){
  const details=document.createElement("details");
  const summary=document.createElement("summary");summary.textContent=t(q);
  const p=document.createElement("p");p.textContent=t(a);
  details.append(summary,p);block.appendChild(details);
 }
}
function translateTool(){
 const id=document.body.dataset.tool,info=tools[id];if(!info)return;
 write(".skip","openWorkbench");
 writeFirst(".tools-toplink","toolsAll");
 writeFirst(".breadcrumb a","home");
 writeFirst(".tool-badge",info.action==="comingSoon"?"comingSoon":"freeTool");
 writeFirst(".tool-hero p",info.desc);
 writeFirst(".tool-nav a[href='../']","home");
 const nav=document.querySelector(".tool-nav");if(nav)nav.setAttribute("aria-label",t("toolsTitle"));
 const brand=document.querySelector(".topbar .brand");if(brand)brand.setAttribute("aria-label","JustPDFIt — "+t("home"));
 writeFirst(".tool-box #action-title",info.action==="comingSoon"?"comingSoon":"toolAction");
 const lead=document.querySelector(".tool-layout > .tool-box > p");
 if(lead)lead.textContent=t(info.action==="comingSoon"?"toolPrepBody":info.desc);
 writeFirst(".tool-notice strong","comingSoon");
 writeFirst(".tool-notice p","toolPrepBody");
 writeFirst(".tool-notice a","tryTools");
 writeFirst(".tool-upload strong","chooseFilesPdf");
 const fname=document.querySelector("#tool-filename");
 if(fname && !document.querySelector("#tool-files")?.files?.length)fname.textContent=t("noneSelected");
 writeFirst("#tool-submit",info.action);
 writeFirst("#tool-download","downloadResult");
 writeFirst(".tool-box small","localNote");
 writeFirst("label[for='edit-page']","editPage");
 writeFirst("label[for='edit-text']","editText");
 const annotation=document.getElementById("edit-text");if(annotation)annotation.placeholder=t("editText");
 const range=document.getElementById("page-range");if(range)range.placeholder=t("pageRange");
 writeFirst("label[for='page-range']","pageRange");
 writeFirst(".tool-aside .tool-box:first-child h3","why");
 const perks=document.querySelectorAll(".tool-aside .tool-box:first-child li");
 ["benefitNoSignup","benefitNoWatermark","benefitSimple","benefitLocal"].forEach((key,i)=>{if(perks[i])perks[i].textContent=t(key)});
 writeFirst(".tool-aside .tool-box:nth-child(2) h3","otherTools");
 writeFirst(".tool-aside .tool-box:nth-child(2) p","otherToolsText");
 writeFirst(".tool-aside .tool-box:nth-child(2) a","openWorkbench");
 const article=document.querySelectorAll(".tool-sections article");
 if(article[0]){
  writeFirst("h2","how",article[0]);
  const steps=article[0].querySelectorAll("li");
  ["step1","step2","step3"].forEach((key,i)=>{if(steps[i])steps[i].textContent=t(key)});
 }
 if(article[1]){writeFirst("h2","privacyLimits",article[1]);writeFirst("p",info.action==="comingSoon"?"toolPrepBody":"privacyDetail",article[1]);}
 replaceFaq();
 writeFirst(".related h2","exploreTools");
 writeFirst(".tool-footer span","footerFree");
 writeFirst(".tool-footer a[href='../#privacy']","privacyLink");
 writeFirst(".tool-footer a[href='../']","returnHome");
}
function translate(){
 document.documentElement.lang=current;
 document.documentElement.dir=ALLOWED.get(current)?.rtl?"rtl":"ltr";
 if(document.body?.classList.contains("tool-page")){
  translateTool();
  const info=tools[document.body.dataset.tool];
  if(info){
   document.title=document.querySelector(".tool-hero h1")?.textContent+" — JustPDFIt";
   const desc=document.querySelector('meta[name="description"]');if(desc)desc.content=t(info.desc);
  }
 }else{
  translateHome();
  document.title="JustPDFIt — "+t("toolsTitle");
  const desc=document.querySelector('meta[name="description"]');if(desc)desc.content=t("subheadline");
 }
 if(button){
  const lang=ALLOWED.get(current);
  updateFlag(button.querySelector(".language-flag"),lang);
  button.querySelector(".language-native").textContent=lang.native;
  button.setAttribute("aria-label",t("language")+" : "+lang.native);
 }
 if(menuTitle)menuTitle.textContent="🌍 "+t("languages");
 if(search){search.placeholder=t("searchLanguage");search.setAttribute("aria-label",t("searchLanguage"));}
 if(entries)for(const el of entries.querySelectorAll("[data-lang]")){
  const selected=el.dataset.lang===current;
  el.classList.toggle("selected",selected);
  el.setAttribute("aria-selected",String(selected));
 }
}
// Render real country flag images. Native emoji remain as a fallback if unavailable.
function updateFlag(element,lang){
 if(!element || !lang)return;
 let img=element.querySelector("img");
 let fallback=element.querySelector(".language-emoji");
 if(!img){img=document.createElement("img");img.className="language-flag-image";img.alt="";img.width=24;img.height=18;img.loading="lazy";img.decoding="async";element.appendChild(img);}
 if(!fallback){fallback=document.createElement("span");fallback.className="language-emoji";fallback.setAttribute("aria-hidden","true");element.appendChild(fallback);}
 fallback.textContent=lang.flag;
 fallback.hidden=true;
 img.hidden=false;
 img.onerror=()=>{img.hidden=true;fallback.hidden=false;};
 img.onload=()=>{img.hidden=false;fallback.hidden=true;};
 img.src=new URL(lang.country+".svg",FLAG_ASSET_BASE).href;
}
function makeFlag(lang){
 const flag=document.createElement("span");flag.className="language-flag";
 flag.setAttribute("aria-hidden","true");updateFlag(flag,lang);return flag;
}
function setLanguage(value,{silent=false}={}){
 const next=canonical(value)||"en";
 if(current!==next)current=next;
 try{localStorage.setItem("justpdfit-language",current);}catch{}
 translate();
 if(!silent)document.dispatchEvent(new CustomEvent("justpdfit-language",{detail:{language:current}}));
 return current;
}
function populateList(filter=""){
 entries.replaceChildren();
 const q=filter.trim().toLocaleLowerCase();
 for(const lang of LANGUAGES){
  const hay=[lang.code,lang.english,lang.native].join(" ").toLocaleLowerCase();
  if(q&&!hay.includes(q))continue;
  const btn=document.createElement("button");btn.type="button";btn.className="language-option";btn.dataset.lang=lang.code;
  btn.setAttribute("role","option");btn.setAttribute("lang",lang.code);btn.setAttribute("aria-selected",String(lang.code===current));
  const flag=makeFlag(lang);
  const name=document.createElement("span");name.className="language-name";name.textContent=lang.native;
  const sub=document.createElement("span");sub.className="language-code";sub.textContent=lang.english;
  btn.append(flag,name,sub);
  btn.addEventListener("click",()=>{setLanguage(lang.code);closeList();button.focus()});
  entries.appendChild(btn);
 }
 if(!entries.children.length){
  const empty=document.createElement("p");empty.className="language-no-results";empty.textContent=t("noLanguage");entries.appendChild(empty);
 }
}
function closeList(){
 if(!menu)return;
 menu.hidden=true;button.setAttribute("aria-expanded","false");
}
function openList(){
 menu.hidden=false;button.setAttribute("aria-expanded","true");
 search.value="";populateList();
 const chosen=entries.querySelector(".selected");if(chosen)chosen.scrollIntoView({block:"nearest"});
 search.focus();
}
function buildSelector(){
 const topbar=document.querySelector(".topbar-inner");if(!topbar)return;
 const old=document.querySelector(".language-label");
 const oldSelect=document.getElementById("language");
 if(old)old.remove();
 if(oldSelect)oldSelect.remove();
 const slot=document.createElement("div");slot.className="language-picker";
 slot.setAttribute("dir","ltr");
 button=document.createElement("button");button.type="button";button.className="language-switcher";button.setAttribute("aria-haspopup","listbox");button.setAttribute("aria-expanded","false");button.setAttribute("aria-label","Choose language");
 const flag=makeFlag(ALLOWED.get(current));
 const native=document.createElement("span");native.className="language-native";native.setAttribute("dir","auto");
 const chevron=document.createElement("span");chevron.className="language-chevron";chevron.setAttribute("aria-hidden","true");chevron.textContent="⌄";
 button.append(flag,native,chevron);
 menu=document.createElement("div");menu.className="language-menu";menu.hidden=true;
 menuTitle=document.createElement("div");menuTitle.className="language-menu-header";menuTitle.textContent="🌍 "+t("languages");
 search=document.createElement("input");search.type="search";search.className="language-search";search.placeholder=t("searchLanguage");search.setAttribute("aria-label",t("searchLanguage"));
 entries=document.createElement("div");entries.className="language-options";entries.setAttribute("role","listbox");entries.setAttribute("aria-label","Available languages");
 menu.append(menuTitle,search,entries);slot.append(button,menu);
 const target=topbar.querySelector(".topbar-actions")||topbar;
 target.appendChild(slot);
 button.addEventListener("click",()=>menu.hidden?openList():closeList());
 search.addEventListener("input",()=>populateList(search.value));
 slot.addEventListener("keydown",e=>{
  if(e.key==="Escape"){e.preventDefault();closeList();button.focus();}
  if(e.key==="ArrowDown"&&menu.hidden){e.preventDefault();openList();}
 });
 document.addEventListener("pointerdown",e=>{if(!slot.contains(e.target))closeList()});
}
function init(){
 buildSelector();
 translate();
}
window.JustPDFItI18n={languages:LANGUAGES,t,setLanguage,getLanguage:()=>current,translate,registerBase:(dict)=>{base=dict||{};translate();}};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();