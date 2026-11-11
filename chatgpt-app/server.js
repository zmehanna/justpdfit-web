import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { perform } from "./operations.js";
import { analyzeSignatures, readChatFile } from "./signature-workflow.js";
const makeApp = () => new McpServer({ name:"JustPDFit", version:"0.6.0" });
const widgetUri = "ui://justpdfit/editor-v6.html";
const uiMeta = { ui:{resourceUri:widgetUri,visibility:["model","app"]}, "openai/widgetAccessible":true, "openai/outputTemplate":widgetUri, "openai/toolInvocation/invoking":"Processing PDF", "openai/toolInvocation/invoked":"PDF ready" };
const fail = e => ({ isError:true,content:[{ type:"text",text:e instanceof Error ? e.message : "PDF processing failed" }] });
function tool(app,name,title,description,schema,action) {
  app.registerTool(name,{title,description,inputSchema:schema,_meta:uiMeta},async args=>{try{return await perform(action,args)}catch(e){return fail(e)}});
}
function registerApp(){
 const app=makeApp();
tool(app,"create_demo_pdf","Create or edit example PDF","Generate a small synthetic PDF, optionally with a visible ASCII text annotation, for testing. Does not use personal files.",{text:z.string().max(100).optional()},"demo");
tool(app,"merge_pdfs","Merge PDF files","Combine 2 to 5 PDFs in sequence. Base64 inputs; document is processed by the JustPDFit server and watermarked. Do not send sensitive content without user consent.",{pdfs:z.array(z.string()).min(2).max(5)},"merge");
tool(app,"extract_pages","Extract PDF pages","Extract selected 1-based page numbers in the specified order.",{pdf:z.string(),pages:z.array(z.number().int().positive()).min(1).max(300)},"split");
tool(app,"reorder_pages","Reorder PDF pages","Create a new PDF with pages in the requested 1-based order.",{pdf:z.string(),pages:z.array(z.number().int().positive()).min(1).max(300)},"reorder");
tool(app,"rotate_pdf","Rotate PDF pages","Rotate all PDF pages by 90, 180 or 270 degrees.",{pdf:z.string(),angle:z.union([z.literal(90),z.literal(180),z.literal(270)])},"rotate");
tool(app,"annotate_pdf","Add PDF text annotation","Overlay a short ASCII text annotation on the chosen page (not editing original text). Coordinates use PDF points from bottom left.",{pdf:z.string(),page:z.number().int().positive().default(1),text:z.string().max(400),x:z.number().nonnegative().default(36),y:z.number().nonnegative().default(55),size:z.number().min(8).max(30).default(12)},"annotate");
const chatFile=z.object({
  download_url:z.string().url(),file_id:z.string().min(1),
  mime_type:z.string().optional(),file_name:z.string().optional()
}).strict();
const signatureInput={
  file:chatFile.optional(),pdf:z.string().optional()
};
app.registerTool("propose_signature_placement",{
 title:"Find signature locations",
 description:"Analyze an attached PDF or base64 PDF for possible signature placements. Read-only. For scanned documents without searchable text, require manual placement; never invent a detected location. The user must approve page and position before any signature is applied.",
 inputSchema:{...signatureInput,name:z.string().max(90).optional()},
 annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false},
 _meta:{...uiMeta,"openai/fileParams":["file"]}
},async args=>{
 try{
  const pdf=args.pdf||(args.file?await readChatFile(args.file):null);
  if(!pdf)throw Error("Select a PDF attachment or open JustPDFit and choose a PDF first.");
  const result=await analyzeSignatures(pdf);
  result.requestedSignerName=args.name||null;
  return {structuredContent:result,content:[{type:"text",text:JSON.stringify(result)}]};
 }catch(e){return fail(e)}
});
app.registerTool("finalize_signature_pdf",{
 title:"Confirm and sign PDF visually",
 description:"Apply a visual name signature ONLY after the user has explicitly approved the exact page and position. Requires confirmed=true and the signer name. Never use this tool speculatively or based solely on a proposed position. This is not a certificate-backed digital signature.",
 inputSchema:{
  ...signatureInput,name:z.string().min(1).max(90),page:z.number().int().positive(),
  x:z.number().nonnegative(),y:z.number().nonnegative(),confirmed:z.literal(true)
 },
 annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:false},
 _meta:{...uiMeta,"openai/fileParams":["file"]}
},async args=>{
 try{
  if(args.confirmed!==true)throw Error("User approval is required");
  const pdf=args.pdf||(args.file?await readChatFile(args.file):null);
  if(!pdf)throw Error("The PDF must be attached again to finalize the signature");
  const result=await perform("sign",{pdf,name:args.name,page:args.page,x:args.x,y:args.y});
  return result;
 }catch(e){return fail(e)}
});
tool(app,"sign_pdf_visual","Add visible PDF signature","Add a typed or PNG drawn signature on a chosen page. This is a visual mark, NOT a digital certificate or identity verification.",{pdf:z.string(),page:z.number().int().positive().default(1),name:z.string().optional(),png:z.string().optional(),x:z.number().nonnegative().default(36),y:z.number().nonnegative().default(55),width:z.number().positive().max(500).optional()},"sign");
tool(app,"optimize_pdf","Re-save PDF using object streams","Re-encode the PDF with object streams. File size reduction is not guaranteed.",{pdf:z.string()},"optimize");
tool(app,"inspect_pdf","Inspect PDF page sizes","Read page count and dimensions, without modifying the uploaded document.",{pdf:z.string()},"inspect");
tool(app,"images_to_pdf","Convert images into PDF","Create a PDF from up to 10 JPEG/PNG images.",{images:z.array(z.object({data:z.string(),mimeType:z.enum(["image/png","image/jpeg"])})).min(1).max(10)},"images");
app.registerResource("JustPDFit editor",widgetUri,{ mimeType:"text/html;profile=mcp-app" },async()=>({
 contents:[{ uri:widgetUri,mimeType:"text/html;profile=mcp-app",text:await readFile(new URL("./widget.html",import.meta.url),"utf8"),_meta:{"openai/widgetDescription":"Edit sample PDFs, preview and download your result in JustPDFit", "openai/ui":{availableDisplayModes:["inline","fullscreen"]},ui:{csp:{connectDomains:[],resourceDomains:[]}}}}]
}));

 return app;
}
const port = Number(process.env.PORT || 3000);
const MAX_BODY = 4 * 1024 * 1024;
const WINDOW_MS = 60_000;
const MAX_PER_IP = 25;
const MAX_TOTAL = 150;
const buckets = new Map();
let total = { start: Date.now(), count: 0 };
function limited(req) {
 const now = Date.now();
 if(now - total.start > WINDOW_MS) total = {start:now,count:0};
 total.count++;
 if(total.count > MAX_TOTAL) return true;
 // Render is behind a managed reverse proxy; cap overall usage independently
 // so that spoofed forwarded headers cannot bypass capacity controls.
 const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim().slice(0,64);
 const entry = buckets.get(ip);
 const next = !entry || now - entry.start > WINDOW_MS ? {start:now,count:1} : {start:entry.start,count:entry.count+1};
 buckets.set(ip,next);
 if(buckets.size > 10000) buckets.clear();
 return next.count > MAX_PER_IP;
}
function json(res,status,message){res.writeHead(status,{"content-type":"application/json","cache-control":"no-store","x-content-type-options":"nosniff"});res.end(JSON.stringify({error:message}))}

