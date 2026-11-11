# JustPDFit Stripe deployment — 2026-11-11

## Infrastructure created and verified

Cloudflare account: `Zmehanna@gmail.com's Account` (authenticated through the authorized Windows VPS).

| Environment | Worker | D1 database | Payments |
| --- | --- | --- | --- |
| Test | https://justpdfit-payments-sandbox.zmehanna.workers.dev | `justpdfit-payments-sandbox` | Disabled (Stripe credentials not configured) |
| Live | https://justpdfit-payments-live.zmehanna.workers.dev | `justpdfit-payments-live` | Disabled (Stripe credentials not configured) |

**Live Stripe account allowlist: `acct_1UaLHoEQp3CN3XtA` — JustPDFit.com ONLY.**

FairTaxy (`acct_1UWgA3L7h2qjW2we`) is refused in Live mode. No FairTaxy Cloudflare service, D1 database or Stripe account was modified.

Both remote D1 databases have the `0001_orders.sql` and `0002_revocations.sql` migrations applied, and the tables `payment_orders`, `stripe_events`, `revoked_payment_intents` were verified via remote D1 SQL. Both Workers are deployed under isolated workers.dev hostnames, without changing DNS, GitHub Pages, or iOS deployment.

External smoke tests with `Origin: https://justpdfit.com`:
- `GET /health` -> HTTP 200, `status: disabled` (expected until secrets are configured).
- `POST /checkout` -> HTTP 503 (fail closed, no payment is created).
- `POST /webhook` without signature -> HTTP 503 (cannot fulfill without webhook secret).

Local Node mocked tests: **18/18 pass**. Local Wrangler D1 migrations and runtime smoke tests passed. GitHub Actions has succeeded on this branch. **No real Stripe Checkout/paid transaction has yet been validated.**

## Remaining secure setup (do not put keys in GitHub or chat)

### 1. Stripe JustPDFit test sandbox

In Stripe Dashboard, switch to **JustPDFit.com**, not FairTaxy. Create/use a separate Stripe sandbox, and create a restricted sandbox API key that allows reading account details and reading/creating Checkout Sessions (plus any additional necessary product/price permissions when using inline `price_data`). Record the sandbox account ID `acct_...`.

In Cloudflare -> Workers & Pages -> `justpdfit-payments-sandbox` -> Settings -> Variables and Secrets:
- Set `STRIPE_EXPECTED_ACCOUNT_ID` to the sandbox account ID, as a non-secret variable or secret (the sandbox Wrangler config deliberately does not include it).
- Set `STRIPE_RESTRICTED_KEY` as an encrypted **Secret** (prefix `rk_test_`, never commit it).
- Create a Stripe webhook destination for `https://justpdfit-payments-sandbox.zmehanna.workers.dev/webhook`; set its supplied `whsec_...` as the Worker **Secret** `STRIPE_WEBHOOK_SECRET`.

Subscribe the webhook destination to:
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `charge.refunded`
- `charge.dispute.created`

Test all paths with Stripe's sandbox Checkout, including a successful 1.99 EUR purchase, a cancelled Checkout, a wrong-fingerprint verification, webhook delivery and refund. Confirm both the signed webhook and the D1 order status. Never use FairTaxy test credentials.

### 2. JustPDFit Live Stripe account

In Stripe Dashboard, switch to JustPDFit.com (`acct_1UaLHoEQp3CN3XtA`). Create a dedicated restricted LIVE API key for Checkout, with account-read and required Checkout read/write permissions. Store it ONLY in the `justpdfit-payments-live` Worker's encrypted Secret `STRIPE_RESTRICTED_KEY`.

Create a **Live** Stripe webhook destination for:
`https://justpdfit-payments-live.zmehanna.workers.dev/webhook`
Subscribe to the same 5 events listed above and save the Stripe-provided `whsec_...` as the **encrypted** Secret `STRIPE_WEBHOOK_SECRET` on the **Live** Worker.

The publicly known `STRIPE_EXPECTED_ACCOUNT_ID = acct_1UaLHoEQp3CN3XtA` is already present in the Live Worker configuration and hard-pinned in the Worker source. The Worker fails closed if `GET /v1/account` reports another account, even if a Live key exists.

