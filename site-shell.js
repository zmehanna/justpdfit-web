/* Shared navigation, 2026. Loaded on every JustPDFit page. */
(() => {
 "use strict";
 const root = location.pathname === "/" || /\/index\.html$/.test(location.pathname) && location.pathname.split("/").filter(Boolean).length === 1;
 const base = root ? "./" : "../";
 const tools = [
  ["home","⌂","home"],["sign","✍","sign"],["merge-pdf","▣","merge"],["split-pdf","✂","split"],
  ["edit-pdf","✎","edit"],["jpg-to-pdf","▧","jpg"],["pdf-to-word","W","pdfword"],
  ["word-to-pdf","↗","wordpdf"],["compress-pdf","⇣","compress"]
 ];
 const catalog = {
 en:["Home","Sign PDF","Merge PDF","Split PDF","Edit PDF","JPG to PDF","PDF to Word","Word to PDF","Compress PDF","PDF tools","Our company","Our websites","Products & partners","Company","Help & legal","About us","Contact","Privacy","Support","Explore our digital products","Made by KL-MEHANNA LLC","Selected tools are still in development."],
 fr:["Accueil","Signer un PDF","Fusionner PDF","Diviser PDF","Modifier PDF","JPG vers PDF","PDF vers Word","Word vers PDF","Compresser PDF","Outils PDF","Notre société","Nos sites","Produits & partenaires","Entreprise","Aide & mentions","À propos","Contact","Confidentialité","Assistance","Découvrez nos produits numériques","Créé par KL-MEHANNA LLC","Certains outils sont encore en préparation."],
 ar:["الرئيسية","توقيع PDF","دمج PDF","تقسيم PDF","تعديل PDF","JPG إلى PDF","PDF إلى Word","Word إلى PDF","ضغط PDF","أدوات PDF","شركتنا","مواقعنا","المنتجات والشركاء","الشركة","المساعدة والقوانين","من نحن","تواصل معنا","الخصوصية","الدعم","اكتشف منتجاتنا الرقمية","من تطوير KL-MEHANNA LLC","بعض الأدوات لا تزال قيد التطوير."],
 es:["Inicio","Firmar PDF","Unir PDF","Dividir PDF","Editar PDF","JPG a PDF","PDF a Word","Word a PDF","Comprimir PDF","Herramientas PDF","Nuestra empresa","Nuestros sitios","Productos y socios","Empresa","Ayuda y legal","Sobre nosotros","Contacto","Privacidad","Soporte","Explora nuestros productos digitales","Creado por KL-MEHANNA LLC","Algunas herramientas están en desarrollo."],
 de:["Start","PDF signieren","PDF zusammenfügen","PDF teilen","PDF bearbeiten","JPG zu PDF","PDF zu Word","Word zu PDF","PDF komprimieren","PDF-Werkzeuge","Unser Unternehmen","Unsere Websites","Produkte & Partner","Unternehmen","Hilfe & Rechtliches","Über uns","Kontakt","Datenschutz","Support","Unsere digitalen Produkte entdecken","Von KL-MEHANNA LLC entwickelt","Einige Werkzeuge sind noch in Entwicklung."],
 it:["Home","Firma PDF","Unisci PDF","Dividi PDF","Modifica PDF","JPG in PDF","PDF in Word","Word in PDF","Comprimi PDF","Strumenti PDF","La nostra azienda","I nostri siti","Prodotti e partner","Azienda","Aiuto e note legali","Chi siamo","Contatto","Privacy","Supporto","Scopri i nostri prodotti digitali","Creato da KL-MEHANNA LLC","Alcuni strumenti sono in sviluppo."],
 pt:["Início","Assinar PDF","Juntar PDF","Dividir PDF","Editar PDF","JPG para PDF","PDF para Word","Word para PDF","Comprimir PDF","Ferramentas PDF","Nossa empresa","Nossos sites","Produtos e parceiros","Empresa","Ajuda e legal","Sobre nós","Contato","Privacidade","Suporte","Conheça nossos produtos digitais","Criado pela KL-MEHANNA LLC","Algumas ferramentas estão em desenvolvimento."],
 nl:["Start","PDF ondertekenen","PDF samenvoegen","PDF splitsen","PDF bewerken","JPG naar PDF","PDF naar Word","Word naar PDF","PDF comprimeren","PDF-tools","Ons bedrijf","Onze websites","Producten en partners","Bedrijf","Hulp en juridisch","Over ons","Contact","Privacy","Ondersteuning","Ontdek onze digitale producten","Gemaakt door KL-MEHANNA LLC","Sommige tools zijn nog in ontwikkeling."],
 tr:["Ana sayfa","PDF imzala","PDF birleştir","PDF böl","PDF düzenle","JPG'den PDF'ye","PDF'den Word'e","Word'den PDF'ye","PDF sıkıştır","PDF araçları","Şirketimiz","Sitelerimiz","Ürünler ve ortaklar","Şirket","Yardım ve yasal","Hakkımızda","İletişim","Gizlilik","Destek","Dijital ürünlerimizi keşfedin","KL-MEHANNA LLC tarafından","Bazı araçlar geliştirme aşamasında."],
 ru:["Главная","Подписать PDF","Объединить PDF","Разделить PDF","Изменить PDF","JPG в PDF","PDF в Word","Word в PDF","Сжать PDF","PDF-инструменты","Наша компания","Наши сайты","Продукты и партнёры","Компания","Помощь и право","О нас","Контакты","Конфиденциальность","Поддержка","Наши цифровые продукты","От KL-MEHANNA LLC","Некоторые инструменты ещё разрабатываются."],
 zh:["首页","签署 PDF","合并 PDF","拆分 PDF","编辑 PDF","JPG 转 PDF","PDF 转 Word","Word 转 PDF","压缩 PDF","PDF 工具","我们的公司","旗下网站","产品与合作伙伴","公司","帮助与法律","关于我们","联系我们","隐私","支持","探索数字产品","由 KL-MEHANNA LLC 开发","部分工具仍在开发中。"],
 ja:["ホーム","PDF に署名","PDF を結合","PDF を分割","PDF を編集","JPG を PDF に","PDF を Word に","Word を PDF に","PDF を圧縮","PDF ツール","運営会社","関連サイト","製品とパートナー","会社","ヘルプと法務","会社概要","お問い合わせ","プライバシー","サポート","デジタル製品を見る","KL-MEHANNA LLC が開発","一部の機能は開発中です。"],
 ko:["홈","PDF 서명","PDF 병합","PDF 분할","PDF 편집","JPG를 PDF로","PDF를 Word로","Word를 PDF로","PDF 압축","PDF 도구","회사 소개","관련 사이트","제품 및 파트너","회사","도움말 및 법률","회사 소개","문의","개인정보","지원","디지털 제품 살펴보기","KL-MEHANNA LLC 제작","일부 도구는 개발 중입니다."],
 hi:["होम","PDF पर हस्ताक्षर","PDF जोड़ें","PDF विभाजित","PDF संपादित","JPG से PDF","PDF से Word","Word से PDF","PDF संपीड़ित","PDF उपकरण","हमारी कंपनी","हमारी साइटें","उत्पाद और साझेदार","कंपनी","सहायता और कानूनी","हमारे बारे में","संपर्क","गोपनीयता","सहायता","हमारे डिजिटल उत्पाद देखें","KL-MEHANNA LLC द्वारा","कुछ उपकरण अभी विकास में हैं।"],
 ur:["ہوم","PDF پر دستخط","PDF ضم کریں","PDF تقسیم کریں","PDF ترمیم","JPG سے PDF","PDF سے Word","Word سے PDF","PDF کمپریس","PDF ٹولز","ہماری کمپنی","ہماری ویب سائٹس","مصنوعات و شراکت دار","کمپنی","مدد اور قانونی","ہمارے بارے میں","رابطہ","رازداری","مدد","ہماری ڈیجیٹل مصنوعات دیکھیں","KL-MEHANNA LLC کی جانب سے","کچھ ٹولز زیرِ تیاری ہیں۔"],
 fa:["خانه","امضای PDF","ادغام PDF","تقسیم PDF","ویرایش PDF","JPG به PDF","PDF به Word","Word به PDF","فشرده‌سازی PDF","ابزارهای PDF","شرکت ما","وب‌سایت‌های ما","محصولات و شرکا","شرکت","راهنما و قوانین","درباره ما","تماس","حریم خصوصی","پشتیبانی","محصولات دیجیتال ما","ساخته‌شده توسط KL-MEHANNA LLC","برخی ابزارها در حال توسعه‌اند."],
 id:["Beranda","Tanda tangan PDF","Gabung PDF","Pisah PDF","Edit PDF","JPG ke PDF","PDF ke Word","Word ke PDF","Kompres PDF","Alat PDF","Perusahaan kami","Situs kami","Produk & mitra","Perusahaan","Bantuan & hukum","Tentang kami","Kontak","Privasi","Bantuan","Jelajahi produk digital kami","Dibuat oleh KL-MEHANNA LLC","Beberapa alat masih dikembangkan."],
 vi:["Trang chủ","Ký PDF","Ghép PDF","Tách PDF","Sửa PDF","JPG sang PDF","PDF sang Word","Word sang PDF","Nén PDF","Công cụ PDF","Công ty","Các trang web","Sản phẩm & đối tác","Công ty","Trợ giúp & pháp lý","Giới thiệu","Liên hệ","Quyền riêng tư","Hỗ trợ","Khám phá sản phẩm số","Được phát triển bởi KL-MEHANNA LLC","Một số công cụ đang phát triển."],
 th:["หน้าแรก","เซ็น PDF","รวม PDF","แยก PDF","แก้ไข PDF","JPG เป็น PDF","PDF เป็น Word","Word เป็น PDF","บีบอัด PDF","เครื่องมือ PDF","บริษัทของเรา","เว็บไซต์ของเรา","ผลิตภัณฑ์และพันธมิตร","บริษัท","ช่วยเหลือและกฎหมาย","เกี่ยวกับเรา","ติดต่อ","ความเป็นส่วนตัว","สนับสนุน","สำรวจผลิตภัณฑ์ดิจิทัล","สร้างโดย KL-MEHANNA LLC","บางเครื่องมืออยู่ระหว่างพัฒนา"],
 ms:["Utama","Tandatangan PDF","Gabung PDF","Pisah PDF","Edit PDF","JPG ke PDF","PDF ke Word","Word ke PDF","Mampat PDF","Alat PDF","Syarikat kami","Laman kami","Produk & rakan","Syarikat","Bantuan & undang-undang","Tentang kami","Hubungi","Privasi","Sokongan","Terokai produk digital kami","Dibangunkan oleh KL-MEHANNA LLC","Beberapa alat masih dibangunkan."],
 fil:["Home","Pirmahan PDF","Pagsamahin PDF","Hatiin PDF","I-edit PDF","JPG to PDF","PDF to Word","Word to PDF","I-compress PDF","Mga PDF tool","Kumpanya namin","Mga site namin","Produk at partner","Kumpanya","Tulong at legal","Tungkol sa amin","Kontak","Privacy","Suporta","Tingnan ang digital products","Gawa ng KL-MEHANNA LLC","May mga tool na ginagawa pa."],
 sv:["Hem","Signera PDF","Slå ihop PDF","Dela PDF","Redigera PDF","JPG till PDF","PDF till Word","Word till PDF","Komprimera PDF","PDF-verktyg","Vårt företag","Våra webbplatser","Produkter & partners","Företaget","Hjälp & juridik","Om oss","Kontakt","Integritet","Support","Upptäck våra digitala produkter","Skapad av KL-MEHANNA LLC","Vissa verktyg utvecklas fortfarande."],
 el:["Αρχική","Υπογραφή PDF","Συγχώνευση PDF","Διαίρεση PDF","Επεξεργασία PDF","JPG σε PDF","PDF σε Word","Word σε PDF","Συμπίεση PDF","Εργαλεία PDF","Η εταιρεία μας","Οι ιστότοποί μας","Προϊόντα & συνεργάτες","Εταιρεία","Βοήθεια & νομικά","Σχετικά","Επικοινωνία","Απόρρητο","Υποστήριξη","Τα ψηφιακά προϊόντα μας","Από την KL-MEHANNA LLC","Ορισμένα εργαλεία αναπτύσσονται."],
 ro:["Acasă","Semnează PDF","Unește PDF","Împarte PDF","Editează PDF","JPG în PDF","PDF în Word","Word în PDF","Comprimă PDF","Instrumente PDF","Compania noastră","Site-urile noastre","Produse și parteneri","Companie","Ajutor și legal","Despre noi","Contact","Confidențialitate","Asistență","Explorează produsele digitale","Creat de KL-MEHANNA LLC","Unele instrumente sunt în dezvoltare."],
 bn:["হোম","PDF স্বাক্ষর","PDF একত্র","PDF ভাগ","PDF সম্পাদনা","JPG থেকে PDF","PDF থেকে Word","Word থেকে PDF","PDF সংকুচিত","PDF টুল","আমাদের কোম্পানি","আমাদের সাইট","পণ্য ও অংশীদার","কোম্পানি","সহায়তা ও আইন","আমাদের সম্পর্কে","যোগাযোগ","গোপনীয়তা","সহায়তা","আমাদের ডিজিটাল পণ্য দেখুন","KL-MEHANNA LLC দ্বারা","কিছু টুল তৈরি হচ্ছে।"],
 sw:["Nyumbani","Saini PDF","Unganisha PDF","Gawa PDF","Hariri PDF","JPG hadi PDF","PDF hadi Word","Word hadi PDF","Bana PDF","Zana za PDF","Kampuni yetu","Tovuti zetu","Bidhaa na washirika","Kampuni","Msaada na sheria","Kuhusu sisi","Wasiliana","Faragha","Msaada","Gundua bidhaa zetu za kidijitali","Imeundwa na KL-MEHANNA LLC","Baadhi ya zana zinaandaliwa."],
 pl:["Start","Podpisz PDF","Połącz PDF","Podziel PDF","Edytuj PDF","JPG na PDF","PDF na Word","Word na PDF","Kompresuj PDF","Narzędzia PDF","Nasza firma","Nasze strony","Produkty i partnerzy","Firma","Pomoc i prawo","O nas","Kontakt","Prywatność","Pomoc","Poznaj nasze produkty cyfrowe","Od KL-MEHANNA LLC","Niektóre narzędzia są w przygotowaniu."]
 };
 const itemPaths = ["","sign/","merge-pdf/","split-pdf/","edit-pdf/","jpg-to-pdf/","pdf-to-word/","word-to-pdf/","compress-pdf/"];
 const soon = new Set(["pdf-to-word","word-to-pdf","compress-pdf"]);
 function pathFor(i){return base+itemPaths[i]}
 function xlink(label, href, external=false) {
  const a=document.createElement("a");a.textContent=label;a.href=href;
  if(external){a.target="_blank";a.rel="noopener noreferrer"}
  return a;
 }
 function getLanguage() {
  const i18n=window.JustPDFItI18n;
  if(i18n?.getLanguage)return i18n.getLanguage();
  const code=document.documentElement.lang||"";
  return catalog[code]?code:code.split("-")[0]||"en";
 }
 function render(){
  const header=document.querySelector("header.topbar");
  if(!header)return;
  const language=getLanguage();
  const t=catalog[language]||catalog.en;
  const brand=header.querySelector(".brand");
  // Keep the wordmark and company credit in a real stacked block;
  // never rely on wrapping and negative margins (mobile overlaps).
  if(brand && !brand.querySelector(".jpi-brand-text")) {
   const wordmark=brand.querySelector(".brand-wordmark");
   if(wordmark){
    const credit=brand.querySelector(".jpi-powered")||document.createElement("span");
    credit.className="jpi-powered";
    credit.textContent="by KL-MEHANNA";
    const stack=document.createElement("span");
    stack.className="jpi-brand-text";
    wordmark.before(stack);
    stack.append(wordmark,credit);
   }
  }
  let nav=document.querySelector(".jpi-global-nav");
  if(!nav){
   nav=document.createElement("nav");nav.className="jpi-global-nav";nav.setAttribute("aria-label","PDF tools");
   header.insertAdjacentElement("afterend",nav);
  }
  const wrap=document.createElement("div");wrap.className="container jpi-nav-scroll";
  const createLabel={"en":"Create a PDF","fr":"Créer un PDF","ar":"إنشاء PDF","es":"Crear PDF","de":"PDF erstellen","it":"Crea PDF","pt":"Criar PDF","nl":"PDF maken","ru":"Создать PDF","pl":"Utwórz PDF","tr":"PDF oluştur","zh":"创建 PDF","ja":"PDF を作成","ko":"PDF 만들기","hi":"PDF बनाएं","ur":"PDF بنائیں","fa":"ساخت PDF","id":"Buat PDF","vi":"Tạo PDF","th":"สร้าง PDF","ms":"Cipta PDF","fil":"Gumawa ng PDF","sv":"Skapa PDF","el":"Δημιουργία PDF","ro":"Creează PDF","bn":"PDF তৈরি করুন","sw":"Unda PDF"}[language]||"Create PDF";
  const createLink=xlink(createLabel,base+"#workbench");createLink.className="jpi-nav-link jpi-nav-create";
  const createIcon=document.createElement("span");createIcon.className="jpi-nav-icon";createIcon.textContent="✦";createLink.prepend(createIcon);wrap.appendChild(createLink);
  for(let i=0;i<tools.length;i++){
   // The header only advertises working tools. Planned tools stay in
   // the footer with an explicit "coming soon" indicator.
   if(soon.has(tools[i][0]))continue;
   const a=xlink(t[i],pathFor(i));a.className="jpi-nav-link";
   if((i===0 && root)||(i>0 && location.pathname.includes("/"+tools[i][0]+"/")))a.setAttribute("aria-current","page");
   const icon=document.createElement("span");icon.className="jpi-nav-icon";icon.textContent=tools[i][1];icon.setAttribute("aria-hidden","true");a.prepend(icon);
   if(soon.has(tools[i][0])){a.title=t[21];a.classList.add("jpi-nav-soon");}
   wrap.appendChild(a);
  }
  nav.replaceChildren(wrap);nav.setAttribute("aria-label",t[9]);
  const oldFooters=Array.from(document.querySelectorAll("footer")).filter(f=>!f.closest("main"));
  let footer=oldFooters[oldFooters.length-1];
  if(!footer)return;
  footer.className="jpi-site-footer";
  const inner=document.createElement("div");inner.className="container";
  const main=document.createElement("div");main.className="jpi-footer-grid";
  const company=document.createElement("div");company.className="jpi-footer-company";
  const companyLink=xlink("KL-MEHANNA LLC","https://kl-mehanna.com/",true);companyLink.className="jpi-company-title";
  const strap=document.createElement("p");strap.textContent=t[20];
  const motto=document.createElement("p");motto.className="jpi-footer-motto";motto.textContent=t[19];
  const companyCTA=xlink(t[15]+" ↗","https://kl-mehanna.com/company/",true);companyCTA.className="jpi-footer-cta";
  company.append(companyLink,strap,motto,companyCTA);
  function group(title,items){
    const el=document.createElement("div");el.className="jpi-footer-column";
    const h=document.createElement("h2");h.textContent=title;el.appendChild(h);
    for(const [label,href,ext] of items)el.appendChild(xlink(label,href,ext));return el;
  }
  const pdf=group(t[9],[[createLabel,base+"#workbench",false],...tools.map((tool,i)=>[t[i]+(soon.has(tool[0])?" · "+(language==="fr"?"bientôt":language==="ar"?"قريبًا":"soon"):""),pathFor(i),false])]);
  const sites=group(t[11],[
   ["JustPDFit","https://justpdfit.com/",true],
   ["FairTaxy","https://fairtaxy.com/",true],
   ["Wanasna","https://wanasna.com/",true],
   ["Wanasna Games","https://wanasna.com/games/",true],
   ["DOM-EDGE","https://dom-edge.com/",true],
   ["ZyXStream","https://zyxstream.com/",true],
   ["KD Agency","https://kdagency.fr/",true]
  ]);
  const corp=group(t[13],[
   [t[15],"https://kl-mehanna.com/company/",true],
   [t[12],"https://kl-mehanna.com/#products",true],
   [t[16],"https://kl-mehanna.com/#contact",true],
   [t[17],base+"privacy/",false],
   [t[18],base+"support/",false]
  ]);
  main.append(company,pdf,sites,corp);inner.appendChild(main);
  const foot=document.createElement("div");foot.className="jpi-footer-bottom";
  const left=document.createElement("span");left.textContent="© "+new Date().getFullYear()+" KL-MEHANNA LLC · JustPDFit";
  const right=document.createElement("span");right.textContent=t[21];
  foot.append(left,right);inner.appendChild(foot);
  footer.replaceChildren(inner);
 }
 function init(){
  render();
  document.addEventListener("justpdfit-language",render);
  let lastLang=document.documentElement.lang;
  new MutationObserver(()=>{
   if(lastLang!==document.documentElement.lang){lastLang=document.documentElement.lang;render();}
  }).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
 }
 /* Load the optional AI guide after the shared shell, without changing PDF processing. */
 const aiCss=document.createElement("link");aiCss.rel="stylesheet";aiCss.href=base+"ai-guide.css?v=20261113-beta";document.head.appendChild(aiCss);
 const aiScript=document.createElement("script");aiScript.src=base+"ai-guide.js?v=20261113-beta";aiScript.defer=true;document.head.appendChild(aiScript);
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
