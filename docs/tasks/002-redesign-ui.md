## Status - [DONE]

Redesign only the **sidebar** and **Customers module** of my existing Next.js application.

Follow the design rules, visual language, layout patterns, spacing, typography, components, and conventions already defined in my project’s `docs/DESIGN.md`. Do not introduce a completely different design system. Treat `DESIGN.md` as the source of truth.

The redesign should make the app feel clearly connected to a **Water Station Management System**. The visual direction should feel fresh, clean, pure, and spring-water inspired, similar to modern mineral water or water delivery websites.

Design direction:

* clean and breathable layout
* water-inspired visual feel
* soft blues, aqua, white, light gradients, and subtle glassy surfaces only if they match `DESIGN.md`
* fresh, pure, trustworthy, and modern look
* avoid looking like a generic admin dashboard
* avoid dark, heavy, industrial, or overly corporate styling
* make the UI feel suitable for managing water refills, deliveries, and customers

Scope restrictions:

* Only redesign the sidebar
* Only redesign the Customers module
* Do not modify unrelated pages or modules
* Do not change backend logic, database logic, API contracts, or business rules
* Do not rename existing routes unless absolutely necessary
* Preserve existing functionality unless the current UI implementation needs cleanup
* Do not create new modules outside the sidebar and customers feature

Sidebar requirements:

* Make the sidebar visually aligned with a water station brand
* Use clean navigation styling with active states
* Use Lucide React icons that clearly match each module
* Keep navigation readable and scalable
* Make the active page obvious but not visually noisy
* Add subtle water-inspired branding if appropriate, such as a droplet, wave, spring, or purity-related visual element
* Keep the sidebar professional and production-ready

Customers module requirements:

* Redesign the customer list, customer cards/table, filters, empty states, loading states, and action buttons if they exist
* Make the customer module feel like it belongs to a water delivery/refill business
* Improve hierarchy: customer name, contact info, address, delivery notes, refill preferences, and status should be easy to scan if these fields exist
* Use clear actions such as view, edit, create customer, and schedule delivery if these actions already exist
* Make the customer page feel polished, real, and usable for actual water station staff
* Use responsive design for desktop and mobile
* Keep accessibility in mind: good contrast, focus states, semantic structure, and readable text

Implementation requirements:

* Do not change service or any functions, retain it and just redesign the frontend keep the functionality and make sure that the changes will not break.
* Use the existing tech stack and conventions in the project
* Use shadcn/ui components where appropriate
* Use Tailwind CSS consistently
* Use Lucide React icons
* Keep components clean, reusable, and easy to maintain
* Follow the existing folder structure
* Do not over-engineer
* Do not add unnecessary dependencies
* Do not hardcode fake logic that conflicts with existing app data
* If sample UI data is needed, keep it temporary and clearly isolated

Before coding:

1. Read `AGENTS.md`
2. Read `docs/DESIGN.md`
3. Inspect the current sidebar implementation
4. Inspect the current Customers module implementation
5. Identify only the files needed for this redesign
6. Make a short implementation plan
7. Then apply the redesign

Expected output:

* A redesigned sidebar
* A redesigned Customers module
* Water station / mineral water inspired UI
* Clean, production-ready code
* No changes outside the requested scope
* A short summary of what was changed after implementation
