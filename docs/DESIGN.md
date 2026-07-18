# Design System

AquaFlow uses a two-surface token system: `--lp-*` for the public landing page and `--app-*` for the authenticated app interior (sidebar, header, and module pages). Dark mode is intentionally scoped to these surfaces only (see ADR 0004).

---

## Typography

**Font:** Poppins (Google Fonts, via `next/font/google`)  
**CSS variable:** `--font-poppins`  
**Weights loaded:** 400, 500, 600, 700, 800  
**Applied on:** `<html>` via `font-family: var(--font-poppins), sans-serif` in `globals.css`

---

## Color Tokens

### Landing Page (`--lp-*`)

| Token | Light | Dark |
|---|---|---|
| `--lp-page-bg` | `#f6fbff` | `#081521` |
| `--lp-surface` | `#ffffff` | `#0d2035` |
| `--lp-surface-2` | `#f0f7fe` | `#0f2640` |
| `--lp-header-bg` | `rgba(246,251,255,0.88)` | `rgba(8,21,33,0.88)` |
| `--lp-text` | `#0c1c2e` | `#e8f4ff` |
| `--lp-text-muted` | `#4a6880` | `#7daac8` |
| `--lp-text-soft` | `#6b8ca8` | `#5a7e9a` |
| `--lp-text-faint` | `#94b4c8` | `#3d607a` |
| `--lp-brand-text` | `#0a6cc4` | `#38bdf8` |
| `--lp-nav-link` | `#2d4e6a` | `#8ab8d8` |
| `--lp-border` | `rgba(14,108,196,0.1)` | `rgba(56,189,248,0.1)` |
| `--lp-border-strong` | `rgba(14,108,196,0.22)` | `rgba(56,189,248,0.2)` |
| `--lp-chip-bg` | `rgba(14,108,196,0.1)` | `rgba(56,189,248,0.15)` |

### App Interior (`--app-*`)

| Token | Light | Dark |
|---|---|---|
| `--app-page-bg` | `#eef6fd` | `#071420` |
| `--app-surface` | `#ffffff` | `#0d1f30` |
| `--app-surface-2` | `#f4f9fe` | `#0f2640` |
| `--app-sidebar-bg` | `#ffffff` | `#0b1f2e` |
| `--app-sidebar-border` | `rgba(14,108,196,0.1)` | `rgba(56,189,248,0.08)` |
| `--app-sidebar-text` | `#2d4e6a` | `#7daac8` |
| `--app-sidebar-active-bg` | `rgba(14,108,196,0.1)` | `rgba(56,189,248,0.15)` |
| `--app-sidebar-active-text` | `#0a6cc4` | `#38bdf8` |
| `--app-text` | `#0c1c2e` | `#e8f4ff` |
| `--app-text-soft` | `#4a6880` | `#7daac8` |
| `--app-text-faint` | `#8aafc8` | `#3d607a` |
| `--app-brand` | `#0a6cc4` | `#38bdf8` |
| `--app-border` | `rgba(14,108,196,0.1)` | `rgba(56,189,248,0.08)` |
| `--app-border-strong` | `rgba(14,108,196,0.2)` | `rgba(56,189,248,0.15)` |
| `--app-chip-bg` | `rgba(14,108,196,0.1)` | `rgba(56,189,248,0.15)` |
| `--app-chip-amber-bg` | `rgba(245,158,11,0.14)` | `rgba(245,158,11,0.18)` |
| `--app-chip-amber-text` | `#b45309` | `#fbbf24` |
| `--app-chip-green-bg` | `rgba(34,197,94,0.14)` | `rgba(34,197,94,0.18)` |
| `--app-chip-green-text` | `#15803d` | `#4ade80` |
| `--app-green-strong` | `#3ecf8e` | `#3ecf8e` |
| `--app-green-deep` | `#1f9d68` | `#2bbd7e` |
| `--app-green-fill` | `linear-gradient(135deg,#40d598,#1f9d68)` | `linear-gradient(135deg,#34d399,#159f6b)` |
| `--app-green-soft-bg` | `#e4f8ee` | `rgba(52,211,153,0.15)` |
| `--app-green-shadow` | `0 10px 22px rgba(31,157,104,0.30)` | `0 10px 22px rgba(0,0,0,0.40)` |
| `--app-chip-red-bg` | `rgba(239,68,68,0.14)` | `rgba(239,68,68,0.18)` |
| `--app-chip-red-text` | `#b91c1c` | `#f87171` |
| `--app-chip-gray-bg` | `rgba(100,116,139,0.12)` | `rgba(100,116,139,0.18)` |
| `--app-chip-gray-text` | `#475569` | `#94a3b8` |
| `--app-chip-violet-bg` | `rgba(139,92,246,0.12)` | `rgba(139,92,246,0.18)` |
| `--app-chip-violet-text` | `#6d28d9` | `#c4b5fd` |
| `--app-overlay-bg` | `rgba(8,21,33,0.55)` | `rgba(4,12,20,0.7)` |
| `--app-surface-3` | `#f7fbff` | `#0d1f2c` |
| `--app-row-hover` | `#f5fafe` | `rgba(56,189,248,0.05)` |
| `--app-shadow-card` | `0 6px 22px rgba(20,100,180,0.06)` | `0 6px 22px rgba(0,0,0,0.28)` |

