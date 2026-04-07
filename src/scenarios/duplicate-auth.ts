import { PaymentFactory } from '../domain/payment.js';
import { PaymentEventType } from '../domain/enums.js';
import { applyEvent } from '../machine/reducer.js';
import { Ids } from '../domain/ids.js';

export function duplicateAuth() {
  let payment = PaymentFactory.create({
    id: Ids.paymentId(),
    amount: { amount: 6_000, currency: 'USD' },
  });

  const idem = 'idem-auth-1';

  payment = applyOrThrow(payment, { type: PaymentEventType.REQUEST_AUTH });
  const first = applyOrThrow(payment, { type: PaymentEventType.AUTH_APPROVED, idempotencyKey: idem });
  const secondResult = applyEvent(first, { type: PaymentEventType.AUTH_APPROVED, idempotencyKey: idem });

  if (!secondResult.ok) throw secondResult.error;

  return {
    payment: secondResult.value.payment,
    duplicateDetected: secondResult.value.duplicate,
    firstAuthState: first.state,
  };
}

function applyOrThrow(payment: import('../domain/payment.js').Payment, input: import('../domain/payment.js').PaymentEventInput) {
  const result = applyEvent(payment, input);
  if (!result.ok) throw result.error;
  return result.value.payment;
}
