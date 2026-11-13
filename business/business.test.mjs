import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const html=await fs.readFile(new URL('./index.html',import.meta.url),'utf8');
const extra1=await fs.readFile(new URL('./i18n-extra.js',import.meta.url),'utf8');
const extra2=await fs.readFile(new URL('./i18n-extra-2.js',import.meta.url),'utf8');
test('Business pricing loads shared header footer navigation',()=>{
 assert.match(html,/\.\.\/site-shell\.js/);
 assert.match(html,/<footer/);
});
test('pricing loads both translation catalogs',()=>{
 assert.match(html,/i18n-extra\.js/);
 assert.match(html,/i18n-extra-2\.js/);
});
test('all additional locale catalogs include expected fields',()=>{
 const one=extra1.match(/\{.*\}/s)?.[0],two=extra2.match(/\{.*\}/s)?.[0];
 const first=JSON.parse(one);
 const second=JSON.parse(two);
 for(const [code,row] of Object.entries({...first,...second}))assert.equal(row.length,35,code);
});
test('public page does not embed Stripe live secret',()=>assert.doesNotMatch(html,/(?:sk_live|rk_live)_[A-Za-z0-9]{15,}/));
