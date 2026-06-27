# Research — water-station maintenance

## Real maintenance items in a refilling station

A typical Philippine water refilling station runs a multi-stage purification
train. The recurring upkeep that keeps water potable and the LGU/DOH permit
valid maps to these pieces of equipment (used as the `equipment` option list):

| Equipment | Typical cadence | Why |
|---|---|---|
| Sediment Pre-Filter | monthly | traps silt/rust before the train |
| Carbon Filter | 1–3 months | removes chlorine, odor, taste |
| RO Membrane System | every 6–12 months | the core purification membrane |
| UV Sterilizer | lamp ~yearly | kills bacteria; lamp loses output |
| Ozone Generator | periodic clean | residual disinfection |
| Storage Tank | monthly sanitation | biofilm prevention |
| Softener / Brine Tank | refill salt (weekly-ish) | scale control |
| Water Pump | inspect/grease | flow + pressure |
| Bottle Washer | disinfect | container hygiene |
| Dispensing Station | TDS & pH test (weekly) | quality compliance |

Because cadences vary and a station may have gear not in this list, the form
offers an **"Others"** option that requires a free-text `equipment_other`, plus a
general `notes` field so the user can describe the task clearly. This satisfies
the spec's "add a notes for this so user can describe clearly."

## Recurrence (per spec, narrower than the design mockup)

The design HTML shipped once/weekly/biweekly/monthly/quarterly/6-month/yearly.
The spec overrides this: keep only

- **One-time** — pick one or more specific dates on a calendar.
- **Everyday** — daily.
- **Weekly** — Once / Twice / Thrice per week, choosing exactly that many
  weekdays (Mon–Sun).

Dropped entirely: biweekly, monthly, quarterly, every-6-months, yearly.

## Assignee

`assigned_to` must be a real staff member in the caller's organization
(`public.users` scoped by `org_id`), not free text. Nullable = "Unassigned".
Stored on the occurrence so it can change per task.
