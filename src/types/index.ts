export interface User {
  id: string;
  username: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense";
  userId: string;
}

export interface InsertCategory {
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense";
}

export interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  categoryId?: string;
  description: string;
  date: string;
  counterparty?: string;
  isDeductible: boolean;
  userId: string;
}

export interface InsertTransaction {
  amount: number;
  type: "income" | "expense" | "transfer";
  categoryId?: string;
  description: string;
  date: string;
  counterparty?: string;
  isDeductible?: boolean;
}

export interface ParsedTransaction {
  date: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  description: string;
  counterparty?: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  estimatedTax: number;
  transactionCount: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

export interface DailyData {
  date: string;
  label: string;
  income: number;
  expenses: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  amount: number;
  percentage: number;
}

export type TaxSystemType = "simplified_4" | "self_employed" | "general";

export interface TaxSettings {
  id: string;
  taxSystem: TaxSystemType;
  year: number;
  userId: string;
}

export interface TaxDeadline {
  id: string;
  quarter: number;
  year: number;
  dueDate: string;
  isPaid: boolean;
  amount?: number;
  userId: string;
}

export interface QuarterlyPayment {
  quarter: number;
  amount: number;
  dueDate: string;
  isPaid: boolean;
}

export interface TaxCalculation {
  taxSystem: TaxSystemType;
  income: number;
  expenses: number;
  taxBase: number;
  taxRate: number;
  taxAmount: number;
  quarterlyPayments: QuarterlyPayment[];
}
