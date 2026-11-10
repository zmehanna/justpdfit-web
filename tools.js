/* JustPDFit standalone browser tools. Files are read locally and never uploaded. */
(() => {
  "use strict";
  const type = document.body.dataset.tool;
  const t = (key) => window.JustPDFItI18n?.t(key) || key;
  const active = new Set(["jpg-to-pdf", "merge-pdf", "split-pdf", "edit-pdf"]);
  if (!active.has(type)) return;
  const form = document.getElementById("tool-form");
  const picker = document.getElementById("tool-files");
  const message = document.getElementById("tool-feedback");
  const selected = document.getElementById("tool-filename");
  const link = document.getElementById("tool-download");
  const submit = document.getElementById("tool-submit");
  let lastURL = null;

  function feedback(text, error = false) {
    message.textContent = text;
    message.classList.toggle("error", error);
  }
  function clearResult() {
    link.hidden = true;
    link.removeAttribute("href");
    if (lastURL) URL.revokeObjectURL(lastURL);
    lastURL = null;
  }
  function output(bytes, name) {
    const blob = new Blob([bytes], { type: "application/pdf" });
    lastURL = URL.createObjectURL(blob);
    link.href = lastURL;
    link.download = name;
    link.hidden = false;
    feedback(t("toolReadyMsg") + " (" + (blob.size / 1024).toFixed(0) + " KB).");window.JustPDFItConfirmation?.open({blob,name,onRename:newName=>{link.download=newName;}});
  }
  picker.addEventListener("change", () => {
    clearResult();
    feedback("");
    const files = Array.from(picker.files || []);
    selected.textContent = files.length ? files.map(f => f.name).join(" · ") : t("noneSelected");
  });
  window.addEventListener("beforeunload", () => { if (lastURL) URL.revokeObjectURL(lastURL); });
  async function renderJpg(files) {
    if (!files.length) throw Error(t("errorFiles"));
    const doc = await PDFLib.PDFDocument.create();
    for (const file of files) {
      if (!/\.(jpe?g|png)$/i.test(file.name)) throw Error(t("errorImage"));
      const bytes = await file.arrayBuffer();
      const image = /\.png$/i.test(file.name) ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
      const page = doc.addPage([595.28, 841.89]);
      const { width, height } = image.size();
      const scale = Math.min(539.28 / width, 785.89 / height);
      page.drawImage(image, { x: (595.28 - width * scale) / 2, y: (841.89 - height * scale) / 2, width: width * scale, height: height * scale });
    }
    return { bytes: await doc.save(), name: "images-justpdfit.pdf" };
  }
  async function renderMerge(files) {
    if (files.length < 2) throw Error(t("errorFiles"));
    const doc = await PDFLib.PDFDocument.create();
    for (const file of files) {
      if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") throw Error(t("errorPdf"));
      const source = await PDFLib.PDFDocument.load(await file.arrayBuffer());
      const pages = await doc.copyPages(source, source.getPageIndices());
      for (const page of pages) doc.addPage(page);
    }
    return { bytes: await doc.save(), name: "justpdfit-merged.pdf" };
  }
  function parsePages(value, count) {
    const result = [];
    for (const raw of value.split(",")) {
      const match = raw.trim().match(/^(\d+)(?:-(\d+))?$/);
      if (!match) throw Error(t("errorRange"));
      const from = Number(match[1]), to = Number(match[2] || match[1]);
      if (from < 1 || to > count || from > to) throw Error(t("errorRange") + " (" + count + " " + t("pages") + ").");
      for (let i = from; i <= to; i++) result.push(i - 1);
    }
    if (!result.length) throw Error(t("errorRange"));
    if (result.length > 1000) throw Error(t("errorRange"));
    return result;
  }
  async function renderSplit(files) {
    if (files.length !== 1) throw Error(t("errorFiles"));
    const source = await PDFLib.PDFDocument.load(await files[0].arrayBuffer());
    const range = document.getElementById("page-range").value.trim();
    if (!range) throw Error(t("errorRange"));
    const indices = parsePages(range, source.getPageCount());
    const doc = await PDFLib.PDFDocument.create();
    for (const page of await doc.copyPages(source, indices)) doc.addPage(page);
    return { bytes: await doc.save(), name: "justpdfit-extracted-pages.pdf" };
  }
  async function renderEdit(files) {
    if (files.length !== 1) throw Error(t("errorFiles"));
    const doc = await PDFLib.PDFDocument.load(await files[0].arrayBuffer());
    const text = document.getElementById("edit-text").value.trim();
    if (!text) throw Error(t("errorText"));
    const pageNum = Number(document.getElementById("edit-page").value);
    if (!Number.isInteger(pageNum) || pageNum < 1 || pageNum > doc.getPageCount()) throw Error(t("errorPage"));
    const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
    const page = doc.getPage(pageNum - 1);
    let size = 18;
    while (font.widthOfTextAtSize(text, size) > page.getWidth() - 72 && size > 8) size -= 1;
    if (font.widthOfTextAtSize(text, size) > page.getWidth() - 72) throw Error(t("errorText"));
    page.drawText(text, { x: 36, y: Math.max(36, page.getHeight() - 60), size, font, color: PDFLib.rgb(0.12, 0.19, 0.33) });
    return { bytes: await doc.save(), name: "justpdfit-annotated.pdf" };
  }
  form.addEventListener("submit", async event => {
    event.preventDefault();
    clearResult();
    if (!window.PDFLib) return feedback(t("errorEngine"), true);
    const files = Array.from(picker.files || []);
    if (files.reduce((sum, file) => sum + file.size, 0) > 80 * 1024 * 1024) return feedback(t("errorTooLarge"), true);
    submit.disabled = true;
    feedback(t("processing"));
    try {
      const renderers = { "jpg-to-pdf": renderJpg, "merge-pdf": renderMerge, "split-pdf": renderSplit, "edit-pdf": renderEdit };
      const { bytes, name } = await renderers[type](files);
      output(bytes, name);
    } catch (error) {
      const raw=String(error?.message||"");
      const known=["errorPage","errorFiles","errorRange","errorPdf","errorImage","errorText","errorEngine","errorTooLarge"];
      const recognized=known.some(key=>raw.startsWith(t(key)));
      const detail=recognized?raw:/WinAnsi|cannot encode|font encoding|unsupported character/i.test(raw)?t("textUnicode"):t("invalidPdf");
      feedback(t("toolError") + " : " + detail, true);
    } finally {
      submit.disabled = false;
    }
  });
})();
