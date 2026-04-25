import type { Money } from '../../../src/domain/money';

export const formatMoney = (m: Money): string => {
  const major = (m.amount / 100).toFixed(2);
  return `${m.currency} ${major}`;
};

export const formatTime = (iso: string): string => {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour12: false });
  } catch {
    return iso;
  }
};

export const stateColor = (state: string): string => {
  if (state.includes('FAIL') || state.includes('DECLINED') || state.includes('REJECTED') || state.includes('MISMATCH')) {
    return '#ef4444';
  }
  if (state.includes('PENDING') || state.includes('AUTHORIZING') || state.includes('SYNCING') || state.includes('QUEUED')) {
    return '#f59e0b';
  }
  if (state.includes('CAPTURED') || state.includes('AUTHORIZED') || state.includes('REFUNDED') || state.includes('VOIDED')) {
    return '#10b981';
  }
  if (state.includes('DISPUTED')) {
    return '#a855f7';
  }
  return '#6b7280';
};
