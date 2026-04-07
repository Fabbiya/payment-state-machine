export type Currency = 'USD' | 'EUR' | 'GBP' | string;

export interface Money {
  amount: number; // stored in minor units to avoid floating point drift
  currency: Currency;
}

export const Money = {
  zero: (currency: Currency): Money => ({ amount: 0, currency }),
  add: (a: Money, b: Money): Money => {
    ensureSameCurrency(a, b);
    return { amount: a.amount + b.amount, currency: a.currency };
  },
  subtract: (a: Money, b: Money): Money => {
    ensureSameCurrency(a, b);
    return { amount: a.amount - b.amount, currency: a.currency };
  },
  greaterThan: (a: Money, b: Money): boolean => {
    ensureSameCurrency(a, b);
    return a.amount > b.amount;
  },
  equals: (a: Money, b: Money): boolean => {
    ensureSameCurrency(a, b);
    return a.amount === b.amount;
  },
};

function ensureSameCurrency(a: Money, b: Money) {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
}
