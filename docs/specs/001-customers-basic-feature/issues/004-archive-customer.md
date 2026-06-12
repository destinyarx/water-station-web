# Issue 004: Archive customer

## Type

AFK

## Blocked by

- [Customer foundation and active list](./001-customer-foundation-and-active-list.md)

## User stories covered

5, 6, 11, 12

## What to build

Build the end-to-end archive customer flow. A registered user should be able to archive a customer they own, which should set the archive marker without hard-deleting the record. Archived customers should disappear from the default active list while remaining available for future reporting or audit use.

## Acceptance criteria

- [ ] A tenant owner can archive a customer they own.
- [ ] Archiving updates `deleted_at` instead of hard-deleting the row.
- [ ] Archived customers are hidden from the default active list.
- [ ] The archive action is blocked for customers outside the current tenant.
- [ ] The UI shows pending and error states while archiving.
- [ ] The archived record remains in the database for future retrieval or audit use.
- [ ] The active list refreshes or invalidates after a successful archive.

## Notes

- This slice should treat archive as a soft-delete operation, not a data removal operation.
- Restoring archived customers is out of scope for this feature set.

