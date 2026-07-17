# Research

## Existing dashboard

Dashboard V1 already has separate owner financial and shared operational RPCs,
strict Zod response validation, period-aware TanStack Query keys, and accessible
SVG charts. The improvement can reuse the existing financial RPC for a second,
independently keyed Weekly/Monthly chart query; no source-row download or new
chart library is needed. Monthly presentation can aggregate the RPC's bounded
daily buckets in the view layer.

Yesterday-to-Today comparison is not part of the original RPC comparison
contract. A separate Today query is the smallest safe compatibility approach:
it preserves the applied SQL API and uses the existing bounded aggregate and
cache key. Staff still never issue a financial query.

## Cancellation root cause

`CancelDeliveryDialog` passes both `description` and `body` to the shared
`ConfirmDialog`. The shell currently resolves `description ?? body`, so the
textarea body is omitted whenever a description exists. Since the confirm
button requires non-empty remarks, it remains disabled.

The canonical database already supports the intended behavior:

- `deliveries.cancellation_remarks` exists.
- `set_delivery_status_atomic(integer,text,text,text,text)` requires a reason.
- Only `pending -> cancelled` and `for_delivery -> cancelled` are legal.
- Cancelling a dispatched occurrence restores stock-tracked quantities.
- The function updates one `deliveries` row and does not update
  `delivery_schedules` or sibling occurrences.

Therefore no migration or RLS change is required.

## Calendar

The existing multi-date calendar already contains the correct selection and
month-navigation logic. Moving it behind Radix Popover keeps that logic, adds
escape/outside-click/focus behavior, and removes the form-height problem without
adding a dependency.

