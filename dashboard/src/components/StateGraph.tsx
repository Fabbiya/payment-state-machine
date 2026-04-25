import { useMemo } from 'react';
import ReactFlow, { Background, Controls, MarkerType, type Edge, type Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { PaymentState } from '../../../src/domain/enums';
import { transitionMatrix } from '../../../src/machine/transitions';
import { stateColor } from '../lib/format';

interface Props {
  current: PaymentState;
  lastTransition?: { from: PaymentState; to: PaymentState };
}

const layout: Record<PaymentState, { x: number; y: number }> = {
  [PaymentState.CREATED]: { x: 0, y: 200 },
  [PaymentState.AUTHORIZING]: { x: 180, y: 120 },
  [PaymentState.AUTHORIZED]: { x: 360, y: 120 },
  [PaymentState.CAPTURE_PENDING]: { x: 540, y: 80 },
  [PaymentState.CAPTURED]: { x: 720, y: 80 },
  [PaymentState.RECONCILIATION_PENDING]: { x: 900, y: 40 },
  [PaymentState.RECONCILIATION_MISMATCH]: { x: 1080, y: 40 },
  [PaymentState.REFUND_PENDING]: { x: 720, y: 200 },
  [PaymentState.REFUNDED]: { x: 900, y: 200 },
  [PaymentState.PARTIALLY_REFUNDED]: { x: 900, y: 280 },
  [PaymentState.VOID_PENDING]: { x: 540, y: 200 },
  [PaymentState.VOIDED]: { x: 720, y: 280 },
  [PaymentState.DECLINED]: { x: 360, y: 280 },
  [PaymentState.FAILED]: { x: 540, y: 360 },
  [PaymentState.OFFLINE_QUEUED]: { x: 180, y: 360 },
  [PaymentState.OFFLINE_SYNCING]: { x: 360, y: 440 },
  [PaymentState.OFFLINE_REJECTED]: { x: 540, y: 440 },
  [PaymentState.DISPUTED]: { x: 1080, y: 200 },
};

export function StateGraph({ current, lastTransition }: Props) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = (Object.values(PaymentState) as PaymentState[]).map((s) => {
      const isCurrent = s === current;
      const color = stateColor(s);
      return {
        id: s,
        position: layout[s] ?? { x: 0, y: 0 },
        data: { label: s.replace(/_/g, ' ') },
        style: {
          background: isCurrent ? color : '#1f2937',
          color: '#f9fafb',
          border: isCurrent ? `2px solid ${color}` : `1px solid ${color}55`,
          borderRadius: 8,
          padding: '6px 10px',
          fontSize: 11,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontWeight: isCurrent ? 600 : 400,
          width: 150,
          textAlign: 'center' as const,
          boxShadow: isCurrent ? `0 0 0 4px ${color}33` : 'none',
        },
      };
    });

    const edges: Edge[] = [];
    for (const [from, evts] of Object.entries(transitionMatrix)) {
      for (const [evt, to] of Object.entries(evts)) {
        if (!to) continue;
        const isJustUsed =
          lastTransition && lastTransition.from === (from as PaymentState) && lastTransition.to === to;
        edges.push({
          id: `${from}-${evt}-${to}`,
          source: from,
          target: to,
          label: evt.replace(/_/g, ' ').toLowerCase(),
          labelStyle: { fontSize: 9, fill: '#9ca3af' },
          labelBgStyle: { fill: '#0f172a', fillOpacity: 0.7 },
          style: {
            stroke: isJustUsed ? '#38bdf8' : '#374151',
            strokeWidth: isJustUsed ? 2.5 : 1,
          },
          markerEnd: { type: MarkerType.ArrowClosed, color: isJustUsed ? '#38bdf8' : '#374151' },
          animated: isJustUsed,
        });
      }
    }

    return { nodes, edges };
  }, [current, lastTransition]);

  return (
    <div style={{ width: '100%', height: '100%', background: '#0b1220' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background color="#1f2937" gap={24} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
