import { describe, it, expect } from 'vitest';
import { reconciliationMismatch } from '../src/scenarios/reconciliation-mismatch.js';
import { PaymentState } from '../src/domain/enums.js';

describe('reconciliation', () => {
  it('detects mismatch after settlement', () => {
    const payment = reconciliationMismatch();
    expect(payment.state).toBe(PaymentState.RECONCILIATION_MISMATCH);
    expect(payment.reconciliation?.status).toBe('MISMATCH');
  });
});
