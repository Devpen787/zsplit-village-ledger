
/**
 * Money utility functions for precise financial calculations
 * All internal calculations use integer cents to avoid floating-point errors
 */

export const toCents = (amount: number): number => Math.round(amount * 100);

export const fromCents = (cents: number): number => cents / 100;

export const formatMoney = (cents: number, currency: string = 'CHF'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(fromCents(cents));
};

export const addMoney = (cents1: number, cents2: number): number => cents1 + cents2;

export const subtractMoney = (cents1: number, cents2: number): number => cents1 - cents2;

export const multiplyMoney = (cents: number, multiplier: number): number => 
  Math.round(cents * multiplier);

export const divideMoney = (cents: number, divisor: number): number => 
  Math.round(cents / divisor);

export const compareMoney = (cents1: number, cents2: number): number => cents1 - cents2;

export const isValidAmount = (amount: number): boolean => {
  return !isNaN(amount) && amount >= 0 && Number.isFinite(amount);
};
