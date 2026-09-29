# Custom Domain (kirovdynamics.co.za) — Setup

Serving from `github.io` is fine, but a real domain measurably lifts trust and
click-through (a `.co.za` domain reads as "the actual company", not a GitHub URL).
This is a step-by-step for when you're ready. Requires domain purchase + a registrar
login (money + account access) — hence not automated from here.

## Option A — kirovdynamics.co.za via Cloudflare (recommended)

Cloudflare Free is compatible with the Free-First standard (rule 1). It adds a CDN,
DNS, and free SSL.

1. **Buy the domain** at a registrar (e.g. domains.co.za, Afrihost, Register.co.za —
   typically R80–150/y).
2. Point the domain's **nameservers** at Cloudflare (Register at
   cloudflare.com → Add site → use the two NS records they give you).
3. In Cloudflare **DNS**, create:
   - `A` record `@` → `185.199.108.153`
   - `A` record `@` → `185.199.109.153`
   - `A` record `@` → `185.199.110.153`
   - `A` record `@` → `185.199.111.153`
   - (`www` → `CNAME` to `kirov-dynamics-technology.github.io` if you want www.)
4. In the site repo, create `docs/CNAME` containing:
   `kirovdynamics.co.za`
5. Commit + push. GitHub Pages serves the site at the custom domain and issues the
   TLS cert automatically.
6. Add the custom domain as a **Redirect** (the `.github.io` URL) → prefer redirect
   `kirov-dynamics-technology.github.io/kirov-dynamics/` → `https://kirovdynamics.co.za/`
   in Cloudflare so old links still work.

## Then update everywhere

- The JSON-LD `@id`/`url` in `index.html` and the new case-study/pricing schema
  blocks (currently `github.io` URLs).
- The `canonical` links on all 11 pages.
- `sitemap.xml` `<loc>`s + `robots.txt`.
- `data-domains` in `assets/js/tracking.js` → allow `kirovdynamics.co.za` too.
- Umami Cloud website → add the custom domain.
- All UTM links in `docs/utm-promo-kit.md`.
- Newsletter/outputs that reference the old URL.

I can batch the repo changes the moment the domain is up — just say when.

## Option B — keep github.io for now

No action. The site is fully functional and crawlable as-is; Search Console setup
(`docs/search-console-setup.md`) is independent and should run now regardless.

## Recommendation

Do the Search Console setup right away (free, this week), and treat the custom domain
as the first "growth spend" once a real lead pipeline justifies it (paid-gate rule 5).