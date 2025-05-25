
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

// Format money amount as display string without currency symbol
export const formatAmount = (amount: number, precision: number = 2): string => {
  return amount.toFixed(precision);
};

// Format money with currency symbol for display
export const formatCurrency = (amount: number, currency: string = 'CHF'): string => {
  return `${formatAmount(amount)} ${currency}`;
};

// Format money amount in cents for display
export const formatMoneyDisplay = (cents: number): string => {
  return formatAmount(fromCents(cents));
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

// Convert from display amount to cents for storage
export const parseAmountToCents = (displayAmount: string | number): number | null => {
  const num = typeof displayAmount === 'string' ? parseFloat(displayAmount) : displayAmount;
  if (!isValidAmount(num)) return null;
  return toCents(num);
};

// Safely add multiple money amounts in cents
export const sumMoney = (...amounts: number[]): number => {
  return amounts.reduce((sum, amount) => addMoney(sum, amount), 0);
};
