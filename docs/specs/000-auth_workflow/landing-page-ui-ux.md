# BUILD INSTRUCTION — Landing Page for "AquaFlow" Water Refilling Station Management System

> **TO THE AI AGENT:** This is a complete, self-contained build specification. Read the entire document before writing any code. Follow every section in order. Do not skip the Design System — it is the source of truth for all colors, fonts, spacing, and motion. When a value is given (hex code, px, rem), use it exactly. When a choice is left open, follow the stated *intent*, not a generic default.

---

## 0. PROJECT GOAL

Build a **single-page, conversion-focused SaaS landing page** for a Water Refilling Station Management System.

- **Audience:** Water refilling station owners, managers, and small business operators who deliver mineral water to households, offices, restaurants, and recurring customers.
- **Core message:** *"Manage your water refilling station in one simple dashboard."*
- **Feel:** Clean, pure, trustworthy, practical. Like the inside of a glass of cold mineral water — crisp, light, calming. NOT corporate, NOT cluttered, NOT enterprise-heavy.
- **Length rule:** Keep it SHORT. The whole page should scroll in ~6–8 screen heights. Each section is compact. Cut text aggressively. Conversion over completeness.

---

## 1. TECH & OUTPUT REQUIREMENTS

- Deliver a **single `index.html`** file containing all HTML, CSS, and JS inline (one file, no build step). If a framework is mandated by the calling context, use a single-component equivalent.
- **No external runtime dependencies** except Google Fonts via `<link>`.
- Use **CSS custom properties (variables)** for the entire color and spacing system — defined once in `:root`.
- **Mobile-first and fully responsive.** Breakpoints: `≤640px` (mobile), `641–1024px` (tablet), `≥1025px` (desktop).
- Use **semantic HTML5** (`<nav>`, `<header>`, `<section>`, `<footer>`) and ARIA labels on icon-only buttons.
- All interactions use vanilla JS event handlers (`onclick`, `addEventListener`). No `<form>` submission to a server — buttons are visual/scroll-anchor only unless told otherwise.
- Smooth-scroll anchor navigation between sections.

---

## 2. DESIGN SYSTEM (SOURCE OF TRUTH)

### 2.1 Aesthetic Direction
**"Pure Water / Mineral Spring."** Light, airy, oceanic. Think bottled-water-brand minimalism with subtle depth: soft gradient meshes that suggest water and light, glassmorphism on cards, gentle fluid motion. Refined minimalism — elegance through restraint, generous whitespace, and precise spacing. Avoid AI-slop: NO purple gradients, NO Inter/Roboto/Arial, NO generic stock-card grids.

### 2.2 Color Tokens (use exactly)
```css
:root {
  /* Core water palette */
  --aqua-deep:    #0A4D68;  /* deep ocean — headings, footer bg */
  --aqua-mid:     #088395;  /* teal — primary brand */
  --aqua-bright:  #05BFDB;  /* cyan — accents, highlights */
  --aqua-light:   #7FE9DE;  /* mint-aqua — soft accents */
  --aqua-mist:    #E8F7FA;  /* pale water tint — section bg */

  /* Neutrals */
  --ink:          #0B2027;  /* primary text */
  --slate:        #51707A;  /* secondary text */
  --cloud:        #FFFFFF;  /* base background / cards */
  --fog:          #F4FBFC;  /* alt section background */
  --border:       #D6EEF2;  /* hairline borders */

  /* Functional */
  --success:      #1BA784;  /* paid / positive metrics */
  --warning:      #E8A33D;  /* pending / unpaid */
}
```
**Usage rule:** Light backgrounds dominate (`--cloud`, `--fog`, `--aqua-mist`). Use `--aqua-bright` and `--aqua-mid` as sharp accents on a calm field — not evenly distributed. Primary CTA buttons use a `--aqua-mid → --aqua-bright` gradient. Deep ocean (`--aqua-deep`) anchors the footer and key headings.

### 2.3 Typography (use exactly — do NOT substitute Inter/Roboto/Arial)
- **Display / Headings:** `"Sora"` (Google Fonts) — clean geometric character, modern but warm.
- **Body / UI:** `"Manrope"` (Google Fonts) — highly legible, friendly, professional.
- Scale (desktop): H1 `clamp(2.4rem, 5vw, 3.6rem)` / H2 `2rem` / H3 `1.25rem` / body `1.0625rem` / small `0.875rem`.
- Headings: weight 700, letter-spacing `-0.02em`. Body: weight 400–500, line-height `1.65`.

### 2.4 Shape, Depth & Spacing
- **Border radius:** cards `20px`, buttons `12px`, pills/badges `999px`.
- **Shadows (soft, watery):** `0 8px 30px rgba(8,131,149,0.10)` resting; `0 16px 44px rgba(5,191,219,0.18)` on hover.
- **Glassmorphism** for the navbar and dashboard mockup cards: `background: rgba(255,255,255,0.7); backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,0.6);`
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 px. Section vertical padding: `96px` desktop, `64px` mobile.
- **Max content width:** `1200px`, centered, side padding `24px`.

