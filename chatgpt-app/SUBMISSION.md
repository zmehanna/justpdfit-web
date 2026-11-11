# JustPDFit for ChatGPT — submission dossier (draft)

**Listing name:** JustPDFit

**Developer:** KL-MEHANNA

**Website:** https://justpdfit.com/

**Category:** Productivity / Documents (select the closest available category)

**Tagline:** Merge, organize, annotate, sign visually, and convert PDF documents in ChatGPT.

**Description (EN):** JustPDFit helps you manage everyday PDF tasks in a conversational workspace. Combine files, extract or rearrange pages, rotate documents, add visible annotations or signatures, inspect pages and create PDFs from images. Preview and download results in ChatGPT. Free processed PDFs include a small JustPDFit watermark. Visual signatures are not certified digital signatures.

**Description (FR):** JustPDFit permet de fusionner, extraire, réorganiser et faire pivoter des pages PDF, d'ajouter des annotations et des signatures visuelles et de convertir des images en PDF. Prévisualisez et téléchargez le résultat dans ChatGPT. Les documents gratuits comportent un discret filigrane JustPDFit. Les signatures visuelles ne sont pas des signatures électroniques certifiées.

**Description (AR):** يساعدك JustPDFit على دمج ملفات PDF واستخراج صفحاتها وإعادة ترتيبها وتدويرها وإضافة تعليقات وتوقيعات مرئية وتحويل الصور إلى PDF. يمكنك معاينة النتائج وتنزيلها داخل ChatGPT. تتضمن الملفات المجانية علامة مائية صغيرة. التوقيع المرئي ليس توقيعًا رقميًا معتمدًا.

**Prompts:**
- Merge these PDF files into one document.
- Extract pages 2, 4 and 7 from my PDF.
- Add a visible signature to the last page.

**Tool safety:** PDF input bytes are transferred to the external JustPDFit MCP server when a user invokes a processing operation. The preview widget uses local browser file selection, not automatic access to all ChatGPT conversation attachments. The current prototype performs no persistent document storage at application level, but this does not guarantee absence of hosting/service logs or upstream data handling. Avoid confidential files until verified operational privacy controls are in place.

**Pricing:** Free outputs include a small watermark. Do not claim that paid removal works inside ChatGPT; it is not implemented. Any web checkout must be reviewed against current platform commerce policies.

**Support URL:** https://justpdfit.com/support/ (verified reachable 2026-11-11).
**Privacy URL:** https://justpdfit.com/chatgpt-privacy.html (publicly accessible 2026-11-11; legal review pending).
**Terms URL:** https://justpdfit.com/chatgpt-terms.html (draft added; live accessibility and legal review pending).
**MCP URL:** https://justpdfit-chatgpt-mcp.onrender.com/mcp (Render live; /health verified externally with ok:true and version 0.2.0; actual MCP tool invocation NOT yet verified).
**Icon/hero assets:** Still required per applicable listing specifications.
**Countries:** Select worldwide availability where policy permits.
**Language support:** UI currently English; tool names/descriptions currently English. FR/AR listing translations above are not a substitute for localized in-app UI.

## Review checklist
- [ ] Confirm production HTTPS endpoint and access controls
- [ ] Validate all tools against actual PDF samples, including malformed input and size limits
- [ ] Test ChatGPT developer mode UI, preview, upload, and download
- [ ] Establish rate limits, abuse prevention, monitoring, retention and privacy review
- [ ] Verify support, privacy and terms pages
- [ ] Complete user-facing localization before claiming multilingual feature parity
- [ ] Confirm official app identity/ownership and asset permissions
- [ ] Submit through the official developer console and retain submission receipt
- [ ] Record review status and remediate feedback

**Current status (2026-11-11):** Render HTTPS deployment is live (service srv-dbqa990u01pc73a94g1g, commit 0378f10900b9b1c62d38fe8433a3e3cc8c513094). /health is externally verified. ChatGPT developer-mode interactions, file uploads/downloads and tool invocations remain UNTESTED. The build surfaced a high-severity npm dependency advisory requiring triage. Privacy and terms HTML are draft, not yet legally approved. NOT submitted.