Review tax settings/registrations, the legal merchant's details, refund rights, receipts and consumer disclosures before the first Live charge.

### 3. Verify, then activate the website

After secrets have been configured, request `GET /health` with `Origin: https://justpdfit.com`:
```json
{"service":"justpdfit-payments","status":"configured","mode":"live"}
```
Then verify a real test/Live Checkout session can be created with the correct merchant and amount, receipt and signed webhook are delivered, and the matching original PDF can be downloaded without a watermark.

Only after that, edit **the public root** `payment-config.js` to:
```js
window.JustPDFitPaymentConfig = {
  endpoint: "https://justpdfit-payments-live.zmehanna.workers.dev"
};
```
The current public `payment-config.js` has `endpoint: null` and therefore checkout remains disabled. The free PDF service remains fully available.

Production Web checkout is **not** Apple iOS in-app purchase compliance. Do not enable the paid native app path without reviewing Apple requirements.

## Maintenance

Production configuration: `payments/wrangler.live.toml` (non-secret account and D1 IDs).
Sandbox configuration: `payments/wrangler.sandbox.toml`.
Worker source: `payments/worker.js`.
DB migrations: `payments/migrations/`.
Local/CI tests: `npm test --prefix payments`.

The code repository is `zmehanna/justpdfit-web`, deployed on GitHub Pages; the payment Workers are separate Cloudflare projects. Never replace the GitHub Pages domain's IONOS DNS records to deploy the payment Worker.

## Incident de deploiement Cloudflare du 11 novembre 2026

L'ajout du secret `STRIPE_WEBHOOK_SECRET` via l'interface Cloudflare a retourne `binding PAYMENTS_DB of type d1 failed to generate` (`code: 10021`). Le meme probleme a ete reproduit sur le VPS avec Wrangler CLI en tentant de redeployer les Workers JustPDFit **Live** et **sandbox**. La base D1 Live existe et repond toujours aux interrogations SQL.

Diagnostic d'isolation :
- Nouveau Worker provisoire **avec** liaison `PAYMENTS_DB` vers D1 sandbox : **erreur 10021**, identique
- Nouveau Worker provisoire **sans** aucune liaison D1 : deploiement **reussi**; ce Worker diagnostique a ensuite ete supprime
- Les Workers de paiement deja deployes restent disponibles, mais refusent le Checkout car le secret webhook n'est pas present
- Le 11 novembre 2026, Cloudflare signale un statut Workers degrade; correlation plausible, causalite non demontree

Ne supprimez pas les bases D1, les liaisons ou les Workers existants en tentative de correction : le code et les bases sont verifies et le probleme est reproduit hors du dashboard. Conserver le paiement public desactive (`payment-config.js` `endpoint: null`) jusqu'a un deploiement reussi avec les secrets et des tests Stripe reellement valides. Apres retablissement, placer `STRIPE_WEBHOOK_SECRET` uniquement dans les Secrets Cloudflare via l'interface ou `wrangler secret put STRIPE_WEBHOOK_SECRET --config wrangler.live.toml`, saisir le secret directement dans le terminal du VPS, puis verifier avec `wrangler secret list` (noms uniquement) et `/health`. La cle ne doit jamais apparaitre dans GitHub, le chat, les logs ou un script.

## Reverification Cloudflare 2026-11-11 (apres ajout secret)

Le VPS Wrangler confirme maintenant que les **deux noms de secrets** existent sur `justpdfit-payments-live`: `STRIPE_RESTRICTED_KEY` et `STRIPE_WEBHOOK_SECRET` (leurs valeurs ne sont pas lues et ne figurent pas dans GitHub).

- `GET https://justpdfit-payments-live.zmehanna.workers.dev/health` avec l'origine JustPDFit -> **HTTP 200**, `{"service":"justpdfit-payments","status":"configured","mode":"live"}`.
- `POST /webhook` **sans** signature Stripe -> **HTTP 400** (rejet attendu).
- La base D1 Live contient bien `payment_orders`, `stripe_events` et `revoked_payment_intents`.
- Les succes ci-dessus **ne prouvent pas** qu'un paiement Checkout a ete cree ni qu'un evenement webhook Stripe signe a ete livre. Realiser encore les validations de bout en bout avant d'activer la boutique publique. Le fichier public `payment-config.js` reste sur `endpoint: null`.

