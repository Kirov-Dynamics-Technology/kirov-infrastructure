# Google Search Console — Set Up

Get the site showing up in Google with real search data. Umami tells us **who
arrives**; Search Console tells us **which search queries brought them** — the two
together are how we grow "relevant views".

Covers GitHub Pages hosting. Total time ~10 minutes, once.

## 1. Create the verification file (5 min)

1. Go to https://search.google.com/search-console → **Add property** → **URL prefix** →
   paste `https://kirov-dynamics-technology.github.io/kirov-dynamics/`.
2. Choose the **HTML file** verification method.
3. Download/copy the token file Google gives you. It looks like
   `google1234abcd.html` with content like `google-site-verification: google...xyz`.
4. Drop that file into:
   `docs/` (the site repo root — the same folder as `index.html`).
5. Commit + push. GitHub Pages deploys it to
   `https://kirov-dynamics-technology.github.io/kirov-dynamics/google1234abcd.html`.
6. Click **Verify** in Search Console. Done — property active.

> The exact filename is minted by Google per-property; it can't be pre-created here.
> Just paste the file Google gives you into `docs/`.

## 2. Submit the sitemap (2 min)

In Search Console → **Sitemaps**:

```
sitemap.xml
```

(That resolves to `https://kirov-dynamics-technology.github.io/kirov-dynamics/sitemap.xml`,
which is already in `robots.txt`.)

## 3. Request indexing of key pages (2 min)

Use the **URL Inspection** tool to request indexing for:

- `https://kirov-dynamics-technology.github.io/kirov-dynamics/`
- `.../case-studies/construction-erp.html`
- `.../case-studies/municipal-complaint-portal.html`
- `.../case-studies/smart-water-monitoring.html`
- `.../case-studies/ai-study-assistant.html`
- `.../pricing.html`

## After that

- **Weekly**: Search Console → Performance → check which queries bring impressions,
  and which pages earn clicks. Feed winners into `docs/utm-promo-kit.md` promotions.
- **Content signal to watch**: pages appearing for South African intent
  (construction ERP, municipal portals, POPIA, water monitoring, AI for SME).

## Status

- [ ] Verification file added to `docs/`
- [ ] Sitemap submitted
- [ ] Key pages requested for indexing