const server = http.createServer(async(req,res)=>{
 res.setHeader("cache-control","no-store");
 res.setHeader("x-content-type-options","nosniff");
 res.setHeader("referrer-policy","no-referrer");
 if(req.url === "/health" && req.method==="GET"){
   res.writeHead(200,{"content-type":"application/json"}); return res.end(JSON.stringify({ok:true,version:"0.5.0"}));
 }
 if(req.url !== "/mcp") return json(res,404,"Not found");
 if(req.method !== "POST") {res.setHeader("allow","POST");return json(res,405,"Method not allowed")}
 if(limited(req)) return json(res,429,"Too many requests");
 const origin=req.headers.origin;
 if(origin && !["https://chatgpt.com","https://chat.openai.com"].includes(origin)) return json(res,403,"Origin not allowed");
 const announced=Number(req.headers["content-length"]||0);
 if(!Number.isFinite(announced)||announced>MAX_BODY) return json(res,413,"Request too large");
 // Limit actual streamed bytes before parsing even for chunked uploads.
 const chunks=[];let bytes=0;
 try{
   for await (const chunk of req) {
     bytes+=chunk.length;
     if(bytes>MAX_BODY) return json(res,413,"Request too large");
     chunks.push(chunk);
   }
   const body=JSON.parse(Buffer.concat(chunks).toString("utf8"));
   if(Array.isArray(body) || !body || typeof body !== "object" || Object.keys(body).length>12) return json(res,400,"Invalid MCP message");
   const transport=new StreamableHTTPServerTransport({sessionIdGenerator:undefined});
   const instance=registerApp();
   try{await instance.connect(transport);await transport.handleRequest(req,res,body)}
   finally{await transport.close();await instance.close()}
 }catch(e){
   // Never log PDF bytes or the entire JSON request.
   console.error("MCP request error",e?.name || "Error");
   if(!res.headersSent) json(res,400,"Invalid MCP request");
 }
});
server.requestTimeout=30000;
server.headersTimeout=15000;
server.listen(port,"0.0.0.0",()=>console.log("JustPDFit MCP on "+port));
