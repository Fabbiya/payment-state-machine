import type { Payment } from '../../../src/domain/payment';
import { formatMoney, stateColor } from '../lib/format';

interface Props {
  payment: Payment;
}

export function CurrentStateCard({ payment }: Props) {
  const color = stateColor(payment.state);
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Current Payment</span>
        <span className="muted small mono">{payment.id.slice(0, 14)}…</span>
      </div>
      <div
        className="state-pill"
        style={{ background: color, ['--pill-color' as never]: color }}
      >
        {payment.state}
      </div>
      <div className="kv-grid">
        <div><span className="muted small">Amount</span><strong>{formatMoney(payment.amount)}</strong></div>
        <div><span className="muted small">Authorized</span><strong>{formatMoney(payment.authorizedAmount)}</strong></div>
        <div><span className="muted small">Captured</span><strong>{formatMoney(payment.capturedAmount)}</strong></div>
        <div><span className="muted small">Refunded</span><strong>{formatMoney(payment.refundedAmount)}</strong></div>
      </div>
    </div>
  );
}
