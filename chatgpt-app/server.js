import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { perform } from "./operations.js";
const app = new McpServer({ name:"JustPDFit", version:"0.2.0" });
const widgetUri = "ui://justpdfit/editor.html";
const uiMeta = { "openai/outputTemplate":widgetUri, "openai/toolInvocation/invoking":"Processing PDF", "openai/toolInvocation/invoked":"PDF ready" };
const fail = e => ({ isError:true,content:[{ type:"text",text:e instanceof Error ? e.message : "PDF processing failed" }] });
function tool(name,title,description,schema,action) {
  app.registerTool(name,{title,description,inputSchema:schema,_meta:uiMeta},async args=>{try{return await perform(action,args)}catch(e){return fail(e)}});
}
tool("merge_pdfs","Merge PDF files","Combine 2 to 5 PDFs in sequence. Base64 inputs; document is processed by the JustPDFit server and watermarked. Do not send sensitive content without user consent.",{pdfs:z.array(z.string()).min(2).max(5)},"merge");
tool("extract_pages","Extract PDF pages","Extract selected 1-based page numbers in the specified order.",{pdf:z.string(),pages:z.array(z.number().int().positive()).min(1).max(300)},"split");
tool("reorder_pages","Reorder PDF pages","Create a new PDF with pages in the requested 1-based order.",{pdf:z.string(),pages:z.array(z.number().int().positive()).min(1).max(300)},"reorder");
tool("rotate_pdf","Rotate PDF pages","Rotate all PDF pages by 90, 180 or 270 degrees.",{pdf:z.string(),angle:z.union([z.literal(90),z.literal(180),z.literal(270)])},"rotate");
tool("annotate_pdf","Add PDF text annotation","Overlay a short ASCII text annotation on the chosen page (not editing original text). Coordinates use PDF points from bottom left.",{pdf:z.string(),page:z.number().int().positive().default(1),text:z.string().max(400),x:z.number().nonnegative().default(36),y:z.number().nonnegative().default(55),size:z.number().min(8).max(30).default(12)},"annotate");
tool("sign_pdf_visual","Add visible PDF signature","Add a typed or PNG drawn signature on a chosen page. This is a visual mark, NOT a digital certificate or identity verification.",{pdf:z.string(),page:z.number().int().positive().default(1),name:z.string().optional(),png:z.string().optional(),x:z.number().nonnegative().default(36),y:z.number().nonnegative().default(55),width:z.number().positive().max(500).optional()},"sign");
tool("optimize_pdf","Re-save PDF using object streams","Re-encode the PDF with object streams. File size reduction is not guaranteed.",{pdf:z.string()},"optimize");
tool("inspect_pdf","Inspect PDF page sizes","Read page count and dimensions, without modifying the uploaded document.",{pdf:z.string()},"inspect");
tool("images_to_pdf","Convert images into PDF","Create a PDF from up to 10 JPEG/PNG images.",{images:z.array(z.object({data:z.string(),mimeType:z.enum(["image/png","image/jpeg"])})).min(1).max(10)},"images");
app.registerResource("JustPDFit editor",widgetUri,{ mimeType:"text/html;profile=mcp-app" },async()=>({
 contents:[{ uri:widgetUri,mimeType:"text/html;profile=mcp-app",text:await readFile(new URL("./widget.html",import.meta.url),"utf8"),_meta:{"openai/widgetDescription":"Upload, preview, process and download PDF files with JustPDFit"}}]
}));
const port = Number(process.env.PORT || 3000);
const server = http.createServer(async(req,res)=>{
 if(req.url === "/health"){res.writeHead(200,{"content-type":"application/json"});return res.end(JSON.stringify({ok:true,version:"0.2.0"}))}
 if(req.url !== "/mcp"){res.writeHead(404);return res.end("Not found")}
 if(req.method !== "POST"){res.writeHead(405,{"allow":"POST"});return res.end()}
 if(Number(req.headers["content-length"] || 0)>18*1024*1024){res.writeHead(413);return res.end("Request too large")}
 const transport=new StreamableHTTPServerTransport({sessionIdGenerator:undefined});
 try{await app.connect(transport);await transport.handleRequest(req,res)}
 catch(e){console.error("MCP request failed",e?.message);if(!res.headersSent){res.writeHead(500);res.end("MCP request failed")}}
 finally{await transport.close()}
});
server.requestTimeout=30000;
server.listen(port,"0.0.0.0",()=>console.log("JustPDFit MCP on "+port));
