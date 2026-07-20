# GEO / AI-Search Analysis — staalre.com

**Site:** https://www.staalre.com (Staal Real Estate — occupier-only warehouse brokerage, Netherlands)
**Analysed:** 2026-07-09
**Method:** Live fetch + direct source-code inspection (static HTML site)

> **Framing (per Google's primary source).** Google's [AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
> states that optimising for AI Overviews and AI Mode "is still SEO." There is no
> separate AI index — a page must be indexed and snippet-eligible to appear in any
> AI feature. Everything below is SEO fundamentals applied to AI-search surfaces.
> Where a popular GEO tactic contradicts Google (e.g. `llms.txt`, mention-farming),
> that is flagged inline.

---

## 1. GEO Readiness Score: **68 / 100**

The technical foundation is excellent — a fully static, server-rendered site with rich
schema and every AI crawler allowed. Points are lost on **off-site entity presence**
(only LinkedIn), **passage-level citability** (brand-voice headings, no FAQ blocks, no
attributed statistics), and one **data-consistency bug** (conflicting phone number).

| Criterion | Weight | Score | Notes |
|---|---|---|---|
| Technical accessibility | 20% | 18/20 | Fully static SSR; all AI crawlers allowed; clean sitemap; canonical + hreflang |
| Structural readability | 20% | 14/20 | Clean H1→H2→H3; short paragraphs; but headings are editorial, no lists/tables/FAQ |
| Citability | 25% | 15/25 | Articles have facts; homepage has no definitional answer block; facts unattributed |
| Authority & brand | 20% | 11/20 | Strong on-site (bylines, dates, Person schema); thin off-site; NAP bug; borderline recency |
| Multi-modal | 15% | 10/15 | Good imagery + video + alt text; no tables/infographics/tools |

---

## 2. Platform Breakdown

| Platform | Est. | Why |
|---|---|---|
| **Google AI Overviews** | 72 | Tied to classic ranking, where this site is strong: indexable, well-structured, and genuinely first-hand ("occupier-only," ROZ-lease specifics) — exactly the non-commodity content Google's guide rewards. |
| **Google AI Mode** (Gemini 3.5 Flash) | 62 | Broader citation pool weighted to freshness + entity authority. Articles are ~3 months old (borderline) and off-site entity signals are thin. |
| **ChatGPT** | 50 | Leans on Wikipedia (47.9%) and Reddit. Staal has neither a Wikipedia/Wikidata entity nor community footprint. |
| **Perplexity** | 48 | Reddit-heavy (46.7%). No community presence to draw on. |
| **Bing Copilot** | 60 | Site is fully indexable; no IndexNow submission in place. |

Only ~11% of domains are cited by *both* ChatGPT and Google AIO for the same query — the
gap above (Google surfaces strong, ChatGPT/Perplexity weak) is the classic profile of a
site with great on-page SEO but no off-site entity presence.

---

## 3. AI Crawler Access — ✅ All Allowed

`robots.txt` is `User-agent: * / Allow: /` — no AI crawler is blocked. GPTBot,
OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, and Bing all have full access.
**No action needed.** (Optional: block `CCBot`/`Bytespider` training crawlers if you want
to allow *search* citation but decline *training* — purely a preference, no SEO downside
either way.)

---

## 4. llms.txt — Present, but with a data bug

`/llms.txt` exists and is well-structured (summary, services, hubs, article links, contact).

⚠️ **Two caveats:**
1. **Google does not treat `llms.txt` as a citation lever** (confirmed by Mueller, Illyes,
   and SE Ranking's 300k-domain study). It is not hurting you — keep it — but do not expect
   citations from it. Do not invest further effort here.
2. **It contains a wrong phone number** (see finding #1 below). Because the file is a
   machine-readable fact sheet, an AI reading it will ingest the wrong number.

---

## 5. Brand-Mention Analysis (the highest-leverage off-page lever)

Brand mentions correlate ~3× more strongly with AI citations than backlinks (Ahrefs, 2025).

| Signal | Status |
|---|---|
| LinkedIn (personal) | ✅ `linkedin.com/in/texstaal` (in `sameAs` on Org, Person, and article author) |
| LinkedIn (company page) | ❌ Not referenced |
| Wikipedia / Wikidata | ❌ None |
| Reddit | ❌ None |
| YouTube | ❌ None (there is an on-site video, but no channel presence) |

> **Contradiction to note.** Community GEO advice says "get mentioned everywhere." Google's
> guide *explicitly rejects* chasing inauthentic mentions across blogs/forums/videos. The
> reconciliation: build **authentic** entity presence — a real Wikidata entry, a real
> LinkedIn *company* page, genuine industry/press coverage — not manufactured mentions.

---

## 6. Passage-Level Citability

Optimal AI-citation passages are **134–167 words**, self-contained, front-loaded (≈44% of
citations come from the first 30% of a page).

- **Insights articles** are your citability engine and are close: clear topic, first-hand
  facts (ROZ model, 3–4% indexation caps, "5+5" terms, break at year three). What's missing:
  a **direct-answer opening sentence** per section and **attribution** for market claims.
- **Homepage** currently opens with brand copy ("Make Your Move.", "Why STAAL") — evocative
  but not extractable. It has **no self-contained definitional block** an AI can lift.
- **No FAQ blocks anywhere.** Q&A is the single most citable format for AI search.

---

## 7. Server-Side Rendering — ✅ Excellent

AI crawlers do **not** execute JavaScript. This site is **fully static HTML**: every
headline, paragraph, service description, and article body is present in the raw source.
Schema is inline JSON-LD. This is the ideal architecture for AI citability and is the single
biggest thing the site already gets right. **No action needed.**

Schema in place:
- Homepage: `RealEstateAgent`+`Organization`, `WebSite`, `Person` (Tex Staal), with
  `sameAs`, `areaServed`, `knowsAbout`, `address`, `founder`.
- Articles: `BlogPosting` + `BreadcrumbList` + author `Person` with `sameAs`. Well done.

---

## 8. Top 5 Highest-Impact Changes

1. **Fix the conflicting phone number (data hygiene, do first).**
   `llms.txt` line 5 says **+31 6 28 36 36 31**; every HTML page + the Organization schema
   say **+31 6 59 12 91 27**. Conflicting NAP data erodes the entity-consistency signal AI
   systems use for trust. Correct `llms.txt` to the real number.

2. **Add an FAQ block to each insights article** (visible content, question-based H3s).
   e.g. *"Can you negotiate a Dutch ROZ lease?", "What is a normal indexation cap in the
   Netherlands?", "Do I need a broker to get lease incentives?"* — each answered in 40–60
   words. This is the highest-yield citability change. (Skip FAQ *schema* — for commercial
   pages Google restricts FAQ rich results; the visible Q&A is what earns AI citations.)

3. **Front-load a 134–167-word definitional answer block near the top of the homepage** —
   "What Staal Real Estate does" in plain, extractable prose ("Staal Real Estate is an
   independent, occupier-only warehouse brokerage in the Netherlands that represents tenants
   and buyers — never landlords — across Rotterdam, Venlo, Tilburg-Waalwijk and Schiphol...").
   Keep the "Make Your Move" hero; add this block below it.

4. **Build one authentic off-site entity anchor: a Wikidata item + a LinkedIn company page.**
   This is the biggest ChatGPT/Perplexity lever. Add the LinkedIn company URL to `sameAs`
   once it exists. (Authentic entity presence — not mention-farming.)

5. **Attribute the market statistics.** Claims like "Venlo, often ranked Europe's top
   logistics location" should cite the source (e.g. the specific logistics-hub ranking).
   AI systems preferentially cite passages with attributed facts.

---

## 9. Schema Recommendations

Current schema is strong. Incremental additions:

- **Homepage `FAQPage`** is *not* recommended for this commercial page — instead add the
  Q&A as visible content (see #2). Keep schema focused on `Organization`/`Person`.
- Expand `knowsAbout` on the Organization to include the specific hubs and lease concepts
  ("ROZ lease model", "warehouse leasing Netherlands", "Rotterdam logistics", "Venlo
  logistics") — cheap entity-context win.
- Once a LinkedIn **company** page and any Wikidata/industry-directory profiles exist, add
  them all to `sameAs` on `#organization`. `sameAs` breadth is a core entity-resolution
  signal for AI.
- Consider `Service` schema entries (Lease / Buy / Manage) to make the offering
  machine-explicit.

---

## 10. Content-Reformatting Suggestions (specific)

- **Article headings → include the question form.** "The ROZ model: the default you'll be
  offered" → keep the editorial line but add a question-shaped H2 or lead sentence: *"How
  do Dutch ROZ warehouse leases work?"* AI search matches query patterns. (This is genuine
  passage clarity, not AI-gaming — Google rejects rewriting *purely* for AI.)
- **Open each article section with the answer, then explain.** Current sections build to the
  point; lead with a one-sentence takeaway an AI can extract standalone.
- **Add a comparison table** to `dutch-logistics-hub-comparison` (Hub · Best for · Rent
  level · Modality). Tables are disproportionately cited and lift multi-modal score.
- **Refresh cadence.** Articles show `dateModified = datePublished` (2026-04-13). Content
  under ~3 months old is ~3× more likely to be cited; pages stale 6+ months lose eligibility.
  A light quarterly refresh (update a figure, bump `dateModified`) is one of the
  highest-leverage recurring GEO plays. *Only bump the date when you genuinely update
  content — Google penalises faked freshness.*

---

## Housekeeping (spotted in passing, not GEO-scored)

- **Stale template filename.** The leasing article's hero image and its `BlogPosting`
  `image` both point to `/images/blog-q1-2026-nyc-market-report.webp` — a leftover from the
  source template (NYC report). The `alt` text is correct, but the schema `image` URL reads
  as an unrelated asset. Rename the file to something topical and update the reference.

---

### What the site already does right (don't touch)
Fully static SSR · all AI crawlers allowed · rich Organization/Person/BlogPosting schema ·
author bylines + dates · `sameAs` entity linking · clean sitemap · canonical + hreflang ·
genuinely first-hand, non-commodity content. This is a strong GEO base — the wins above are
refinements, not rescue.
