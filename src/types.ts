export type TransactionType =
  | 'mobile_in'
  | 'mobile_out'
  | 'cash_in'
  | 'cash_out'
  | 'other_in'
  | 'other_out'
  | 'customer_payment'
  | 'customer_due';

export interface Transaction {
  id: string;
  date: string; // ISO string or YYYY-MM-DD
  type: TransactionType;
  amount: number;
  description: string;
  customerName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  currentBalance: number;
  createdAt: string;
  updatedAt: string;
}

export type TransactionCategory = {
  id: string;
  label: string;
  direction: 'in' | 'out';
  color: string;
  isSystem?: boolean;
};

export interface SystemSettings {
  systemName: string;
  userName: string;
  mobile: string;
  password?: string;
  googleSheetUrl?: string;
}

export const TRANSACTION_TYPES: Record<TransactionType, { label: string; direction: 'in' | 'out'; color: string }> = {
  mobile_in: { label: 'Mobile In', direction: 'in', color: 'text-emerald-600' },
  mobile_out: { label: 'Mobile Out', direction: 'out', color: 'text-rose-600' },
  cash_in: { label: 'Cash In', direction: 'in', color: 'text-emerald-600' },
  cash_out: { label: 'Cash Out', direction: 'out', color: 'text-rose-600' },
  other_in: { label: 'Other In', direction: 'in', color: 'text-emerald-600' },
  other_out: { label: 'Other Out', direction: 'out', color: 'text-rose-600' },
  customer_payment: { label: 'Customer Payment', direction: 'in', color: 'text-blue-600' },
  customer_due: { label: 'Customer Due', direction: 'out', color: 'text-amber-600' },
};

export const IN_TYPES: TransactionType[] = ['mobile_in', 'cash_in', 'other_in', 'customer_payment'];
export const OUT_TYPES: TransactionType[] = ['mobile_out', 'cash_out', 'other_out', 'customer_due'];
