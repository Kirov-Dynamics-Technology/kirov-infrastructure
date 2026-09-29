# UTM Promo Kit — Kirov Dynamics

Every link you post publicly should carry UTM tags so the Umami report shows exactly
which channel brings the *relevant* views (`utm_source`, `utm_medium`, `utm_campaign`).
The report already breaks down UTM campaigns/sources/medium (see `tools/umami-report`).

**Base pages** (swap the page URL as needed):

- Home: `https://kirov-dynamics-technology.github.io/kirov-dynamics/`
- Pricing: `.../pricing.html`
- Case study – Construction ERP: `.../case-studies/construction-erp.html`
- Case study – Municipal Portal: `.../case-studies/municipal-complaint-portal.html`
- Case study – Smart Water: `.../case-studies/smart-water-monitoring.html`

**Add the query string** (URL-encoded ampersands are a single `&`, browsers handle it):

```
?utm_source=NAME&utm_medium=MEDIUM&utm_campaign=CAMPAIGN
```

## Copy-paste kit

### LinkedIn (company page / posts)

```
https://kirov-dynamics-technology.github.io/kirov-dynamics/?utm_source=linkedin&utm_medium=social&utm_campaign=linkedin-launch
https://kirov-dynamics-technology.github.io/kirov-dynamics/case-studies/construction-erp.html?utm_source=linkedin&utm_medium=social&utm_campaign=construction-erp
https://kirov-dynamics-technology.github.io/kirov-dynamics/case-studies/municipal-complaint-portal.html?utm_source=linkedin&utm_medium=social&utm_campaign=municipal-portal
```

### WhatsApp (direct to a contact)

```
https://kirov-dynamics-technology.github.io/kirov-dynamics/?utm_source=whatsapp&utm_medium=chat&utm_campaign=sales-v1
https://kirov-dynamics-technology.github.io/kirov-dynamics/pricing.html?utm_source=whatsapp&utm_medium=chat&utm_campaign=pricing-share
```

### Email signature / newsletters

```
https://kirov-dynamics-technology.github.io/kirov-dynamics/?utm_source=email&utm_medium=email&utm_campaign=newsletter
https://kirov-dynamics-technology.github.io/kirov-dynamics/company-profile.html?utm_source=email&utm_medium=email&utm_campaign=intro-pitch
```

### Welcome pack / printed / PDF

```
https://kirov-dynamics-technology.github.io/kirov-dynamics/?utm_source=offline&utm_medium=qr&utm_campaign=welcome-pack
```

## Conventions (keep names stable so charts are comparable)

- `utm_source` = channel: `linkedin`, `whatsapp`, `email`, `offline`, `referral`
- `utm_medium` = format: `social`, `chat`, `email`, `qr`, `banner`
- `utm_campaign` = short, permanent slug: `linkedin-launch`, `construction-erp`, `newsletter`
- Never reuse a campaign name for a different page/date range.
- Add `?utm_source=...` to **every** promoted link, not only the homepage.

## Verification

After a campaign runs, check the report:

```powershell
node tools/umami-report/umami-report.mjs --since 2026-09-29
```

Under **UTM campaigns** / **UTM sources** you'll see which channel pulled views and
how many, then the **Funnel events** show which of those viewers actually engaged.