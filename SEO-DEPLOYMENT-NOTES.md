# SEO Deployment Notes — Static HTML Mockup

This build intentionally uses the existing static file structure for Vercel mockup hosting.

- Home: `/index.html` (or `/` when served by Vercel)
- Main pages: `/pages/services.html`, `/pages/dentists.html`, `/pages/contact.html`, etc.
- Blog articles: `/pages/blog/*.html`
- No clean-URL rewrite rules are included in this mockup build.
- Internal links, canonical tags, JSON-LD URLs, and `sitemap.xml` all use the `.html` page paths for consistency.
- When the approved site is later integrated into the production Helms & White website, canonical URLs, sitemap entries, internal links, and server redirects should be migrated to the production site's final URL structure.

All other SEO improvements in this package remain intact.
