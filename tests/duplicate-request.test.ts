import { describe, it, expect } from 'vitest';
import { duplicateAuth } from '../src/scenarios/duplicate-auth.js';

describe('duplicate detection', () => {
  it('flags duplicate auth with same idempotency key', () => {
    const { payment, duplicateDetected, firstAuthState } = duplicateAuth();

    expect(duplicateDetected).toBe(true);
    expect(payment.state).toBe(firstAuthState);
    expect(payment.history.filter((h) => h.type === 'AUTH_APPROVED')).toHaveLength(1);
  });
});
