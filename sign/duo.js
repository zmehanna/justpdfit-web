(() => {
const API="https://sign-api.justpdfit.com";
document.addEventListener("DOMContentLoaded", async () => {
 const $=id=>document.getElementById(id),button=$("startDuo"),status=$("duoStatus");
 if(!button||!status)return;
 const message=(s,bad=false)=>{status.textContent=s;status.style.color=bad?"#b8324b":"#5274b4"};
 button.disabled=true;
 async function availability(){
  try {
   const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),6000);
   const res=await fetch(API+"/api/health",{signal:controller.signal,cache:"no-store"});clearTimeout(timeout);
   const data=await res.json();
   if(res.ok&&data.enabled===true){button.disabled=false;message("Paiement sécurisé disponible. Les invitations seront envoyées après confirmation Stripe.");return}
   message("Les signatures à deux ne sont pas encore activées. Aucun paiement ne sera demandé.");
  }catch{message("Paiement temporairement indisponible. Réessayez plus tard.",true)}
 }
 button.addEventListener("click",async()=>{
  const file=$("duoFile").files[0],a=$("signerA").value.trim(),b=$("signerB").value.trim();
  const plan=$("verifyDidit").checked?"enhanced":"standard";
  if(!file||file.size>10e6||file.type!=="application/pdf"&&!/\.pdf$/i.test(file.name)){message("Choisissez un fichier PDF de 10 Mo maximum.",true);return}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b)||a.toLowerCase()===b.toLowerCase()){message("Indiquez deux adresses email distinctes et valides.",true);return}
  button.disabled=true;message("Préparation du paiement Stripe…");
  try{
   const data=new FormData();data.append("file",file);data.append("signer_a",a);data.append("signer_b",b);data.append("plan",plan);
   const res=await fetch(API+"/api/draft",{method:"POST",body:data});
   const body=await res.json();
   if(!res.ok||!body.checkout_url)throw Error(body.error||"Impossible d'initialiser le paiement");
   const url=new URL(body.checkout_url);if(url.protocol!=="https:"||!(url.hostname==="checkout.stripe.com"||url.hostname.endsWith(".checkout.stripe.com")))throw Error("Adresse de paiement non reconnue");
   location.assign(url.href);
  }catch(e){message(e.message||"Le paiement n'a pas pu être préparé.",true);button.disabled=false}
 });
 const p=new URLSearchParams(location.search).get("payment");
 if(p==="success")message("Paiement reçu par Stripe. Les invitations sont envoyées après confirmation du paiement. Vérifiez les deux boîtes email.");
 if(p==="cancel")message("Paiement annulé. Aucune invitation n'a été envoyée.");
 await availability();
});
})();