# JustPDFit.com deployment

Repository: `zmehanna/justpdfit-web`.

GitHub Pages uses `main` and `/(root)`. The production custom domain is
`justpdfit.com`; the root `CNAME` file contains only this domain.

IONOS apex A records remain pointed to GitHub Pages:
- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

`www` CNAME should target `zmehanna.github.io`. Enforce HTTPS.

Deployment occurs automatically on pushes to `main`. Test the homepage,
individual PDF tools, flags, language selection, privacy and support pages.

Do not deploy the web site from the old iOS repository. The native iOS app
remains in `zmehanna/Pdf-ios` and builds with Xcode Cloud.
