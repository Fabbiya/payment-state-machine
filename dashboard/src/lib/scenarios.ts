import { PaymentEventType } from '../../../src/domain/enums';
import type { PaymentEventInput } from '../../../src/domain/payment';
import type { Money } from '../../../src/domain/money';

export interface ScenarioDef {
  id: string;
  title: string;
  description: string;
  amount: Money;
  events: PaymentEventInput[];
}

const usd = (amount: number): Money => ({ amount, currency: 'USD' });

export const scenarios: ScenarioDef[] = [
  {
    id: 'happy-path',
    title: 'Happy Path',
    description: 'Authorize → capture → settle. The boring case the marketing demos always show.',
    amount: usd(10_500),
    events: [
      { type: PaymentEventType.REQUEST_AUTH, note: 'POS initiated auth', actor: 'pos_terminal' },
      { type: PaymentEventType.AUTH_APPROVED, actor: 'processor' },
      { type: PaymentEventType.CAPTURE_REQUESTED, actor: 'system' },
      { type: PaymentEventType.CAPTURE_SUCCEEDED, actor: 'processor' },
      { type: PaymentEventType.SETTLEMENT_RECEIVED, actor: 'processor', data: { batch: 'B123' } },
    ],
  },
  {
    id: 'duplicate-auth',
    title: 'Duplicate Auth (idempotency replay)',
    description: 'Same idempotency key fires twice. The second one is a duplicate, not a double-charge.',
    amount: usd(6_000),
    events: [
      { type: PaymentEventType.REQUEST_AUTH, actor: 'pos_terminal' },
      { type: PaymentEventType.AUTH_APPROVED, actor: 'processor', idempotencyKey: 'idem-auth-1' },
      { type: PaymentEventType.AUTH_APPROVED, actor: 'processor', idempotencyKey: 'idem-auth-1', note: 'Replay — same idempotency key' },
    ],
  },
  {
    id: 'offline-success',
    title: 'Offline queue → sync success',
    description: 'Terminal offline, queues the sale, syncs cleanly when connectivity returns.',
    amount: usd(8_000),
    events: [
      { type: PaymentEventType.OFFLINE_QUEUE_ACCEPTED, note: 'Terminal offline', actor: 'pos_terminal' },
      { type: PaymentEventType.RETRY_REQUESTED, note: 'Connectivity restored', actor: 'system' },
      { type: PaymentEventType.OFFLINE_SYNC_SUCCEEDED, actor: 'processor' },
      { type: PaymentEventType.SETTLEMENT_RECEIVED, actor: 'processor' },
    ],
  },
  {
    id: 'offline-failure',
    title: 'Offline queue → sync rejected',
    description: 'POS thinks it succeeded; processor rejects on sync. Application truth ≠ settlement truth.',
    amount: usd(8_000),
    events: [
      { type: PaymentEventType.OFFLINE_QUEUE_ACCEPTED, note: 'Terminal offline', actor: 'pos_terminal' },
      { type: PaymentEventType.RETRY_REQUESTED, note: 'Connectivity restored', actor: 'system' },
      { type: PaymentEventType.OFFLINE_SYNC_FAILED, actor: 'processor', note: 'Processor rejected the queued sale' },
    ],
  },
  {
    id: 'partial-refund',
    title: 'Partial Refund',
    description: 'Captured $120, refund $20. State lands in PARTIALLY_REFUNDED, not REFUNDED.',
    amount: usd(12_000),
    events: [
      { type: PaymentEventType.REQUEST_AUTH },
      { type: PaymentEventType.AUTH_APPROVED, actor: 'processor' },
      { type: PaymentEventType.CAPTURE_REQUESTED },
      { type: PaymentEventType.CAPTURE_SUCCEEDED, actor: 'processor' },
      { type: PaymentEventType.REFUND_REQUESTED, note: 'Customer returned item', actor: 'merchant' },
      { type: PaymentEventType.REFUND_SUCCEEDED, amount: usd(2_000), actor: 'processor' },
    ],
  },
  {
    id: 'reconciliation-mismatch',
    title: 'Reconciliation Mismatch',
    description: 'Settlement file disagrees with what was captured. Surfaces a mismatch, does not silently accept.',
    amount: usd(9_500),
    events: [
      { type: PaymentEventType.REQUEST_AUTH },
      { type: PaymentEventType.AUTH_APPROVED, actor: 'processor' },
      { type: PaymentEventType.CAPTURE_REQUESTED },
      { type: PaymentEventType.CAPTURE_SUCCEEDED, actor: 'processor' },
      { type: PaymentEventType.SETTLEMENT_RECEIVED, actor: 'processor', data: { processorSettlementRef: 'batch-9001' } },
      { type: PaymentEventType.RECONCILIATION_FAILED, note: 'Processor settlement amount mismatch', actor: 'system' },
    ],
  },
];