#### Product-card gradients (feature 007)

Themed background gradients for the product card "visual" header, since they
differ per state and must follow dark mode.

| Token | Light | Dark |
|---|---|---|
| `--app-card-refill-bg` | `linear-gradient(135deg,#c2e5fb,#ddf0ff)` | `linear-gradient(135deg,#0c2d42,#103448)` |
| `--app-card-stock-bg` | `linear-gradient(135deg,#beefd6,#d8f5e8)` | `linear-gradient(135deg,#0c2e22,#0e3828)` |
| `--app-card-disc-bg` | `linear-gradient(135deg,#e4eaef,#edf2f6)` | `linear-gradient(135deg,#1a2530,#1f2e3c)` |

---

## Animations

All animations are defined as `@keyframes` in `globals.css` and referenced by name in inline `style` props.

| Name | Usage |
|---|---|
| `floaty` | Hero card float (6s ease-in-out infinite) |
| `waveDrift` | Bottom SVG waves on landing hero |
| `waveDrift2` | Second wave layer (offset phase) |
| `bubbleRise` | Landing page bubble elements |
| `caustic` | Glow blobs behind hero |
| `floatUp` | Dialog enter animation |
| `popIn` | Scale-in for small overlays |

---

## Dark Mode

**Implementation:** `html.dark` class toggled by JavaScript, persisted to `localStorage` key `aqua-theme`.

