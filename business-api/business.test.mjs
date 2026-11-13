import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const source = await fs.readFile(new URL('./worker.js',import.meta.url),'utf8');
const api = (await import('./worker.js')).default;
test('health route is staged and billing disabled without activation',async()=>{
 const response=await api.fetch(new Request('https://api.test/health'),{BUSINESS_MODE:'test',BUSINESS_BILLING_ENABLED:'false'});
 assert.equal(response.status,200);const body=await response.json();assert.equal(body.billing_enabled,false);assert.equal(body.mode,'staged');
});
test('unauthorized API origin fails closed',async()=>{
 const response=await api.fetch(new Request('https://api.test/auth/request',{method:'POST',headers:{Origin:'https://malicious.example','Content-Type':'application/json'},body:'{}'}),{});
 assert.equal(response.status,403);
});
test('service refuses account operations without secrets',async()=>{
 const response=await api.fetch(new Request('https://api.test/me',{headers:{Origin:'https://justpdfit.com'}}),{});
 assert.equal(response.status,503);
});
test('webhook cannot be accepted without signed secret',async()=>{
 const response=await api.fetch(new Request('https://api.test/stripe-webhook',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}),{});
 assert.equal(response.status,503);
});
test('seat management route and invoices route are registered',()=>{
 assert.match(source,/members\|invites\|billing\|billing-change\|billing-portal\|entitlement\|invoices\|usage/);
});
test('production account pinned and billing gated',()=>{
 assert.match(source,/acct_1UaLHoEQp3CN3XtA/);
 assert.match(source,/BUSINESS_BILLING_ENABLED/);
});
test('session cookies are HttpOnly',()=>assert.match(source,/HttpOnly; Secure/));
test('no client API keys are committed',()=>assert.doesNotMatch(source,/(?:sk_live|re_live)_[A-Za-z0-9]{15,}/));
