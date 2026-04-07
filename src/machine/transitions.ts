import { PaymentEventType, PaymentState } from '../domain/enums.js';

export const transitionMatrix: Record<PaymentState, Partial<Record<PaymentEventType, PaymentState>>> = {
  [PaymentState.CREATED]: {
    [PaymentEventType.REQUEST_AUTH]: PaymentState.AUTHORIZING,
    [PaymentEventType.OFFLINE_QUEUE_ACCEPTED]: PaymentState.OFFLINE_QUEUED,
  },
  [PaymentState.AUTHORIZING]: {
    [PaymentEventType.AUTH_APPROVED]: PaymentState.AUTHORIZED,
    [PaymentEventType.AUTH_DECLINED]: PaymentState.DECLINED,
    [PaymentEventType.NETWORK_TIMEOUT]: PaymentState.FAILED,
    [PaymentEventType.RETRY_REQUESTED]: PaymentState.AUTHORIZING,
    [PaymentEventType.OFFLINE_QUEUE_ACCEPTED]: PaymentState.OFFLINE_QUEUED,
  },
  [PaymentState.AUTHORIZED]: {
    [PaymentEventType.CAPTURE_REQUESTED]: PaymentState.CAPTURE_PENDING,
    [PaymentEventType.VOID_REQUESTED]: PaymentState.VOID_PENDING,
    [PaymentEventType.RETRY_REQUESTED]: PaymentState.AUTHORIZING,
    [PaymentEventType.SETTLEMENT_RECEIVED]: PaymentState.RECONCILIATION_PENDING,
  },
  [PaymentState.CAPTURE_PENDING]: {
    [PaymentEventType.CAPTURE_SUCCEEDED]: PaymentState.CAPTURED,
    [PaymentEventType.CAPTURE_FAILED]: PaymentState.FAILED,
    [PaymentEventType.NETWORK_TIMEOUT]: PaymentState.FAILED,
    [PaymentEventType.RETRY_REQUESTED]: PaymentState.CAPTURE_PENDING,
  },
  [PaymentState.CAPTURED]: {
    [PaymentEventType.REFUND_REQUESTED]: PaymentState.REFUND_PENDING,
    [PaymentEventType.SETTLEMENT_RECEIVED]: PaymentState.RECONCILIATION_PENDING,
    [PaymentEventType.DISPUTE_OPENED]: PaymentState.DISPUTED,
  },
  [PaymentState.PARTIALLY_REFUNDED]: {
    [PaymentEventType.REFUND_REQUESTED]: PaymentState.REFUND_PENDING,
    [PaymentEventType.DISPUTE_OPENED]: PaymentState.DISPUTED,
  },
  [PaymentState.REFUND_PENDING]: {
    [PaymentEventType.REFUND_SUCCEEDED]: PaymentState.REFUNDED,
  },
  [PaymentState.REFUNDED]: {},
  [PaymentState.DECLINED]: {
    [PaymentEventType.RETRY_REQUESTED]: PaymentState.AUTHORIZING,
  },
  [PaymentState.VOID_PENDING]: {
    [PaymentEventType.VOID_SUCCEEDED]: PaymentState.VOIDED,
  },
  [PaymentState.VOIDED]: {},
  [PaymentState.FAILED]: {
    [PaymentEventType.RETRY_REQUESTED]: PaymentState.AUTHORIZING,
    [PaymentEventType.OFFLINE_QUEUE_ACCEPTED]: PaymentState.OFFLINE_QUEUED,
  },
  [PaymentState.OFFLINE_QUEUED]: {
    [PaymentEventType.RETRY_REQUESTED]: PaymentState.OFFLINE_SYNCING,
    [PaymentEventType.OFFLINE_SYNC_SUCCEEDED]: PaymentState.CAPTURED,
    [PaymentEventType.OFFLINE_SYNC_FAILED]: PaymentState.OFFLINE_REJECTED,
  },
  [PaymentState.OFFLINE_SYNCING]: {
    [PaymentEventType.OFFLINE_SYNC_SUCCEEDED]: PaymentState.CAPTURED,
    [PaymentEventType.OFFLINE_SYNC_FAILED]: PaymentState.OFFLINE_REJECTED,
  },
  [PaymentState.OFFLINE_REJECTED]: {
    [PaymentEventType.RETRY_REQUESTED]: PaymentState.AUTHORIZING,
  },
  [PaymentState.RECONCILIATION_PENDING]: {
    [PaymentEventType.SETTLEMENT_RECEIVED]: PaymentState.CAPTURED,
    [PaymentEventType.RECONCILIATION_FAILED]: PaymentState.RECONCILIATION_MISMATCH,
  },
  [PaymentState.RECONCILIATION_MISMATCH]: {
    [PaymentEventType.RETRY_REQUESTED]: PaymentState.RECONCILIATION_PENDING,
  },
  [PaymentState.DISPUTED]: {},
};
