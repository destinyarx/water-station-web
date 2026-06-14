Build a responsive **Next.js sidebar navigation** using **shadcn/ui** and **lucide-react** icons.

Follow the visual direction and layout style from **Google Stitch design** and make sure to reference the existing design rules from:

`docs/DESIGN.md`

The sidebar should be clean, modern, scalable, and consistent with the app’s existing design system.

Tech stack and requirements:

* Next.js App Router
* TypeScript
* shadcn/ui components
* Tailwind CSS
* lucide-react icons
* Use reusable components
* Follow the project’s existing folder structure
* Keep the code clean, readable, and production-ready
* Make the active route visually clear
* Support hover states
* Support collapsed/mobile behavior if the current layout already supports it
* Do not hardcode messy styles; use consistent Tailwind classes and design tokens where possible
* Use `next/link` for navigation
* Use `usePathname()` from `next/navigation` to determine active routes

Create the sidebar navigation for these main pages:

1. Dashboard

   * Route: `/dashboard`
   * Icon: `LayoutDashboard`

2. Deliveries

   * Route: `/deliveries`
   * Icon: `Truck`

3. Customers

   * Route: `/customers`
   * Icon: `UsersRound`

4. Sales

   * Route: `/sales`
   * Icon: `BadgeDollarSign` or `ChartNoAxesColumnIncreasing`

5. Maintenances

   * Route: `/maintenances`
   * Icon: `Wrench`

6. Expenses

   * Route: `/expenses`
   * Icon: `ReceiptText` or `WalletCards`

Use icons that are semantically related to each module. Do not use random or generic icons when a better module-specific icon exists.

Expected output:

* A reusable sidebar component, preferably something like:

`src/components/layout/app-sidebar.tsx`

or follow the existing layout structure if the project already has one.

* A clean navigation config array, for example:

```ts
const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Deliveries",
    href: "/deliveries",
    icon: Truck,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: UsersRound,
  },
  {
    title: "Sales",
    href: "/sales",
    icon: BadgeDollarSign,
  },
  {
    title: "Maintenances",
    href: "/maintenances",
    icon: Wrench,
  },
  {
    title: "Expenses",
    href: "/expenses",
    icon: ReceiptText,
  },
]
```

Implementation expectations:

* Import icons from `lucide-react`
* Use shadcn/ui sidebar-related components if available in the project
* If the shadcn sidebar component is not installed, use existing shadcn primitives like `Button`, `ScrollArea`, `Separator`, or `Sheet` where appropriate
* Make the sidebar visually aligned with Google Stitch-inspired design:

  * soft rounded corners
  * clean spacing
  * minimal but polished UI
  * clear active state
  * subtle hover states
  * readable typography
  * balanced icon and text alignment
  * make the sidebar collapsibe, if the sidebar state is collapse only shows the icons, when it is expanded it shows the icons and the text.
  * on the top of the sidebar there is a logo in path ('public\icon.png'), and under the logo there is a button to toggle the sidebar state.

Active state behavior:

* If the current path starts with the item route, mark it as active
* Example: `/deliveries/create` should still highlight `Deliveries`

Do not create fake pages unless needed. Focus on building the sidebar component and integrating it into the app layout if appropriate.

Before coding, inspect:

* `docs/DESIGN.md`
* existing layout components
* existing shadcn/ui components
* current app route structure

Then implement the sidebar in the most consistent way with the existing codebase.
