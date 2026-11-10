# JustPDFit signature watermark and payments

## Current status

- **Free individual signing** works entirely in the browser. Every page of the signed PDF receives a visible, clickable footer reading **Signé avec JustPDFit.com**, linked to https://justpdfit.com/.
- **Remove watermark: 1.99 EUR per document**. The interface and secure checkout adapter are implemented but **disabled by default**. Do not activate before configuring a dedicated JustPDFit Stripe account and payment backend.
- **Two signers**: existing standard/Didit service remains in preparation. The removal checkbox adds 1.99 EUR to the existing price (standard 1.99 -> 3.98 EUR; Didit 3.99 -> 5.98 EUR). Payment and counter-signature flows are not live, so the duo checkout button remains disabled.

**Never reuse FairTaxy Stripe keys or products for JustPDFit.**

## Deployment prerequisites

1. Set up or connect a dedicated **JustPDFit** Stripe account (with an account appropriate for the legal selling entity). Enable the desired payment methods.
2. Deploy `payments/worker.js` as a **separate Cloudflare Worker** under an HTTPS domain (e.g. `payments.justpdfit.com` if you control and configure that subdomain).
3. Configure `STRIPE_SECRET_KEY` as a **Cloudflare Worker secret** (not in GitHub, Pages, or JavaScript).
4. Verify that Stripe Checkout creates a **EUR 1.99** session and that `/verify` only returns `paid:true` after payment was confirmed server-side.
5. Set `endpoint` in the public `payment-config.js` to the Worker HTTPS origin. This enables the clean-download checkout button; keep `endpoint:null` if the Worker or Stripe account is not ready.
6. Test both completed and cancelled sessions with Stripe test keys on a **separate test deployment** before switching to a JustPDFit live key.
7. Publish a payment/refund policy and update the JustPDFit support/privacy pages, including the document SHA-256 fingerprint that is shared with the payment backend (not PDF content).

## Payment flow

- For the free choice, `sign-engine.js` uses pdf-lib to add visible footer text and real PDF link annotations on **all pages**, even pages without a signature.
- For the paid choice, no watermark-free PDF can be downloaded until the backend confirms that a Stripe Checkout session is `complete` and `paid`, has EUR 1.99 total, and the `metadata.fingerprint` equals the original PDF's SHA-256 hash.
- The Checkout page opens in **another browser tab** to preserve the local PDF and signature state. After payment, return to the original tab and select **Vérifier le paiement**.
- The document hash binds the upgrade to the original PDF, allowing users to edit signature positions before downloading the same document. Because all PDF processing is intentionally client-side, client-side tools cannot fully prevent deliberate modification of the open-source JavaScript to bypass a paywall. If strict enforcement is required, use authenticated server-side document rendering, explicitly disclose PDF upload and retention, and redesign privacy guarantees accordingly.

## Security

- Do not trust a browser redirect or URL parameter as proof of payment.
- Never process client-supplied prices or allow changing the 199-cent amount in the browser.
- Use allowed-origin CORS in the Worker and HTTPS for both the site and the Worker.
- The Stripe secret stays server-side; no Stripe API call is made from the public page directly.
- Stripe session status is checked **on the server**. There is no payment verification based only on localStorage, a client field, or the success URL.
- No PDF bytes or raw signature images are sent to Stripe.
