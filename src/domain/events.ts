import { PaymentEventType, PaymentState, PaymentActor } from './enums.js';
import { EventId, IdempotencyKey } from './ids.js';

export interface PaymentEventRecord {
  id: EventId;
  type: PaymentEventType;
  at: string;
  actor: PaymentActor;
  idempotencyKey?: IdempotencyKey;
  data?: Record<string, unknown>;
  note?: string;
  resultingState: PaymentState;
}
