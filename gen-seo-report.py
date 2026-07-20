# Generates a branded SEO audit PDF for Staal Real Estate using ReportLab.
import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                HRFlowable, KeepTogether)

STEEL   = colors.HexColor("#1F4257")
STEEL2  = colors.HexColor("#33627D")
LIGHT   = colors.HexColor("#6FA0C0")
PAPER   = colors.HexColor("#F4F2EF")
INK     = colors.HexColor("#1A1C1C")
MUTE    = colors.HexColor("#5A5C5C")
RED     = colors.HexColor("#C0392B")
ORANGE  = colors.HexColor("#D87A1A")
AMBER   = colors.HexColor("#B8901E")
GREEN   = colors.HexColor("#2E7D5B")
LINEC   = colors.HexColor("#D9D5CE")

DATE = datetime.date.today().strftime("%d %B %Y")
URL  = "staalre-new.vercel.app  (production: staalre.com)"

styles = getSampleStyleSheet()
def S(name, **kw):
    base = kw.pop("parent", styles["Normal"])
    return ParagraphStyle(name, parent=base, **kw)

body   = S("body", fontName="Helvetica", fontSize=9.5, leading=14, textColor=INK, spaceAfter=4)
muted  = S("muted", parent=body, textColor=MUTE, fontSize=8.5, leading=12)
h2     = S("h2", fontName="Helvetica-Bold", fontSize=14, leading=18, textColor=STEEL, spaceBefore=14, spaceAfter=2)
h3     = S("h3", fontName="Helvetica-Bold", fontSize=10.5, leading=14, textColor=INK, spaceBefore=8, spaceAfter=2)
find   = S("find", parent=body, leftIndent=20, spaceAfter=7)
cell   = S("cell", parent=body, fontSize=9, leading=12)
cellb  = S("cellb", parent=cell, fontName="Helvetica-Bold")
cellw  = S("cellw", parent=cell, textColor=colors.white, fontName="Helvetica-Bold")

def finding(num, title, color, text):
    hexc = "#" + color.hexval()[2:]
    return Paragraph('<b><font color="%s">%s.&nbsp;&nbsp;%s</font></b><br/>%s'
                     % (hexc, num, title, text), find)

story = []

# ---- intro band spacer (header drawn on canvas) ----
story.append(Spacer(1, 30*mm))

story.append(Paragraph("A static, well-built marketing site with strong fundamentals "
    "(fast HTML, clean URLs, correct canonical &amp; sitemap, solid trust block). The score is held "
    "back by three concentrated, fixable areas: <b>media/image weight</b>, <b>near-absent structured "
    "data</b>, and <b>missing human-authority signals</b> — plus it is a brand-new domain.", body))
story.append(Spacer(1, 4))

# ---- score table ----
story.append(Paragraph("Score by category", h2))
rows = [
    ["Category", "Weight", "Score", "Read"],
    ["Technical SEO", "22%", "68", "Good base; missing security headers"],
    ["Content / E-E-A-T", "23%", "54", "Sound topics; no named author, thin articles"],
    ["On-Page SEO", "20%", "62", "Unique titles; H1 not keyword-bearing"],
    ["Schema / structured data", "10%", "18", "Only homepage has JSON-LD"],
    ["Performance (Core Web Vitals)", "10%", "30", "Mobile LCP est. 8-12s — worst issue"],
    ["AI / GEO readiness", "10%", "52", "Crawlable; no llms.txt, no author/stats"],
    ["Images", "5%", "35", "Huge files, empty/wrong alt text"],
]
def score_color(v):
    v = int(v)
    return GREEN if v >= 65 else (AMBER if v >= 45 else RED)
data = [[Paragraph(c, cellw if i==0 else (cellb if j in (1,2) else cell)) for j,c in enumerate(r)]
        for i,r in enumerate(rows)]
t = Table(data, colWidths=[55*mm, 18*mm, 16*mm, 81*mm])
tstyle = [
    ("BACKGROUND", (0,0), (-1,0), STEEL),
    ("TOPPADDING", (0,0), (-1,-1), 5), ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ("LEFTPADDING", (0,0), (-1,-1), 8), ("RIGHTPADDING", (0,0), (-1,-1), 8),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ("ALIGN", (1,0), (2,-1), "CENTER"),
    ("LINEBELOW", (0,1), (-1,-1), 0.5, LINEC),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, PAPER]),
]
for i in range(1, len(rows)):
    tstyle.append(("TEXTCOLOR", (2,i), (2,i), score_color(rows[i][2])))
t.setStyle(TableStyle(tstyle))
story.append(t)
story.append(Spacer(1, 2))
story.append(Paragraph("Overall SEO Health Score is the weighted aggregate of the above (0–100).", muted))

