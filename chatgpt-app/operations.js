import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
export const LIMIT = 2 * 1024 * 1024;
export function fromBase64(input) {
  if (typeof input !== "string" || !/^[A-Za-z0-9+/]+={0,2}$/.test(input)) throw Error("Invalid base64 content");
  const bytes = Buffer.from(input, "base64");
  if (!bytes.length || bytes.length > LIMIT || bytes.toString("base64").replace(/=+$/, "") !== input.replace(/=+$/, "")) throw Error("File exceeds 2MB or is invalid");
  return bytes;
}
export async function load(input) { return PDFDocument.load(fromBase64(input), { ignoreEncryption: false, updateMetadata: false }); }
export async function mark(pdf) {
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (const page of pdf.getPages()) {
    const width = font.widthOfTextAtSize("JustPDFit.com", 8);
    page.drawText("JustPDFit.com", { x: Math.max(8, page.getWidth() - width - 12), y: 10, font, size: 8, opacity: 0.45, color: rgb(0.16, 0.37, 0.72) });
  }
}
export async function output(pdf, filename = "justpdfit.pdf") {
  await mark(pdf);
  const bytes = await pdf.save({ useObjectStreams: true });
  if (bytes.length > LIMIT) throw Error("Output exceeds 2MB");
  const base64 = Buffer.from(bytes).toString("base64");
  return { content: [{ type: "text", text: JSON.stringify({ filename, mimeType: "application/pdf", pages: pdf.getPageCount(), watermark: "JustPDFit.com", note: "PDF bytes available in structuredContent for the widget; never paste base64 into chat." }) }], structuredContent: { filename, mimeType:"application/pdf", base64, pages:pdf.getPageCount(), watermark:"JustPDFit.com" } };
}
export async function perform(action, input) {
  if (action === "demo") {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    page.drawText("JustPDFit demo - synthetic document", { x: 45, y: 770, font, size: 18, color: rgb(0.1, 0.27, 0.55) });
    page.drawText("Try annotating, rotating or downloading this sample.", { x: 45, y: 735, font, size: 12 });
    if (input.text) {
      if (typeof input.text !== "string" || input.text.length > 100 || /[^\\x20-\\x7e]/.test(input.text)) throw Error("Demo annotation must be printable text (max 100 characters)");
      page.drawText(input.text,{x:45,y:680,font,size:16,color:rgb(0.05,0.45,0.25)});
    }
    return output(pdf, input.text ? "justpdfit-demo-edited.pdf" : "justpdfit-demo.pdf");
  }
  if (action === "merge") {
    if (!Array.isArray(input.pdfs) || input.pdfs.length < 2 || input.pdfs.length > 5) throw Error("Select 2 to 5 PDFs");
    const result = await PDFDocument.create();
    for (const source of input.pdfs) {
      const pdf = await load(source);
      const pages = await result.copyPages(pdf, pdf.getPageIndices());
      for (const page of pages) result.addPage(page);
    }
    return output(result, "justpdfit-merged.pdf");
  }
  if (action === "images") {
    const pdf = await PDFDocument.create();
    if (!Array.isArray(input.images) || input.images.length < 1 || input.images.length > 10) throw Error("Select 1 to 10 images");
    for (const img of input.images) {
      const bytes = fromBase64(img.data);
      const image = img.mimeType === "image/png" ? await pdf.embedPng(bytes) : img.mimeType === "image/jpeg" ? await pdf.embedJpg(bytes) : null;
      if (!image) throw Error("Only PNG and JPEG are supported");
      const p = pdf.addPage([image.width, image.height]);
      p.drawImage(image, { x:0, y:0, width:image.width, height:image.height });
    }
    return output(pdf, "justpdfit-images.pdf");
  }
  const pdf = await load(input.pdf);
  const count = pdf.getPageCount();
  if (!count || count > 300) throw Error("PDF must contain 1 to 300 pages");
  if (action === "split" || action === "reorder") {
    const numbers = input.pages;
    if (!Array.isArray(numbers) || numbers.length < 1 || numbers.length > 300 || numbers.some(n => !Number.isInteger(n) || n < 1 || n > count)) throw Error("Invalid page numbers");
    const target = await PDFDocument.create();
    for (const page of await target.copyPages(pdf, numbers.map(n => n - 1))) target.addPage(page);
    return output(target, action === "split" ? "justpdfit-extracted.pdf" : "justpdfit-reordered.pdf");
  }
  if (action === "rotate") {
    const angle = input.angle;
    if (![0,90,180,270].includes(angle)) throw Error("Angle must be 0, 90, 180 or 270");
    for (const page of pdf.getPages()) page.setRotation(degrees((page.getRotation().angle + angle) % 360));
  } else if (action === "annotate" || action === "sign") {
    const index = input.page || 1;
    if (!Number.isInteger(index) || index < 1 || index > count) throw Error("Invalid page");
    const page = pdf.getPage(index - 1);
    const x = input.x ?? 36; const y = input.y ?? 55;
    if (![x,y].every(Number.isFinite) || x < 0 || y < 0 || x > page.getWidth() || y > page.getHeight()) throw Error("Invalid coordinates");
    if (action === "annotate") {
      const txt = input.text;
      if (!txt || txt.length > 400 || /[^\x20-\x7e]/.test(txt)) throw Error("Text annotation currently supports printable ASCII only (max 400 characters)");
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      page.drawText(txt, { x,y, font,size:Math.min(30,Math.max(8,input.size || 12)),color:rgb(0.1,0.24,0.44),maxWidth:Math.max(30,page.getWidth()-x-10) });
    } else {
      if (input.png) {
        const image = await pdf.embedPng(fromBase64(input.png));
        const width = Math.min(input.width || 180, page.getWidth() - x);
        page.drawImage(image, { x,y,width,height:width * image.height / image.width });
      } else {
        const signature = input.name;
        if (!signature || signature.length > 90 || /[^\x20-\x7e]/.test(signature)) throw Error("A printable name is required");
        const font = await pdf.embedFont(StandardFonts.TimesRomanItalic);
        page.drawText(signature, { x,y,font,size:Math.min(40, Math.max(12,input.size || 24)),color:rgb(0.08,0.16,0.42) });
      }
    }
  } else if (action === "optimize") {
    // Re-serialize with PDF object streams; not guaranteed to reduce all PDFs.
  } else if (action !== "inspect") {
    throw Error("Unknown action");
  }
  if (action === "inspect") return { content: [{ type:"text",text:JSON.stringify({pages:count,dimensions:pdf.getPages().map((p,i)=>({page:i+1,width:p.getWidth(),height:p.getHeight()}))}) }] };
  return output(pdf, "justpdfit-"+action+".pdf");
}
