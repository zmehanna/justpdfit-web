# JustPDFit for ChatGPT — developer preview

This is a **working MCP server starter**, not a published ChatGPT Directory app. It currently offers two tools: plain-text PDF creation and PDF merging. Both return base64-encoded PDF bytes with a small watermark. The implementation is intentionally limited: it does not yet provide a ChatGPT widget, native attachment ingestion, signatures, editing, payments, or a downloadable file resource.

## Run locally

```sh
cd chatgpt-app
npm install
npm start
```

GET /health returns a health check. POST /mcp serves stateless Streamable HTTP MCP. Deploy to an HTTPS endpoint before connecting in ChatGPT developer mode. Never claim a public listing or submission until the OpenAI developer dashboard confirms it.

## Before submission

- Replace base64 tool inputs/outputs with supported ChatGPT file handling and downloadable artifacts.
- Add an Apps SDK widget for PDF preview, page selection and download.
- Add robust multilingual PDF fonts, proper line wrapping, file validation, privacy and abuse limits.
- Implement remaining tools (split, compress, sign, annotate, watermark, convert) and test them end-to-end.
- Define public privacy policy, support contact, developer verification, tool descriptions and directory assets.
- Review current OpenAI app submission requirements, host the MCP server, test in ChatGPT developer mode, then submit through the app developer dashboard.
- Keep the free watermark flow separate from paid watermark removal; verify current OpenAI payment rules before integrating checkout.
- Do not deploy this prototype publicly without authentication, rate limiting, monitoring and an explicit data-retention policy.
