# SEO Audit Notes — initial pass

Summary of issues found and changes implemented (quick audit):

Issues discovered:
- Missing per-page meta titles and meta descriptions on most pages.
- No structured data present for Organization, LocalBusiness, Product or FAQ.
- No sitemap.xml or robots.txt in public.
- Many <img> tags lacked `loading` attribute (lazy) to improve LCP.
- No canonical tags present on pages.

Implemented changes (code-level):
- Added `components/Seo.js` — central helper to insert title, meta description, OG, Twitter, canonical, and JSON-LD.
- Updated `pages/index.js`, `pages/products/index.js`, and `components/ProductDetailView.js` to use `Seo` and provide unique titles/descriptions.
- Added Product JSON-LD for product detail pages (dynamic when product data is available).
- Added `public/robots.txt` and a dynamic `/sitemap.xml` generator at `pages/sitemap.xml.js`.
- Added lazy-loading and async decoding to product images (`ProductCard`, product thumbnails, main product images).
- Created `/pages/faq.js` with FAQ JSON-LD.
- Added initial `seo/keyword-mapping.md` and this audit report.

Next recommended actions (priority):
1. High: Add canonical + unique title/description to remaining pages (cart, track-order, category pages). Also add hreflang alternates for supported locales.
2. High: Move to `next/image` for product images to enable automatic optimization and WebP conversion.
3. High: Serve critical CSS inline for above-the-fold and defer non-critical CSS — implement a small critical CSS extract for the hero and header.
4. High: Configure server-side caching headers (Cache-Control) for static assets and leverage long cache TTLs.
5. Medium: Convert large images to WebP and generate multiple sizes; add srcset for responsive images.
6. Medium: Implement font display swap and preload critical fonts (if using web fonts).
7. Medium: Create more localized landing pages (Chișinău, Ialoveni) and add LocalBusiness schema with geo coordinates.
8. Low: Implement automated sitemap generation as a build step for static exports.

I will continue implementing the high-impact items now (structured data for LocalBusiness, robots+ sitemap already added). Next I'll run schema validation tools and prepare before/after metrics.
