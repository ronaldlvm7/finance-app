import type { Transaction, Account, Debt } from '../types';

/**
 * CRITICAL CREDIT CARD FLOW UTILITIES
 * 
 * These functions implement the "3 Layers" approach:
 * 1. CONSUMPTION (Capa 1): What you actually spent
 * 2. CASH FLOW (Capa 2): Real money that left your accounts
 * 3. LIABILITIES (Capa 3): What you still owe
 */

export interface DashboardMetrics {
    // Layer 1: Consumption
    totalConsumption: number;
    consumptionByCategory: Record<string, number>;

    // Layer 2: Cash Flow
    totalCashIn: number;
    totalCashOut: number;
    netCashFlow: number;

    // Layer 3: Liabilities
    totalDebt: number;
    creditCardDebt: number;
    otherDebt: number;
}

/**
 * Calculate dashboard metrics for a given month
 * This is the core "calcular_dashboard" function from the requirements
 */
export const calculateDashboardMetrics = (
    transactions: Transaction[],
    debts: Debt[],
    month: string // YYYY-MM format
): DashboardMetrics => {
    const monthTransactions = transactions.filter(t => t.date.startsWith(month));

    // LAYER 1: CONSUMPTION (Lo que realmente gasté)
    // All expenses count here, regardless of payment method
    const expenses = monthTransactions.filter(t => t.type === 'expense');
    const totalConsumption = expenses.reduce((sum, t) => sum + t.amount, 0);

    const consumptionByCategory: Record<string, number> = {};
    expenses.forEach(t => {
        if (t.categoryId) {
            consumptionByCategory[t.categoryId] = (consumptionByCategory[t.categoryId] || 0) + t.amount;
        }
    });

    // LAYER 2: CASH FLOW (Cuánto dinero salió realmente)
    const incomeTransactions = monthTransactions.filter(t => t.type === 'income');
    const totalCashIn = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Cash out includes:
    // - Expenses paid with cash/debit (NOT credit)
    // - Transfers (including credit card payments)
    // - Debt payments
    const cashExpenses = expenses.filter(t => t.paymentMethod !== 'credit');
    const transfers = monthTransactions.filter(t => t.type === 'transfer');
    const debtPayments = monthTransactions.filter(t => t.type === 'debt_payment');

    const totalCashOut =
        cashExpenses.reduce((sum, t) => sum + t.amount, 0) +
        transfers.reduce((sum, t) => sum + t.amount, 0) +
        debtPayments.reduce((sum, t) => sum + t.amount, 0);

    const netCashFlow = totalCashIn - totalCashOut;

    // LAYER 3: LIABILITIES (Lo que aún debo)
    const activeDebts = debts.filter(d => d.status === 'active');
    const totalDebt = activeDebts.reduce((sum, d) => sum + d.currentBalance, 0);

    const creditCardDebt = activeDebts
        .filter(d => d.type === 'credit_card')
        .reduce((sum, d) => sum + d.currentBalance, 0);

    const otherDebt = totalDebt - creditCardDebt;

    return {
        totalConsumption,
        consumptionByCategory,
        totalCashIn,
        totalCashOut,
        netCashFlow,
        totalDebt,
        creditCardDebt,
        otherDebt
    };
};

/**
 * Get credit card debt for a specific account
 */
export const getCreditCardDebt = (accountId: string, debts: Debt[]): number => {
    const debt = debts.find(d =>
        d.accountId === accountId &&
        d.type === 'credit_card' &&
        d.status === 'active'
    );
    return debt?.currentBalance || 0;
};

/**
 * Check if a credit card has pending debt
 */
export const hasPendingDebt = (accountId: string, debts: Debt[]): boolean => {
    return getCreditCardDebt(accountId, debts) > 0;
};

/**
 * Get all credit card accounts with their debt status
 */
export const getCreditCardAccounts = (accounts: Account[], debts: Debt[]) => {
    return accounts
        .filter(a => a.type === 'credit_card' && !a.isArchived)
        .map(account => ({
            ...account,
            currentDebt: getCreditCardDebt(account.id, debts),
            availableCredit: (account.creditLimit || 0) - getCreditCardDebt(account.id, debts)
        }));
};
