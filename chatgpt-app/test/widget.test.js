import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Script } from "node:vm";
test("embedded widget parses and exposes file controls",async()=>{
 const html=await readFile(new URL("../widget.html",import.meta.url),"utf8");
 const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
 assert.ok(scripts.length>0,"No embedded widget scripts");
 for(const js of scripts)new Script(js,{filename:"widget.html"});
 for(const id of ["file","library","action","run","download","preview","demo","edit-demo","download-link"])assert.ok(html.includes('id="'+id+'"'),"Missing "+id);
 assert.ok(html.includes('"ui/initialize"'));
 assert.ok(html.includes('"ui/notifications/initialized"'));
 assert.ok(html.includes('"tools/call"'));
 assert.ok(html.includes("window.openai.callTool"));
 assert.ok(html.includes("window.openai.uploadFile"));
 assert.ok(html.includes("window.openai.getFileDownloadUrl"));
});
