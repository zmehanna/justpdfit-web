import test from "node:test";
import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
import { perform, fromBase64, LIMIT } from "../operations.js";
import { analyzeSignatures } from "../signature-workflow.js";
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
test("demo creates a real PDF that can be annotated",async()=>{
 const demo=await perform("demo",{});
 const pdf=await pdfFrom(demo);
 assert.equal(pdf.getPageCount(),1);
 const editedDemo=await perform("demo",{text:"TEST APPROVED"});
 assert.equal(editedDemo.structuredContent.filename,"justpdfit-demo-edited.pdf");
 assert.equal((await pdfFrom(editedDemo)).getPageCount(),1);
 const annotated=await perform("annotate",{pdf:demo.structuredContent.base64,text:"APPROVED",page:1});
 const result=await pdfFrom(annotated);
 assert.equal(result.getPageCount(),1);
 assert.equal(annotated.structuredContent.filename,"justpdfit-annotate.pdf");
});
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

test("signature analyzer flags scanned or blank documents for manual placement",async()=>{
 const input=await sample(4);
 const result=await analyzeSignatures(input);
 assert.equal(result.pages,4);
 assert.equal(result.scanOrImageOnly,true);
 assert.equal(result.requiresConfirmation,true);
 assert.equal(result.canAutoPlace,false);
 assert.deepEqual(result.candidates,[]);
});
test("signature analyzer proposes a region for searchable signature labels",async()=>{
 const pdf=await PDFDocument.create();const page=pdf.addPage([595,842]);
 const font=await pdf.embedFont("Helvetica");
 page.drawText("Signature du locataire",{x:270,y:290,size:15,font});
 const data=Buffer.from(await pdf.save()).toString("base64");
 const result=await analyzeSignatures(data);
 assert.equal(result.pages,1);
 assert.equal(result.scanOrImageOnly,false);
 assert.ok(result.candidates.length>0);
 assert.equal(result.candidates[0].page,1);
 assert.equal(result.candidates[0].requiresConfirmation,true);
});
