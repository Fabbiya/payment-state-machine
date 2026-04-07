import { PaymentEventType, PaymentState } from '../domain/enums.js';
import type { Payment, PaymentEventInput } from '../domain/payment.js';
import type { PaymentEventRecord } from '../domain/events.js';
import { Ids } from '../domain/ids.js';
import { transitionMatrix } from './transitions.js';
import { History } from './history.js';
import { nowIso } from '../utils/time.js';
import { Result } from '../utils/result.js';
import { Money as MoneyFns } from '../domain/money.js';
import { validateRefundAmount, validateCaptureAmount, isFullyRefunded, isEventAllowed } from './guards.js';

interface ApplyEventResult {
  payment: Payment;
  event: PaymentEventRecord;
  duplicate: boolean;
}

export function applyEvent(payment: Payment, input: PaymentEventInput) {
  const duplicate = History.findByIdempotencyKey(payment, input.idempotencyKey);
  if (duplicate) {
    return Result.ok<ApplyEventResult>({ payment, event: duplicate, duplicate: true });
  }

  if (!isEventAllowed(payment.state, input.type)) {
    return Result.fail(`Invalid transition: state=${payment.state} event=${input.type}`);
  }

  try {
    const { nextPayment, event } = reduce(payment, input);
    const updated = History.append(nextPayment, event);
    return Result.ok<ApplyEventResult>({ payment: updated, event, duplicate: false });
  } catch (error) {
    return Result.fail(error as Error);
  }
}

function reduce(payment: Payment, input: PaymentEventInput): { nextPayment: Payment; event: PaymentEventRecord } {
  const actor = input.actor ?? 'system';
  const at = input.at ?? nowIso();
  const idempotencyKey = input.idempotencyKey ?? Ids.idempotencyKey();

  const nextState = resolveNextState(payment, input);

  let updated: Payment = { ...payment, state: nextState };

  switch (input.type) {
    case PaymentEventType.AUTH_APPROVED: {
      updated = {
        ...updated,
        authorizedAmount: payment.amount,
      };
      break;
    }
    case PaymentEventType.AUTH_DECLINED: {
      break;
    }
    case PaymentEventType.CAPTURE_REQUESTED: {
      break;
    }
    case PaymentEventType.CAPTURE_SUCCEEDED: {
      const captureAmount = input.amount ?? payment.amount;
      validateCaptureAmount(payment, captureAmount);
      updated = {
        ...updated,
        capturedAmount: MoneyFns.add(payment.capturedAmount, captureAmount),
      };
      break;
    }
    case PaymentEventType.CAPTURE_FAILED: {
      break;
    }
    case PaymentEventType.VOID_REQUESTED:
    case PaymentEventType.VOID_SUCCEEDED: {
      updated = {
        ...updated,
        authorizedAmount: payment.authorizedAmount,
      };
      break;
    }
    case PaymentEventType.REFUND_REQUESTED: {
      // no monetary mutation yet, wait for success event
      break;
    }
    case PaymentEventType.REFUND_SUCCEEDED: {
      const refundAmount = input.amount ?? payment.capturedAmount;
      validateRefundAmount(payment, refundAmount);
      const newRefunded = MoneyFns.add(payment.refundedAmount, refundAmount);
      updated = {
        ...updated,
        refundedAmount: newRefunded,
      };
      // adjust state when partial refund occurs
      updated.state = isFullyRefunded({ ...updated, capturedAmount: payment.capturedAmount })
        ? PaymentState.REFUNDED
        : PaymentState.PARTIALLY_REFUNDED;
      break;
    }
    case PaymentEventType.NETWORK_TIMEOUT: {
      break;
    }
    case PaymentEventType.RETRY_REQUESTED: {
      break;
    }
    case PaymentEventType.OFFLINE_QUEUE_ACCEPTED: {
      updated = {
        ...updated,
        offline: {
          ...(payment.offline ?? {}),
          queuedAt: at,
        },
      };
      break;
    }
    case PaymentEventType.OFFLINE_SYNC_SUCCEEDED: {
      const captureAmount = input.amount ?? payment.amount;
      validateCaptureAmount(payment, captureAmount);
      updated = {
        ...updated,
        offline: { ...(payment.offline ?? {}), syncedAt: at },
        capturedAmount: MoneyFns.add(payment.capturedAmount, captureAmount),
      };
      break;
    }
    case PaymentEventType.OFFLINE_SYNC_FAILED: {
      updated = {
        ...updated,
        offline: { ...(payment.offline ?? {}), syncedAt: at },
      };
      break;
    }
    case PaymentEventType.SETTLEMENT_RECEIVED: {
      updated = {
        ...updated,
        reconciliation: {
          expectedAmount: payment.capturedAmount,
          status: payment.state === PaymentState.RECONCILIATION_PENDING ? 'MATCHED' : 'PENDING',
          processorSettlementRef: payment.reconciliation?.processorSettlementRef ?? input.data?.processorSettlementRef?.toString(),
        },
      };
      break;
    }
    case PaymentEventType.RECONCILIATION_FAILED: {
      updated = {
        ...updated,
        reconciliation: {
          expectedAmount: payment.capturedAmount,
          status: 'MISMATCH',
          processorSettlementRef: payment.reconciliation?.processorSettlementRef,
        },
      };
      break;
    }
    case PaymentEventType.DISPUTE_OPENED: {
      break;
    }
    default:
      break;
  }

  const event: PaymentEventRecord = {
    id: Ids.eventId(),
    type: input.type,
    at,
    actor,
    idempotencyKey,
    data: input.data,
    note: input.note,
    resultingState: updated.state,
  };

  return { nextPayment: updated, event };
}

function resolveNextState(payment: Payment, input: PaymentEventInput): PaymentState {
  if (input.type === PaymentEventType.REFUND_SUCCEEDED) {
    const refundAmount = input.amount ?? payment.capturedAmount;
    const projected = MoneyFns.add(payment.refundedAmount, refundAmount);
    if (projected.amount < payment.capturedAmount.amount) {
      return PaymentState.PARTIALLY_REFUNDED;
    }
    return PaymentState.REFUNDED;
  }

  if (input.type === PaymentEventType.DUPLICATE_REQUEST_DETECTED) {
    return payment.state;
  }

  const fromMatrix = transitionMatrix[payment.state]?.[input.type];
  if (!fromMatrix) {
    throw new Error(`No transition mapping for state=${payment.state} event=${input.type}`);
  }
  return fromMatrix;
}
