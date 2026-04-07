import { PaymentState, PaymentEventType, PaymentActor } from './enums.js';
import { Money } from './money.js';
import { EventId, IdempotencyKey, PaymentId, ProcessorReference } from './ids.js';
import { nowIso } from '../utils/time.js';
import { Money as MoneyFns } from './money.js';
import { PaymentEventRecord } from './events.js';

export interface Payment {
  id: PaymentId;
  processorRef?: ProcessorReference;
  state: PaymentState;
  amount: Money;
  authorizedAmount: Money;
  capturedAmount: Money;
  refundedAmount: Money;
  history: PaymentEventRecord[];
  createdAt: string;
  updatedAt: string;
  offline?: {
    queuedAt?: string;
    syncedAt?: string;
  };
  reconciliation?: {
    expectedAmount: Money;
    status: 'PENDING' | 'MISMATCH' | 'MATCHED';
    processorSettlementRef?: string;
  };
}

export interface PaymentEventInput {
  type: PaymentEventType;
  actor?: PaymentActor;
  idempotencyKey?: IdempotencyKey;
  data?: Record<string, unknown>;
  amount?: Money; // used for capture/refund partial logic
  note?: string;
  at?: string;
}

export const PaymentFactory = {
  create: (params: {
    id: PaymentId;
    amount: Money;
    processorRef?: ProcessorReference;
  }): Payment => {
    const createdAt = nowIso();
    return {
      id: params.id,
      processorRef: params.processorRef,
      state: PaymentState.CREATED,
      amount: params.amount,
      authorizedAmount: MoneyFns.zero(params.amount.currency),
      capturedAmount: MoneyFns.zero(params.amount.currency),
      refundedAmount: MoneyFns.zero(params.amount.currency),
      history: [
        {
          id: `evt_${createdAt}` as EventId,
          type: PaymentEventType.CREATE_PAYMENT,
          at: createdAt,
          actor: 'system',
          resultingState: PaymentState.CREATED,
          note: 'Payment created',
        },
      ],
      createdAt,
      updatedAt: createdAt,
    };
  },
};
