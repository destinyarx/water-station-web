# Research

## Root cause and authorization

Stopping a schedule performs two writes: it updates `delivery_schedules.status`
and soft-deletes future pending rows in `deliveries`. The live error names the
second table, so hiding the action cannot repair the owner workflow. A new
versioned migration must restate the delivery update policy without the legacy
`deleted_at is null` `WITH CHECK` mistake and add a schedule-aware archive guard.

ADR 0015 deliberately makes schedule pause/resume available to any organization
member. That accepted decision remains authoritative. The repair reasserts the
member update policies with `deleted_at` excluded from the deliveries
`WITH CHECK`, which permits the new soft-deleted row while `USING` still blocks
updates to rows that were already archived.

## Main-queue visibility

The main delivery table reads `public.v_current_deliveries`. Its latest
definition filters occurrence status/date but did not require the joined parent
schedule to be `active`. Stop already soft-deletes pending occurrences dated
today or later, but it intentionally keeps overdue pending and in-flight rows;
those retained rows could therefore remain visible for a paused schedule.

Adding `s.status = 'active'` to the security-invoker view makes parent lifecycle
the visibility boundary. Stop hides every occurrence of that schedule from the
main queue, and Resume makes eligible rows visible again. No terminal outcome
needs to be updated, restored, or deleted.

## Bounded schedule context

PostgREST embedded resources can return one latest due pending occurrence and
one nearest future pending occurrence per paginated parent schedule by using
aliased relationships with referenced-table order/limit. The same bounded
parent query can embed customer type and schedule item/product display data.
The parent query still uses `pageSize + 1`, so no total count or full schedule
download is required.

## History chronology

`completed_at` is null for failed and cancelled deliveries, which pushes those
rows behind completed records when it is the primary sort. The server-owned
`updated_at` is stamped on every terminal transition and is therefore the
consistent cross-status event timestamp. `completed_at`, `delivery_date`, and
`id` remain deterministic tie-breakers.

## Unit labels

The schema has quantity and stock classification but no unit-of-measure column.
This slice displays the neutral label `unit`/`units` and does not invent a new
product measurement model.
