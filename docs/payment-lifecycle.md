# Payment Lifecycle

This repository models a normalized payment lifecycle for POS and processor-integrated systems. The state machine is intentionally explicit about transitions that often hide behind vendor SDKs: authorization latency, capture retries, offline queueing, reconciliation and disputes.

## Design principles
- **Single source of truth**: Each payment owns its state; history records facts, not interpretations.
- **Idempotency everywhere**: Duplicate requests return prior outcomes; the state machine is defensive by default.
- **Fail closed**: Unknown transitions throw; partial failures land in holding states that require explicit action.
- **Reconciliation aware**: Settlement confirmation is modeled as a first-class state, not an afterthought.
- **Offline resilient**: Terminal decisions when disconnected are captured separately from processor truth.

## Core states
- `CREATED` → `AUTHORIZING` → `AUTHORIZED` → `CAPTURE_PENDING` → `CAPTURED`
- Divergences: `DECLINED`, `FAILED`, `VOID_PENDING` → `VOIDED`
- Post-capture: `REFUND_PENDING` → `PARTIALLY_REFUNDED` / `REFUNDED`
- Offline: `OFFLINE_QUEUED` → `OFFLINE_SYNCING` → `CAPTURED` | `OFFLINE_REJECTED`
- Reconciliation: `RECONCILIATION_PENDING` → `CAPTURED` (confirmed) | `RECONCILIATION_MISMATCH`
- Exception: `DISPUTED`

See `docs/diagrams/payment-lifecycle.mmd` for the full Mermaid representation.

## Transition philosophy
- **Auth and capture are distinct**: Many POS flows auto-capture; we still model the intermediate `CAPTURE_PENDING` to capture retry behavior explicitly.
- **Offline is not success**: `OFFLINE_QUEUED` is optimistic; only `OFFLINE_SYNC_SUCCEEDED` promotes the payment to financial success.
- **Reconciliation is blocking**: `SETTLEMENT_RECEIVED` shifts the payment into `RECONCILIATION_PENDING`; the transaction is not considered closed until matched or marked as mismatch.
- **Disputes are terminal**: `DISPUTE_OPENED` halts further transitions in this reference model.

## Event hygiene
Every event carries optional idempotency keys and metadata. The reducer rejects invalid transitions and records a history entry with the resulting state to keep auditing obvious.
