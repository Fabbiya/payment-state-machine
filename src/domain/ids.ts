import { randomUUID } from 'crypto';

export type PaymentId = string;
export type ProcessorReference = string;
export type EventId = string;
export type IdempotencyKey = string;

export const Ids = {
  paymentId: (): PaymentId => `pay_${randomUUID()}`,
  eventId: (): EventId => `evt_${randomUUID()}`,
  idempotencyKey: (): IdempotencyKey => randomUUID(),
};
