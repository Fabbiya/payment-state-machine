import { applyEvent } from '../machine/reducer.js';
import type { Payment } from '../domain/payment.js';
import type { PaymentEventInput } from '../domain/payment.js';

export function applySequence(payment: Payment, events: PaymentEventInput[]): Payment {
  return events.reduce((current, input) => {
    const result = applyEvent(current, input);
    if (!result.ok) {
      throw result.error;
    }
    return result.value.payment;
  }, payment);
}
