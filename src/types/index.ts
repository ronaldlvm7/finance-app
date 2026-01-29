export type AccountType = 'cash' | 'bank' | 'debit' | 'credit_card' | 'savings';

export interface Account {
    id: string;
    name: string;
    type: AccountType;
    balance: number; // Only for initial balance + calculated movements
    creditLimit?: number; // Only for credit cards
    isArchived?: boolean;
}

export type TransactionType = 'income' | 'expense' | 'transfer' | 'debt_payment';
export type PaymentMethod = 'cash' | 'debit' | 'credit'; // credit means using the credit card

export interface Transaction {
    id: string;
    date: string; // ISO string
    type: TransactionType;
    amount: number;
    concept: string;
    description?: string;
    categoryId?: string;
    fromAccountId?: string; // Source of funds (or the Credit Card account if expense is credit)
    toAccountId?: string; // Destination (for transfers/income)
    paymentMethod?: PaymentMethod;
    debtId?: string; // If related to a specific debt payment
}

export interface Category {
    id: string;
    name: string;
    parentId?: string;
    isFixed: boolean; // Fixed vs Variable
    color?: string;
    icon?: string;
}

export type DebtType = 'bank' | 'friend' | 'installments' | 'subscription' | 'credit_card';
export type DebtStatus = 'active' | 'paid' | 'cancelled';

export interface Debt {
    id: string;
    name: string;
    type: DebtType;
    totalAmount: number; // Principal
    currentBalance: number; // What is left to pay
    dueDate?: number; // Day of month
    interestRate?: number;
    installments?: number; // If applicable
    notes?: string;
    status: DebtStatus;
    startDate?: string; // ISO string YYYY-MM-DD
    installmentsPaid?: number; // For progress tracking
    accountId?: string; // Link to the specific Credit Card Account if type is credit_card
}

export interface Budget {
    id: string;
    categoryId: string;
    amount: number;
    month: string; // YYYY-MM
}

export interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
    icon?: string;
    targetAccountId?: string; // Where the money is stored
}

export interface AppData {
    accounts: Account[];
    transactions: Transaction[];
    categories: Category[];
    debts: Debt[];
    budgets: Budget[];
    goals: Goal[];
}
