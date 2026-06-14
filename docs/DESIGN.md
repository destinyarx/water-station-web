---
name: Ocean Vitality
colors:
  surface: '#f7f9ff'
  surface-dim: '#c0ddff'
  surface-bright: '#f7f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef4ff'
  surface-container: '#e4efff'
  surface-container-high: '#d9eaff'
  surface-container-highest: '#cfe5ff'
  on-surface: '#001d34'
  on-surface-variant: '#3d494d'
  inverse-surface: '#0d3250'
  inverse-on-surface: '#e9f1ff'
  outline: '#6d797e'
  outline-variant: '#bcc9ce'
  surface-tint: '#00677d'
  primary: '#00677d'
  on-primary: '#ffffff'
  primary-container: '#00b4d8'
  on-primary-container: '#00414f'
  inverse-primary: '#4cd6fb'
  secondary: '#006b5b'
  on-secondary: '#ffffff'
  secondary-container: '#26fedc'
  on-secondary-container: '#007261'
  tertiary: '#5157a6'
  on-tertiary: '#ffffff'
  tertiary-container: '#989ef3'
  on-tertiary-container: '#2d3280'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b3ebff'
  primary-fixed-dim: '#4cd6fb'
  on-primary-fixed: '#001f27'
  on-primary-fixed-variant: '#004e5f'
  secondary-fixed: '#26fedc'
  secondary-fixed-dim: '#00dfc1'
  on-secondary-fixed: '#00201a'
  on-secondary-fixed-variant: '#005144'
  tertiary-fixed: '#e0e0ff'
  tertiary-fixed-dim: '#bfc2ff'
  on-tertiary-fixed: '#070a61'
  on-tertiary-fixed-variant: '#393e8c'
  background: '#f7f9ff'
  on-background: '#001d34'
  surface-variant: '#cfe5ff'
typography:
  display-lg:
    fontFamily: Clash Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Clash Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Clash Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Clash Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Satoshi
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Satoshi
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Satoshi
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  caption:
    fontFamily: Satoshi
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style
The design system is an energetic, high-performance interface designed for clarity, data visualization, and fluid navigation. It targets professional users who require rapid insights without cognitive fatigue. 

The aesthetic is **Modern Corporate** with a **Glassmorphic** edge, utilizing a "Light Mode" palette that feels airy and expansive. It balances the precision of a dashboard with the refreshing atmosphere of ocean environments. The UI should evoke a sense of professional optimism, speed, and deep clarity. Expect heavy use of whitespace, refined typography, and subtle depth cues to separate layers of information.

## Colors
This design system utilizes the **Ocean Vitality** palette, optimized for high legibility on light surfaces. 

- **Primary (#00B4D8):** A vibrant ocean blue used for call-to-action elements, active states, and primary navigation links.
- **Secondary/Accent (#00F5D4):** Neon Teal is reserved for positive trends, metric highlights, and interactive accents. It provides a high-energy contrast against the blue tones.
- **Surface (#F0F7FF):** A very light blue-tinted off-white used for container backgrounds and secondary sections to create subtle hierarchy against the pure white background.
- **Typography:** Deep Navy (#03045E) ensures maximum contrast for headlines, while Navy-Grey (#2A4B6A) provides a softer, more readable experience for long-form body text.

## Typography
The typography pairing combines the structural impact of **Clash Display** with the geometric precision of **Satoshi**.

- **Headlines:** Clash Display is used for all major titles. Its unique character adds a sense of "performance" and modernity. Use Medium (500) to Semibold (600) weights to maintain authority without being overly heavy.
- **Body & Data:** Satoshi is the workhorse for all functional text. It is highly legible at small sizes, making it ideal for data-dense dashboards and status labels.
- **Scaling:** On mobile devices, display sizes shrink by approximately 30% to maintain visual balance within the narrower viewport.

## Layout & Spacing
The design system employs a **Fluid Grid** model based on an 8px spacing rhythm. 

- **Grid:** A 12-column layout is used for desktop (breakpoints at 1024px and 1440px). Gutters are fixed at 24px to ensure breathing room between data modules.
- **Margins:** Desktop views utilize a maximum container width of 1280px with auto-margins. Mobile views shift to a 4-column grid with 16px side margins.
- **Spacing Philosophy:** Priority is given to vertical whitespace to separate distinct functional blocks. Group related elements (like an input and its label) using `sm` (8px) spacing, while larger sections are separated by `xl` (48px).

## Elevation & Depth
Depth in this design system is created through **Tonal Layers** and **Blue-Tinted Shadows**. 

1. **Base Layer:** Pure White (#FFFFFF) background.
2. **Surface Layer:** Very Light Blue (#F0F7FF) containers with 1px borders (#DDEBFF).
3. **Elevated State:** Used for active cards or modals. These elements utilize a high-diffusion shadow with a blue tint (`hex: #003049`, `opacity: 0.08`, `blur: 24px`, `y-offset: 8px`).
4. **Glassmorphism:** For floating navigation or overlays, use a backdrop blur (12px) combined with a semi-transparent white fill (opacity: 70%) and a subtle inner white highlight to simulate polished glass.

## Shapes
The shape language is consistently **Rounded**, reflecting a modern and approachable tool. 

- **Standard Elements:** Buttons, input fields, and small chips use a 0.5rem (8px) corner radius.
- **Large Containers:** Dashboard cards and modals use 1rem (16px) to emphasize the "modular" feel of the interface.
- **Interaction:** State changes (like hovering over a card) should not change the border radius, but rather increase the shadow diffusion to indicate lift.

## Components
- **Buttons:** Primary buttons are solid Ocean Blue (#00B4D8) with white text. Secondary buttons are "Ghost" style with an Ocean Blue border and text. All buttons have a transition duration of 200ms on hover.
- **Chips/Badges:** Small indicators for status. Success states use the Neon Teal (#00F5D4) background at 15% opacity with dark teal text.
- **Input Fields:** Use a #F0F7FF background and a 1px border. On focus, the border transitions to Primary Blue with a subtle 4px outer glow in the same color.
- **Cards:** White backgrounds against the #F0F7FF surface. Include a very soft 1px border (#E1E9F2). Use Satoshi Bold for card headers in Deep Navy.
- **Data Visuals:** Charts should primarily use Ocean Blue and Neon Teal. Grid lines in charts should be extremely faint (#E1E9F2) to keep the focus on the data trend.
- **Progress Bars:** Use a high-contrast track (#E1E9F2) with a Neon Teal fill for active progress.