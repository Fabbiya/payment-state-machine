import { describe, it, expect } from 'vitest';
import { PaymentFactory } from '../src/domain/payment.js';
import { Ids } from '../src/domain/ids.js';
import { PaymentEventType } from '../src/domain/enums.js';
import { applyEvent } from '../src/machine/reducer.js';

describe('invalid transitions', () => {
  it('rejects capture before auth', () => {
    const payment = PaymentFactory.create({
      id: Ids.paymentId(),
      amount: { amount: 5_000, currency: 'USD' },
    });

    const result = applyEvent(payment, { type: PaymentEventType.CAPTURE_REQUESTED });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('Invalid transition');
    }
  });
});
