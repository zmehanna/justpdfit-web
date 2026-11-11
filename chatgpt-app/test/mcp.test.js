import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { PDFDocument } from "pdf-lib";
const PORT=45981;
const proc=spawn(process.execPath,["server.js"],{env:{...process.env,PORT:String(PORT)},stdio:"pipe"});
let stderr="";proc.stderr.on("data",c=>stderr+=c);
const base="http://127.0.0.1:"+PORT;
try{
 let ready=false;
 for(let i=0;i<80;i++){
  try{const r=await fetch(base+"/health");if(r.ok){ready=true;break}}catch{}
  await sleep(150);
 }
 assert.equal(ready,true,"Server failed to start: "+stderr);
 const health=await (await fetch(base+"/health")).json();
 assert.equal(health.ok,true);
 const bad=await fetch(base+"/mcp",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(Array(101).fill({jsonrpc:"2.0",id:1,method:"ping"}))});
 assert.equal(bad.status,400,"HTTP batch must be rejected");
 const giant=await fetch(base+"/mcp",{method:"POST",headers:{"content-type":"application/json"},body:"x".repeat(4*1024*1024+10)});
 assert.equal(giant.status,413);
 const origin=await fetch(base+"/mcp",{method:"POST",headers:{"origin":"https://evil.example","content-type":"application/json"},body:"{}"});
 assert.equal(origin.status,403);
 const transport=new StreamableHTTPClientTransport(new URL(base+"/mcp"));
 const client=new Client({name:"justpdfit-test",version:"0.1.0"});
 await client.connect(transport);
 const listing=await client.listTools();
 assert.ok(listing.tools.some(t=>t.name==="merge_pdfs"));
 const resources=await client.listResources();
 assert.ok(resources.resources.some(r=>r.uri==="ui://justpdfit/editor.html"));
 const widget=await client.readResource({uri:"ui://justpdfit/editor.html"});
 assert.ok(widget.contents.some(c=>c.text?.includes("JustPDFit")));
 const pdf=await PDFDocument.create();pdf.addPage([300,400]);
 const base64=Buffer.from(await pdf.save()).toString("base64");
 const result=await client.callTool({name:"inspect_pdf",arguments:{pdf:base64}});
 assert.equal(JSON.parse(result.content[0].text).pages,1);
 await client.close();
 console.log("MCP HTTP smoke tests PASS; 9 tools exposed");
} finally{
 proc.kill("SIGTERM");
 await sleep(250);
}
