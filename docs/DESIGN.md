---
name: Transparent Stream
colors:
  surface: '#f6fafe'
  surface-dim: '#d7dadf'
  surface-bright: '#f6fafe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f4f8'
  surface-container: '#ebeef2'
  surface-container-high: '#e5e8ed'
  surface-container-highest: '#dfe3e7'
  on-surface: '#181c1f'
  on-surface-variant: '#3f484f'
  inverse-surface: '#2c3134'
  inverse-on-surface: '#edf1f5'
  outline: '#6f7880'
  outline-variant: '#bec8d0'
  surface-tint: '#00658a'
  primary: '#00658a'
  on-primary: '#ffffff'
  primary-container: '#4fb5e8'
  on-primary-container: '#00445e'
  inverse-primary: '#7cd0ff'
  secondary: '#416181'
  on-secondary: '#ffffff'
  secondary-container: '#badaff'
  on-secondary-container: '#406080'
  tertiary: '#875200'
  on-tertiary: '#ffffff'
  tertiary-container: '#e69b3b'
  on-tertiary-container: '#5c3700'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c4e7ff'
  primary-fixed-dim: '#7cd0ff'
  on-primary-fixed: '#001e2c'
  on-primary-fixed-variant: '#004c69'
  secondary-fixed: '#cfe5ff'
  secondary-fixed-dim: '#a9caee'
  on-secondary-fixed: '#001d34'
  on-secondary-fixed-variant: '#284968'
  tertiary-fixed: '#ffddba'
  tertiary-fixed-dim: '#ffb865'
  on-tertiary-fixed: '#2b1700'
  on-tertiary-fixed-variant: '#663d00'
  background: '#f6fafe'
  on-background: '#181c1f'
  surface-variant: '#dfe3e7'
  background-light: '#F9FCFF'
  navy-dark: '#111c21'
  accent-success: '#4ADE80'
  muted-blue: '#93B4D1'
  glass-border: rgba(147, 180, 209, 0.2)
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 64px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Outfit
    fontSize: 40px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
  title-lg:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: '1.5'
  label-md:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1200px
  gutter: 2rem
  section-padding-y: 6rem
  stack-sm: 0.5rem
  stack-md: 1.5rem
  stack-lg: 3rem
---

## Brand & Style
The brand identity for Transparent Stream is built on the concepts of purity, clarity, and fluid efficiency. It targets modern business owners in the water utility and logistics space, requiring a UI that feels professional yet approachable. 

The design style is a blend of **Corporate Modern** and **Glassmorphism**. It utilizes a "Pebble" aesthetic—soft, rounded shapes combined with extremely diffused, color-tinted shadows to create a sense of lightness and transparency. The visual language should evoke the feeling of clean water: airy, bright, and refreshing, using subtle SVG path animations to represent flow and movement.

## Colors
The palette is centered around a vibrant "Crystal Blue" primary color that represents water and technology. 

- **Primary (#4fb5e8):** Used for key actions, brand marks, and active states.
- **Secondary/Text-Main (#2A4B6A):** A deep navy used for high-contrast typography and dark-mode backgrounds to ensure professional readability.
- **Background (#F9FCFF):** A very cool-toned white that maintains the "clean" aesthetic.
- **Accent (#4ADE80):** A fresh mint green reserved for positive growth metrics and success states.
- **Muted (#93B4D1):** A desaturated blue-gray for secondary text and decorative elements like flow paths.

## Typography
The system uses a two-font pairing strategy. **Outfit** provides a geometric, modern look for headings and buttons, reinforcing the tech-forward brand. **Plus Jakarta Sans** is used for body copy due to its high legibility and friendly, rounded terminals that match the overall shape language.

Key headers use tight tracking (`-0.02em`) to maintain a punchy, editorial feel, while body text uses a generous line height (`1.6`) to ensure the interface feels "airy."

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy for desktop, centered within a 1200px max-width container. 

- **Sectioning:** Deep vertical breathing room (96px or more) between major content blocks to prevent visual clutter.
- **Grid:** A standard 12-column grid is used for dashboard layouts, while marketing sections use a simplified 3-column or 2-column flex structure.
- **Mobile:** Margins shrink to 16px (1rem), and stacked elements increase their gap to ensure touch targets remain clear.

## Elevation & Depth
Depth is created through **Ambient Shadows** and **Glassmorphism**, rather than traditional grey shadows.

1.  **Low Elevation (Glass Nav):** Uses a `backdrop-blur(12px)` and a semi-transparent white fill (`85% opacity`) with a hairline light-blue border.
2.  **Medium Elevation (Pebble Cards):** The signature card style. Uses a large, soft shadow tinted with the primary color (`rgba(79, 182, 232, 0.08)`).
3.  **High Elevation (Hover States):** On interaction, cards shift upwards (`-8px`) and the shadow deepens and spreads further to simulate the object lifting off the surface.
4.  **Glow Effects:** Critical metrics and primary buttons utilize a "glow" shadow that matches their own color, creating a neon-organic hybrid look.

## Shapes
The shape language is defined by large, organic radii. 

- **Standard Cards:** Use a `1.5rem` (24px) corner radius to create the "Pebble" look.
- **Interactive Elements:** Buttons and tags use a `full` (pill) radius, which feels more fluid and approachable than square buttons.
- **Visual Nodes:** Icons and process steps are housed in circular containers to reinforce the "drop" or "bubble" motif.

## Components

- **Buttons:** Always pill-shaped. Primary buttons use a solid Crystal Blue fill with white bold text. Secondary buttons should use a ghost style with a subtle blue border.
- **Pebble Cards:** White background, 24px rounded corners, and the signature light-blue ambient shadow. No borders.
- **Process Nodes:** Large circular icons with a `4px` white border and a soft shadow, connected by dashed SVG lines.
- **Glass Navigation:** Sticky header with backdrop-blur and a light bottom-border.
- **Data Visualization:** Use "Glowing Bar" charts. Bars should have rounded tops and a 1px high-intensity glow line at the peak of the bar.
- **Inputs:** Soft rounded corners (8px), light-blue background tint on focus, and clear Label-Medium typography above the field.