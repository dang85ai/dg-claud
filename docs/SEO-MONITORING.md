# Caledon United FC 2018 Girls — SEO & Operations Monitoring

**Canonical domain:** https://caledonunited2018girls.ca  
**Host:** Netlify (Cloudflare DNS)  
**Official contact:** girlsoccer2018@gmail.com

## Automated build checks

Every `npm run build` now runs `npm run seo:check` before generating the site. The guardrail checks canonical configuration, sitemap entries, private noindex/no-store rules, old-domain redirect declarations, service-worker scope and official email consistency. It intentionally does not request private resources or transmit personal information.

Manual command:

```bash
npm run seo:check
```

These checks only validate code and configuration. They **do not prove public DNS redirects, Search Console indexing, or successful email delivery**.

## Manual production smoke test after every release

- Open home, /about, /schedule, /faq, /kit, /sponsors and /contact on desktop and mobile.
- Confirm /portal and /admin still require appropriate authentication/MFA.
- Confirm /order still submits correctly and the team email notification arrives.
- Verify sponsor availability remains editable through management.
- Check approved player images and names obey guardian consent.
- Confirm that the homepage favicon and crest still display properly.
- Inspect published sitemap and robots.txt from the custom domain.
- Confirm old Netlify and www hostnames resolve/redirect to the chosen canonical. Example:

```bash
curl -sSI https://www.caledonunited2018girls.ca/
curl -sSI https://caledon-u9-girls-2026.netlify.app/
curl -sSI https://caledonunited2018girls.ca/sitemap.xml
```

Expected: a permanent redirect for alternate hostnames and a 200 response for the sitemap. Do not assume success without examining status and Location headers.

## Google Search Console — weekly for the first month

1. Domain property: caledonunited2018girls.ca.
2. Sitemap: https://caledonunited2018girls.ca/sitemap.xml.
3. Inspect /, /about, /schedule, /kit and /sponsors. Confirm Google-selected canonical equals the `.ca` URL.
4. Record **Indexed**, **Crawled — currently not indexed** and **Discovered — currently not indexed** counts.
5. Review search performance for legitimate team-branded queries and changes in clicks/impressions.
6. Request indexing for important updated pages only when appropriate. Repeated submissions are not a shortcut.

The season-recap placeholder stays accessible from the site but is intentionally `noindex` and omitted from the sitemap until meaningful 2026–27 information exists. Player roster, private portal and order-request routes must not appear in the public sitemap.

## Google Analytics 4 — optional, not yet verified as active

The application supports `NEXT_PUBLIC_GA_MEASUREMENT_ID`, but a real measurement ID must be supplied by the team's Google Analytics administrator before GA4 can collect data. Obtain appropriate privacy and consent approval before enabling it. Never use a fabricated measurement ID.

If enabled, public page-view tracking only sends the pathname (not query parameters), and protected/portal/order/roster routes are excluded. Generic conversion events on successful kit and sponsor forms do not contain names, emails, player data, amounts or free-text content. Confirm in GA4 DebugView or Realtime, and do not equate configured code with verified data collection.

## Form and operational verification — after every change

- Open Netlify Forms and confirm `team-kit-order` is recognized.
- Send one clearly labeled TEST ORDER using an authorized adult's own contact details.
- Confirm the Netlify submission record appears.
- Independently confirm delivery to girlsoccer2018@gmail.com.
- Clean up test records through the provider console if appropriate.
- Submit a sponsor enquiry test separately only with approval; its current backend is distinct from Netlify Forms.
- Do not expose contact submissions or player details to search crawlers or analytical event payloads.

## Release record

- Phase 1: technical SEO cleanup; sponsor title deduplication and noindex for unfinished season recap.
- Phase 2: public content update to About, FAQ, Contact and Parent Resources.
- Phase 3: automated SEO guardrails, privacy-conscious optional analytics instrumentation and this runbook.

**Outstanding external checks:** live redirect headers, GA4 measurement configuration, real Search Console indexing progress, end-to-end form email receipt, authenticated mobile UX and live Core Web Vitals.
