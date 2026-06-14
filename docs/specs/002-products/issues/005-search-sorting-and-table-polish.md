# Issue 005: Search, sorting, and table polish

## Type

AFK

## Blocked by

- Issue 001: Products foundation and active list

## User stories covered

4-8, 12, 42

## What to build

Finish the product discovery and table usability layer. A registered station user should be able to search active products by product name, scan price and stock-tracking status quickly, use supported table sorting behavior, and interact with row actions in a responsive and accessible table layout.

## Acceptance criteria

- [ ] Users can search active products by product name.
- [ ] Search returns a no-results state when no active products match.
- [ ] Clearing search restores the active products list.
- [ ] Product name sorting is supported when consistent with the existing table pattern.
- [ ] Price sorting is supported when consistent with the existing table pattern.
- [ ] Stock sorting is supported when consistent with the existing table pattern.
- [ ] Created date sorting is supported when consistent with the existing table pattern.
- [ ] Price values are formatted as currency.
- [ ] Stock-tracked products show numeric stock clearly.
- [ ] Non-stock-tracked products show `Not tracked` clearly.
- [ ] Row actions remain keyboard-accessible and have clear accessible names.
- [ ] The table remains readable and usable on smaller screens.
- [ ] The UI follows the existing water station dashboard design direction.
- [ ] Search/filter behavior and table display states are covered by focused tests or documented manual verification.

## Notes

- Do not introduce a new table abstraction unless the existing project pattern already supports it or the duplication becomes meaningful.
- Pagination is only required if it matches the existing table pattern used by nearby features.
- Keep this slice focused on product table usability, not analytics or inventory movement.