# ---- Critical ----
story.append(Paragraph("Critical — fix first", h2))
story.append(HRFlowable(width="100%", thickness=1.4, color=RED, spaceAfter=6))
story.append(finding("1", "Performance: the hero is ~16 MB of media", RED,
    "<b>warehouse.png is 4 MB and loaded twice</b> (8 MB), why-us.mp4 is <b>7.3 MB autoplaying</b> with no "
    "poster, and there are <b>11 render-blocking CSS files</b>. Estimated mobile LCP <b>8–12s</b> (Google "
    "“Poor” is &gt;4s). The hero is also <font name='Courier'>visibility:hidden</font> until JS runs, "
    "which delays LCP itself. This is the #1 ranking risk."))
story.append(finding("2", "Preview is publicly indexable while canonical points to staalre.com", RED,
    "Google can index <font name='Courier'>staalre-new.vercel.app</font> with nowhere to consolidate "
    "(the production domain is not live yet). Add <font name='Courier'>X-Robots-Tag: noindex</font> to the "
    "preview until the domain cuts over, then remove it."))
story.append(finding("3", "Zero security response headers", RED,
    "No CSP, X-Frame-Options, or X-Content-Type-Options. One <font name='Courier'>vercel.json</font> headers "
    "block fixes it (also a clickjacking exposure today)."))

# ---- High ----
story.append(Paragraph("High — within ~1 week", h2))
story.append(HRFlowable(width="100%", thickness=1.4, color=ORANGE, spaceAfter=6))
story.append(finding("4", "Structured data is nearly empty (18/100)", ORANGE,
    "Add <b>BlogPosting</b> to the 3 articles (headline, datePublished, author), <b>BreadcrumbList</b>, and "
    "upgrade the homepage to an <font name='Courier'>@graph</font> with <b>Organization</b> (logo, sameAs) + "
    "<b>WebSite</b>."))
story.append(finding("5", "No human authority (E-E-A-T)", ORANGE,
    "No named author (Tex Staal), no founder bio on /about, and testimonials were removed leaving no social "
    "proof. Every ranked competitor shows named advisors + track record. Biggest content &amp; AI-citation gap."))
story.append(finding("6", "Search-intent / page-type mismatch", ORANGE,
    "“Warehouse for rent NL” searchers expect listings; “tenant rep NL” expect a credentialed "
    "advisory page. The homepage is a brochure with a slogan H1 (“Make Your Move.”). Add an above-fold "
    "proof point + sector signal and a keyword-bearing H1."))
story.append(finding("7", "Thin articles with placeholder images", ORANGE,
    "Articles are ~330–400 words, bury the answer, cite no data, and use leftover US-template images "
    "(blog-philly-winter-chill.jpg, NYC market report). Weak for both Google and LLMs."))
story.append(finding("8", "No llms.txt; low AI-citation readiness", ORANGE,
    "Your stated priority. Add an <font name='Courier'>llms.txt</font>, front-load article answers in the first "
    "~50 words, and add sourced stats. Crawlers are already allowed — this is about citability."))
story.append(finding("9", "Image alt text", ORANGE,
    "13 empty alts (decorative ones are fine) plus 3 wrong-context alts (“Mortgage Services”, “Property "
    "Management”) inherited from the template. Add descriptive, warehouse-specific alt to meaningful images."))

# ---- Medium / Low ----
story.append(Paragraph("Medium / Low", h2))
story.append(HRFlowable(width="100%", thickness=1.4, color=AMBER, spaceAfter=6))
ml = ("Redundant &lt;title&gt; on /about &nbsp;·&nbsp; og:type=website on articles (should be article) "
      "&nbsp;·&nbsp; footer social links are <font name='Courier'>href=\"#\"</font> &nbsp;·&nbsp; no "
      "<font name='Courier'>hreflang=\"en\"</font> &nbsp;·&nbsp; no IndexNow &nbsp;·&nbsp; orphaned heavy "
      "files in repo (back2.0.png 5.3 MB, og-image.svg) &nbsp;·&nbsp; dead <font name='Courier'>meta "
      "keywords</font> &nbsp;·&nbsp; switch RealEstateAgent schema toward ProfessionalService for advisory fit.")
story.append(Paragraph(ml, body))

