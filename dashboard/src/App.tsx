import { useCallback, useMemo, useState } from 'react';
import { StateGraph } from './components/StateGraph';
import { ScenarioPlayer } from './components/ScenarioPlayer';
import { EventTimeline } from './components/EventTimeline';
import { CurrentStateCard } from './components/CurrentStateCard';
import { EventFiringPanel } from './components/EventFiringPanel';
import { TruthSplitPane } from './components/TruthSplitPane';
import { scenarios } from './lib/scenarios';
import { newPayment, fireEvent } from './lib/simulator';
import type { PaymentEventType } from '../../src/domain/enums';
import type { Payment } from '../../src/domain/payment';
import { PaymentState } from '../../src/domain/enums';

interface Snapshot {
  payment: Payment;
  step: number;
}

export default function App() {
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const scenario = useMemo(() => scenarios.find((s) => s.id === scenarioId)!, [scenarioId]);

  const [snapshots, setSnapshots] = useState<Snapshot[]>(() => [
    { payment: newPayment(scenario.amount), step: 0 },
  ]);
  const [playing, setPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(1500);
  const [lastError, setLastError] = useState<string | undefined>();

  const current = snapshots[snapshots.length - 1];
  const totalSteps = scenario.events.length;

  const lastTransition = useMemo(() => {
    if (snapshots.length < 2) return undefined;
    const prev = snapshots[snapshots.length - 2].payment.state;
    const now = current.payment.state;
    return prev !== now ? { from: prev, to: now } : undefined;
  }, [snapshots, current]);

  const reset = useCallback(
    (id?: string) => {
      const sc = scenarios.find((s) => s.id === (id ?? scenarioId)) ?? scenario;
      setSnapshots([{ payment: newPayment(sc.amount), step: 0 }]);
      setPlaying(false);
      setLastError(undefined);
    },
    [scenarioId, scenario],
  );

  const handleSelect = useCallback(
    (id: string) => {
      setScenarioId(id);
      reset(id);
    },
    [reset],
  );

  const handleStep = useCallback(() => {
    if (current.step >= totalSteps) {
      setPlaying(false);
      return;
    }
    const evt = scenario.events[current.step];
    const outcome = fireEvent(current.payment, evt);
    if (!outcome.ok) {
      setLastError(outcome.error);
      setPlaying(false);
      return;
    }
    setLastError(undefined);
    setSnapshots((prev) => [...prev, { payment: outcome.payment, step: current.step + 1 }]);
  }, [current, scenario, totalSteps]);

  const handleBack = useCallback(() => {
    setSnapshots((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    setLastError(undefined);
  }, []);

  const handleSandboxFire = useCallback(
    (type: PaymentEventType) => {
      setPlaying(false);
      const outcome = fireEvent(current.payment, { type });
      if (!outcome.ok) {
        setLastError(outcome.error);
        return;
      }
      setLastError(undefined);
      setSnapshots((prev) => [...prev, { payment: outcome.payment, step: current.step }]);
    },
    [current],
  );

  return (
    <div className="app">
      <div className="hero-banner">
        <p className="hero-line strong">Payment systems are not atomic.</p>
        <p className="hero-line">
          Retries, timeouts, and offline execution can create double charges, lost states, and
          reconciliation mismatches.
        </p>
        <p className="hero-line muted">
          This system demonstrates how a deterministic state machine prevents those failures.
        </p>
        <ul className="hero-bullets">
          <li>Prevents duplicate charges (idempotency)</li>
          <li>Handles offline + retry safely</li>
          <li>Reconciles application vs processor truth</li>
        </ul>
        <p className="hero-audience">
          <span className="hero-audience-label">For:</span> payment engineers, POS systems, fintech platforms
        </p>
        <div className="hero-callout">
          <span className="hero-callout-label">Why this matters</span>
          <p className="hero-callout-line">
            In production systems, retries and network failures can move real money.
          </p>
          <p className="hero-callout-line">
            This model ensures correctness even when events arrive out of order.
          </p>
        </div>
      </div>

      <p className="hero-thesis-line">
        This work introduces a deterministic state model for ensuring financial correctness in
        distributed payment systems under real-world failure conditions.
      </p>

      <header className="app-header">
        <div>
          <h1>Payment State Machine — Live Demo</h1>
          <p className="byline">
            By <strong>Farnaz Bagheri</strong>
            <span className="byline-sep">·</span>
            <a
              className="paper-tag"
              href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6611041"
              target="_blank"
              rel="noreferrer"
            >
              Paper (under review on SSRN)
            </a>
          </p>
          <p className="muted small">
            19 states · 21 events · pure reducer. Pick a scenario, watch the lifecycle, or fire your
            own events in the sandbox.
          </p>
        </div>
        <a
          className="repo-link"
          href="https://github.com/Fabbiya/payment-state-machine"
          target="_blank"
          rel="noreferrer"
        >
          <svg
            className="repo-link-icon"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M12 .5C5.73.5.74 5.49.74 11.76c0 4.96 3.22 9.16 7.69 10.65.56.1.77-.24.77-.54v-2.06c-3.13.68-3.79-1.32-3.79-1.32-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 .81 2.62 1.21 3.26.92.1-.72.39-1.21.71-1.49-2.5-.28-5.13-1.25-5.13-5.57 0-1.23.44-2.24 1.16-3.03-.12-.28-.5-1.43.11-2.99 0 0 .94-.3 3.09 1.16.9-.25 1.86-.38 2.82-.38.96 0 1.92.13 2.82.38 2.15-1.46 3.09-1.16 3.09-1.16.61 1.56.23 2.71.11 2.99.72.79 1.16 1.8 1.16 3.03 0 4.33-2.63 5.29-5.14 5.57.4.34.76 1.02.76 2.06v3.05c0 .3.21.65.78.54 4.46-1.5 7.68-5.69 7.68-10.65C23.26 5.49 18.27.5 12 .5z"
            />
          </svg>
          <span>View Source on GitHub</span>
          <span className="repo-link-arrow">↗</span>
        </a>
      </header>

      <main className="app-grid">
        <section className="col-left">
          <ScenarioPlayer
            scenario={scenario}
            step={current.step}
            totalSteps={totalSteps}
            playing={playing}
            speedMs={speedMs}
            onSelect={handleSelect}
            onStep={handleStep}
            onBack={handleBack}
            onReset={() => reset()}
            onTogglePlay={() => setPlaying((p) => !p)}
            onSpeed={setSpeedMs}
          />
          <CurrentStateCard payment={current.payment} />
          <TruthSplitPane payment={current.payment} />
        </section>

        <section className="col-center">
          <div className="card graph-card">
            <div className="card-header">
              <span className="card-title">State Graph</span>
              <span className="muted small">Active state highlighted; last transition animated</span>
            </div>
            <div className="graph-frame">
              <StateGraph
                current={current.payment.state as PaymentState}
                lastTransition={lastTransition}
              />
            </div>
          </div>
        </section>

        <section className="col-right">
          <EventTimeline history={current.payment.history} />
          <EventFiringPanel
            payment={current.payment}
            onFire={handleSandboxFire}
            lastError={lastError}
          />
        </section>
      </main>

      <footer className="app-footer">
        <span className="app-footer-label">Cite as:</span>
        <span className="app-footer-citation">
          Farnaz Bagheri, <em>Payment State Machine Model</em>, 2026.
        </span>
      </footer>
    </div>
  );
}
