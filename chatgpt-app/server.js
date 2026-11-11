import http from "node:http";
import { randomUUID } from "node:crypto";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const app = new McpServer({ name: "JustPDFit", version: "0.1.0" });
const MAX_BYTES = 12 * 1024 * 1024;
const decode = (s) => {
  const b = Buffer.from(s, "base64");
  if (!b.length || b.length > MAX_BYTES || b.toString("base64").replace(/=+$/, "") !== s.replace(/=+$/, "")) throw Error("Invalid or oversized base64 PDF");
  return b;
};
const result = async (pdf, name) => {
  const bytes = await pdf.save();
  if (bytes.length > MAX_BYTES) throw Error("Output exceeds 12 MB");
  return { content: [{ type: "text", text: JSON.stringify({ filename: name, mimeType: "application/pdf", base64: Buffer.from(bytes).toString("base64"), watermark: "JustPDFit" }) }] };
};
const stamp = async (pdf) => {
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (const page of pdf.getPages()) page.drawText("JustPDFit.com", { x: Math.max(12, page.getWidth() - 105), y: 12, size: 9, font, opacity: 0.45 });
};
app.registerTool("create_pdf", { title: "Create a PDF", description: "Create a PDF from plain text. Free output contains a small JustPDFit watermark.", inputSchema: { text: z.string().min(1).max(30000), filename: z.string().default("justpdfit.pdf") } }, async ({text, filename}) => {
  try {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    let page = pdf.addPage();
    let y = page.getHeight() - 45;
    for (const line of text.split("\n")) {
      for (const chunk of (line.match(/.{1,90}/g) || [""])) {
        if (y < 50) { page = pdf.addPage(); y = page.getHeight() - 45; }
        page.drawText(chunk.replace(/[^\x20-\x7E]/g, "?"), { x: 40, y, font, size: 11 });
        y -= 16;
      }
    }
    await stamp(pdf);
    return await result(pdf, filename);
  } catch(e) { return { isError: true, content: [{type:"text",text:e.message}] }; }
});
app.registerTool("merge_pdfs", { title: "Merge PDFs", description: "Merge two to five base64-encoded PDFs in order. Free output contains a small JustPDFit watermark.", inputSchema: { pdfs: z.array(z.string()).min(2).max(5) } }, async ({pdfs}) => {
  try {
    const merged = await PDFDocument.create();
    for (const encoded of pdfs) {
      const src = await PDFDocument.load(decode(encoded), { ignoreEncryption: false });
      const pages = await merged.copyPages(src, src.getPageIndices());
      for (const p of pages) merged.addPage(p);
    }
    await stamp(merged);
    return await result(merged, "justpdfit-merged.pdf");
  } catch(e) { return { isError: true, content: [{type:"text",text:e.message}] }; }
});
const port = Number(process.env.PORT || 3000);
http.createServer(async (req, res) => {
  if (req.url === "/health") { res.writeHead(200, {"content-type":"application/json"}); return res.end(JSON.stringify({ok:true})); }
  if (req.url !== "/mcp") { res.writeHead(404); return res.end("Not found"); }
  if (req.method !== "POST") { res.writeHead(405, {"allow":"POST"}); return res.end(); }
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  try { await app.connect(transport); await transport.handleRequest(req,res); }
  catch(e) { if (!res.headersSent) { res.writeHead(500); res.end("MCP error"); } }
  finally { await transport.close(); }
}).listen(port, "0.0.0.0", () => console.log("JustPDFit MCP listening on " + port));
