import { applyEvent } from '../../../src/machine/reducer';
import { PaymentFactory } from '../../../src/domain/payment';
import { Ids } from '../../../src/domain/ids';
import type { Payment, PaymentEventInput } from '../../../src/domain/payment';
import type { Money } from '../../../src/domain/money';

export interface ApplyOutcome {
  payment: Payment;
  ok: boolean;
  duplicate: boolean;
  error?: string;
}

export const newPayment = (amount: Money): Payment =>
  PaymentFactory.create({ id: Ids.paymentId(), amount });

export const fireEvent = (payment: Payment, input: PaymentEventInput): ApplyOutcome => {
  const result = applyEvent(payment, input);
  if (!result.ok) {
    return { payment, ok: false, duplicate: false, error: result.error.message };
  }
  return {
    payment: result.value.payment,
    ok: true,
    duplicate: result.value.duplicate,
  };
};
