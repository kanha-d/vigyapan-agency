# VIGYAPAN — Premium agency website

A complete, responsive redesign of the existing VIGYAPAN advertising website. Plain HTML, CSS and JavaScript; no framework migration, bundler or production dependencies.

## Run locally

```sh
npm start
```

Open http://127.0.0.1:4173. Python 3 is required for this convenience server. Any static web server also works. Do not open `index.html` as a file URL because the content snapshot is fetched over HTTP.

```sh
npm run build
npm run lint
npm test
```

The build pre-renders the published `content.json` snapshot into HTML so services, products, prices and contact information appear immediately and remain readable without JavaScript. Run it after editing the snapshot. The original CMS can still update the page at runtime.

## Deployment

Publish the repository root with GitHub Pages (Settings → Pages → Deploy from a branch → main → / root). All asset paths are relative, including when hosted below a repository path. No environment variables or secrets are required for the static site.

## Files

- `index.html`, `style.css`, `app.js`: redesign and interactions.
- `assets/`: locally hosted original assets, original SVG concept art and fonts.
- `content.json`: sanitized snapshot of the original public content feed, retrieved 14 October 2026.
- `config.js`: original public Google Apps Script URL and polling interval.
- `admin.html`, `admin.css`, `admin.js`: original content management interface, retained without changing its backend contract.
- `build.mjs`, `verify.mjs`: dependency-free pre-rendering and verification.

## Preserved source and content

Reference: https://sparkgroupindia.github.io/advertisement/
Original source: https://github.com/Sparkgroupindia/advertisement

The original project contained eight files, no framework/build dependencies and no local asset folder. Its assets and business content were supplied by Google Apps Script/Sheets and Google Drive. This redesign preserves the seven published services (including video, apps and SEO), five products, four plans and their exact prices/inclusions, original gallery/video link, and admin route. Live version polling continues every five seconds while the page is visible. An unavailable CMS leaves the local content intact.

The hero and editorial copy are intentionally art-directed rather than driven by the previous rotating hero fields. The original hero records remain in `content.json` for reference. Home copy is edited in `index.html`; new CMS service descriptions are used when a service does not have a tailored editorial description in `app.js`.

The original fake map, subscription toast and generically attributed testimonials are not represented as working integrations or verified endorsements. The relationship section intentionally contains no invented testimonials. Generic social platform homepage URLs are retained in the source snapshot but omitted from visible social links until actual profile URLs are supplied.

## Enquiries and contact verification

There is **no enquiry submission endpoint in the supplied project**. The accessible enquiry builder validates all required fields, prepares a complete message, and provides email draft, WhatsApp and clipboard handoffs. It never sends automatically or claims a submission has succeeded. Form data is not persisted on this website. Nothing was sent during QA.

To receive submissions directly, supply a server-side endpoint or a properly configured form service. Add server validation, rate limiting, spam checks, secure mail delivery and explicit success/error responses; keep provider credentials in server environment variables. The honeypot is present for a future server integration but is not a substitute for server spam protection.

The source phone, address and email were preserved, but are not independently verified; the patterned phone number and generic street address should be confirmed before promotion. Plan features such as “96 Reels” and “264 Photo/carousel post” were preserved verbatim. Their allocation period, ad spend, taxes and contract terms need agency confirmation. No inaccurate LocalBusiness address or rating schema was added.

## Existing backend security issue

The original public Apps Script response exposes an administrative password setting. The deliverable snapshot excludes that field and the redesigned client discards credential-like settings, but **frontend filtering cannot repair the server disclosure**. Before production administration, the Apps Script owner should remove credentials from all public responses, rotate the exposed credential, and verify server-side authorization. The Apps Script server source was not in the original repository, so that backend repair could not be made here. No credentials have been added to this repository.

## Assets and licenses

Original photos/artwork were downloaded from the reference site's own media URLs and retained with their original provenance; their third-party licenses and client relationships were not independently established. They are not presented as newly verified client projects. Confirm usage rights before public promotion. New SVG files `identity.svg`, `poster.svg`, `digital.svg`, and `banner.svg` are original illustrative concept work and visibly labelled as such. No new client claims or performance statistics were created.

Inter and Space Grotesk are hosted locally and distributed under the SIL Open Font License. See `Inter-OFL.txt` and `Space-Grotesk-OFL.txt`.

## Verification

- Build, JavaScript syntax checks and static content/asset/anchor verification pass.
- Browser-tested widths: 320, 390, 480, 768, 1024, 1440 and 1920px; no horizontal overflow.
- Checked desktop/mobile composition, mobile navigation, portfolio filters, modal open/close, service preselection, invalid form errors and valid draft creation.
- No console errors observed on the redesigned page.
- Local images and fonts; reserved image geometry, lazy loading below the fold, semantic sections, focus indicators and reduced-motion support.
- Admin authentication and destructive/write operations were not exercised against the live CMS.
- No actual enquiry or WhatsApp message was sent.
