import { z } from 'zod';
import { PaymentEventType, PaymentState, PaymentActor } from './enums.js';

export const MoneySchema = z.object({
  amount: z.number().int(),
  currency: z.string().min(3),
});

export const PaymentEventSchema = z.object({
  type: z.nativeEnum(PaymentEventType),
  at: z.string(),
  actor: z.enum(['system', 'processor', 'merchant', 'customer', 'pos_terminal']),
  idempotencyKey: z.string().optional(),
  data: z.record(z.any()).optional(),
  note: z.string().optional(),
  resultingState: z.nativeEnum(PaymentState),
});

export const PaymentSchema = z.object({
  id: z.string(),
  processorRef: z.string().optional(),
  state: z.nativeEnum(PaymentState),
  amount: MoneySchema,
  authorizedAmount: MoneySchema,
  capturedAmount: MoneySchema,
  refundedAmount: MoneySchema,
  history: z.array(PaymentEventSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  offline: z
    .object({
      queuedAt: z.string().optional(),
      syncedAt: z.string().optional(),
    })
    .optional(),
  reconciliation: z
    .object({
      expectedAmount: MoneySchema,
      status: z.enum(['PENDING', 'MISMATCH', 'MATCHED']),
      processorSettlementRef: z.string().optional(),
    })
    .optional(),
});

export type PaymentSchemaType = z.infer<typeof PaymentSchema>;
