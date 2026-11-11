# JustPDFit ChatGPT MCP app (developer prototype)

This directory contains a Streamable HTTP MCP server and an embedded ChatGPT editor widget.

## Operations

merge_pdfs, extract_pages, reorder_pages, rotate_pdf, annotate_pdf, sign_pdf_visual, optimize_pdf, inspect_pdf, images_to_pdf.

**Limitations:** All PDF manipulation in this prototype runs on the external MCP server, not on the user's device. Free generated PDFs receive a small watermark. Visual signatures are **not** cryptographically signed and are not identity-verified. Annotation overlays text; it does not replace existing PDF text. Optimization is a PDF re-save and may not compress. Typed annotations currently accept printable ASCII only. No payment or watermark removal is enabled.

The widget offers a user-facing HTML file picker, PDF preview and download, but it has **not** yet been validated with ChatGPT's actual widget bridge and does not automatically retrieve all attached conversation files. The API currently accepts base64 inputs and can exceed practical tool message limits for large PDFs. Improve file handling before production.

## Local start

Node 20 or later:

```sh
cd chatgpt-app
npm install
npm start
```

GET `/health` returns JSON. POST `/mcp` serves MCP.

## Hosting

A Render blueprint is provided at repository root. It is a deployment template, **not** evidence that the application has been deployed. Select an authorized Render workspace and configure the public endpoint. Enable access controls, request limits, monitoring and log scrubbing before handling real documents.

## Developer review

See [SUBMISSION.md](SUBMISSION.md) for directory listing copy, security disclosures and readiness checklist. Do not submit until integration tests, privacy verification, and OpenAI developer-console review pass.