L'erreur Cloudflare `10021` deja diagnostiquee a ete constatee sur plusieurs tentatives de mise a jour D1, mais le secret Live a ensuite ete enregistre par l'utilisateur. Ne pas en deduire que toutes les tentatives de redeploiement D1 fonctionneront.


## Validation HTTP réelle du Checkout Live — 11 novembre 2026

Tests non facturants effectués depuis le VPS sur le Worker public `https://justpdfit-payments-live.zmehanna.workers.dev` avec une empreinte SHA-256 fictive (aucun document privé transmis) :

| Test | Résultat |
| --- | --- |
| `POST /checkout`, `kind=solo-clean` | **HTTP 200**, session `cs_live_...` créée |
| URL Checkout retournée | Domaine **`checkout.stripe.com`** |
| `POST /verify`, session non payée, empreinte correcte | `paid:false` |
| `POST /verify`, même session, autre empreinte | `paid:false` |
| `POST /checkout`, signature duo non livrable | **HTTP 422** |
| `POST /checkout`, origine non autorisée | **HTTP 403** |
| Webhook sans signature | **HTTP 400** |

L'émission de la session Live implique que le Worker a vérifié avec l'API Stripe que la clé appartient au compte **JustPDFit `acct_1UaLHoEQp3CN3XtA`**. Les frais Checkout sont fixés côté serveur à `199` centimes d'EUR dans `payments/worker.js`. Aucun paiement réel n'a été effectué ni validé. La consultation manuelle de la page de paiement, la réception Stripe d'un paiement de test réussi, le webhook signé et le déblocage post-paiement restent **non validés**.

Le Worker sandbox `justpdfit-payments-sandbox` n'a actuellement **aucun secret** configuré (`wrangler secret list` retourne `[]`), donc aucun paiement de test Stripe n'a pu être effectué. Pour valider intégralement sans frais réels : configurer une sandbox Stripe JustPDFit avec clé restreinte `rk_test_...`, identifiant du compte sandbox `STRIPE_EXPECTED_ACCOUNT_ID`, et webhook sandbox dédié dont le secret signé `whsec_...` est enregistré dans Cloudflare. Puis payer avec un moyen de paiement test Stripe et vérifier D1 + `/verify`.

**Ne pas encore fusionner la configuration de paiement dans le site public** : `payment-config.js` reste `endpoint:null` sur `main`. Ne pas présenter ces tests comme la validation d'un paiement réussi.


## Site Live active le 11 novembre 2026

L'activation publique du paiement **solo-sans-filigrane (1,99 EUR par PDF)** a ete demandee par le proprietaire du site et effectuee le 11 novembre 2026. Les autres options de signature a deux ne sont pas activables.

- Worker Live redeploye avec la version renforcee (`workers.dev`), secrets `STRIPE_RESTRICTED_KEY` et `STRIPE_WEBHOOK_SECRET` confirmes par leur nom uniquement.
- `GET /health` Live : `configured`; webhook non signe : HTTP 400 (refuse).
- `POST /checkout` Live : session `cs_live_...` creee, URL `checkout.stripe.com`; session non payee `/verify` retourne `paid:false`.
- PR #4 fusionnee sur `main`; `payment-config.js` public pointe sur le Worker Live. La page `sign/index.html` charge `payment-config.js?v=20261111-live` pour eviter les anciennes versions en cache.
- GitHub Pages deployment reussi; requetes externes reelles confirment le script versionne et le Worker Live sur https://justpdfit.com/sign/.
- Le contenu du fichier public ne contient aucune cle Stripe.

**Validation restante** : aucune transaction avec carte reelle / reussie n'a ete effectuee depuis le site dans ces tests. La livraison d'un evenement webhook signe par Stripe, l'ecriture de l'ordre en D1 apres paiement, et le PDF sans filigrane apres paiement doivent etre verifies au moyen d'un achat reel controle. L'utilisateur est averti que tout paiement accepte en Live debite reellement 1,99 EUR. En cas de probleme, rollback immediat en placant `endpoint:null` dans `payment-config.js` puis en redéployant GitHub Pages.
