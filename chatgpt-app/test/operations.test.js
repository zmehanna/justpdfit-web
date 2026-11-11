import test from "node:test";
import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
import { perform, fromBase64, LIMIT } from "../operations.js";
async function sample(n=1){
 const p=await PDFDocument.create();
 for(let i=0;i<n;i++)p.addPage([300+i,400+i]);
 return Buffer.from(await p.save()).toString("base64");
}
async function pdfFrom(result){
 assert.equal(result.isError,undefined);
 assert.equal(result.structuredContent.mimeType,"application/pdf");
 return PDFDocument.load(Buffer.from(result.structuredContent.base64,"base64"));
}
test("inspect, extract and reorder PDF pages",async()=>{
 const pdf=await sample(3);
 const inspect=await perform("inspect",{pdf});
 assert.equal(JSON.parse(inspect.content[0].text).pages,3);
 const a=await pdfFrom(await perform("split",{pdf,pages:[3,1]}));
 assert.equal(a.getPageCount(),2);
 assert.equal(a.getPage(0).getWidth(),302);
 const b=await pdfFrom(await perform("reorder",{pdf,pages:[2,2,1]}));
 assert.deepEqual(b.getPages().map(p=>p.getWidth()),[301,301,300]);
});
test("merge and rotate PDFs",async()=>{
 const pdf=await sample(2);
 assert.equal((await pdfFrom(await perform("merge",{pdfs:[pdf,pdf]}))).getPageCount(),4);
 const rotated=await pdfFrom(await perform("rotate",{pdf,angle:90}));
 assert.equal(rotated.getPage(0).getRotation().angle,90);
});
test("annotate, visually sign, optimize",async()=>{
 const pdf=await sample();
 for(const [name,args] of [
  ["annotate",{pdf,page:1,text:"Test",x:10,y:50}],
  ["sign",{pdf,page:1,name:"Jane Doe",x:10,y:60}],
  ["optimize",{pdf}]
 ])assert.equal((await pdfFrom(await perform(name,args))).getPageCount(),1);
});
test("reject oversized, invalid base64 and invalid page numbers",async()=>{
 assert.throws(()=>fromBase64("%%%"));
 assert.throws(()=>fromBase64(Buffer.alloc(LIMIT+1,1).toString("base64")));
 await assert.rejects(perform("split",{pdf:await sample(),pages:[4]}),/Invalid page numbers/);
 await assert.rejects(perform("sign",{pdf:await sample(),name:"\u0633"}),/printable/);
});
test("output does not echo PDF bytes in model-readable text",async()=>{
 const r=await perform("optimize",{pdf:await sample()});
 assert.equal(r.content[0].text.includes("base64"),true);
 assert.equal(r.content[0].text.includes(r.structuredContent.base64),false);
});
