import { PaymentFactory } from '../domain/payment.js';
import { PaymentEventType } from '../domain/enums.js';
import { applySequence } from './base.js';
import { Ids } from '../domain/ids.js';

export function reconciliationMismatch() {
  const payment = PaymentFactory.create({
    id: Ids.paymentId(),
    amount: { amount: 9_500, currency: 'USD' },
  });

  return applySequence(payment, [
    { type: PaymentEventType.REQUEST_AUTH },
    { type: PaymentEventType.AUTH_APPROVED },
    { type: PaymentEventType.CAPTURE_REQUESTED },
    { type: PaymentEventType.CAPTURE_SUCCEEDED },
    { type: PaymentEventType.SETTLEMENT_RECEIVED, data: { processorSettlementRef: 'batch-9001' } },
    { type: PaymentEventType.RECONCILIATION_FAILED, note: 'Processor settlement amount mismatch' },
  ]);
}
