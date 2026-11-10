/* Progressive enhancement: the native file input is kept for actual selection and form validation. */
(() => {
  "use strict";
  const languages = {
    fr:["Sélectionner un fichier","Sélectionner des fichiers","Aucun fichier sélectionné","Retirer le fichier"],
    en:["Select a file","Select files","No file selected","Remove file"],
    es:["Seleccionar archivo","Seleccionar archivos","Ningún archivo seleccionado","Quitar archivo"],
    ar:["اختيار ملف","اختيار ملفات","لم يتم اختيار ملف","إزالة الملف"],
    de:["Datei auswählen","Dateien auswählen","Keine Datei ausgewählt","Datei entfernen"],
    it:["Seleziona un file","Seleziona i file","Nessun file selezionato","Rimuovi file"],
    pt:["Selecionar arquivo","Selecionar arquivos","Nenhum arquivo selecionado","Remover arquivo"],
    nl:["Bestand kiezen","Bestanden kiezen","Geen bestand gekozen","Bestand verwijderen"],
    ru:["Выбрать файл","Выбрать файлы","Файл не выбран","Удалить файл"],
    pl:["Wybierz plik","Wybierz pliki","Nie wybrano pliku","Usuń plik"],
    tr:["Dosya seç","Dosyaları seç","Dosya seçilmedi","Dosyayı kaldır"],
    zh:["选择文件","选择文件","未选择文件","移除文件"],
    ja:["ファイルを選択","ファイルを選択","ファイルが選択されていません","ファイルを削除"],
    ko:["파일 선택","파일 선택","선택한 파일 없음","파일 제거"],
    hi:["फ़ाइल चुनें","फ़ाइलें चुनें","कोई फ़ाइल नहीं चुनी गई","फ़ाइल हटाएँ"],
    ur:["فائل منتخب کریں","فائلیں منتخب کریں","کوئی فائل منتخب نہیں","فائل ہٹائیں"],
    fa:["انتخاب فایل","انتخاب فایل‌ها","فایلی انتخاب نشده","حذف فایل"],
    id:["Pilih berkas","Pilih berkas","Belum ada berkas dipilih","Hapus berkas"],
    vi:["Chọn tệp","Chọn các tệp","Chưa chọn tệp","Xóa tệp"],
    th:["เลือกไฟล์","เลือกไฟล์","ยังไม่ได้เลือกไฟล์","ลบไฟล์"],
    ms:["Pilih fail","Pilih fail","Tiada fail dipilih","Alih keluar fail"],
    fil:["Pumili ng file","Pumili ng mga file","Walang napiling file","Alisin ang file"],
    sv:["Välj fil","Välj filer","Ingen fil vald","Ta bort fil"],
    el:["Επιλογή αρχείου","Επιλογή αρχείων","Δεν επιλέχθηκε αρχείο","Αφαίρεση αρχείου"],
    ro:["Selectează fișier","Selectează fișiere","Niciun fișier selectat","Elimină fișier"],
    bn:["ফাইল নির্বাচন করুন","ফাইলগুলো নির্বাচন করুন","কোনো ফাইল নির্বাচিত হয়নি","ফাইল সরান"],
    sw:["Chagua faili","Chagua faili","Hakuna faili iliyochaguliwa","Ondoa faili"]
  };
  const pickers = [];
  function words() {
    const code = (window.JustPDFItI18n?.getLanguage?.() || document.documentElement.lang || navigator.language || "en").split("-")[0].toLowerCase();
    return languages[code] || languages.en;
  }
  function enhance(input) {
    if (input.dataset.jpiEnhanced || input.hidden) return;
    input.dataset.jpiEnhanced = "true";
    const parent = input.parentElement;
    const wrap = document.createElement("div");
    wrap.className = "jpi-file-picker";
    input.before(wrap);
    wrap.append(input);
    input.classList.add("jpi-file-picker__input");
    const choose = document.createElement("button");
    choose.type = "button";
    choose.className = "jpi-file-picker__choose";
    choose.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 16V4m0 0L7 9m5-5 5 5M5 16v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"/></svg><span></span>';
    const chooseText = choose.querySelector("span");
    const name = document.createElement("span");
    name.className = "jpi-file-picker__name";
    name.setAttribute("aria-live", "polite");
    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "jpi-file-picker__clear";
    clear.textContent = "×";
    clear.hidden = true;
    wrap.append(choose, name, clear);
    const formerName = parent.querySelector("#tool-filename");
    if (formerName) formerName.hidden = true;
    function render() {
      const labels = words();
      const files = Array.from(input.files || []);
      chooseText.textContent = labels[input.multiple ? 1 : 0];
      name.textContent = files.length ? files.map(file => file.name).join(" · ") : labels[2];
      name.dataset.empty = String(!files.length);
      clear.hidden = !files.length;
      clear.setAttribute("aria-label", labels[3]);
      clear.title = labels[3];
      choose.disabled = input.disabled;
    }
    choose.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      if (!input.disabled) input.click();
    });
    clear.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      input.value = "";
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    input.addEventListener("change", render);
    pickers.push(render);
    render();
  }
  function init() { document.querySelectorAll('input[type="file"][data-jpi-picker]').forEach(enhance); }
  document.addEventListener("justpdfit-language", () => pickers.forEach(render => render()));
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
