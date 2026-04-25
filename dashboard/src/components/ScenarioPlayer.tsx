import { useEffect, useRef } from 'react';
import { scenarios, type ScenarioDef } from '../lib/scenarios';

interface Props {
  scenario: ScenarioDef;
  step: number;
  totalSteps: number;
  playing: boolean;
  speedMs: number;
  onSelect: (id: string) => void;
  onStep: () => void;
  onBack: () => void;
  onReset: () => void;
  onTogglePlay: () => void;
  onSpeed: (ms: number) => void;
}

export function ScenarioPlayer(props: Props) {
  const { scenario, step, totalSteps, playing, speedMs } = props;
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    if (step >= totalSteps) {
      props.onTogglePlay();
      return;
    }
    tickRef.current = window.setTimeout(props.onStep, speedMs);
    return () => {
      if (tickRef.current !== null) window.clearTimeout(tickRef.current);
    };
  }, [playing, step, totalSteps, speedMs, props.onStep, props.onTogglePlay]);

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Scenario</span>
        <select
          className="select"
          value={scenario.id}
          onChange={(e) => props.onSelect(e.target.value)}
        >
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>

      <p className="muted small">{scenario.description}</p>

      <div className="player-controls">
        <button className="btn" onClick={props.onReset} title="Reset to step 0">⏮</button>
        <button className="btn" onClick={props.onBack} disabled={step === 0} title="Step back">◀</button>
        <button className="btn primary" onClick={props.onTogglePlay} disabled={step >= totalSteps && !playing}>
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <button className="btn" onClick={props.onStep} disabled={step >= totalSteps} title="Step forward">▶</button>
        <select
          className="select small-select"
          value={speedMs}
          onChange={(e) => props.onSpeed(Number(e.target.value))}
        >
          <option value={1500}>1×</option>
          <option value={750}>2×</option>
          <option value={300}>5×</option>
        </select>
      </div>

      <div className="step-indicator">
        Step <strong>{step}</strong> / {totalSteps}
      </div>

      <ol className="event-list">
        {scenario.events.map((evt, i) => (
          <li
            key={i}
            className={
              i < step ? 'event-row done' : i === step ? 'event-row next' : 'event-row pending'
            }
          >
            <span className="event-index">{i + 1}.</span>
            <span className="event-type">{evt.type}</span>
            {evt.actor && <span className="event-actor">{evt.actor}</span>}
            {evt.note && <span className="event-note">— {evt.note}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
