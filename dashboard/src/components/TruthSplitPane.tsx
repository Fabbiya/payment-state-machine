import type { Payment } from '../../../src/domain/payment';
import { formatMoney } from '../lib/format';

interface Props {
  payment: Payment;
}

// Heuristic: "application truth" is what the local state believes.
// "Settlement truth" is only known after SETTLEMENT_RECEIVED / RECONCILIATION_FAILED.
export function TruthSplitPane({ payment }: Props) {
  const recon = payment.reconciliation;

  const appView = {
    state: payment.state,
    captured: formatMoney(payment.capturedAmount),
    refunded: formatMoney(payment.refundedAmount),
  };

  const settlementKnown = !!recon;
  const settlementView = settlementKnown
    ? {
        status: recon!.status,
        expected: formatMoney(recon!.expectedAmount),
        ref: recon!.processorSettlementRef ?? '—',
      }
    : null;

  const diverged =
    settlementKnown && recon!.status === 'MISMATCH';

  return (
    <div className="card">
      <div className="core-concept-banner">
        <span className="core-concept-pointer">👉</span>
        <span className="core-concept-prefix">Core Concept:</span>
        <span className="core-concept-title">Application Truth vs Settlement Truth</span>
        {diverged && <span className="badge mismatch">DIVERGED</span>}
      </div>
      <p className="muted small" style={{ margin: 0 }}>
        Two realities that diverge under retries and offline execution. The state machine reconciles
        them.
      </p>
      <div className="truth-grid">
        <div className="truth-col app">
          <div className="truth-heading">Application Truth (POS)</div>
          <div className="truth-row"><span className="muted small">State</span><strong>{appView.state}</strong></div>
          <div className="truth-row"><span className="muted small">Captured</span><strong>{appView.captured}</strong></div>
          <div className="truth-row"><span className="muted small">Refunded</span><strong>{appView.refunded}</strong></div>
        </div>
        <div className="truth-col settle">
          <div className="truth-heading">Settlement Truth (Processor)</div>
          {settlementView ? (
            <>
              <div className="truth-row"><span className="muted small">Status</span><strong>{settlementView.status}</strong></div>
              <div className="truth-row"><span className="muted small">Expected</span><strong>{settlementView.expected}</strong></div>
              <div className="truth-row"><span className="muted small">Ref</span><strong className="mono small">{settlementView.ref}</strong></div>
            </>
          ) : (
            <div className="muted small">No settlement received yet — processor truth is unknown.</div>
          )}
        </div>
      </div>
    </div>
  );
}
