import { spawnSync } from "node:child_process";
function run(cmd,args) {
 const r=spawnSync(cmd,args,{encoding:"utf8",timeout:90000,maxBuffer:1024*1024*4});
 if(r.stdout)process.stdout.write(r.stdout);
 if(r.stderr)process.stderr.write(r.stderr);
 if(r.error||r.status!==0) {
   console.error("BUILD_CHECK_FAILED",cmd,args.join(" "),r.error?.message||r.status);
   process.exitCode=1;
 }
}
const audit=spawnSync("npm",["audit","--omit=dev","--json"],{encoding:"utf8",timeout:30000,maxBuffer:1024*1024*4});
try {
 const details=JSON.parse(audit.stdout);
 const items=Object.entries(details.vulnerabilities||{}).map(([name,v])=>({name,severity:v.severity,range:v.range,fixAvailable:v.fixAvailable,via:(v.via||[]).map(x=>typeof x==="string"?x:x.title)}));
 console.log("AUDIT_SUMMARY "+JSON.stringify({counts:details.metadata?.vulnerabilities,issues:items}));
} catch(e) { console.log("AUDIT_UNAVAILABLE "+String(e)); }
run(process.execPath,["--test","test/operations.test.js"]);
run(process.execPath,["test/mcp.test.js"]);
if(process.exitCode)throw Error("Integration checks failed");
