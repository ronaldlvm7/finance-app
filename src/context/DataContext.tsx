
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Transaction, Account, Category, Debt, Budget, Goal } from '../types';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

export interface AppData {
    accounts: Account[];
    transactions: Transaction[];
    categories: Category[];
    debts: Debt[];
    budgets: Budget[];
    goals: Goal[];
}

interface DataContextType {
    data: AppData;
    isLoading: boolean;
    user: { name: string };
    updateUser: (name: string) => Promise<void>;
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    addAccount: (account: Omit<Account, 'id'>) => Promise<void>;
    updateAccount: (account: Account) => Promise<void>;
    addDebt: (debt: Omit<Debt, 'id'>) => Promise<void>;
    updateDebt: (debt: Debt) => Promise<void>;
    addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
    setBudget: (budget: Budget) => Promise<void>;
    addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
    clearAllData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user: authUser } = useAuth();
    const [data, setData] = useState<AppData>({
        accounts: [],
        transactions: [],
        categories: [],
        debts: [],
        budgets: [],
        goals: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState('Usuario');

    const fetchData = async () => {
        if (!authUser) {
            setData({
                accounts: [],
                transactions: [],
                categories: [],
                debts: [],
                budgets: [],
                goals: []
            });
            return;
        }
        setIsLoading(true);

        try {
            const [
                { data: accounts },
                { data: transactions },
                { data: categories },
                { data: debts },
                { data: goals },
                { data: profile }
            ] = await Promise.all([
                supabase.from('accounts').select('*').eq('is_archived', false),
                supabase.from('transactions').select('*').order('date', { ascending: false }),
                supabase.from('categories').select('*'),
                supabase.from('debts').select('*').neq('status', 'cancelled'),
                supabase.from('goals').select('*'),
                supabase.from('profiles').select('name').eq('id', authUser.id).single()
            ]);

            const mapAccounts = (list: any[]): Account[] => list?.map(item => ({
                id: item.id,
                name: item.name,
                type: item.type,
                balance: Number(item.balance),
                creditLimit: Number(item.credit_limit),
                isArchived: item.is_archived
            })) || [];

            const mapTransactions = (list: any[]): Transaction[] => list?.map(item => ({
                id: item.id,
                date: item.date,
                type: item.type,
                amount: Number(item.amount),
                concept: item.concept,
                description: item.description,
                categoryId: item.category_id,
                fromAccountId: item.from_account_id,
                toAccountId: item.to_account_id,
                paymentMethod: item.payment_method,
                debtId: item.debt_id
            })) || [];

            const mapDebts = (list: any[]): Debt[] => list?.map(item => ({
                id: item.id,
                name: item.name,
                type: item.type,
                totalAmount: Number(item.total_amount),
                currentBalance: Number(item.current_balance),
                status: item.status,
                startDate: item.start_date,
                installments: item.installments,
                installmentsPaid: item.installments_paid,
                accountId: item.account_id
            })) || [];

            const mapGoals = (list: any[]): Goal[] => list?.map(item => ({
                id: item.id,
                name: item.name,
                targetAmount: Number(item.target_amount),
                currentAmount: Number(item.current_amount),
                deadline: item.deadline,
                icon: item.icon,
                targetAccountId: item.target_account_id
            })) || [];

            const mapCategories = (list: any[]): Category[] => list?.map(item => ({
                id: item.id,
                name: item.name,
                isFixed: item.is_fixed,
                icon: item.icon,
                color: item.color
            })) || [];

            setData({
                accounts: mapAccounts(accounts || []),
                transactions: mapTransactions(transactions || []),
                categories: mapCategories(categories || []),
                debts: mapDebts(debts || []),
                budgets: [],
                goals: mapGoals(goals || [])
            });

            if (profile) setUserName(profile.name || 'Usuario');

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [authUser]);

    const updateUser = async (name: string) => {
        if (!authUser) return;
        setUserName(name);
        await supabase.from('profiles').update({ name }).eq('id', authUser.id);
    };

    // ------------------------------------------------------------------
    // TRANSACTIONS
    // ------------------------------------------------------------------
    const addTransaction = async (txnData: Omit<Transaction, 'id'>) => {
        if (!authUser) return;

        // 1. Insert Transaction
        const { error } = await supabase.from('transactions').insert({
            user_id: authUser.id,
            date: txnData.date,
            type: txnData.type,
            amount: txnData.amount,
            concept: txnData.concept,
            category_id: txnData.categoryId,
            from_account_id: txnData.fromAccountId,
            to_account_id: txnData.toAccountId,
            payment_method: txnData.paymentMethod,
            debt_id: txnData.debtId
        });

        if (error) {
            console.error("Error adding transaction:", error);
            return;
        }

        // 2. Handle Logic (Update Balances/Debts) via Database Triggers is better, but for V1 we keep frontend logic logic mirrored in backend ops??
        // actually, implementing the complex "Golden Rules" via multiple SQL updates from frontend is risky but easiest fo migration.

        // --- EXPENSE ---
        if (txnData.type === 'expense') {
            if (txnData.paymentMethod === 'credit' && txnData.fromAccountId) {
                // Credit Card Expense: Increase Debt, Decrease Account Balance (available credit)
                // In Supabase, 'accounts' balance for CC is usually negative or we track it differently?
                // The previous logic: 
                // updatedDebts[debtIndex].currentBalance += newTxn.amount;
                // updatedAccounts[accIndex].balance -= newTxn.amount;

                // We need to find the active debt for this CC
                // This is getting complex to do transactionally from client.
                // ideally, we create a stored procedure.
                // For now, let's do optimistic updates or just sequential updates.

                // We will rely on calling specific RPCs or just multiple updates.
                // Let's implement a simple version first: just update account balance.
                // Correct logic for CC expense:
                // 1. Update Account (reduce balance/available limit)
                if (txnData.fromAccountId) {
                    await rpcUpdateBalance(txnData.fromAccountId, -txnData.amount);
                }
                // 2. Update/Create Debt
                // Checking for existing active debt for this CC
                const { data: debts } = await supabase.from('debts')
                    .select('*')
                    .eq('account_id', txnData.fromAccountId)
                    .eq('type', 'credit_card')
                    .eq('status', 'active')
                    .single();

                if (debts) {
                    await supabase.from('debts').update({
                        current_balance: debts.current_balance + txnData.amount,
                        total_amount: debts.total_amount + txnData.amount
                    }).eq('id', debts.id);
                } else {
                    // Get Account Name
                    const acc = data.accounts.find(a => a.id === txnData.fromAccountId);
                    await supabase.from('debts').insert({
                        user_id: authUser.id,
                        name: `Deuda ${acc?.name || 'Tarjeta'}`,
                        type: 'credit_card',
                        total_amount: txnData.amount,
                        current_balance: txnData.amount,
                        status: 'active',
                        account_id: txnData.fromAccountId
                    });
                }

            } else if (txnData.fromAccountId) {
                // Cash/Debit Expense
                await rpcUpdateBalance(txnData.fromAccountId, -txnData.amount);
            }
        }
        // --- INCOME ---
        else if (txnData.type === 'income' && txnData.toAccountId) {
            await rpcUpdateBalance(txnData.toAccountId, txnData.amount);
        }
        // --- TRANSFER ---
        else if (txnData.type === 'transfer') {
            if (txnData.fromAccountId) await rpcUpdateBalance(txnData.fromAccountId, -txnData.amount);
            if (txnData.toAccountId) {
                await rpcUpdateBalance(txnData.toAccountId, txnData.amount);

                // If transfer TO credit card (Payment)
                const toAccount = data.accounts.find(a => a.id === txnData.toAccountId);
                if (toAccount?.type === 'credit_card') {
                    // Reduce Debt
                    const { data: debts } = await supabase.from('debts')
                        .select('*')
                        .eq('account_id', txnData.toAccountId)
                        .eq('type', 'credit_card')
                        .eq('status', 'active')
                        .single();

                    if (debts) {
                        const newBalance = debts.current_balance - txnData.amount;
                        await supabase.from('debts').update({
                            current_balance: newBalance,
                            status: newBalance <= 0 ? 'paid' : 'active'
                        }).eq('id', debts.id);
                    }
                }
            }
        }
        // --- DEBT PAYMENT ---
        else if (txnData.type === 'debt_payment' && txnData.debtId) {
            const debt = data.debts.find(d => d.id === txnData.debtId);
            if (debt) {
                const newBalance = debt.currentBalance - txnData.amount;
                await supabase.from('debts').update({
                    current_balance: newBalance,
                    status: newBalance <= 0 ? 'paid' : 'active'
                }).eq('id', txnData.debtId);
            }
            if (txnData.fromAccountId) {
                await rpcUpdateBalance(txnData.fromAccountId, -txnData.amount);
            }
        }

        fetchData();
    };

    const rpcUpdateBalance = async (accountId: string, amount: number) => {
        // We really should use an RPC, but for now: fetch, calc, update
        const { data: acc } = await supabase.from('accounts').select('balance').eq('id', accountId).single();
        if (acc) {
            await supabase.from('accounts').update({ balance: acc.balance + amount }).eq('id', accountId);
        }
    };

    const deleteTransaction = async (id: string) => {
        await supabase.from('transactions').delete().eq('id', id);
        fetchData();
    };

    // ------------------------------------------------------------------
    // ACCOUNTS
    // ------------------------------------------------------------------
    const addAccount = async (acc: Omit<Account, 'id'>) => {
        if (!authUser) return;
        await supabase.from('accounts').insert({
            user_id: authUser.id,
            name: acc.name,
            type: acc.type,
            balance: acc.balance,
            credit_limit: acc.creditLimit,
            is_archived: false
        });
        fetchData();
    };

    const updateAccount = async (acc: Account) => {
        await supabase.from('accounts').update({
            name: acc.name,
            balance: acc.balance
        }).eq('id', acc.id);
        fetchData();
    };

    // ------------------------------------------------------------------
    // DEBTS
    // ------------------------------------------------------------------
    const addDebt = async (debt: Omit<Debt, 'id'>) => {
        if (!authUser) return;
        await supabase.from('debts').insert({
            user_id: authUser.id,
            name: debt.name,
            type: debt.type,
            total_amount: debt.totalAmount,
            current_balance: debt.currentBalance,
            status: debt.status,
            start_date: debt.startDate,
            installments: debt.installments,
            account_id: debt.accountId
        });
        fetchData();
    };

    const updateDebt = async (debt: Debt) => {
        await supabase.from('debts').update({
            current_balance: debt.currentBalance,
            installments_paid: debt.installmentsPaid,
            status: debt.status
        }).eq('id', debt.id);
        fetchData();
    };

    // ------------------------------------------------------------------
    // GOALS & CATEGORIES
    // ------------------------------------------------------------------
    const addCategory = async (cat: Omit<Category, 'id'>) => {
        if (!authUser) return;
        await supabase.from('categories').insert({
            user_id: authUser.id,
            name: cat.name,
            is_fixed: cat.isFixed,
            icon: cat.icon,
            color: cat.color
        });
        fetchData();
    };

    const setBudget = async (_budget: Budget) => {
        // Placeholder
    };

    const addGoal = async (goal: Omit<Goal, 'id'>) => {
        if (!authUser) return;
        await supabase.from('goals').insert({
            user_id: authUser.id,
            name: goal.name,
            target_amount: goal.targetAmount,
            current_amount: goal.currentAmount,
            deadline: goal.deadline,
            icon: goal.icon
        });
        fetchData();
    };

    const clearAllData = async () => {
        if (!authUser) return;

        // 1. Optimistic Update: Clear UI immediately
        setData({
            accounts: [],
            transactions: [],
            categories: [],
            debts: [],
            budgets: [],
            goals: []
        });

        try {
            // 2. Delete from Supabase
            // Delete in order to avoid FK constraints
            const { error: txError } = await supabase.from('transactions').delete().eq('user_id', authUser.id);
            if (txError) throw txError;

            const { error: dbError } = await supabase.from('debts').delete().eq('user_id', authUser.id);
            if (dbError) throw dbError;

            const { error: glError } = await supabase.from('goals').delete().eq('user_id', authUser.id);
            if (glError) throw glError;

            const { error: catError } = await supabase.from('categories').delete().eq('user_id', authUser.id);
            if (catError) throw catError;

            // Accounts last
            const { error: acError } = await supabase.from('accounts').delete().eq('user_id', authUser.id);
            if (acError) throw acError;

            console.log("All data cleared successfully");

            // 3. Final Fetch to ensure sync
            fetchData();
        } catch (error) {
            console.error("Error clearing data:", error);
            alert("Hubo un error borrando los datos. Revisa la consola.");
            fetchData(); // Revert state if error
        }
    };

    return (
        <DataContext.Provider value={{
            data,
            isLoading,
            user: { name: userName },
            updateUser,
            addTransaction,
            deleteTransaction,
            addAccount,
            updateAccount,
            addDebt,
            updateDebt,
            addCategory,
            setBudget,
            addGoal,
            clearAllData
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
