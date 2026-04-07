import type { Payment } from '../domain/payment.js';
import type { PaymentEventRecord } from '../domain/events.js';

export const History = {
  append: (payment: Payment, event: PaymentEventRecord): Payment => {
    return {
      ...payment,
      history: [...payment.history, event],
      state: event.resultingState,
      updatedAt: event.at,
    };
  },
  last: (payment: Payment): PaymentEventRecord | undefined => payment.history[payment.history.length - 1],
  findByIdempotencyKey: (
    payment: Payment,
    key?: string,
  ): PaymentEventRecord | undefined =>
    key ? payment.history.find((evt) => evt.idempotencyKey === key) : undefined,
};
