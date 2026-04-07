import { PaymentState, PaymentEventType } from '../domain/enums.js';
import type { Payment } from '../domain/payment.js';
import type { Money } from '../domain/money.js';
import { Money as MoneyFns } from '../domain/money.js';

const allowedTransitions: Record<PaymentState, PaymentEventType[]> = {
  [PaymentState.CREATED]: [PaymentEventType.REQUEST_AUTH, PaymentEventType.OFFLINE_QUEUE_ACCEPTED],
  [PaymentState.AUTHORIZING]: [
    PaymentEventType.AUTH_APPROVED,
    PaymentEventType.AUTH_DECLINED,
    PaymentEventType.NETWORK_TIMEOUT,
    PaymentEventType.RETRY_REQUESTED,
    PaymentEventType.OFFLINE_QUEUE_ACCEPTED,
  ],
  [PaymentState.AUTHORIZED]: [
    PaymentEventType.CAPTURE_REQUESTED,
    PaymentEventType.VOID_REQUESTED,
    PaymentEventType.RETRY_REQUESTED,
    PaymentEventType.SETTLEMENT_RECEIVED,
  ],
  [PaymentState.CAPTURE_PENDING]: [
    PaymentEventType.CAPTURE_SUCCEEDED,
    PaymentEventType.CAPTURE_FAILED,
    PaymentEventType.NETWORK_TIMEOUT,
    PaymentEventType.RETRY_REQUESTED,
  ],
  [PaymentState.CAPTURED]: [
    PaymentEventType.REFUND_REQUESTED,
    PaymentEventType.SETTLEMENT_RECEIVED,
    PaymentEventType.DISPUTE_OPENED,
  ],
  [PaymentState.DECLINED]: [PaymentEventType.RETRY_REQUESTED],
  [PaymentState.VOID_PENDING]: [PaymentEventType.VOID_SUCCEEDED],
  [PaymentState.VOIDED]: [],
  [PaymentState.REFUND_PENDING]: [PaymentEventType.REFUND_SUCCEEDED],
  [PaymentState.REFUNDED]: [],
  [PaymentState.PARTIALLY_REFUNDED]: [PaymentEventType.REFUND_REQUESTED, PaymentEventType.DISPUTE_OPENED],
  [PaymentState.FAILED]: [PaymentEventType.RETRY_REQUESTED, PaymentEventType.OFFLINE_QUEUE_ACCEPTED],
  [PaymentState.OFFLINE_QUEUED]: [
    PaymentEventType.RETRY_REQUESTED,
    PaymentEventType.OFFLINE_SYNC_SUCCEEDED,
    PaymentEventType.OFFLINE_SYNC_FAILED,
  ],
  [PaymentState.OFFLINE_SYNCING]: [PaymentEventType.OFFLINE_SYNC_SUCCEEDED, PaymentEventType.OFFLINE_SYNC_FAILED],
  [PaymentState.OFFLINE_REJECTED]: [PaymentEventType.RETRY_REQUESTED],
  [PaymentState.RECONCILIATION_PENDING]: [PaymentEventType.SETTLEMENT_RECEIVED, PaymentEventType.RECONCILIATION_FAILED],
  [PaymentState.RECONCILIATION_MISMATCH]: [PaymentEventType.RETRY_REQUESTED],
  [PaymentState.DISPUTED]: [],
};

export function isEventAllowed(state: PaymentState, event: PaymentEventType): boolean {
  if (event === PaymentEventType.DUPLICATE_REQUEST_DETECTED) return true;
  return allowedTransitions[state]?.includes(event) ?? false;
}

export function validateRefundAmount(payment: Payment, refund: Money): void {
  if (refund.currency !== payment.amount.currency) {
    throw new Error('Refund currency mismatch');
  }
  const afterRefund = payment.refundedAmount.amount + refund.amount;
  if (afterRefund > payment.capturedAmount.amount) {
    throw new Error('Refund exceeds captured amount');
  }
}

export function validateCaptureAmount(payment: Payment, capture: Money): void {
  if (capture.currency !== payment.amount.currency) {
    throw new Error('Capture currency mismatch');
  }
  if (capture.amount + payment.capturedAmount.amount > payment.amount.amount) {
    throw new Error('Capture exceeds authorized amount');
  }
}

export function isFullyRefunded(payment: Payment): boolean {
  return MoneyFns.equals(payment.refundedAmount, payment.capturedAmount);
}