### 2.5 Background Atmosphere (don't default to flat color)
- Add a subtle **radial gradient mesh** behind the hero: soft `--aqua-light` and `--aqua-bright` blobs at low opacity (~12–18%) over `--cloud`, blurred large.
- Optional **fine grain/noise overlay** at ~3% opacity for texture.
- Optional **animated water-line SVG wave** as a divider between hero and the next section (gentle, slow `~8s` loop). Keep it tasteful, not gimmicky.

### 2.6 Motion
- **One orchestrated page load:** hero elements reveal with staggered fade-up (`animation-delay` 0ms → 120ms → 240ms → 360ms on headline, subheadline, CTAs, hero visual).
- **Scroll reveals:** sections/cards fade-up on enter using `IntersectionObserver` (translateY 24px → 0, opacity 0 → 1, 0.6s ease).
- **Hover micro-interactions:** cards lift `-6px` + shadow grow; buttons brighten gradient + slight scale `1.03`.
- Respect `prefers-reduced-motion: reduce` → disable transforms/animations.

---

## 3. PAGE STRUCTURE (build in this exact order)

### SECTION 1 — Navbar
- **Sticky** top, glassmorphism background, subtle bottom hairline on scroll.
- **Left:** logo — a water-drop SVG icon in `--aqua-bright` + wordmark **"AquaFlow"** in Sora 700 (you may rename if the user provides a real name).
- **Center (desktop only):** anchor links → `Features` · `Preview` · `Pricing` · `FAQ`. Hide on mobile, collapse into a hamburger that opens a clean slide-down menu.
- **Right:** **`Sign In`** (text/ghost button) + **`Sign Up`** (filled gradient pill button). On mobile keep `Sign Up` visible.
- Links smooth-scroll to their sections.

### SECTION 2 — Hero
- Two-column on desktop (text left, visual right); stacked on mobile.
- **Headline (H1):** *"Run your water refilling station with less paperwork and fewer missed deliveries."*
- **Subheadline:** *"Manage customers, delivery schedules, sales, expenses, and machine maintenance in one simple system built for water refilling businesses."*
- **CTAs:** Primary **`Get Started`** (gradient pill) · Secondary **`View Features`** (ghost/outline, scrolls to Features).
- **Trust strip** under CTAs (small): e.g. "Built for households · offices · restaurants · regular customers" or simple trust badges (No setup fees · Works on any device · Made for small businesses).
- **Hero visual (right):** a stylized, abstract floating dashboard preview OR a large water-drop/glass illustration with light caustics. Use glassmorphism + the gradient mesh. This is the visual centerpiece — make it memorable.

### SECTION 3 — Problem / Pain Point
- Section eyebrow + short H2, e.g. *"Running a refilling station shouldn't feel this messy."*
- Present **6 pain points** as compact items (icon + one-line label) in a 3×2 (desktop) / 1-col (mobile) grid:
  1. Missed or forgotten deliveries
  2. Manual, scattered customer lists
  3. Untracked or unpaid payments
  4. Messy, hard-to-read sales records
  5. Unexpected machine maintenance issues
  6. Hard to monitor staff & daily operations
- Visual treatment: muted/desaturated icons here (the "before") to contrast with the bright "after" in Features.

### SECTION 4 — Core Features
- H2, e.g. *"Everything your station needs, in one dashboard."*
- **6 feature cards** (rounded `20px`, glass/white, soft shadow), 3-col desktop / 2-col tablet / 1-col mobile. Each card = icon (line-style, `--aqua-mid`) + title + 1–2 line description.

| # | Title | Description |
|---|-------|-------------|
| 1 | Customer Management | Store customer details, addresses, contact numbers, order history, and payment status in one organized place. |
| 2 | Delivery Scheduling | Plan daily and recurring deliveries for households, offices, restaurants, and regular customers. |
| 3 | Sales Tracking | Monitor daily sales, paid and unpaid orders, and total income with clear reports. |
| 4 | Expense Management | Track bills, staff expenses, delivery costs, repairs, and other business expenses. |
| 5 | Maintenance Scheduling | Schedule machine cleaning, filter replacement, preventive maintenance, and repair reminders. |
| 6 | Dashboard Overview | See today's deliveries, sales, expenses, pending payments, and upcoming maintenance at a glance. |

- Use clean line icons (inline SVG). Suggested: user/contact, calendar/truck, chart-line, wallet, wrench/gear, grid/layout.

