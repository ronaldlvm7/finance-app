import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import type { TransactionType, Transaction } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { format } from 'date-fns';

export interface TransactionFormProps {
    onSuccess: () => void;
    onCancel?: () => void;
    initialValues?: Partial<Transaction>;
}

export const TransactionForm = ({ onSuccess, onCancel, initialValues }: TransactionFormProps) => {
    const { addTransaction, data } = useData();
    const [type, setType] = useState<TransactionType>(initialValues?.type || 'expense');
    const [amount, setAmount] = useState(initialValues?.amount?.toString() || '');
    const [concept, setConcept] = useState(initialValues?.concept || '');
    const [date, setDate] = useState(initialValues?.date || format(new Date(), 'yyyy-MM-dd'));

    // Selects
    const [categoryId, setCategoryId] = useState(initialValues?.categoryId || '');
    const [fromAccountId, setFromAccountId] = useState(initialValues?.fromAccountId || '');
    const [toAccountId, setToAccountId] = useState(initialValues?.toAccountId || '');
    const [debtId, setDebtId] = useState(initialValues?.debtId || '');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit'>(initialValues?.paymentMethod === 'credit' ? 'credit' : 'cash');

    const accounts = data.accounts;
    const categories = data.categories;
    const activeDebts = data.debts.filter(d => d.status === 'active');

    // Reset states when type changes
    React.useEffect(() => {
        // Keep date, but reset others to avoid UI artifacts
        setCategoryId('');
        setFromAccountId('');
        setToAccountId('');
        setDebtId('');
        setPaymentMethod('cash');
        // Concept and amount can persist for convenience
    }, [type]);

    // Auto-detect Credit Card "Payment Method"
    React.useEffect(() => {
        if (!fromAccountId) return;
        const account = accounts.find(a => a.id === fromAccountId);
        if (account?.type === 'credit_card') {
            setPaymentMethod('credit'); // Enforce Credit
        } else {
            setPaymentMethod('cash'); // Default back to cash
        }
    }, [fromAccountId, accounts]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || !concept) return;

        // Validation for Category
        if ((type === 'income' || type === 'expense') && !categoryId) {
            alert("Por favor selecciona una categoría");
            return;
        }

        addTransaction({
            date,
            type,
            amount: Number(amount),
            concept,
            categoryId: (type === 'income' || type === 'expense') ? categoryId : undefined,
            fromAccountId: type === 'income' ? undefined : fromAccountId,
            toAccountId: (type === 'expense' || type === 'debt_payment') ? undefined : toAccountId,
            paymentMethod: type === 'expense' ? paymentMethod : undefined,
            debtId: type === 'debt_payment' ? debtId : undefined,
        });

        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Selector */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-secondary rounded-lg mb-4">
                {(['income', 'expense', 'transfer', 'debt_payment'] as const).map(t => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`text-xs py-2 rounded-md transition-all ${type === t ? 'bg-background shadow font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        {t === 'income' ? 'Ingreso' : t === 'expense' ? 'Gasto' : t === 'transfer' ? 'Transf.' : 'Pago Deuda'}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input label="Fecha" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                <Input label="Monto" type="number" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="0.00" />
            </div>

            <Input label="Concepto / Descripción" value={concept} onChange={e => setConcept(e.target.value)} required placeholder="Ej. Almuerzo, Uber..." />

            {/* Dynamic Fields based on Type */}

            {/* CATEGORY: Only for Income and Expense */}
            {(type === 'income' || type === 'expense') && (
                <Select
                    label="Categoría"
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    options={[
                        { value: '', label: 'Seleccionar...' },
                        ...categories.map(c => ({ value: c.id, label: c.name }))
                    ]}
                    required
                />
            )}

            {/* FROM ACCOUNT: For Expense, Transfer, Debt Payment */}
            {type !== 'income' && (
                <Select
                    label="Cuenta Origen (Paga)"
                    value={fromAccountId}
                    onChange={e => setFromAccountId(e.target.value)}
                    options={[
                        { value: '', label: 'Seleccionar...' },
                        ...accounts.filter(_ => type === 'debt_payment' ? true : true).map(a => ({ value: a.id, label: a.name }))
                    ]}
                    required
                />
            )}

            {/* PAYMENT METHOD: Only for Expense */}
            {type === 'expense' && (
                <div className="space-y-2">
                    <label className="text-sm font-medium">Método de Pago</label>
                    {accounts.find(a => a.id === fromAccountId)?.type === 'credit_card' ? (
                        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 text-sm font-bold flex items-center gap-2">
                            💳 Pagando con Crédito (Automático)
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('cash')}
                                className={`flex-1 py-2 text-sm border rounded-lg ${paymentMethod === 'cash' ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-border'}`}
                            >
                                Efectivo / Débito
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('credit')}
                                className={`flex-1 py-2 text-sm border rounded-lg ${paymentMethod === 'credit' ? 'border-purple-500 bg-purple-500/10 text-purple-500 font-bold' : 'border-border'}`}
                            >
                                Crédito (Genera Deuda)
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* TO ACCOUNT: Only for Income and Transfer */}
            {(type === 'income' || type === 'transfer') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label="Cuenta Destino (Recibe)"
                        value={toAccountId}
                        onChange={e => setToAccountId(e.target.value)}
                        options={[
                            { value: '', label: 'Seleccionar...' },
                            ...accounts.map(a => ({ value: a.id, label: a.name }))
                        ]}
                        required
                    />

                    {/* Visual Cue for Credit Card Payment */}
                    {accounts.find(a => a.id === toAccountId)?.type === 'credit_card' && (
                        <div className="col-span-1 md:col-span-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2">
                            <div className="text-blue-500 text-lg">💳</div>
                            <div>
                                <p className="text-xs font-bold text-blue-400">Pago de Tarjeta Detectado</p>
                                <p className="text-[10px] text-blue-300">
                                    Esta transferencia reducirá tu deuda de TC automáticamente.
                                    <br />
                                    No se duplicará como gasto (solo flujo de caja).
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* DEBT SELECTOR: Only for Debt Payment */}
            {type === 'debt_payment' && (
                <Select
                    label="Deuda a Pagar"
                    value={debtId}
                    onChange={e => setDebtId(e.target.value)}
                    options={[
                        { value: '', label: 'Seleccionar Deuda...' },
                        ...activeDebts.map(d => ({ value: d.id, label: `${d.name} (${d.currentBalance})` }))
                    ]}
                    required
                />
            )}

            <div className="flex gap-3 mt-4">
                {onCancel && (
                    <Button type="button" variant="ghost" className="flex-1" onClick={onCancel}>
                        Cancelar
                    </Button>
                )}
                <Button type="submit" className="flex-1">
                    Guardar Movimiento
                </Button>
            </div>
        </form>
    );
};
