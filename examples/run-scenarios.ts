import { happyPath } from '../src/scenarios/happy-path.js';
import { duplicateAuth } from '../src/scenarios/duplicate-auth.js';
import { offlineQueueThenSyncSuccess } from '../src/scenarios/offline-queue-then-sync-success.js';
import { offlineQueueThenSyncFailure } from '../src/scenarios/offline-queue-then-sync-failure.js';
import { partialRefund } from '../src/scenarios/partial-refund.js';
import { reconciliationMismatch } from '../src/scenarios/reconciliation-mismatch.js';

const runners = [
  ['happy-path', happyPath],
  ['duplicate-auth', duplicateAuth],
  ['offline-queue-success', offlineQueueThenSyncSuccess],
  ['offline-queue-failure', offlineQueueThenSyncFailure],
  ['partial-refund', partialRefund],
  ['reconciliation-mismatch', reconciliationMismatch],
] as const;

for (const [name, fn] of runners) {
  const result = fn();
  console.log(`\n--- ${name} ---`);
  console.log(`state: ${result.state}`);
  // @ts-ignore history exists on result
  console.log(`history entries: ${result.history?.length ?? 'n/a'}`);
  if ('duplicateDetected' in result) {
    // @ts-ignore
    console.log(`duplicateDetected: ${result.duplicateDetected}`);
  }
}
