import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const html=await fs.readFile(new URL('./index.html',import.meta.url),'utf8');
const source=await fs.readFile(new URL('./i18n-extra.js',import.meta.url),'utf8');
const start=source.indexOf('{'),end=source.lastIndexOf('}');
const locales=JSON.parse(source.slice(start,end+1));
const expected=['es','de','it','pt','nl','ru','pl','tr','sv','ro','zh','ja','ko','hi','ur','fa','id','vi','th','ms','fil','el','bn','sw'];
const keys=['title','intro','signIn','signInHint','email','sendLink','company','signOut','newOrg','companyName','create','plan','seats','state','team','role','action','inviteEmail','invite','billing','billingHint','setup','sent','loading','active','inactive','deactivate','confirm','error','noOrg','inviteSent','createOk','period','monthly','annual','extraSeats','subscribe','manageBilling','billingLocked','confirmBilling','inviteAccepted','inviteLogin','invoiceHeading','refresh','activityHeading','usageHint','noInvoices','events','pdfExports','aiRequests','remoteSigns'];
test('24 additional dashboard languages have all 51 interface keys',()=>{
 assert.deepEqual(Object.keys(locales).sort(),expected.sort());
 for(const [locale,strings] of Object.entries(locales)){
  assert.deepEqual(Object.keys(strings).sort(),[...keys].sort(),locale);
  for(const k of keys)assert.ok(typeof strings[k]==='string'&&strings[k].trim(),locale+' '+k);
 }
});
test('dashboard loads shared shell and locale pack',()=>{
 assert.match(html,/\.\.\/\.\.\/site-shell\.js/);
 assert.match(html,/\.\/i18n-extra\.js/);
});
test('RTL mode is enabled for Arabic, Persian and Urdu',()=>assert.match(html,/\["ar","fa","ur"\]/));
test('no customer payments are automatically invoked',()=>assert.match(html,/confirm\(t\("confirmBilling"\)\)/));
