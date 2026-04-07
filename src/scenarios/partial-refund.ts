import { PaymentFactory } from '../domain/payment.js';
import { PaymentEventType } from '../domain/enums.js';
import { applySequence } from './base.js';
import { Ids } from '../domain/ids.js';

export function partialRefund() {
  const payment = PaymentFactory.create({
    id: Ids.paymentId(),
    amount: { amount: 12_000, currency: 'USD' },
  });

  const refundPortion = { amount: 2_000, currency: 'USD' };

  return applySequence(payment, [
    { type: PaymentEventType.REQUEST_AUTH },
    { type: PaymentEventType.AUTH_APPROVED },
    { type: PaymentEventType.CAPTURE_REQUESTED },
    { type: PaymentEventType.CAPTURE_SUCCEEDED },
    { type: PaymentEventType.REFUND_REQUESTED, note: 'Customer returned item' },
    { type: PaymentEventType.REFUND_SUCCEEDED, amount: refundPortion },
  ]);
}
