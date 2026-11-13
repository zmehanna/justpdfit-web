/* JustPDFit Business API. Staged: requires isolated D1, Resend, verified Stripe prices, webhook secrets.
 * API_HOST is configured as workers.dev or the custom api subdomain. Never deploy before QA.
 */
const ALLOWED_ORIGINS=new Set(["https://justpdfit.com","https://www.justpdfit.com"]);
const PLANS={starter:{included:3},team:{included:10},pro:{included:30}};
const enc=new TextEncoder();
const now=()=>Math.floor(Date.now()/1000);
const uid=()=>crypto.randomUUID();
function randomToken(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,"0")).join("")}
async function sha(s){return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",enc.encode(s))),x=>x.toString(16).padStart(2,"0")).join("")}
function response(data,status=200,origin="",extra={}){let headers={"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Vary":"Origin",...extra};if(ALLOWED_ORIGINS.has(origin)){headers["Access-Control-Allow-Origin"]=origin;headers["Access-Control-Allow-Credentials"]="true";headers["Access-Control-Allow-Methods"]="GET,POST,OPTIONS";headers["Access-Control-Allow-Headers"]="Content-Type"}return new Response(JSON.stringify(data),{status,headers})}
async function body(req){if(Number(req.headers.get("content-length")||0)>12000)throw Error("too_large");const x=await req.json();if(!x||typeof x!=="object"||Array.isArray(x))throw Error("invalid_json");return x}
function emailOk(email){return typeof email==="string"&&email.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
function cookie(req){return (req.headers.get("Cookie")||"").split(";").map(x=>x.trim()).find(x=>x.startsWith("jpibiz="))?.slice(7)||""}
async function user(req,env){const token=cookie(req);if(!/^[a-f0-9]{64}$/.test(token))return null;return await env.BUSINESS_DB.prepare("SELECT u.id,u.email FROM business_sessions s JOIN business_users u ON s.user_id=u.id WHERE s.token_hash=? AND s.expires_at>? AND s.revoked_at IS NULL").bind(await sha(token),now()).first()}
async function member(env,orgId,userId){return env.BUSINESS_DB.prepare("SELECT role FROM memberships WHERE organization_id=? AND user_id=? AND active=1").bind(orgId,userId).first()}
async function organization(env,id){return env.BUSINESS_DB.prepare("SELECT o.id,o.name,o.owner_id,s.plan,s.state,s.included_seats,s.extra_seats,s.current_period_end FROM organizations o LEFT JOIN business_subscriptions s ON s.organization_id=o.id WHERE o.id=?").bind(id).first()}
async function countMembers(env,id){const r=await env.BUSINESS_DB.prepare("SELECT COUNT(*) n FROM memberships WHERE organization_id=? AND active=1").bind(id).first();return r?.n||0}
async function permitted(env,id,userId,roles){const m=await member(env,id,userId);return m&&roles.includes(m.role)}
async function audit(env,orgId,userId,action,detail=""){await env.BUSINESS_DB.prepare("INSERT INTO business_audit(id,organization_id,actor_id,action,detail) VALUES (?,?,?,?,?)").bind(uid(),orgId,userId,action,detail).run()}
async function rate(env,key,limit,windowSec){const t=now();await env.BUSINESS_DB.prepare("DELETE FROM rate_limits WHERE expires_at < ?").bind(t).run();await env.BUSINESS_DB.prepare("INSERT INTO rate_limits(token,count,expires_at) VALUES(?,1,?) ON CONFLICT(token) DO UPDATE SET count=CASE WHEN expires_at<? THEN 1 ELSE count+1 END,expires_at=CASE WHEN expires_at<? THEN excluded.expires_at ELSE expires_at END").bind(key,t+windowSec,t,t).run();const r=await env.BUSINESS_DB.prepare("SELECT count FROM rate_limits WHERE token=?").bind(key).first();return Number(r.count)<=limit}
async function send(env,to,subject,html){if(!env.RESEND_API_KEY||!env.MAIL_FROM)throw Error("mail_unconfigured");const res=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+env.RESEND_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({from:env.MAIL_FROM,to:[to],subject,html})});if(!res.ok)throw Error("mail_failed")}
async function stripe(env,path,form){if(!env.STRIPE_SECRET_KEY||!/^sk_(test|live)_/.test(env.STRIPE_SECRET_KEY))throw Error("stripe_unconfigured");const res=await fetch("https://api.stripe.com/v1"+path,{method:form?"POST":"GET",headers:{"Authorization":"Bearer "+env.STRIPE_SECRET_KEY,...(form?{"Content-Type":"application/x-www-form-urlencoded"}:{})},body:form?new URLSearchParams(form):undefined});if(!res.ok)throw Error("stripe_failure");return res.json()}
async function webhookSignature(raw,header,secret){const parts=Object.fromEntries(header.split(",").map(p=>p.trim().split("=",2)));const t=Number(parts.t);if(!t||Math.abs(now()-t)>300||!parts.v1)return false;const key=await crypto.subtle.importKey("raw",enc.encode(secret),"HMAC",false,["sign"]);const signature=new Uint8Array(await crypto.subtle.sign("HMAC",key,enc.encode(t+"."+raw)));const hex=Array.from(signature,x=>x.toString(16).padStart(2,"0")).join("");if(hex.length!==parts.v1.length)return false;let same=0;for(let i=0;i<hex.length;i++)same|=hex.charCodeAt(i)^parts.v1.charCodeAt(i);return same===0}
function configured(env){return !!(env.BUSINESS_DB&&env.RESEND_API_KEY&&env.MAIL_FROM&&env.PUBLIC_SITE_URL==="https://justpdfit.com")}
async function handle(req,env){
const url=new URL(req.url),origin=req.headers.get("Origin")||"";
if(req.method==="OPTIONS")return response({},204,origin);
if(url.pathname==="/health")return response({ok:true,mode:env.BUSINESS_MODE==="live"?"live":"staged",billing_enabled:env.BUSINESS_BILLING_ENABLED==="true"},200,origin);
if(url.pathname==="/stripe-webhook"){
 if(req.method!=="POST"||!env.STRIPE_WEBHOOK_SECRET||!env.BUSINESS_DB)return response({error:"not_ready"},503);
 const raw=await req.text();if(!await webhookSignature(raw,req.headers.get("Stripe-Signature")||"",env.STRIPE_WEBHOOK_SECRET))return response({error:"invalid_signature"},400);
 const event=JSON.parse(raw);if(event.livemode!==(env.BUSINESS_MODE==="live"))return response({error:"mode_mismatch"},409);
 if(!["customer.subscription.created","customer.subscription.updated","customer.subscription.deleted"].includes(event.type))return response({ok:true});
 const sub=event.data?.object;const id=sub?.metadata?.business_org_id;
 if(!id||typeof id!=="string")return response({ok:true});
 const org=await env.BUSINESS_DB.prepare("SELECT id FROM organizations WHERE id=? AND stripe_customer_id=?").bind(id,sub.customer).first();if(!org)return response({ok:true});
 const plan=sub.metadata?.business_plan,extra=Number(sub.metadata?.extra_seats||0);
 if(!PLANS[plan]||!Number.isSafeInteger(extra)||extra<0||extra>10000)return response({error:"invalid_subscription_metadata"},422);
 const prev=await env.BUSINESS_DB.prepare("SELECT event_id FROM stripe_events WHERE event_id=?").bind(event.id).first();if(prev)return response({ok:true,duplicate:true});
 await env.BUSINESS_DB.prepare("INSERT INTO stripe_events(event_id) VALUES (?)").bind(event.id).run();
 const state=event.type==="customer.subscription.deleted"?"canceled":sub.status;
 await env.BUSINESS_DB.prepare("INSERT INTO business_subscriptions(organization_id,stripe_subscription_id,plan,state,included_seats,extra_seats,current_period_end) VALUES(?,?,?,?,?,?,?) ON CONFLICT(organization_id) DO UPDATE SET stripe_subscription_id=excluded.stripe_subscription_id,plan=excluded.plan,state=excluded.state,included_seats=excluded.included_seats,extra_seats=excluded.extra_seats,current_period_end=excluded.current_period_end,updated_at=CURRENT_TIMESTAMP").bind(id,sub.id,plan,state,PLANS[plan].included,extra,sub.current_period_end||null).run();
 return response({ok:true});
}
if(!ALLOWED_ORIGINS.has(origin))return response({error:"origin_denied"},403);
if(!configured(env))return response({error:"service_not_configured"},503,origin);
if(req.method==="POST"&&url.pathname==="/auth/request"){
 const d=await body(req),email=String(d.email||"").trim().toLowerCase();
 if(!emailOk(email))return response({error:"invalid_email"},422,origin);
 const ip=req.headers.get("CF-Connecting-IP")||"unknown",fingerprint=await sha(email);
 if(!await rate(env,"login:ip:"+await sha(ip),15,3600)||!await rate(env,"login:email:"+fingerprint,4,3600))return response({error:"rate_limited"},429,origin);
 const token=randomToken();
 await env.BUSINESS_DB.prepare("INSERT INTO email_logins(token_hash,email,expires_at) VALUES (?,?,?)").bind(await sha(token),email,now()+900).run();
 const link=env.PUBLIC_SITE_URL+"/business/dashboard/#login="+token;
 await send(env,email,"Your JustPDFit Business sign-in link",'<p>Sign in to JustPDFit Business:</p><p><a href="'+link+'">Sign in</a></p><p>This link expires in 15 minutes.</p>');
 return response({ok:true},200,origin);
}
if(req.method==="POST"&&url.pathname==="/auth/verify"){
 const d=await body(req),token=d.token;
 if(typeof token!=="string"||!/^[a-f0-9]{64}$/.test(token))return response({error:"invalid_token"},422,origin);
 const hash=await sha(token),record=await env.BUSINESS_DB.prepare("SELECT email FROM email_logins WHERE token_hash=? AND expires_at>? AND consumed_at IS NULL").bind(hash,now()).first();
 if(!record)return response({error:"expired_token"},401,origin);
 const changed=await env.BUSINESS_DB.prepare("UPDATE email_logins SET consumed_at=? WHERE token_hash=? AND consumed_at IS NULL").bind(now(),hash).run();
 if(changed.meta.changes!==1)return response({error:"expired_token"},401,origin);
 let current=await env.BUSINESS_DB.prepare("SELECT id,email FROM business_users WHERE email=?").bind(record.email).first();
 if(!current){await env.BUSINESS_DB.prepare("INSERT INTO business_users(id,email) VALUES(?,?) ON CONFLICT(email) DO NOTHING").bind(uid(),record.email).run();current=await env.BUSINESS_DB.prepare("SELECT id,email FROM business_users WHERE email=?").bind(record.email).first()}
 const session=randomToken();await env.BUSINESS_DB.prepare("INSERT INTO business_sessions(token_hash,user_id,expires_at) VALUES(?,?,?)").bind(await sha(session),current.id,now()+30*86400).run();
 return response({user:current},200,origin,{"Set-Cookie":"jpibiz="+session+"; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=2592000"});
}
const current=await user(req,env);if(!current)return response({error:"unauthenticated"},401,origin);
if(req.method==="POST"&&url.pathname==="/invitations/accept"){
 const d=await body(req),token=d.token;
 if(typeof token!=="string"||!/^[a-f0-9]{64}$/.test(token))return response({error:"invalid_invitation"},422,origin);
 const h=await sha(token);
 const invite=await env.BUSINESS_DB.prepare("SELECT organization_id,email,role FROM invitations WHERE token_hash=? AND expires_at>? AND accepted_at IS NULL").bind(h,now()).first();
 if(!invite||invite.email!==current.email)return response({error:"invalid_invitation"},403,origin);
 const org=await organization(env,invite.organization_id);
 if(!org||!["active","trialing"].includes(org.state))return response({error:"subscription_required"},402,origin);
 // The INSERT ... SELECT is evaluated transactionally by D1/SQLite. Concurrent
 // redemptions cannot exceed the paid seat count in this statement.
 const cap=(org.included_seats||0)+(org.extra_seats||0);
 const sql="INSERT INTO memberships(organization_id,user_id,role,active) SELECT ?,?,?,1 WHERE (SELECT COUNT(*) FROM memberships WHERE organization_id=? AND active=1) < ? ON CONFLICT(organization_id,user_id) DO UPDATE SET active=1,role=excluded.role";
 const update=await env.BUSINESS_DB.prepare(sql).bind(invite.organization_id,current.id,invite.role,invite.organization_id,cap).run();
 if(update.meta.changes!==1)return response({error:"seat_limit"},409,origin);
 await env.BUSINESS_DB.prepare("UPDATE invitations SET accepted_at=? WHERE token_hash=? AND accepted_at IS NULL").bind(now(),h).run();
 await audit(env,invite.organization_id,current.id,"invitation_accepted");
 return response({ok:true,organization_id:invite.organization_id},200,origin);
}
if(req.method==="POST"&&url.pathname==="/auth/logout"){const token=cookie(req);await env.BUSINESS_DB.prepare("UPDATE business_sessions SET revoked_at=? WHERE token_hash=?").bind(now(),await sha(token)).run();return response({ok:true},200,origin,{"Set-Cookie":"jpibiz=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0"})}
if(req.method==="GET"&&url.pathname==="/me"){const orgs=await env.BUSINESS_DB.prepare("SELECT o.id,o.name,m.role,s.plan,s.state,s.included_seats,s.extra_seats FROM organizations o JOIN memberships m ON o.id=m.organization_id LEFT JOIN business_subscriptions s ON s.organization_id=o.id WHERE m.user_id=? AND m.active=1").bind(current.id).all();return response({user:current,organizations:orgs.results},200,origin)}
if(req.method==="POST"&&url.pathname==="/organizations"){
 const d=await body(req),name=String(d.name||"").trim();if(name.length<2||name.length>120)return response({error:"invalid_name"},422,origin);
 const id=uid();await env.BUSINESS_DB.batch([env.BUSINESS_DB.prepare("INSERT INTO organizations(id,name,owner_id) VALUES(?,?,?)").bind(id,name,current.id),env.BUSINESS_DB.prepare("INSERT INTO memberships(organization_id,user_id,role) VALUES(?,?,'owner')").bind(id,current.id)]);
 await audit(env,id,current.id,"organization_created");return response({id,name},201,origin);
}
const match=url.pathname.match(/^\/organizations\/([a-f0-9-]{36})(?:\/(members|invites|billing|entitlement))?$/);if(!match)return response({error:"not_found"},404,origin);
const id=match[1],resource=match[2]||"",membership=await member(env,id,current.id);
if(!membership)return response({error:"not_found"},404,origin);
const org=await organization(env,id);if(!org)return response({error:"not_found"},404,origin);
if(req.method==="GET"&&resource===""){
 const members=await env.BUSINESS_DB.prepare("SELECT u.id,u.email,m.role,m.active FROM memberships m JOIN business_users u ON u.id=m.user_id WHERE m.organization_id=? ORDER BY m.role,u.email").bind(id).all();
 return response({organization:org,members:members.results,seats_used:await countMembers(env,id)},200,origin);
}
if(req.method==="GET"&&resource==="entitlement"){
 return response({eligible:["active","trialing"].includes(org.state),plan:org.plan||null,seats:Math.max(0,(org.included_seats||0)+(org.extra_seats||0))},200,origin);
}
if(req.method==="POST"&&resource==="invites"){
 if(!["owner","admin"].includes(membership.role))return response({error:"forbidden"},403,origin);
 const d=await body(req),email=String(d.email||"").trim().toLowerCase(),role=d.role==="admin"?"admin":"member";
 if(!emailOk(email))return response({error:"invalid_email"},422,origin);
 if(!["active","trialing"].includes(org.state))return response({error:"subscription_required"},402,origin);
 const cap=(org.included_seats||0)+(org.extra_seats||0),used=await countMembers(env,id);
 const pending=await env.BUSINESS_DB.prepare("SELECT COUNT(DISTINCT email) n FROM invitations WHERE organization_id=? AND accepted_at IS NULL AND expires_at>?").bind(id,now()).first();
 if(used+(pending?.n||0)>=cap)return response({error:"seat_limit"},409,origin);
 if(!await rate(env,"invite:"+id,30,3600))return response({error:"rate_limited"},429,origin);
 const token=randomToken();await env.BUSINESS_DB.prepare("INSERT INTO invitations(token_hash,organization_id,email,role,expires_at,invited_by) VALUES(?,?,?,?,?,?)").bind(await sha(token),id,email,role,now()+7*86400,current.id).run();
 const link=env.PUBLIC_SITE_URL+"/business/dashboard/#invite="+token;
 await send(env,email,"JustPDFit Business team invitation",'<p>You were invited to join a JustPDFit Business team.</p><p><a href="'+link+'">Accept invitation</a></p><p>Valid for 7 days.</p>');
 await audit(env,id,current.id,"member_invited",role);return response({ok:true},200,origin);
}
if(req.method==="POST"&&resource==="members"){
 if(!["owner","admin"].includes(membership.role))return response({error:"forbidden"},403,origin);
 const d=await body(req);if(typeof d.user_id!=="string"||d.user_id===org.owner_id)return response({error:"invalid_user"},422,origin);
 await env.BUSINESS_DB.prepare("UPDATE memberships SET active=0 WHERE organization_id=? AND user_id=? AND role!='owner'").bind(id,d.user_id).run();
 await audit(env,id,current.id,"member_deactivated");return response({ok:true},200,origin);
}
if(req.method==="POST"&&resource==="billing"){
 if(membership.role!=="owner")return response({error:"forbidden"},403,origin);
 if(env.BUSINESS_BILLING_ENABLED!=="true")return response({error:"billing_not_enabled"},503,origin);
 const d=await body(req),plan=d.plan,period=d.period,extra=Number(d.extra_seats);
 if(!PLANS[plan]||!["monthly","annual"].includes(period)||!Number.isSafeInteger(extra)||extra<0||extra>10000)return response({error:"invalid_plan"},422,origin);
 const key=plan.toUpperCase()+"_"+period.toUpperCase(),seatKey=plan.toUpperCase()+"_EXTRA_"+period.toUpperCase();
 const mainPrice=env["PRICE_"+key],extraPrice=env["PRICE_"+seatKey];
 if(!/^price_/.test(mainPrice||"")||(extra&&!/^price_/.test(extraPrice||"")))return response({error:"prices_not_configured"},503,origin);
 let customer=await env.BUSINESS_DB.prepare("SELECT stripe_customer_id FROM organizations WHERE id=?").bind(id).first();
 if(!customer.stripe_customer_id){const c=await stripe(env,"/customers",{name:org.name,email:current.email,"metadata[business_org_id]":id});await env.BUSINESS_DB.prepare("UPDATE organizations SET stripe_customer_id=? WHERE id=? AND stripe_customer_id IS NULL").bind(c.id,id).run();customer.stripe_customer_id=c.id}
 const form={"mode":"subscription","customer":customer.stripe_customer_id,"success_url":env.PUBLIC_SITE_URL+"/business/dashboard/?checkout=success","cancel_url":env.PUBLIC_SITE_URL+"/business/dashboard/?checkout=cancel","line_items[0][price]":mainPrice,"line_items[0][quantity]":"1","subscription_data[metadata][business_org_id]":id,"subscription_data[metadata][business_plan]":plan,"subscription_data[metadata][extra_seats]":String(extra),"metadata[business_org_id]":id};
 if(extra){form["line_items[1][price]"]=extraPrice;form["line_items[1][quantity]"]=String(extra)}
 const checkout=await stripe(env,"/checkout/sessions",form);await audit(env,id,current.id,"checkout_created",plan);return response({url:checkout.url},200,origin);
}
return response({error:"not_found"},404,origin);
}
export default {async fetch(request,env){const origin=request.headers.get("Origin")||"";try{return await handle(request,env)}catch(e){console.error("Business API failed",e.message);return response({error:"server_error"},500,origin)}}};
