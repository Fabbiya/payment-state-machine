import { PaymentFactory } from '../domain/payment.js';
import { Money } from '../domain/money.js';
import { PaymentEventType } from '../domain/enums.js';
import { applySequence } from './base.js';
import { Ids } from '../domain/ids.js';

export function happyPath() {
  const payment = PaymentFactory.create({
    id: Ids.paymentId(),
    amount: { amount: 10_500, currency: 'USD' } as Money,
  });

  return applySequence(payment, [
    { type: PaymentEventType.REQUEST_AUTH, note: 'POS initiated auth' },
    { type: PaymentEventType.AUTH_APPROVED, actor: 'processor' },
    { type: PaymentEventType.CAPTURE_REQUESTED, actor: 'system' },
    { type: PaymentEventType.CAPTURE_SUCCEEDED, actor: 'processor' },
    { type: PaymentEventType.SETTLEMENT_RECEIVED, actor: 'processor', data: { batch: 'B123' } },
  ]);
}
