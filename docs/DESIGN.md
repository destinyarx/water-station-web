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
| `--app-chip-red-bg` | `rgba(239,68,68,0.14)` | `rgba(239,68,68,0.18)` |
| `--app-chip-red-text` | `#b91c1c` | `#f87171` |
| `--app-chip-gray-bg` | `rgba(100,116,139,0.12)` | `rgba(100,116,139,0.18)` |
| `--app-chip-gray-text` | `#475569` | `#94a3b8` |
| `--app-overlay-bg` | `rgba(8,21,33,0.55)` | `rgba(4,12,20,0.7)` |

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

**Scope:** Landing page, app sidebar + header, and expenses module only. Other modules (customers, deliveries, products, maintenance) are unaffected.

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

New design-system components (landing, sidebar, header, expenses) use **inline `style` props** with `var(--token)` references. This avoids Tailwind class conflicts with dark mode token switching and keeps the HTML closer to the design source.

Existing non-redesigned modules continue to use Tailwind + shadcn/ui as before.

---

## Component Library

Use **shadcn/ui** for existing non-redesigned modules. The redesigned surfaces (landing, sidebar, header, expenses) use raw HTML elements with inline styles per the design source.

---

## Icons

- **Sidebar nav:** Custom SVG paths inline in `app-sidebar.tsx`. No Lucide.
- **Landing page:** Custom SVG inline per section.
- **Existing modules:** Lucide React (unchanged).

---

## Dialogs

Custom overlay dialogs (expenses module) use `position:fixed; inset:0; z-index:80` with `var(--app-overlay-bg)` background. Enter animation: `floatUp 0.22s ease`. The dialog card uses `borderRadius:20px` with `var(--app-surface)` background.