### SECTION 5 — Product / Dashboard Preview
- H2 + one supporting line: *"See your whole business at a glance."*
- Render a **realistic but lightweight dashboard MOCKUP** (pure HTML/CSS, no real data) inside a glass browser-frame (fake top bar with 3 dots + a URL pill like `app.aquaflow.com/dashboard`). The mockup must visually contain:
  - **Stat cards row:** Today's Deliveries (e.g. `12`), Total Sales (e.g. `₱8,450`), Pending Payments (e.g. `₱1,200` in `--warning`), Upcoming Maintenance (e.g. `2 tasks`).
  - **A small bar or line chart** for weekly sales (CSS-only bars are fine).
  - **Recent Customers** mini-list (3 rows: name + status pill "Paid"/"Pending").
  - **Expense Summary** mini widget (small donut or 2–3 line items).
- Use peso `₱` since target users are Philippine small businesses (location: PH). Keep numbers realistic for a small station.
- Slight 3D tilt / float on the frame is welcome; keep it readable.

### SECTION 6 — Pricing / Call-to-Action
> Build this as a **compact CTA band** (the user wants the page short). You MAY include a single simple pricing pill ("Free to start" / "Affordable monthly plan") but do not build a full multi-tier pricing table unless explicitly requested. Keep it to one focused conversion block.
- Full-width band with a soft `--aqua-mid → --aqua-deep` gradient OR an `--aqua-mist` panel with a wave top-edge.
- **Headline:** *"Ready to organize your water refilling business?"*
- **Description:** *"Start managing customers, deliveries, sales, expenses, and maintenance from one simple dashboard."*
- **Button:** **`Start Managing Now`** (large, high-contrast).
- Optional reassurance line under button: "No setup fees · Cancel anytime · Set up in minutes."

### SECTION 7 — FAQ
- H2 *"Frequently asked questions."*
- **Accordion** (vanilla JS toggle, smooth height/opacity, chevron rotate). 5–6 concise Q&As:
  1. Is this built specifically for water refilling stations? → Yes, every feature maps to real refilling-station operations.
  2. Can I track unpaid orders and customer balances? → Yes, see paid/pending status per customer instantly.
  3. Does it work on my phone? → Yes, fully responsive on any device.
  4. Can I schedule recurring deliveries? → Yes, daily and recurring schedules for households, offices, and businesses.
  5. Will it remind me about machine maintenance? → Yes, set cleaning, filter, and repair reminders.
  6. Do I need technical skills to use it? → No, it's designed to be simple for small business owners.
- Only one panel open at a time; first item may start open.

### SECTION 8 — Footer
- Background `--aqua-deep`, text in `--aqua-mist`/`--cloud`.
- 3–4 columns: **Brand** (logo + one-line tagline "Simple management for water refilling stations") · **Product** (Features, Preview, Pricing) · **Support** (FAQ, Contact) · **Legal** (Privacy, Terms).
- Bottom bar: © year + "AquaFlow" + small social icon row (water-drop-styled, optional).
- Decorative subtle wave at the very top edge of the footer.

---

## 4. EXTRA TRUST/CONVERSION ELEMENTS (recommended additions)
> The user asked what else attracts visitors. Add these *only if they keep the page compact* — prefer subtlety over more scrolling:

- **Mini trust bar** directly under the hero: 3 quick stat/benefit chips (e.g. "Less paperwork", "No missed deliveries", "Clear sales tracking") — reinforces benefits fast.
- **A single short testimonial / social-proof line** near the CTA (a believable quote from a station owner) — builds trust without a heavy testimonials section.
- **"How it works in 3 steps"** strip (Add customers → Schedule deliveries → Track sales) — optional, only if it fits without bloating the page.
- **Benefit-framed microcopy** everywhere: lead with the *outcome* (e.g. "Never miss a delivery again") not the *feature name*.

Do not add more than two of these. Page brevity is a hard requirement.

---

## 5. COPY & TONE RULES
- Tone: **simple, helpful, business-focused, not too corporate.** Speak to a real station owner.
- Lead with benefits/outcomes, support with the feature. Short sentences. No jargon, no fluff.
- Currency: **₱ (Philippine peso)** in any mockup numbers.
- Every CTA must be action-oriented and consistent in styling.

---

## 6. QUALITY CHECKLIST (verify before finishing)
- [ ] All 7 required sections present + footer, in order.
- [ ] Navbar has working Sign In + Sign Up buttons and smooth-scroll links.
- [ ] Hero uses the exact headline, subheadline, and CTA labels given.
- [ ] Colors come only from the defined CSS variables; fonts are Sora + Manrope (no Inter/Roboto/Arial).
- [ ] No purple gradients, no generic AI-slop layout.
- [ ] Dashboard mockup shows: deliveries, total sales, pending payments, upcoming maintenance, recent customers, expense summary.
- [ ] FAQ accordion works; one panel open at a time.
- [ ] Fully responsive at ≤640 / 641–1024 / ≥1025 px; no horizontal scroll on mobile.
- [ ] Page-load stagger + scroll-reveal animations work; `prefers-reduced-motion` respected.
- [ ] Total page is short and scannable — not a long scroll.
- [ ] Single self-contained file, valid semantic HTML, ARIA on icon buttons.