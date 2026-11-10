/* Shared completion dialog for JustPDFit web tools. */
(() => {
"use strict";
const translations={
fr:{title:"Votre PDF est prêt !",subtitle:"Votre document a été créé avec succès.",name:"Nom du fichier",rename:"Renommer",save:"Enregistrer le nom",download:"Télécharger",share:"Partager",open:"Ouvrir le PDF",close:"Terminer",invalid:"Veuillez saisir un nom de fichier valide.",saved:"Nom mis à jour"},
en:{title:"Your PDF is ready!",subtitle:"Your document was created successfully.",name:"File name",rename:"Rename",save:"Save name",download:"Download",share:"Share",open:"Open PDF",close:"Done",invalid:"Enter a valid file name.",saved:"File name updated"},
ar:{title:"ملف PDF جاهز!",subtitle:"تم إنشاء المستند بنجاح.",name:"اسم الملف",rename:"إعادة التسمية",save:"حفظ الاسم",download:"تنزيل",share:"مشاركة",open:"فتح PDF",close:"تم",invalid:"أدخل اسم ملف صالحًا.",saved:"تم تحديث اسم الملف"}};
Object.assign(translations,window.JustPDFItConfirmLocales||{});
const lang=()=>{const raw=window.JustPDFItI18n?.getLanguage?.()||document.documentElement.lang||navigator.language||"en";const l=String(raw).toLowerCase().replace("_","-").split("-")[0];return translations[l]?l:"en"};
const extraLabels={"es":["Renombrar","Abrir PDF","Listo","Introduce un nombre de archivo válido.","Nombre actualizado"],"de":["Umbenennen","PDF öffnen","Fertig","Bitte einen gültigen Dateinamen eingeben.","Dateiname aktualisiert"],"it":["Rinomina","Apri PDF","Fine","Inserisci un nome file valido.","Nome file aggiornato"],"pt":["Renomear","Abrir PDF","Concluir","Digite um nome de arquivo válido.","Nome do arquivo atualizado"],"nl":["Hernoemen","PDF openen","Gereed","Voer een geldige bestandsnaam in.","Bestandsnaam bijgewerkt"],"ru":["Переименовать","Открыть PDF","Готово","Введите допустимое имя файла.","Имя файла обновлено"],"pl":["Zmień nazwę","Otwórz PDF","Gotowe","Wpisz prawidłową nazwę pliku.","Nazwa pliku zaktualizowana"],"tr":["Yeniden adlandır","PDF aç","Bitti","Geçerli bir dosya adı girin.","Dosya adı güncellendi"],"zh":["重命名","打开 PDF","完成","请输入有效的文件名。","文件名已更新"],"ja":["名前を変更","PDF を開く","完了","有効なファイル名を入力してください。","ファイル名を更新しました"],"ko":["이름 바꾸기","PDF 열기","완료","올바른 파일 이름을 입력하세요.","파일 이름이 변경되었습니다"],"hi":["नाम बदलें","PDF खोलें","पूरा हुआ","मान्य फ़ाइल नाम दर्ज करें।","फ़ाइल नाम अपडेट हो गया"],"ur":["نام تبدیل کریں","PDF کھولیں","مکمل","درست فائل نام درج کریں۔","فائل کا نام اپ ڈیٹ ہو گیا"],"fa":["تغییر نام","باز کردن PDF","انجام شد","نام فایل معتبر وارد کنید.","نام فایل به‌روزرسانی شد"],"id":["Ubah nama","Buka PDF","Selesai","Masukkan nama berkas yang valid.","Nama berkas diperbarui"],"vi":["Đổi tên","Mở PDF","Hoàn tất","Nhập tên tệp hợp lệ.","Đã cập nhật tên tệp"],"th":["เปลี่ยนชื่อ","เปิด PDF","เสร็จสิ้น","กรุณากรอกชื่อไฟล์ที่ถูกต้อง","อัปเดตชื่อไฟล์แล้ว"],"ms":["Namakan semula","Buka PDF","Selesai","Masukkan nama fail yang sah.","Nama fail dikemas kini"],"fil":["Palitan ang pangalan","Buksan ang PDF","Tapos","Maglagay ng wastong pangalan ng file.","Na-update ang pangalan ng file"],"sv":["Byt namn","Öppna PDF","Klar","Ange ett giltigt filnamn.","Filnamnet uppdaterades"],"el":["Μετονομασία","Άνοιγμα PDF","Τέλος","Πληκτρολογήστε έγκυρο όνομα αρχείου.","Το όνομα αρχείου ενημερώθηκε"],"ro":["Redenumește","Deschide PDF","Gata","Introdu un nume de fișier valid.","Numele fișierului a fost actualizat"],"bn":["নাম পরিবর্তন","PDF খুলুন","সম্পন্ন","একটি সঠিক ফাইলের নাম লিখুন।","ফাইলের নাম হালনাগাদ হয়েছে"],"sw":["Badilisha jina","Fungua PDF","Imekamilika","Weka jina sahihi la faili.","Jina la faili limesasishwa"]};
for(const [code,fields] of Object.entries(extraLabels)){
 const core=window.JustPDFItPacks?.[code]||{};
 const trim=(v)=>String(v||"").replace(/^[↓↗]\s*/u,"");
 translations[code]={
  title:core.success||"Your PDF is ready!",
  subtitle:core.readyDescription||"Your document was created successfully.",
  name:core.file||"File name",
  rename:fields[0],save:core.save||"Save",download:trim(core.download)||"Download",share:trim(core.share)||"Share",
  open:fields[1],close:fields[2],invalid:fields[3],saved:fields[4]
 };
}
const safeName=v=>{const s=v.trim().replace(/[\\/:*?"<>|\x00-\x1f]/g,"").replace(/\.+$/,"").trim();return s?s.replace(/\.pdf$/i,"")+".pdf":""};
let active=null;
function open({blob,name,onRename}){
 if(!blob)return;
 active?.cleanup();
 const l=lang(),t=translations[l],url=URL.createObjectURL(blob);
 const overlay=document.createElement("div");overlay.className="jpi-confirm-overlay";overlay.setAttribute("role","presentation");
 overlay.innerHTML='<section class="jpi-confirm" role="dialog" aria-modal="true" aria-labelledby="jpi-confirm-title"><button class="jpi-confirm-x" type="button" data-act="close" aria-label="Close">×</button><div class="jpi-confirm-symbol" aria-hidden="true">✓</div><div class="jpi-confirm-kicker">JUST<span>PDF</span>it</div><h2 id="jpi-confirm-title"></h2><p class="jpi-confirm-subtitle"></p><div class="jpi-confirm-file"><span class="jpi-confirm-pdf">PDF</span><div class="jpi-confirm-filetext"><strong class="jpi-confirm-filename"></strong><small class="jpi-confirm-size"></small></div><button type="button" class="jpi-confirm-rename" data-act="edit"></button></div><form class="jpi-confirm-edit" hidden><label for="jpi-confirm-input"></label><input id="jpi-confirm-input" maxlength="180" autocomplete="off"><button type="submit"></button><p class="jpi-confirm-error" role="alert"></p></form><div class="jpi-confirm-actions"><button type="button" class="jpi-confirm-primary" data-act="download"></button><button type="button" class="jpi-confirm-secondary" data-act="share"></button></div><div class="jpi-confirm-bottom"><button type="button" data-act="open"></button><button type="button" data-act="close"></button></div></section>';
 const el=s=>overlay.querySelector(s);
 let filename=safeName(name)||"JustPDFit.pdf";
 el("h2").textContent=t.title;el(".jpi-confirm-subtitle").textContent=t.subtitle;el(".jpi-confirm-x").setAttribute("aria-label",t.close);
 el(".jpi-confirm-size").textContent=(blob.size/1024/1024>=1?(blob.size/1024/1024).toFixed(2)+" MB":Math.max(1,Math.round(blob.size/1024))+" KB");
 el(".jpi-confirm-rename").textContent=t.rename;el(".jpi-confirm-edit label").textContent=t.name;
 el(".jpi-confirm-edit button").textContent=t.save;
 for(const k of ["download","share","open","close"])el('[data-act="'+k+'"]:last-of-type')?.setAttribute("data-ready","1");
 el(".jpi-confirm-primary").textContent="↓ "+t.download;el(".jpi-confirm-secondary").textContent="↗ "+t.share;
 el('.jpi-confirm-bottom [data-act="open"]').textContent=t.open;el('.jpi-confirm-bottom [data-act="close"]').textContent=t.close;
 const update=()=>{el(".jpi-confirm-filename").textContent=filename;el("#jpi-confirm-input").value=filename};
 update();overlay.dir=["ar","ur","fa"].includes(l)?"rtl":"ltr";
 const download=()=>{const a=document.createElement("a");a.href=url;a.download=filename;document.body.append(a);a.click();a.remove()};
 const cleanup=()=>{document.removeEventListener("keydown",key);overlay.remove();URL.revokeObjectURL(url);active=null};
 const key=e=>{if(e.key==="Escape")cleanup()};
 document.addEventListener("keydown",key);
 overlay.addEventListener("click",async e=>{
 if(e.target===overlay){cleanup();return}
 const act=e.target.closest("[data-act]")?.dataset.act;
 if(act==="close")cleanup();
 if(act==="edit"){el(".jpi-confirm-edit").hidden=false;el("#jpi-confirm-input").focus();el("#jpi-confirm-input").select()}
 if(act==="download")download();
 if(act==="open")window.open(url,"_blank","noopener");
 if(act==="share"){try{const file=new File([blob],filename,{type:"application/pdf"});if(navigator.canShare?.({files:[file]}))await navigator.share({files:[file],title:filename});else if(navigator.share)await navigator.share({title:filename});else download()}catch(err){if(err.name!=="AbortError")download()}}
 });
 el(".jpi-confirm-edit").addEventListener("submit",async e=>{e.preventDefault();const next=safeName(el("#jpi-confirm-input").value);if(!next){el(".jpi-confirm-error").textContent=t.invalid;return}filename=next;update();el(".jpi-confirm-edit").hidden=true;el(".jpi-confirm-error").textContent="";try{await onRename?.(filename)}catch(err){console.warn("Rename persistence",err)}});
 document.body.append(overlay);active={cleanup};el(".jpi-confirm-primary").focus();
}
window.JustPDFItConfirmation={open};
})();