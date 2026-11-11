import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

// Evaluate the browser signing integration without uploading a PDF or
// creating a Stripe charge. The selected site language must be read at click
// time (not cached when the page was loaded).
const source = readFileSync(new URL("../sign-watermark.js", import.meta.url), "utf8");

test("browser sends current JustPDFit language to Stripe for each checkout", async () => {
  let language = "en";
  const sent = [];
  const window = {
    JustPDFitPaymentConfig: { endpoint: "https://justpdfit-payments-live.zmehanna.workers.dev" },
    JustPDFItI18n: { getLanguage: () => language }
  };
  const fetch = async (url, init) => {
    assert.ok(String(url).endsWith("/checkout"));
    sent.push(JSON.parse(init.body));
    return { ok: true, json: async () => ({ sessionId: "cs_test_example", checkoutUrl: "https://checkout.stripe.com/c/pay/example" }) };
  };
  vm.runInNewContext(source, { window, fetch, crypto: globalThis.crypto });
  const fingerprint = "a".repeat(64);
  for (const lang of ["en", "fr", "es", "ar"]) {
    language = lang;
    await window.JustPDFitWatermark.createCheckout(fingerprint);
  }
  assert.deepEqual(sent.map(({ locale }) => locale), ["en", "fr", "es", "ar"]);
  assert.ok(sent.every(row => row.kind === "solo-clean" && row.fingerprint === fingerprint));
});
