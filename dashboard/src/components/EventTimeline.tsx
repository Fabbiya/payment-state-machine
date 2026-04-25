import type { PaymentEventRecord } from '../../../src/domain/events';
import { PaymentEventType } from '../../../src/domain/enums';
import { formatTime, stateColor } from '../lib/format';

interface Props {
  history: PaymentEventRecord[];
}

export function EventTimeline({ history }: Props) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Event History</span>
        <span className="muted small">{history.length} events</span>
      </div>
      <div className="timeline">
        {history.map((evt, i) => {
          const isDup = evt.type === PaymentEventType.DUPLICATE_REQUEST_DETECTED;
          const fromState = i > 0 ? history[i - 1].resultingState : '—';
          const toState = evt.resultingState;
          const changed = fromState !== toState;
          const isLast = i === history.length - 1;
          const fromColor = i > 0 ? stateColor(fromState) : '#6b7280';
          const toColor = stateColor(toState);

          return (
            <div
              key={evt.id}
              className={`tl-row actor-${evt.actor} ${isLast ? 'tl-row-active' : ''}`}
            >
              <span className="tl-time">{formatTime(evt.at)}</span>
              <span className={`tl-actor actor-tag actor-${evt.actor}`}>{evt.actor}</span>
              <span className="tl-event">
                {evt.type}
                {isDup && <span className="badge dup">duplicate</span>}
              </span>
              <span className="tl-transition">
                <span
                  className="tl-state-chip"
                  style={{ background: `${fromColor}22`, color: fromColor, borderColor: `${fromColor}55` }}
                >
                  {fromState}
                </span>
                <span className={`tl-arrow ${changed ? 'changed' : 'unchanged'}`}>→</span>
                <span
                  className="tl-state-chip to"
                  style={{ background: `${toColor}33`, color: toColor, borderColor: toColor }}
                >
                  {toState}
                </span>
              </span>
              {evt.idempotencyKey && (
                <span className="tl-idem" title={evt.idempotencyKey}>
                  idem:{evt.idempotencyKey.slice(0, 8)}
                </span>
              )}
              {evt.note && <div className="tl-note">{evt.note}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
