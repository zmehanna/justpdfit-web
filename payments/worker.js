/**
 * Dedicated JustPDFit.com Stripe Checkout Worker (not deployed until a dedicated
 * JustPDFit Stripe account and secret key have been configured).
 *
 * Public routes:
 * POST /checkout { kind:"solo-clean", fingerprint:"<sha256 hex>" }
 * POST /verify { sessionId:"cs_...", fingerprint:"<sha256 hex>" }
 * Requires STRIPE_SECRET_KEY in Worker secrets (never in GitHub Pages).
 *
 * No PDF bytes, images, signature strokes or document names are uploaded here.
 * Checkout uses the PDF SHA-256 fingerprint solely to bind a receipt to a document.
 */
const ORIGINS = new Set(["https://justpdfit.com","https://www.justpdfit.com"]);
const STRIPE_API="https://api.stripe.com/v1";
const sha256=/^[a-f0-9]{64}$/i;

function response(origin, body, code=200){
 return new Response(JSON.stringify(body),{
  status:code,headers:{
   "Content-Type":"application/json; charset=utf-8",
   "Cache-Control":"no-store",
   "Vary":"Origin",
   "Access-Control-Allow-Origin":ORIGINS.has(origin)?origin:"https://justpdfit.com",
   "Access-Control-Allow-Methods":"POST, OPTIONS",
   "Access-Control-Allow-Headers":"Content-Type"
  }
 });
}
async function stripe(env,path,options={}){
 const result=await fetch(STRIPE_API+path,{
  ...options,
  headers:{"Authorization":"Bearer "+env.STRIPE_SECRET_KEY,...options.headers}
 });
 const data=await result.json().catch(()=>({}));
 if(!result.ok)throw Error("Stripe: "+(data.error?.message||"Service indisponible."));
 return data;
}
export default {
 async fetch(request,env){
  const origin=request.headers.get("Origin")||"";
  if(request.method==="OPTIONS"){
   if(!ORIGINS.has(origin))return new Response(null,{status:403});
   return new Response(null,{status:204,headers:{
    "Access-Control-Allow-Origin":origin,
    "Access-Control-Allow-Methods":"POST, OPTIONS",
    "Access-Control-Allow-Headers":"Content-Type","Access-Control-Max-Age":"7200"
   }});
  }
  if(!ORIGINS.has(origin))return response(origin,{error:"Origine non autorisée."},403);
  const url=new URL(request.url);
  if(request.method!=="POST"||!["/checkout","/verify"].includes(url.pathname))return response(origin,{error:"Route inconnue."},404);
  if(!env.STRIPE_SECRET_KEY||!env.STRIPE_SECRET_KEY.startsWith("sk_"))return response(origin,{error:"Paiement non activé."},503);
  let data;
  try{data=await request.json();}catch{return response(origin,{error:"Requête JSON invalide."},400);}
  if(!data||!sha256.test(data.fingerprint||""))return response(origin,{error:"Identifiant de document invalide."},400);
  try{
   if(url.pathname==="/checkout"){
    if(data.kind!=="solo-clean")return response(origin,{error:"Option non disponible."},400);
    const form=new URLSearchParams();
    form.set("mode","payment");
    form.set("payment_method_collection","always");
    form.set("line_items[0][price_data][currency]","eur");
    form.set("line_items[0][price_data][unit_amount]","199");
    form.set("line_items[0][price_data][product_data][name]","JustPDFit - Signature PDF sans filigrane");
    form.set("line_items[0][quantity]","1");
    form.set("metadata[kind]","solo-clean");
    form.set("metadata[fingerprint]",data.fingerprint.toLowerCase());
    form.set("client_reference_id",crypto.randomUUID());
    form.set("success_url","https://justpdfit.com/sign/?payment=success&session_id={CHECKOUT_SESSION_ID}");
    form.set("cancel_url","https://justpdfit.com/sign/?payment=cancelled");
    const session=await stripe(env,"/checkout/sessions",{
     method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
     body:form
    });
    if(!session.id||!session.url)return response(origin,{error:"Session Stripe invalide."},502);
    return response(origin,{sessionId:session.id,checkoutUrl:session.url});
   }
   const sessionId=String(data.sessionId||"");
   if(!/^cs_(test_|live_)[a-zA-Z0-9]+$/.test(sessionId))return response(origin,{error:"Identifiant de paiement invalide."},400);
   const session=await stripe(env,"/checkout/sessions/"+encodeURIComponent(sessionId));
   const valid=session.mode==="payment" &&
    session.status==="complete" &&
    session.payment_status==="paid" &&
    session.amount_total===199 &&
    session.currency==="eur" &&
    session.metadata?.kind==="solo-clean" &&
    session.metadata?.fingerprint===data.fingerprint.toLowerCase();
   return response(origin,{paid:!!valid});
  }catch(error){
   // Never disclose payment credentials or sensitive Stripe response internals.
   return response(origin,{error:/Stripe/.test(error.message)?"Service de paiement momentanément indisponible.":"Impossible de vérifier le paiement."},502);
  }
 }
};
