import { PaymentFactory } from '../domain/payment.js';
import { PaymentEventType } from '../domain/enums.js';
import { applySequence } from './base.js';
import { Ids } from '../domain/ids.js';

export function offlineQueueThenSyncFailure() {
  const payment = PaymentFactory.create({
    id: Ids.paymentId(),
    amount: { amount: 8_000, currency: 'USD' },
  });

  return applySequence(payment, [
    { type: PaymentEventType.OFFLINE_QUEUE_ACCEPTED, note: 'Terminal offline, queue sale' },
    { type: PaymentEventType.RETRY_REQUESTED, note: 'Connectivity restored, syncing' },
    { type: PaymentEventType.OFFLINE_SYNC_FAILED, actor: 'processor' },
  ]);
}
