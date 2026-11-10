import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
const te=new TextEncoder();
const now=()=>Math.floor(Date.now()/1000);
const uid=()=>crypto.randomUUID();
const toHex=b=>Array.from(b).map(x=>x.toString(16).padStart(2,"0")).join("");
const random=()=>toHex(crypto.getRandomValues(new Uint8Array(32)));
const digest=async b=>toHex(new Uint8Array(await crypto.subtle.digest("SHA-256",typeof b==="string"?te.encode(b):b)));
const hmac=async(k,s)=>{const key=await crypto.subtle.importKey("raw",te.encode(k),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return toHex(new Uint8Array(await crypto.subtle.sign("HMAC",key,te.encode(s))))};
const same=(a,b)=>{if(typeof a!=="string"||typeof b!=="string"||a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0};
const abort=(message,status=400)=>{throw Object.assign(new Error(message),{status})};
const safe=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const address=s=>typeof s==="string"&&s.length<255&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const reply=(body,status=200,origin="https://justpdfit.com")=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json","cache-control":"no-store","access-control-allow-origin":origin,"vary":"Origin"}});
const bodyJSON=async r=>{try{return await r.json()}catch{abort("JSON invalide")}};
const site=e=>e.SITE_ORIGIN||"https://justpdfit.com";
const ready=e=>!!(e.SIGNATURES_ENABLED==="true"&&e.STRIPE_SECRET_KEY&&e.STRIPE_WEBHOOK_SECRET&&e.RESEND_API_KEY&&e.MAIL_FROM&&e.OTP_PEPPER&&e.DOCUMENTS&&e.DB);
async function mail(e,to,subject,content){
 const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"authorization":"Bearer "+e.RESEND_API_KEY,"content-type":"application/json"},body:JSON.stringify({from:e.MAIL_FROM,to:[to],subject,html:content})});
 if(!r.ok)abort("Envoi email temporairement indisponible",502);
}
const signerLink=(e,t)=>site(e)+"/sign/invite/?token="+encodeURIComponent(t);
async function signer(e,t){
 if(typeof t!=="string"||!/^[0-9a-f]{64}$/.test(t))abort("Invitation invalide",401);
 const s=await e.DB.prepare("SELECT s.*,d.status document_status,d.plan,d.expires_at FROM signers s JOIN documents d ON d.id=s.document_id WHERE invite_hash=?").bind(await digest(t)).first();
 if(!s||s.expires_at<now()||s.document_status==="cancelled")abort("Invitation expirée",401);
 return s;
}
async function authenticate(r,e,s){
 const k=(r.headers.get("authorization")||"").replace(/^Bearer /i,"");
 if(!/^[0-9a-f]{64}$/.test(k)||!s.session_hash||s.session_exp<now()||!same(await digest(k),s.session_hash))abort("Vérification email requise",401);
}
async function checkout(e,d){
 const p=new URLSearchParams();
 p.set("mode","payment");p.set("success_url",site(e)+"/sign/?payment=success");p.set("cancel_url",site(e)+"/sign/?payment=cancel");
 p.set("client_reference_id",d.id);p.set("line_items[0][price_data][currency]","eur");
 p.set("line_items[0][price_data][unit_amount]",d.plan==="enhanced"?"399":"199");
 p.set("line_items[0][price_data][product_data][name]",d.plan==="enhanced"?"JustPDFit Signature Duo + Didit":"JustPDFit Signature Duo");
 p.set("line_items[0][quantity]","1");p.set("customer_email",d.email);p.set("metadata[document_id]",d.id);
 const r=await fetch("https://api.stripe.com/v1/checkout/sessions",{method:"POST",headers:{"authorization":"Bearer "+e.STRIPE_SECRET_KEY,"content-type":"application/x-www-form-urlencoded","idempotency-key":"justpdfit-"+d.id},body:p});
 const v=await r.json();if(!r.ok||!v.url)abort("Paiement impossible à initialiser",502);return v;
}
async function create(r,e){
 if(!ready(e))abort("Service de paiement désactivé",503);
 const f=await r.formData(),file=f.get("file"),a=String(f.get("signer_a")||"").trim().toLowerCase(),b=String(f.get("signer_b")||"").trim().toLowerCase(),plan=String(f.get("plan")||"standard");
 if(!(file instanceof File)||file.size<10||file.size>10e6||!address(a)||!address(b)||a===b||!["standard","enhanced"].includes(plan))abort("Document ou adresses invalides");
 if(plan==="enhanced"&&(!e.DIDIT_API_KEY||!e.DIDIT_WORKFLOW_ID||!e.DIDIT_WEBHOOK_SECRET))abort("Identification renforcée indisponible",503);
 const bytes=new Uint8Array(await file.arrayBuffer());
 if(new TextDecoder().decode(bytes.slice(0,5))!=="%PDF-")abort("Un PDF est requis");
 try{const p=await PDFDocument.load(bytes);if(p.getPageCount()>100)abort("Maximum 100 pages")}catch{abort("PDF invalide ou protégé")}
 const id=uid(),expiry=now()+7*86400;
 await e.DOCUMENTS.put("original/"+id+".pdf",bytes,{httpMetadata:{contentType:"application/pdf"}});
 try{
  await e.DB.batch([
   e.DB.prepare("INSERT INTO documents(id,plan,status,payer_email,original_sha,created_at,expires_at) VALUES(?,?,?,?,?,?,?)").bind(id,plan,"awaiting_payment",a,await digest(bytes),now(),expiry),
   e.DB.prepare("INSERT INTO signers(id,document_id,email,slot) VALUES(?,?,?,?)").bind(uid(),id,a,0),
   e.DB.prepare("INSERT INTO signers(id,document_id,email,slot) VALUES(?,?,?,?)").bind(uid(),id,b,1)
  ]);
  const c=await checkout(e,{id,plan,email:a});
  await e.DB.prepare("UPDATE documents SET checkout_id=? WHERE id=?").bind(c.id,id).run();
  return reply({checkout_url:c.url});
 }catch(err){await e.DOCUMENTS.delete("original/"+id+".pdf");throw err}
}
async function paid(e,session){
 const d=await e.DB.prepare("SELECT * FROM documents WHERE id=?").bind(session.client_reference_id||"").first();
 if(!d||d.status!=="awaiting_payment"||d.checkout_id!==session.id||session.payment_status!=="paid"||session.currency!=="eur"||session.amount_total!==(d.plan==="enhanced"?399:199))return;
 const u=await e.DB.prepare("UPDATE documents SET status='invited',paid_at=? WHERE id=? AND status='awaiting_payment'").bind(now(),d.id).run();
 if(!u.meta.changes)return;
 const people=(await e.DB.prepare("SELECT * FROM signers WHERE document_id=? ORDER BY slot").bind(d.id).all()).results;
 for(const p of people){
  const token=random();await e.DB.prepare("UPDATE signers SET invite_hash=? WHERE id=?").bind(await digest(token),p.id).run();
  await mail(e,p.email,"JustPDFit : document à signer",'<p>Vous avez reçu une invitation personnelle pour signer un document.</p><p><a href="'+safe(signerLink(e,token))+'">Consulter et signer</a></p><p>Un code envoyé à votre adresse email sera exigé. Invitation valable 7 jours.</p>');
 }
}
async function stripeEvent(r,e){
 const raw=await r.text(),sig=r.headers.get("stripe-signature")||"",t=/t=(\d+)/.exec(sig)?.[1],v=[...sig.matchAll(/v1=([0-9a-f]+)/g)].map(x=>x[1]);
 // Stripe's signed message is timestamp + dot + exact raw payload.
 if(!t||Math.abs(now()-Number(t))>300||!v.length)abort("Webhook Stripe non authentifié",401);
 const expected=await hmac(e.STRIPE_WEBHOOK_SECRET,t+"."+raw);
 if(!v.some(x=>same(x,expected)))abort("Webhook Stripe non authentifié",401);
 const event=JSON.parse(raw);
 if(event.type==="checkout.session.completed"&&event.data.object.payment_status==="paid")await paid(e,event.data.object);
 return reply({received:true});
}
async function info(r,e){
 const s=await signer(e,new URL(r.url).searchParams.get("token"));
 return reply({email:s.email.replace(/^(.{1,2}).*(@.*)$/,"$1***$2"),status:s.status,document_status:s.document_status,plan:s.plan});
}
async function sendCode(r,e){
 const {token}=await bodyJSON(r),s=await signer(e,token);
 if(!["invited","completed"].includes(s.document_status))abort("Paiement non confirmé",403);
 if(s.otp_sent_at&&now()-s.otp_sent_at<60)abort("Attendez 60 secondes avant un nouvel envoi",429);
 if(s.otp_sends>=10)abort("Trop de tentatives",429);
 const code=String(crypto.getRandomValues(new Uint32Array(1))[0]%1000000).padStart(6,"0");
 await e.DB.prepare("UPDATE signers SET otp_hash=?,otp_exp=?,otp_attempts=0,otp_sent_at=?,otp_sends=otp_sends+1,session_hash=NULL WHERE id=?").bind(await digest(code+":"+s.id+":"+e.OTP_PEPPER),now()+600,now(),s.id).run();
 await mail(e,s.email,"Votre code de signature JustPDFit",'<p>Votre code JustPDFit : <strong style="font-size:24px">'+code+'</strong>.</p><p>Valable 10 minutes. Ne communiquez jamais ce code.</p>');
 return reply({sent:true});
}
async function verifyCode(r,e){
 const {token,code}=await bodyJSON(r),s=await signer(e,token);
 if(!/^\d{6}$/.test(String(code))||!s.otp_hash||s.otp_exp<now()||s.otp_attempts>=5)abort("Code invalide ou expiré",401);
 if(!same(await digest(code+":"+s.id+":"+e.OTP_PEPPER),s.otp_hash)){await e.DB.prepare("UPDATE signers SET otp_attempts=otp_attempts+1 WHERE id=?").bind(s.id).run();abort("Code incorrect",401)}
 const session=random();
 await e.DB.prepare("UPDATE signers SET session_hash=?,session_exp=?,otp_hash=NULL,verified_at=? WHERE id=?").bind(await digest(session),now()+3600,now(),s.id).run();
 return reply({session,plan:s.plan,status:s.status,kyc_status:s.kyc_status});
}
async function state(r,e){
 const s=await signer(e,new URL(r.url).searchParams.get("token"));await authenticate(r,e,s);
 return reply({status:s.status,document_status:s.document_status,plan:s.plan,kyc_status:s.kyc_status||"not_started"});
}
async function document(r,e){
 const s=await signer(e,new URL(r.url).searchParams.get("token"));await authenticate(r,e,s);
 const key=(s.document_status==="completed"?"final/":"original/")+s.document_id+".pdf";
 const o=await e.DOCUMENTS.get(key);if(!o)abort("Document indisponible",404);
 return new Response(o.body,{headers:{"content-type":"application/pdf","cache-control":"no-store","content-disposition":"attachment; filename=justpdfit-document.pdf","access-control-allow-origin":site(e)}});
}
async function diditStart(r,e){
 const {token}=await bodyJSON(r),s=await signer(e,token);await authenticate(r,e,s);
 if(s.plan!=="enhanced"||s.document_status!=="invited")abort("Identification non autorisée",403);
 if(s.kyc_status==="Approved")return reply({approved:true});
 if(s.kyc_id)abort("Une vérification existe déjà. Actualisez le statut.",409);
 const v=await fetch("https://verification.didit.me/v3/session/",{method:"POST",headers:{"x-api-key":e.DIDIT_API_KEY,"content-type":"application/json"},body:JSON.stringify({workflow_id:e.DIDIT_WORKFLOW_ID,vendor_data:s.id})});
 const j=await v.json();if(!v.ok||!j.session_id||!j.url)abort("Didit temporairement indisponible",502);
 await e.DB.prepare("UPDATE signers SET kyc_id=?,kyc_status='Pending' WHERE id=?").bind(j.session_id,s.id).run();
 return reply({url:j.url});
}
async function diditEvent(r,e){
 const raw=await r.text();const signature=(r.headers.get("x-signature-v2")||"").toLowerCase();
 if(!signature||!same(signature,await hmac(e.DIDIT_WEBHOOK_SECRET,raw)))abort("Webhook Didit non authentifié",401);
 const data=JSON.parse(raw),session=data.session_id||data.session?.session_id,status=data.status||data.session?.status;
 if(session&&["Approved","Declined","In Review","Resubmitted"].includes(status))await e.DB.prepare("UPDATE signers SET kyc_status=? WHERE kyc_id=?").bind(status,session).run();
 return reply({received:true});
}
async function buildFinal(e,id){
 const d=await e.DB.prepare("SELECT * FROM documents WHERE id=?").bind(id).first();
 if(!d||d.status!=="invited")return;
 const people=(await e.DB.prepare("SELECT * FROM signers WHERE document_id=? ORDER BY slot").bind(id).all()).results;
 if(people.length!==2||people.some(s=>s.status!=="signed"))return;
 const o=await e.DOCUMENTS.get("original/"+id+".pdf");if(!o)abort("Original introuvable",500);
 const pdf=await PDFDocument.load(await o.arrayBuffer());
 for(const p of people){
  const img=await e.DOCUMENTS.get("signature/"+p.id+".png");if(!img)abort("Signature manquante",500);
  const png=await pdf.embedPng(await img.arrayBuffer()),page=pdf.getPages()[p.page_index];
  if(!page)abort("Page de signature invalide",500);
  page.drawImage(png,{x:p.sig_x*page.getWidth(),y:(1-p.sig_y-p.sig_h)*page.getHeight(),width:p.sig_w*page.getWidth(),height:p.sig_h*page.getHeight()});
 }
 const cert=pdf.addPage([595,842]),font=await pdf.embedFont(StandardFonts.Helvetica);
 let y=790;const line=(s,size=11)=>{cert.drawText(String(s).replace(/[^\x20-\x7e]/g,"?").slice(0,98),{x:38,y,size,font,color:rgb(.13,.2,.35)});y-=size+13};
 line("JustPDFit - Signature audit certificate",19);y-=16;
 line("Document ID: "+id);line("Original file SHA-256:");line(d.original_sha,10);
 line("Verification: "+(d.plan==="enhanced"?"Email OTP + Didit":"Email OTP"));line("Completed UTC: "+new Date().toISOString());
 for(const [i,p] of people.entries()){y-=15;line("Signer "+(i+1)+": "+p.email);line("Email verified UTC: "+new Date(p.verified_at*1000).toISOString());line("Signed UTC: "+new Date(p.signed_at*1000).toISOString());line("Identity check: "+(p.kyc_status||"email-only"));line("Explicit consent recorded: yes");}
 y-=20;line("Evidence summary - NOT a qualified electronic signature.",10);
 const result=await pdf.save(),hash=await digest(result);
 await e.DOCUMENTS.put("final/"+id+".pdf",result,{httpMetadata:{contentType:"application/pdf"}});
 const u=await e.DB.prepare("UPDATE documents SET status='completed',final_sha=?,completed_at=? WHERE id=? AND status='invited'").bind(hash,now(),id).run();
 if(u.meta.changes)for(const p of people)await mail(e,p.email,"JustPDFit : votre document signé",'<p>Les deux signatures ont été recueillies.</p><p>Ouvrez votre invitation initiale et confirmez votre adresse email pour télécharger le PDF final et son certificat de preuve.</p>');
}
async function sign(r,e){
 const b=await bodyJSON(r),s=await signer(e,b.token);await authenticate(r,e,s);
 if(s.document_status!=="invited"||s.status!=="pending")abort("Signature impossible pour ce dossier",409);
 if(s.plan==="enhanced"&&s.kyc_status!=="Approved")abort("Vérification Didit requise",403);
 const {signature,page,x,y,w,h,consent}=b;
 if(consent!==true||!Number.isInteger(page)||page<0||![x,y,w,h].every(Number.isFinite)||x<0||y<0||w<=0||h<=0||x+w>1||y+h>1)abort("Consentement ou position invalides");
 if(typeof signature!=="string"||!/^data:image\/png;base64,/.test(signature)||signature.length>500000)abort("Image de signature invalide");
 const bytes=Uint8Array.from(atob(signature.split(",")[1]),c=>c.charCodeAt(0));
 const original=await e.DOCUMENTS.get("original/"+s.document_id+".pdf");const pdf=await PDFDocument.load(await original.arrayBuffer());
 if(page>=pdf.getPageCount())abort("Page inconnue");
 try{await pdf.embedPng(bytes)}catch{abort("Signature PNG invalide")}
 await e.DOCUMENTS.put("signature/"+s.id+".png",bytes,{httpMetadata:{contentType:"image/png"}});
 const u=await e.DB.prepare("UPDATE signers SET status='signed',signed_at=?,page_index=?,sig_x=?,sig_y=?,sig_w=?,sig_h=? WHERE id=? AND status='pending'").bind(now(),page,x,y,w,h,s.id).run();
 if(!u.meta.changes)abort("Signature déjà apposée",409);
 await buildFinal(e,s.document_id);
 return reply({signed:true});
}
export default {
 async fetch(r,e){
  const origin=r.headers.get("origin"),siteOrigin=site(e);
  if(origin&&origin!==siteOrigin)return reply({error:"Origine non autorisée"},403,siteOrigin);
  if(r.method==="OPTIONS")return new Response(null,{headers:{"access-control-allow-origin":siteOrigin,"access-control-allow-headers":"content-type,authorization","access-control-allow-methods":"GET,POST,OPTIONS"}});
  const path=new URL(r.url).pathname;
  try{
   if(path==="/api/health")return reply({ok:true,enabled:ready(e)});
   if(path==="/api/stripe-webhook"&&r.method==="POST")return await stripeEvent(r,e);
   if(path==="/api/didit-webhook"&&r.method==="POST")return await diditEvent(r,e);
   if(!ready(e))abort("Service de signatures à deux non activé",503);
   if(path==="/api/draft"&&r.method==="POST")return await create(r,e);
   if(path==="/api/invitation"&&r.method==="GET")return await info(r,e);
   if(path==="/api/otp/send"&&r.method==="POST")return await sendCode(r,e);
   if(path==="/api/otp/verify"&&r.method==="POST")return await verifyCode(r,e);
   if(path==="/api/document"&&r.method==="GET")return await document(r,e);
   if(path==="/api/didit/start"&&r.method==="POST")return await diditStart(r,e);
   if(path==="/api/state"&&r.method==="GET")return await state(r,e);
   if(path==="/api/sign"&&r.method==="POST")return await sign(r,e);
   return reply({error:"Route inconnue"},404);
  }catch(err){return reply({error:err.message||"Erreur interne"},err.status||500);}
 },
 async scheduled(event,e){
  const expired=(await e.DB.prepare("SELECT id FROM documents WHERE expires_at<? LIMIT 100").bind(now()).all()).results;
  for(const d of expired){const people=(await e.DB.prepare("SELECT id FROM signers WHERE document_id=?").bind(d.id).all()).results;
   await Promise.all(["original/"+d.id+".pdf","final/"+d.id+".pdf",...people.map(p=>"signature/"+p.id+".png")].map(k=>e.DOCUMENTS.delete(k)));
   await e.DB.prepare("DELETE FROM signers WHERE document_id=?").bind(d.id).run();await e.DB.prepare("DELETE FROM documents WHERE id=?").bind(d.id).run();
  }
 }
};
