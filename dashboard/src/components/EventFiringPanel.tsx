import { PaymentEventType } from '../../../src/domain/enums';
import type { Payment } from '../../../src/domain/payment';
import { isEventAllowed } from '../../../src/machine/guards';

interface Props {
  payment: Payment;
  onFire: (type: PaymentEventType) => void;
  lastError?: string;
}

const ALL_EVENTS = Object.values(PaymentEventType) as PaymentEventType[];

export function EventFiringPanel({ payment, onFire, lastError }: Props) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Fire Event</span>
        <span className="muted small">Sandbox</span>
      </div>
      <p className="muted small">
        Click any event. Greyed-out events are rejected by the guard for the current state — try one
        to see the rejection message.
      </p>
      <div className="event-grid">
        {ALL_EVENTS.map((evt) => {
          const allowed = isEventAllowed(payment.state, evt);
          return (
            <button
              key={evt}
              className={allowed ? 'evt-btn' : 'evt-btn disabled'}
              onClick={() => onFire(evt)}
              title={allowed ? 'Allowed from current state' : 'Not allowed — will be rejected'}
            >
              {evt.replace(/_/g, ' ').toLowerCase()}
            </button>
          );
        })}
      </div>
      {lastError && (
        <div className="error-banner">
          <strong>Rejected:</strong> {lastError}
        </div>
      )}
    </div>
  );
}
