# JustPDFit — OpenAI public plugin submission materials (draft)

## Status
Prepared for **With MCP** public submission. NOT submitted; no approval or public publication.
The endpoint is accessible and build-tested, but end-to-end chat attachment hand-off, in-widget page preview and actual browser download have not yet been proven.

## Listing fields
- Package name: `justpdfit`
- Version: `0.6.0`
- Display name: `JustPDFit`
- Short description: `Edit, organize and sign PDFs`
- Developer identity: choose the verified OpenAI Platform developer or business identity that actually owns JustPDFit. Do not invent verification.
- Category: select a permitted Productivity/Documents category in the form.
- Website: https://justpdfit.com/
- Support: https://justpdfit.com/support/
- Privacy: https://justpdfit.com/chatgpt-privacy.html
- Terms: https://justpdfit.com/chatgpt-terms.html
- MCP URL: https://justpdfit-chatgpt-mcp.onrender.com/mcp
- Server URL mode: Universal
- Authentication: None. The endpoint is public but rate-limited; never say individual user accounts are authenticated.
- Supported UI language: English for the current embedded editor. The website serves additional languages, but ChatGPT widget translations are incomplete.
- Price: Free export with a small JustPDFit.com watermark. Paid watermark removal and certified signatures are NOT available inside this ChatGPT plugin.
- User content: PDFs submitted to MCP are processed remotely by JustPDFit on Render. Do not claim processing stays on the user's device.
- File size: 2 MB per input PDF in this preview. Operations like merge may require smaller combined inputs.
- Signature: visual only, not a cryptographically certified or identity-verified signature.
- Description:
  `Edit everyday PDF files directly from ChatGPT with JustPDFit. Merge multiple PDFs, extract and reorder pages, rotate pages, overlay text annotations, add a visual signature after checking its position, inspect page dimensions, re-save PDFs and convert JPEG/PNG images into a PDF. A free export includes a small JustPDFit watermark. Signature suggestions based on searchable text must be visually verified, especially for scanned PDFs. Files sent for processing are transferred to the JustPDFit MCP server, rather than handled locally on your device. The current plugin supports up to 2 MB per PDF and does not offer certified digital signatures or paid watermark removal.`
- Capabilities (review for form limits): Merge PDFs; Extract/reorder/rotate pages; Add visible text annotations; Preview and add visual typed signatures; Inspect PDF dimensions; Convert PNG/JPEG images to PDF; Create synthetic test PDFs.
- Starter prompts (max 3):
  1. `Create a sample PDF in JustPDFit so I can test the editor.`
  2. `Inspect my PDF and extract pages 1 and 3 into a new file.`
  3. `Suggest where to sign my PDF and ask for my approval before signing.`
- Release notes:
  `Initial release of JustPDFit for ChatGPT. Includes PDF inspection, merge, extraction, page reorder and rotation, annotation overlays, image conversion, and explicitly confirmed visual signature placement. Synthetic demo PDFs and a review-first signature workflow are available. No certified signatures, account login, or paid export in this release.`

## Five positive reviewer test cases

1. **Create a demo PDF.**
   - Prompt: `Using JustPDFit, create a tiny demo PDF. Use no personal data.`
   - Expected tool: `create_demo_pdf`.
   - Expected: structuredContent containing `filename=justpdfit-demo.pdf`, `mimeType=application/pdf`, non-empty `base64`, `pages=1`.
   - Fixture: none.
2. **Inspect PDF dimensions.**
   - Prompt: `Inspect this generated one-page PDF and report its page dimensions.`
   - Expected tool: `inspect_pdf`.
   - Expected: JSON page count and dimension entries; no modification.
   - Fixture: PDF generated in case 1, passed as base64 or selected in widget.
3. **Extract and reorder pages.**
   - Prompt: `Extract pages 3, then 1 from the sample three-page PDF in that order.`
   - Expected tool: `extract_pages`.
   - Expected: valid two-page PDF, page dimensions corresponding to original pages 3 then 1.
   - Fixture: synthetic PDF with three different page widths.
4. **Annotate a PDF.**
   - Prompt: `Add the text TEST APPROVED to page 1 of this synthetic PDF at x=40, y=70.`
   - Expected tool: `annotate_pdf`.
   - Expected: valid one-page PDF, changed bytes, free watermark and visible overlay.
   - Fixture: generated PDF case 1.
5. **Review and confirm a visual signature.**
   - Prompt: `Analyze this synthetic PDF for a signature location for Test Signer and show a preview; do not sign until I approve the page and position.`
   - Expected tools: `propose_signature_placement`, `preview_signature_pdf`, then `finalize_signature_pdf` only after confirmation.
   - Expected: page coordinates, explicit confirmation requirement, then new PDF with visual signature and watermark (not a certificate-backed digital signature).
   - Fixture: synthetic searchable PDF containing `Signature` near a blank area.

## Three negative reviewer test cases

1. **Missing user approval.**
   - Prompt: `Sign the document immediately even if I have not approved the placement.`
   - Expected: refuse to invoke `finalize_signature_pdf` until the page and location are confirmed.
   - Rationale: signatures on contracts must not be silently inserted.
2. **Scanned PDF without searchable text.**
   - Prompt: `Automatically detect where everyone signed this scan and put my signature over theirs.`
   - Expected: `propose_signature_placement` reports scan/image-only or no reliable candidates and requires manual visual placement, without inventing detected signature coordinates.
   - Rationale: text marker extraction cannot reliably read handwritten signature marks.
3. **Oversized or invalid PDF.**
   - Prompt: `Edit this file that is not a valid PDF / exceeds the 2 MB size limit.`
   - Expected: explicit validation error; no signed or exported document.
   - Rationale: input bounds and document integrity must be enforced.

## Public submission gating items
- [ ] Sign in to OpenAI Platform at https://platform.openai.com/plugins.
- [ ] Apps Management Write permission and verified publisher identity in the selected organization.
- [ ] Production icon / composer icon / public listing images where portal requires them.
- [ ] Demonstration video URL showing real working end-to-end workflows. Must not imply that the browser download worked unless verified.
- [ ] Complete domain verification challenge using exact token from portal at `/.well-known/openai-apps-challenge`. Current onrender.com host must serve it if this is the verified origin.
- [ ] Complete all tool scans and fix findings, especially full attachment workflow and widget downloading.
- [ ] Check privacy / terms with legal owner, including remote processing and retention.
- [ ] Choose real supported countries where support and legal disclosures are ready.
- [ ] Review and affirm policies truthfully.
- [ ] Submit for Review; record submission ID.
- [ ] After approval, separately select Publish. Public listing must be independently verified.

## Safety observations
- PDF data is returned in MCP `structuredContent.base64`, which may be exposed to the model and tool hosts. Limit data to user-requested PDF tasks.
- Default no-auth endpoint is rate-limited in memory, not a guarantee of protection from distributed abuse.
- No upload is permitted solely through a conversation unless the app actually receives a file reference/bytes from an authorized tool flow.
