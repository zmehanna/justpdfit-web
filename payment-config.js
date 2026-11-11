/* JustPDFit.com production payment routing.
 * Public website only. The Stripe key and webhook secret stay exclusively
 * in Cloudflare Worker Secrets; never embed them in this file.
 * To suspend paid orders instantly, set endpoint to null and redeploy.
 */
window.JustPDFitPaymentConfig = {
  endpoint: "https://justpdfit-payments-live.zmehanna.workers.dev"
};
