# STAAL Real Estate

Marketing site for STAAL Real Estate — boutique warehouse & logistics real estate
advisory in the Netherlands, acting for occupiers (tenants/buyers).

## Static site

The deployable site is plain static files served from the repo root:

- `index.html` — the page
- `css/`, `fonts/`, `images/`, `js/` — assets
- `vercel.json` — tells Vercel to serve the root with no build step

No build is required to deploy; Vercel serves the files as-is.

## Regenerating `index.html`

`index.html` and `css/staal.css` are generated from a source assembler. Structural
or copy changes are made in `assemble.js`, then:

```
node assemble.js
```

- `gen-staal-logo.js` → `staal-logo.json` regenerates the STAAL letterform SVG
  paths from `InstrumentSans-var.ttf` (only needed if the wordmark changes).
- Hero scroll choreography, header, burger menu, testimonials carousel, reveals
  live in `js/main.js` (vanilla JS + local Swiper and Lenis).