**Scope:** Landing page, app sidebar + header, expenses, **customers, products, and documents** modules, plus deliveries, maintenance, and the **complete-registration** page. Customers and products were added in feature 007, documents in feature 009, deliveries in feature 010, and complete-registration in task 010 (all extend ADR 0004's original three-surface scope). Only the `(auth)` sign-in/sign-up screens and `playground` remain light-only.

**Public auth surfaces (sign-in, sign-up, complete-registration):** all three share the `AuthShell` (`src/components/layout/auth-shell.tsx`) — a full-screen `--lp-*` ocean background with the shared `OceanBackdrop` (glow blobs, rising bubbles, drifting waves), a home logo, and the dark-mode toggle. `AuthShell` owns the single `initTheme()` call for these routes (they render outside both the landing navbar and the app shell). The complete-registration card and form use Tailwind classes with the `(--lp-*)` token shorthand so they follow dark mode. The Clerk `<SignIn>`/`<SignUp>` widgets can't read our CSS tokens, so they're themed via `authAppearance(isDark)` (`src/app/(auth)/auth-appearance.ts`), which passes concrete per-theme values.

**State management:** Module-level pub/sub singletons in `src/stores/theme-store.ts` and `src/stores/sidebar-store.ts`. React components subscribe via `useSyncExternalStore` in `src/stores/use-theme.ts` and `src/stores/use-sidebar.ts`.

**Init point:** `initTheme()` must be called once on mount in `LandingNavbar` and `AppHeader`. Do not call it in multiple places.

See ADR 0004 for the decision record.

---

## Layout

### Sidebar

| State | Width |
|---|---|
| Expanded | `252px` |
| Collapsed | `78px` |

Transition: `width 0.2s ease`. Toggle is triggered by the header's sidebar button.

### Header

Height: `62px`. Contains: sidebar toggle, breadcrumb, theme toggle, vertical divider, `<UserButton />`.

### App Shell

```
<div style="display:flex; height:100vh; overflow:hidden">
  <AppSidebar />          /* sticky, flex-none */
  <div style="flex:1; display:flex; flex-direction:column">
    <AppHeader />         /* 62px */
    <main style="flex:1; overflow-y:auto">
      {children}
    </main>
  </div>
</div>
```

---

## Styling Approach

**Tailwind CSS is the default.** Use Tailwind utility classes for all styling, including
design-system tokens. Dark mode works automatically because the `--lp-*` / `--app-*` CSS
variables reassign under `html.dark` (globals.css line 5 wires the `dark` variant to the
`.dark` class), so a token utility switches themes without a `dark:` variant.

Reference design tokens with Tailwind v4's CSS-variable shorthand:

- Colors: `bg-(--lp-surface)`, `text-(--app-text)`, `border-(--lp-border-strong)`,
  `placeholder:text-(--lp-text-faint)`, `focus:border-(--lp-brand-text)`.
- Gradients / images: `bg-[image:var(--lp-hero-grad)]`.
- Composite values with a token inside (shadows, rings): keep the bracket form,
  e.g. `focus:shadow-[0_0_0_3px_var(--lp-chip-bg)]`.
- Prefer the numeric spacing scale over arbitrary px (`mb-4.5` not `mb-[18px]`,
  `max-w-115` not `max-w-[460px]`) — the ESLint `suggestCanonicalClasses` rule flags these.

**Use plain CSS (an inline `style` prop or a `@keyframes` rule in globals.css) only when
Tailwind genuinely can't express it:**

- Runtime-dynamic values computed in JS (e.g. per-element position/size in a `.map()`),
  such as the bubbles in `OceanBackdrop`. Mark these with a `// ponytail:` note.
- Keyframe animation *definitions* (already in globals.css; reference them from Tailwind
  with `animate-[caustic_11s_ease-in-out_infinite]`).

The earlier redesigned surfaces (landing, sidebar, header, expenses, and the feature 007–011
modules) were built with inline `style` props before this guidance and are not being
rewritten wholesale, but **new or edited components should use Tailwind**, and prefer
migrating a component to Tailwind when you're already touching its markup.

---

## Component Library

Use **shadcn/ui** components where they fit. New/edited UI is styled with Tailwind (see [Styling Approach](#styling-approach)). The earlier redesigned surfaces (landing, sidebar, header, expenses) use raw HTML elements with inline styles per the design source — that predates the Tailwind-first guidance and isn't being rewritten wholesale.

---

## Icons

- **Sidebar nav:** Custom SVG paths inline in `app-sidebar.tsx`. No Lucide.
- **Landing page:** Custom SVG inline per section.
- **Existing modules:** Lucide React (unchanged).

---

## Dialogs

Custom overlay form dialogs use the shared `src/components/app/app-modal.tsx` shell: `position:fixed; inset:0; z-index:80` with `var(--app-overlay)` background + `backdrop-filter:blur(4px)`. Enter animation: `floatUp .26s ease`. The dialog card uses `borderRadius:20px` with `var(--app-surface)` background and a gradient brand badge in the header. Form dialogs anchor to the top (`alignItems:flex-start`, `padding:36px 18px`); individual feature forms still own their validation, submit buttons, and mutation behavior.

**Confirm dialog** — confirmations use the shared `src/components/app/confirm-dialog.tsx`: centered (`alignItems:center`), `maxWidth:430px` by default, rounded icon tile, title + description, and Cancel / confirm buttons. It defaults to the primary blue gradient action used by create/form submit buttons. Archive/delete flows explicitly use `variant="destructive"` for the red icon tile and destructive button. App-themed so it follows dark mode.

---

## Toast Notifications (feature 007-toast)

Global fire-and-forget notifications, separate from `ConfirmDialog` (which blocks on a decision) — toasts only report an outcome.

**Store** — `src/stores/toast-store.ts` is a module-level pub/sub singleton (same pattern as `theme-store.ts`), so it can be called from anywhere: components, hooks, mutation `onSuccess`/`onError`, or plain async functions — not just inside React. Public API:

```ts
toast.success(message, opts?)
toast.error(message, opts?)
toast.warning(message, opts?)
toast.info(message, opts?)
```

`opts` is `{ duration?: number; autoClose?: boolean }` — `duration` defaults to `4000`ms, `autoClose` defaults to `true` (pass `false` to require manual dismissal).

**Renderer** — `src/components/app/toast.tsx` exports `<Toaster />`, mounted once in `src/app/providers.tsx` (sibling to `{children}`, inside `QueryClientProvider`) so it's available app-wide. It subscribes via `useSyncExternalStore`.

**Position & stacking** — `position:fixed; top:22px; right:22px; zIndex:200`, a `flex-direction:column; gap:13px` stack, width `min(420px, calc(100vw - 32px))` (deliberately large/SweetAlert-scale so a toast is easy to spot).

**Card style** — `var(--app-surface)` background, `1px solid var(--app-border)`, `borderRadius:17px`, elevated shadow (`0 22px 50px rgba(7,40,70,0.26)`), `overflow:hidden`. Left-to-right: a 6px **accent rail** (per-type gradient), a **46×46 gradient icon disc** (white icon) with a one-shot **pulsing ring** behind it, a text block with a small uppercase type **eyebrow label** in the accent colour above the message, and a dismiss (×) button. Per-type gradients: success `#40d598→#1f9d68`, error `#fb7185→#e11d48`, warning `#fbbf24→#f59e0b`, info ocean `#4fb5e8→#00658a`. The info label reads "Notification" (info is what realtime notifications use).

**Animation** — enters via `toastSlideInRight` (from `translateX(28px)`), exits via `toastSlideOut` (`.24s ease`). The icon disc pops in (`toastIconPop`) while its stroke **draws itself in** (`toastIconDraw`, staggered per path) and the ring pulses out (`toastRingPulse`). A bottom **countdown progress bar** (`toastProgress`, `scaleX` over `duration`) shows time remaining. Hovering pauses both the auto-close timer and the progress bar. All keyframes live in `globals.css`.

**Usage** — wired into the Maintenance module: `useCompleteTask`, `useCreateSchedule`, and `useUpdateSchedule` call `toast.success`/`toast.error` from their mutation `onSuccess`/`onError`, alongside the existing query invalidation. New modules should follow the same pattern — fire toasts from the mutation hook, not from the component calling it.

---

## Stat Cards

Every module's header stat-card row shares one shell and sizing scale, with two variants depending on whether the metric is a plain count or a completion/ratio metric. Reference implementations: `src/features/expenses/components/expenses-page.tsx` (`StatCard`) and `src/features/deliveries/components/deliveries-page.tsx` (`StatCard` + the featured gradient card) for the **plain** variant; `src/features/documents/components/DocumentsPage.tsx` (`StatChip`) for the **completion-bar** variant. New modules should build on this section instead of inventing their own stat-card shape.

### Shared shell

- Grid: `display:grid; gridTemplateColumns: repeat(auto-fit,minmax(210–220px,1fr)); gap:14px; marginBottom:18px`.
- Card: `background: var(--app-surface); border:1px solid var(--app-border); borderLeft: 3px solid <accentColor>; borderRadius:16px; padding:15px 16px; boxShadow: var(--app-shadow-card)`.
- Header row (label + icon): `display:flex; alignItems:flex-start; justifyContent:space-between; marginBottom:10px`.
  - Label: `fontSize:10.5px; fontWeight:700; letterSpacing:0.08em; textTransform:uppercase; color: var(--app-text-faint)`.
  - Icon chip: `28×28px; borderRadius:9px`, background/color from the `--app-chip-*` pair; icon SVG `15×15`.
- Value: `fontSize:25px; fontWeight:800; letterSpacing:-0.03em; lineHeight:1; color: var(--app-text)`. Drop to `18px` (a `valueSmall` flag) only for long/short-text values like a category label — never for numeric counts.
- Helper/sub line: `fontSize:12px; color: var(--app-text-soft); marginTop:7px`. Truncate with `whiteSpace:nowrap; overflow:hidden; textOverflow:ellipsis` if it can overflow a narrow card.
- **Featured/hero card** (one gradient card per row — e.g. expenses "Spent this month", deliveries "Scheduled today"): same shell dimensions, `background: linear-gradient(150deg,#0b73c8,#075098)`, white / `#bfe2ff` text, an optional low-opacity decorative wave `<svg>` in the bottom-right corner. The wave is decorative only — it must not add to the card's height budget above.
- Emphasis variants with extra decoration (e.g. customers' glow + wave background) may run the value/icon a touch larger (up to `26px` value / `34px` icon) to keep the decoration legible, but must not exceed the pre-revamp sizes below and should land at roughly the same overall card height as the plain variant.

Do **not** use the pre-revamp sizes still visible in old commits (`18–20px` padding, `34–42px` icon chips, `32–36px` values, `22–26px` grid gaps) — those cards were too tall and ate into the table/list below the fold. The `15px`/`16px`/`25px`/`28px` scale above is current and applies to every module, redesigned or new.

### When to add a completion bar

If a stat represents **progress toward a whole** — a percentage, an `n / total` ratio, quota/usage, anything a user would read as "how much of this is done" — render it with the loading-bar variant from the Documents module (`StatChip`), not a bare number. If a stat is just a count with no natural denominator (e.g. "Total customers", "Overdue tasks"), use the plain shell with no bar.

Bar variant additions to the shared shell, inserted between the value and the helper line:

- `height:3px; background: var(--app-border); borderRadius:99px; overflow:hidden; marginBottom:8px`, containing an inner fill `div` at `height:100%; width:<percentage>; background:<accentColor>; borderRadius:99px`.
- The helper line still sits at the bottom and must spell out the ratio in words (e.g. `"3 of 5 filters replaced"`, `"80% approved"`) — the bar echoes that text visually, it doesn't replace it.
- Compute the fill width as a clamped percentage string: `Math.min(100, Math.round((part / Math.max(whole, 1)) * 100)) + '%'`. Cards with no meaningful denominator yet should fall back to `0%` with a gray/faded accent rather than dividing by zero (see products' `Low stock` / `Out of stock` cards for the pattern).

### Choosing accent colors

Pick from the existing chip token pairs (`--app-chip-*-bg` / `--app-chip-*-text`) or the raw hex already used alongside them (`#38bdf8` brand, `#22c55e` green, `#f59e0b` amber, `#ef4444` red, `#8b5cf6` violet) — don't invent a new accent color per module. Neutral/zero states fall back to `var(--app-border)` / `var(--app-chip-gray-bg)` / `var(--app-text-faint)`.

---

## Module Patterns (feature 007)

These patterns back the redesigned **Customers** and **Products** pages. Both pages are plain React + inline styles consuming `--app-*` tokens (no shadcn), wrapped in `maxWidth:1160px; padding:26px 28px 56px`.

### Stat cards

Follows the shared shell in [Stat Cards](#stat-cards). Two variants, both with a 3px left accent border and `var(--app-shadow-card)`:

- **Glow + wave** (customers): the emphasis variant — a radial `glow` circle (top-right, `86px`) and a bottom `<svg>` wave, value at `26px`, icon chip `34×34`, helper line.
- **Progress bar** (products): the completion-bar variant — label + icon row, `25px` value, a 3px progress bar (`barWidth` %), helper line. Inactive metrics (zero low/out) fall back to gray tokens and `0%` width.

### Product cards

Responsive grid `repeat(auto-fill,minmax(236px,1fr))`. Each card has a 104px gradient "visual" header (`--app-card-*-bg` by state) with layered waves, a frosted icon tile (jug for refill / bottle for stocked), a type tag, a frosted kebab, and a `Discontinued` overlay when `is_active = false`. Body shows name, 2-line clamped description, price, and a stock badge (out / low / in-stock) or a `Refillable` pill.

### Directory rows (customers)

CSS-grid "table" (`minmax(200px,1.4fr) 160px minmax(150px,1fr) minmax(160px,1fr) 64px`) with an avatar (business/home icon) carrying a status dot, a derived `#000123` code, a type chip, an `Inactive` chip, contact, and address. Inactive rows render at `opacity:0.6`.

### Record status

Active/Inactive (customers) and Active/Discontinued (products) are backed by `is_active` and are **distinct from archive** (`deleted_at`). Toggled from the row/card kebab menu (`Set inactive`/`Discontinue` ↔ reactivate). See `CONTEXT.md` → Record Status Vocabulary and ADR 0005.

### Pagination

Client-side: the filtered+sorted array is sliced (`PER_PAGE` = 6 customers / 8 products) with a `Showing X–Y of N` footer and prev / numbered / next controls.

## Module Patterns (feature 009 — Documents)

The **Documents** page uses the plain-React + `--app-*` shell, widest of all modules at `maxWidth:1200px; padding:32px 24px`. Eyebrow-less; title "Documents" with a subtitle and a gradient "Upload document" button (top-right).

### Stat cards

Four progress-bar chips (`repeat(auto-fit,minmax(220px,1fr))`), the canonical completion-bar variant from [Stat Cards](#stat-cards): label + icon row, `25px` extrabold number, 3px progress bar, helper line. Accent colors: brand (total), amber (private), amber (expiring), green (shared).

### Data table

CSS-grid with 6 columns (`2fr 2.2fr 1.5fr 120px 96px 52px`) inside a `border-radius:18px` surface card. Head row uses `--app-surface-2`. Body rows use `--app-row-hover` on hover. Columns: Title, Description, Category / Type, Date, Status, Actions.

- **Title cell** — a square 34×34 file-type badge (background + color keyed to extension: PDF → red, JPG/PNG → green, DOCX → blue, fallback → brand chip), title text truncated at 160px, an amber lock icon for `only_me` documents, and the uploader name in faint text below.
- **Category / Type cell** — category label in brand uppercase 11px + a gray chip for the document type below.
- **Status badge** — four states, priority order: Expired (red chip), Expiring (amber chip, within 30 days), Approved (green chip), Uploaded (brand chip). Derived from `expiry_date` vs today and `is_approved`.
- **File type badge colors** — PDF `rgba(220,38,38,0.1)` / `#dc2626`; JPG/PNG `rgba(34,197,94,0.1)` / `#15803d`; XLSX `rgba(34,197,94,0.12)` / `#166534`; DOCX `rgba(59,130,246,0.1)` / `#1d4ed8`; fallback `--app-chip-bg` / `--app-brand`.

### Upload / Edit dialog (shadcn Dialog)

`maxWidth:lg`, scrollable. Gradient brand icon tile in header (same 44×44 rounded-[13px] pattern). Sections in order:

1. Drop zone (dashed border, placeholder — no upload logic yet)
2. "Document info" card (`--app-surface-2`) — Title (required), Description (textarea)
3. 2-col grid — Category (required select, 10 options) + Document Type (dependent select, disabled until category chosen)
4. 2-col grid — Document date (date input) + Amount ₱ (number with ₱ prefix)
5. Expiry date (full-width date input)
6. "Visibility" card — two toggle buttons side by side: **All staff** / **Just me**, border highlights to brand on selection

### Visibility filter (toolbar)

Segmented control: `p-1` surface card with `border-radius:12px`, three pill buttons (`rounded-[9px]`). Active pill: `--app-brand` background + white text + shadow. Inactive: transparent + soft text.

---

## Module Patterns (feature 008 — Maintenance)

The **Maintenance** page reuses the same plain-React + `--app-*` shell, narrowed to `maxWidth:1000px` (a single-column task list, not a grid). Eyebrow "Equipment upkeep" / title "Maintenance schedule".

### Stat cards

Four plain variants (no bar — these are counts with no denominator) of the canonical shell from [Stat Cards](#stat-cards): label + icon row, `25px` number, 3px left accent, no helper line: **Due this week** (brand), **Overdue** (red, falls back to gray at zero), **Done this month** (green), **Recurring** (violet `#8b5cf6`). Counts ignore inactive schedules except "Done this month".

### Task rows

Flat list of cards (`gap:12px`), each: a pill-shaped **Complete** button (outlined brand pill with a check icon; not done → open state, wired to `useCompleteTask`), title (struck through when completed) with a violet **recurrence chip** (Daily / Once–Thrice a week) and an `Inactive` chip, a meta row (wrench+equipment, person+assignee, priority pill), a **due pill** colored by `displayStatus` (red overdue / brand upcoming / green completed), and the shared kebab (`MaintenanceRowActions`: edit / toggle schedule active / delete — delete owner-only). Inactive-schedule rows render at `opacity:0.6`.

**Complete button** — outlined brand pill (`Complete`, check icon) while open; solid `--app-chip-green-text` pill (`Completed`, check icon) once done. Completing requires confirmation via the shared `ConfirmDialog` (green check-circle icon tile, green confirm button — a non-destructive variant of the shared component, styled to match the "Done" accent rather than the default brand-blue or destructive-red treatments) before `useCompleteTask` runs. Reopening a completed task (clicking the green pill again) is a direct, unconfirmed action.

### Due label

Overrides any date in the mockup: `Overdue N days` / `Due today` / `Tomorrow` / `In N days` (≤3 only) / formatted date otherwise. Logic in `maintenance.view.ts:dueLabelFor`.

### Recurrence picker (create dialog)

Violet-accented panel with One-time / Everyday / Weekly pills. One-time reveals a hand-rolled `MultiDateCalendar` (multi-select, past disabled); Everyday/Weekly reveal a `min=today` start date; Weekly adds a `WeekdayPicker` (Mon–Sun toggles, frequency = number selected, 1–3). Cadence is fixed after creation — the edit dialog shows it read-only and only edits this occurrence's date/assignee/descriptive fields. See `CONTEXT.md` → Maintenance Domain and ADR 0006.

---

## Delivery schedule and history dialogs (feature 016)

The Recurring Schedules and Delivery History dialogs use the wide operational
modal pattern (`max-width: 1080–1120px`) so recipient, timing, outcome, and
action hierarchy remain readable without a cramped table. Their scroll regions
reserve a stable gutter and additional right padding so content does not touch
the scrollbar.

- **Schedules** — responsive filter row (customer search, Active/Inactive,
  Business/Household) above stacked surface cards. Each card shows recipient
  and type first, then recurrence and a single timing callout: Current due work
  takes priority; otherwise show Next. Template items live in a collapsed
  disclosure and Stop/Resume remains the only action.
- **History** — outcome filter pills above stacked surface cards ordered by the
  recorded terminal time. Recipient and outcome lead; scheduled date and total
  are secondary. Failure/cancellation reason uses the red chip treatment.
  Product names, quantities in neutral `unit`/`units`, and line totals live in a
  collapsed disclosure.
- Both surfaces use Tailwind utilities with `--app-*` tokens, the shared
  `AppModal`, limit-plus-one Previous/Next pagination, and dedicated
  loading/error/empty/no-result states.

## Module Patterns (feature 011 — AquaFlow AI Assistant)

The owner-only **AI Assistant** page (`/ai-assistant`) is a full-height, two-pane chat
shell built with React + Tailwind on the same `--app-*` tokens — no new token namespace,
no plain CSS. Dark mode works for free via the shared tokens. The nav item carries a
brand `New` badge and only renders for owners.

### Layout

Left: a fixed `264px` **conversation sidebar** (`--app-surface`, right border) with a
gradient **New chat** button, an uppercase "Conversations" eyebrow, and a scrollable list
of the signed-in owner's conversations (title + relative time; a trash icon reveals on
row hover). Right: a flex column of the **message list** (scrolls, `--app-page-bg`) over a
sticky **composer**.

### Message bubbles

User bubbles are right-aligned brand-gradient pills (`rounded-br-[4px]`, white text) that
show `display_text` when present (ready-made prompt title) else `content`. Assistant bubbles
are left-aligned surface cards with a small brand water-drop avatar and always show `content`,
optionally followed by one structured card:

- **insight** — responsive grid of metric tiles (uppercase label, `20px` value, tone-colored trend).
- **flag** — stacked rows (title + subtitle + tone-colored badge) for attention items.
- **ranked** — numbered rows with a brand progress bar (`pct` width) and a right-aligned value.

Card tone (`green|amber|red|brand`) maps to the existing `--app-chip-*` pairs. A three-dot
**typing indicator** (bouncing dots in an assistant bubble) shows while a reply is pending.

### Empty state & prompt cards

A new/empty conversation shows a centered water-drop hero ("How can I help with your station?")
over a responsive grid of **ready-made prompt cards** (tone-colored icon tile + short title).
Clicking one sends immediately: the bubble shows the short title while the long, prompt-engineered
body is what gets sent/stored. See `CONTEXT.md` → AquaFlow AI Domain and ADR 0007 / 0008.
