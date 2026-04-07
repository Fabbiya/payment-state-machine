# Reconciliation Notes

Reconciliation is not an accounting afterthought; it is part of system correctness. In distributed payment stacks, application truth and processor truth regularly diverge.

## Why divergence happens
- Batch windows and cut-off times differ between processors and merchants.
- File-based settlement feeds arrive hours after customer checkout.
- Processors silently retry settlement after transient failures, creating duplicate or shifted totals.
- Currency conversions at settlement time introduce rounding differences.

## Modeling approach
- After capture, `SETTLEMENT_RECEIVED` moves the payment into `RECONCILIATION_PENDING` to signal that the ledger is provisional.
- A second `SETTLEMENT_RECEIVED` (with matching totals) or an explicit operator action can confirm the payment back to `CAPTURED`.
- `RECONCILIATION_FAILED` places the payment in `RECONCILIATION_MISMATCH`, forcing operational review instead of masking the issue.

## Operational hooks
- Store the expected amount and optional processor reference on reconciliation to compare with incoming settlement files.
- Keep history entries immutable to simplify audit export or replication into a data warehouse.
- Use the mismatch state to drive alerts or queues for finance teams.
