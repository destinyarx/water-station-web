## Status: Done

Redesign the existing Pricing section while retaining the current three-card structure:

1. Starter
2. Station
3. Multi-Branch

Keep the existing tier names, card layout, feature lists, visual hierarchy, and recommended-plan styling. Do not remove or merge the pricing cards.

For the initial release, all application features will be available for free. Update the section so users clearly understand that the current pricing is temporarily free during the launch period, while the three tiers are being retained for future pricing changes.

Design requirements:

* Add a prominent announcement banner above the pricing cards.
* Suggested banner heading: “All Plans Are Free During Launch”
* Suggested supporting text: “Enjoy access to all available features at no cost during our launch period. Paid pricing may be introduced in the future, and users will be notified before any changes take effect.”
* Make the banner noticeable but consistent with the existing design system.
* Use a subtle promotional icon, badge, or accent without making the section look overly promotional.

For each pricing card:

* Retain the tier name.
* Retain the existing feature list for that tier.
* Replace the current price display with “FREE”.
* Add a smaller label below it such as “During the launch period”.
* If the existing price must remain visible for future reference, display it as muted or struck through, but do not make it the main focus.
* Add a small badge near the top of each card that says “Free During Launch”.
* Update the call-to-action button to “Get Started for Free” or “Choose This Plan”.
* Do not include checkout, payment, billing, or credit-card language.
* Keep the Multi-Branch card visually highlighted if it is currently the featured or recommended plan.

Add a small note below the pricing cards:

“No payment required. No credit card needed. Future pricing will be announced in advance.”

The section should communicate that:

* All features are currently free.
* Users may still select a tier based on their business setup or intended use.
* The tier structure is being retained because paid pricing may be introduced later.
* Selecting a higher tier during the launch period does not require payment.

Keep the design clean, professional, modern, responsive, and consistent with the existing application UI. Preserve the current component architecture and reuse existing cards, buttons, typography, spacing, and design tokens where possible. Avoid rebuilding the pricing section from scratch unless necessary.

Ensure the section works properly on desktop, tablet, and mobile. On smaller screens, stack the cards vertically with appropriate spacing. Maintain accessible color contrast, readable text sizes, clear button states, and proper semantic heading structure.