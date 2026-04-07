# Edge Cases in Payment Systems

Payments fail in non-obvious ways because they are distributed systems with financial consequences. This repo spotlights the ones that hurt merchants most.

## Duplicated requests
- **Why it happens**: POS retries on flaky Wi-Fi, mobile apps hit “Pay” twice, or gateways resend webhooks.
- **Impact**: Without idempotency, double charges become real liabilities.
- **Modeling choice**: The reducer short-circuits when an idempotency key repeats and records a single history entry.

## Offline optimism
- **Why it happens**: Card-present terminals accept transactions while disconnected to keep queues moving.
- **Impact**: Financial success is unknown until sync; declined offline syncs create customer anger and reconciliation noise.
- **Modeling choice**: `OFFLINE_QUEUED` and `OFFLINE_SYNCING` are explicit, and success is only recorded at `OFFLINE_SYNC_SUCCEEDED`.

## Partial capture and partial refunds
- **Why it happens**: Tips, split tenders, or item-level returns change the final amount.
- **Impact**: Over-refunding or under-capturing can trigger disputes or accounting breaks.
- **Modeling choice**: Money math is in minor units; refund validation rejects amounts above captured totals.

## Processor timeouts vs. processor actions
- **Why it happens**: Network blips during capture can hide the fact that the processor actually captured the funds.
- **Impact**: Merchants may retry and double capture.
- **Modeling choice**: `NETWORK_TIMEOUT` lands the payment in `FAILED`; `RETRY_REQUESTED` re-enters the flow while idempotency keeps the state consistent.

## Reconciliation gaps
- **Why it happens**: Settlement batches, file-based clearing, and processor outages mean the application view diverges from the ledger view.
- **Impact**: Missing money, orphaned orders, and support escalations.
- **Modeling choice**: `RECONCILIATION_PENDING` is required before closure; `RECONCILIATION_MISMATCH` holds the discrepancy for operators.

## Disputes
- **Why it happens**: Cardholders question a charge or issuer triggers fraud rules.
- **Impact**: Funds can be clawed back; continuing to operate on the payment is risky.
- **Modeling choice**: `DISPUTE_OPENED` stops transitions in this reference model, highlighting the operational work that starts next.
