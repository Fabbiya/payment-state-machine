import { describe, it, expect } from 'vitest';
import { happyPath } from '../src/scenarios/happy-path.js';
import { PaymentState } from '../src/domain/enums.js';

describe('happy path', () => {
  it('walks through auth, capture, settlement', () => {
    const result = happyPath();

    expect(result.state).toBe(PaymentState.RECONCILIATION_PENDING);
    expect(result.capturedAmount.amount).toBe(10_500);
    expect(result.history).toHaveLength(6);
  });
});
