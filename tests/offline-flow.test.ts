import { describe, it, expect } from 'vitest';
import { offlineQueueThenSyncSuccess } from '../src/scenarios/offline-queue-then-sync-success.js';
import { offlineQueueThenSyncFailure } from '../src/scenarios/offline-queue-then-sync-failure.js';
import { PaymentState } from '../src/domain/enums.js';

describe('offline flows', () => {
  it('queues then syncs successfully', () => {
    const payment = offlineQueueThenSyncSuccess();
    expect(payment.state).toBe(PaymentState.RECONCILIATION_PENDING);
    expect(payment.offline?.queuedAt).toBeDefined();
    expect(payment.offline?.syncedAt).toBeDefined();
  });

  it('queues then is rejected after sync failure', () => {
    const payment = offlineQueueThenSyncFailure();
    expect(payment.state).toBe(PaymentState.OFFLINE_REJECTED);
  });
});