# ---- Action plan ----
story.append(Paragraph("Action plan", h2))
story.append(HRFlowable(width="100%", thickness=1.4, color=STEEL, spaceAfter=6))
ap_head = [Paragraph("Implement now (no input needed)", cellw), Paragraph("Needs your input", cellw)]
now = ("–&nbsp;Convert hero/section images to WebP/AVIF + srcset; de-dupe the double 4 MB image<br/>"
       "–&nbsp;Video poster + preload=none; preload + fetchpriority on the LCP image<br/>"
       "–&nbsp;BlogPosting + BreadcrumbList + Organization/WebSite @graph<br/>"
       "–&nbsp;llms.txt, descriptive alt text, og:type=article, hreflang<br/>"
       "–&nbsp;Security headers + preview noindex; drop meta keywords; delete orphan files")
need = ("–&nbsp;Founder bio + photo for /about (+ Person schema, real LinkedIn URL)<br/>"
        "–&nbsp;Real social profile URLs; real testimonials / case references<br/>"
        "–&nbsp;Verified market stats for articles (won't invent rent figures)<br/>"
        "–&nbsp;New article hero images (can generate options on request)<br/>"
        "–&nbsp;Per-hub landing pages (Rotterdam / Venlo / Tilburg / Schiphol)")
ap = Table([[ap_head[0], ap_head[1]],
            [Paragraph(now, cell), Paragraph(need, cell)]], colWidths=[85*mm, 85*mm])
ap.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (0,0), STEEL), ("BACKGROUND", (1,0), (1,0), STEEL2),
    ("TOPPADDING", (0,0), (-1,-1), 7), ("BOTTOMPADDING", (0,0), (-1,-1), 7),
    ("LEFTPADDING", (0,0), (-1,-1), 9), ("RIGHTPADDING", (0,0), (-1,-1), 9),
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("BACKGROUND", (0,1), (0,1), colors.white), ("BACKGROUND", (1,1), (1,1), PAPER),
    ("BOX", (0,0), (-1,-1), 0.5, LINEC), ("INNERGRID", (0,0), (-1,-1), 0.5, LINEC),
]))
story.append(ap)
story.append(Spacer(1, 6))
story.append(Paragraph("Highest-leverage sprint: <b>image optimization + structured data + llms.txt + author "
    "attribution</b> — estimated to lift the overall score into the low-70s.", body))

# ---- build with header/footer ----
def decorate(canvas, doc):
    canvas.saveState()
    w, h = A4
    if doc.page == 1:
        canvas.setFillColor(STEEL)
        canvas.rect(0, h-46*mm, w, 46*mm, fill=1, stroke=0)
        canvas.setFillColor(LIGHT)
        canvas.setFont("Helvetica-Bold", 9)
        canvas.drawString(20*mm, h-18*mm, "STAAL REAL ESTATE")
        canvas.setFillColor(colors.white)
        canvas.setFont("Helvetica-Bold", 21)
        canvas.drawString(20*mm, h-28*mm, "SEO & AI-Search Audit")
        canvas.setFillColor(colors.HexColor("#BVDFEF".replace("V","8")))
        canvas.setFont("Helvetica", 9)
        canvas.drawString(20*mm, h-35*mm, URL)
        canvas.drawString(20*mm, h-40*mm, DATE)
        # score badge
        bx, by = w-58*mm, h-42*mm
        canvas.setFillColor(colors.white)
        canvas.roundRect(bx, by, 40*mm, 32*mm, 3*mm, fill=1, stroke=0)
        canvas.setFillColor(STEEL)
        canvas.setFont("Helvetica-Bold", 34)
        canvas.drawCentredString(bx+20*mm, by+13*mm, "52")
        canvas.setFillColor(MUTE)
        canvas.setFont("Helvetica", 8)
        canvas.drawCentredString(bx+20*mm, by+24*mm, "HEALTH SCORE")
        canvas.drawCentredString(bx+20*mm, by+6*mm, "out of 100")
    # footer
    canvas.setStrokeColor(LINEC); canvas.setLineWidth(0.5)
    canvas.line(20*mm, 14*mm, w-20*mm, 14*mm)
    canvas.setFillColor(MUTE); canvas.setFont("Helvetica", 8)
    canvas.drawString(20*mm, 9*mm, "Staal Real Estate — SEO & AI-Search Audit · " + DATE)
    canvas.drawRightString(w-20*mm, 9*mm, "Page %d" % doc.page)
    canvas.restoreState()

doc = SimpleDocTemplate("Staal-SEO-Audit.pdf", pagesize=A4,
                        leftMargin=20*mm, rightMargin=20*mm, topMargin=20*mm, bottomMargin=20*mm,
                        title="Staal Real Estate - SEO & AI-Search Audit", author="Staal Real Estate")
doc.build(story, onFirstPage=decorate, onLaterPages=decorate)
print("wrote Staal-SEO-Audit.pdf")
