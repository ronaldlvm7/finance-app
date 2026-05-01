import { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import type { TransactionType, Transaction, Account, Debt } from '../../types';
import { format } from 'date-fns';

export interface TransactionFormProps {
    onSuccess: () => void;
    onCancel?: () => void;
    initialValues?: Partial<Transaction>;
    editId?: string;
    onPendingEdit?: (data: Omit<Transaction, 'id'>) => void;
}

const TYPE_CONFIG = {
    expense:      { label: 'Gasto',   color: '#EF4444', gradient: 'linear-gradient(160deg, #F87171 0%, #DC2626 100%)' },
    income:       { label: 'Ingreso', color: '#22C55E', gradient: 'linear-gradient(160deg, #34D399 0%, #16A34A 100%)' },
    transfer:     { label: 'Transf.', color: '#3B82F6', gradient: 'linear-gradient(160deg, #60A5FA 0%, #2563EB 100%)' },
    debt_payment: { label: 'Deuda',   color: '#F59C2A', gradient: 'linear-gradient(160deg, #FBBF24 0%, #D97706 100%)' },
} as const;

const CATEGORY_EMOJI: Record<string, string> = {
    comida: '🍔', almuerzo: '🍽️', cena: '🍽️', desayuno: '🥐', restaurante: '🍽️',
    transporte: '🚗', uber: '🚗', taxi: '🚗', bus: '🚌', gasolina: '⛽',
    salud: '💊', médico: '⚕️', medico: '⚕️', farmacia: '💊', doctor: '🏥',
    ocio: '🎮', entretenimiento: '🎬', cine: '🎬', gaming: '🎮',
    hogar: '🏠', casa: '🏠', alquiler: '🏠', luz: '💡', agua: '💧',
    ropa: '👕', moda: '👗', zapatos: '👟',
    educación: '📚', educacion: '📚', escuela: '🏫', universidad: '🎓',
    viajes: '✈️', viaje: '✈️', hotel: '🏨',
    gym: '💪', deporte: '⚽', bienestar: '💆', masajes: '💆',
    tecnología: '💻', tecnologia: '💻', suscripción: '📱', suscripcion: '📱',
    supermercado: '🛒', mercado: '🛒', compras: '🛍️',
    café: '☕', cafe: '☕', cafetería: '☕', cafeteria: '☕',
    ingresos: '💰', sueldo: '💼', trabajo: '💼', freelance: '💻', salario: '💼',
    seguros: '🛡️', seguro: '🛡️', ahorros: '🏦', inversión: '📈',
};

const getCategoryEmoji = (cat: { name: string; icon?: string }): string => {
    const icon = cat.icon?.trim() || '';
    if (icon && icon !== 'tag' && /\p{Emoji}/u.test(icon)) return icon;
    const name = cat.name.toLowerCase();
    for (const [key, emoji] of Object.entries(CATEGORY_EMOJI)) {
        if (name.includes(key)) return emoji;
    }
    return '🏷️';
};

const getAccountVisual = (type: string): { emoji: string; bg: string } => {
    switch (type) {
        case 'cash':        return { emoji: '💵', bg: '#22C55E20' };
        case 'bank':        return { emoji: '🏦', bg: '#6B728020' };
        case 'debit':       return { emoji: '💳', bg: '#3B82F620' };
        case 'credit_card': return { emoji: '💳', bg: '#8B5CF620' };
        case 'savings':     return { emoji: '🏦', bg: '#10B98120' };
        default:            return { emoji: '💰', bg: '#6B728020' };
    }
};

const RadioDot = ({ isSelected, color }: { isSelected: boolean; color: string }) => (
    <div
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
        style={isSelected ? { borderColor: color, background: color } : { borderColor: 'hsl(var(--border))' }}
    >
        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
    </div>
);

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
);

const getAccountDisplayBalance = (account: Account, debts: Debt[]): number => {
    if (account.type === 'credit_card') {
        const limit = account.creditLimit || 0;
        const ccDebt = debts
            .filter(d => d.accountId === account.id && d.type === 'credit_card' && d.status === 'active')
            .reduce((sum, d) => sum + d.currentBalance, 0);
        return limit - ccDebt;
    }
    return account.balance;
};

const AccountSelector = ({
    label, accounts, debts, selectedId, onSelect, activeColor,
}: {
    label: string;
    accounts: Account[];
    debts: Debt[];
    selectedId: string;
    onSelect: (id: string) => void;
    activeColor: string;
}) => (
    <div>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
        <div className="space-y-2">
            {accounts.map(account => {
                const { emoji, bg } = getAccountVisual(account.type);
                const isSelected = selectedId === account.id;
                const displayBalance = getAccountDisplayBalance(account, debts);
                const isCC = account.type === 'credit_card';
                return (
                    <button
                        key={account.id}
                        type="button"
                        onClick={() => onSelect(account.id)}
                        className="w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all"
                        style={isSelected
                            ? { borderColor: activeColor, background: activeColor + '12' }
                            : { borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }
                        }
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: bg }}>
                                {emoji}
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-sm text-foreground">{account.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {isCC ? 'Disponible: ' : ''}S/{displayBalance.toFixed(2)}
                                </p>
                            </div>
                        </div>
                        <RadioDot isSelected={isSelected} color={activeColor} />
                    </button>
                );
            })}
        </div>
    </div>
);

export const TransactionForm = ({ onSuccess, onCancel: _onCancel, initialValues, editId, onPendingEdit }: TransactionFormProps) => {
    const { addTransaction, addCategory, data } = useData();
    const isFirstMount = useRef(true);

    const [step, setStep] = useState(1);
    const [type, setType] = useState<TransactionType>(initialValues?.type || 'expense');
    const [amount, setAmount] = useState(initialValues?.amount?.toString() || '');
    const [concept, setConcept] = useState(initialValues?.concept || '');
    const [date, setDate] = useState(initialValues?.date || format(new Date(), 'yyyy-MM-dd'));
    const [categoryId, setCategoryId] = useState(initialValues?.categoryId || '');
    const [fromAccountId, setFromAccountId] = useState(initialValues?.fromAccountId || '');
    const [toAccountId, setToAccountId] = useState(initialValues?.toAccountId || '');
    const [debtId, setDebtId] = useState(initialValues?.debtId || '');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit'>(
        initialValues?.paymentMethod === 'credit' ? 'credit' : 'cash'
    );
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const accounts = data.accounts;
    const categories = data.categories;
    const activeDebts = data.debts.filter(d => d.status === 'active');
    const config = TYPE_CONFIG[type];
    const needsCategory = type === 'income' || type === 'expense';

    useEffect(() => {
        if (isFirstMount.current) { isFirstMount.current = false; return; }
        setCategoryId('');
        setFromAccountId('');
        setToAccountId('');
        setDebtId('');
        setPaymentMethod('cash');
    }, [type]);

    useEffect(() => {
        if (!fromAccountId) return;
        const account = accounts.find(a => a.id === fromAccountId);
        if (account?.type === 'credit_card') setPaymentMethod('credit');
        else setPaymentMethod('cash');
    }, [fromAccountId, accounts]);

    const handleNumPress = (key: string) => {
        if (key === '⌫') { setAmount(prev => prev.slice(0, -1)); return; }
        if (key === '.') {
            if (amount.includes('.')) return;
            setAmount(prev => (prev || '0') + '.');
            return;
        }
        if (amount === '0') { setAmount(key); return; }
        const dotIdx = amount.indexOf('.');
        if (dotIdx !== -1 && amount.length - dotIdx > 2) return;
        setAmount(prev => prev + key);
    };

    const canProceedToStep2 = () => {
        if (!amount || Number(amount) <= 0) return false;
        if (needsCategory && !categoryId) return false;
        return true;
    };

    const handleSubmit = () => {
        if (!concept.trim()) { alert('Por favor ingresa una descripción'); return; }
        if (type !== 'income' && !fromAccountId) { alert('Por favor selecciona una cuenta origen'); return; }
        if ((type === 'income' || type === 'transfer') && !toAccountId) { alert('Por favor selecciona una cuenta destino'); return; }
        if (type === 'debt_payment' && !debtId) { alert('Por favor selecciona la deuda a pagar'); return; }

        if (type === 'expense') {
            const account = accounts.find(a => a.id === fromAccountId);
            if (account) {
                if (account.type === 'credit_card') {
                    const available = getAccountDisplayBalance(account, data.debts);
                    if (Number(amount) > available) {
                        alert(`Fondos insuficientes. Tu tarjeta ${account.name} solo tiene ${available.toFixed(2)} disponible.`);
                        return;
                    }
                } else {
                    if (Number(amount) > account.balance) {
                        alert(`Fondos insuficientes. Tu cuenta ${account.name} solo tiene ${account.balance.toFixed(2)} disponible.`);
                        return;
                    }
                }
            }
        }

        const txnData: Omit<Transaction, 'id'> = {
            date,
            type,
            amount: Number(amount),
            concept,
            categoryId: needsCategory ? categoryId : undefined,
            fromAccountId: type === 'income' ? undefined : fromAccountId,
            toAccountId: (type === 'expense' || type === 'debt_payment') ? undefined : toAccountId,
            paymentMethod: type === 'expense' ? paymentMethod : undefined,
            debtId: type === 'debt_payment' ? debtId : undefined,
        };

        if (editId && onPendingEdit) { onPendingEdit(txnData); return; }
        addTransaction(txnData);
        onSuccess();
    };

    return (
        <div className="flex flex-col">
            {/* ── Colored Header ── */}
            <div className="px-5 pt-4 pb-5 shrink-0" style={{ background: config.gradient }}>
                <div className="flex gap-1 bg-black/15 rounded-2xl p-1 mb-4">
                    {(['expense', 'income', 'transfer', 'debt_payment'] as const).map(t => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => { setType(t); setStep(1); }}
                            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                                type === t ? 'bg-white text-gray-800 shadow-sm' : 'text-white/80 hover:text-white'
                            }`}
                        >
                            {TYPE_CONFIG[t].label}
                        </button>
                    ))}
                </div>
                <div className="text-center">
                    <p className="text-white/70 text-xs uppercase tracking-wider font-medium">Monto</p>
                    <p className="text-white font-bold mt-1" style={{ fontSize: '2.75rem', lineHeight: 1.1 }}>
                        S/{amount || '0'}
                    </p>
                </div>
                <div className="flex justify-center gap-2 mt-3">
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-5 bg-white' : 'w-2 bg-white/35'}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-5 bg-white' : 'w-2 bg-white/35'}`} />
                </div>
            </div>

            {/* ── Step 1: Description + Category + Numpad ── */}
            {step === 1 && (
                <div className="overflow-y-auto">
                    {/* Description */}
                    <div className="px-4 pt-4">
                        <div className="flex items-center gap-3 bg-secondary rounded-2xl px-4 h-12 border border-border">
                            <span className="text-base select-none">✏️</span>
                            <input
                                type="text"
                                value={concept}
                                onChange={e => setConcept(e.target.value)}
                                placeholder="Descripción (ej. Almuerzo, Uber...)"
                                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Category grid */}
                    {needsCategory && (
                        <div className="px-4 pt-4">
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Categoría</p>
                            <div className="grid grid-cols-4 gap-2">
                                {categories.map(cat => {
                                    const isSelected = categoryId === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCategoryId(cat.id)}
                                            className="flex flex-col items-center py-2.5 rounded-2xl border-2 transition-all text-center"
                                            style={isSelected ? {
                                                borderColor: config.color,
                                                background: config.color + '15',
                                            } : {
                                                borderColor: 'transparent',
                                                background: 'hsl(var(--secondary))',
                                            }}
                                        >
                                            <span className="text-2xl leading-none">{getCategoryEmoji(cat)}</span>
                                            <span className="text-[10px] font-medium mt-1.5 text-foreground truncate w-full px-1">{cat.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="mt-2.5">
                                {showNewCategory ? (
                                    <div className="flex gap-2 items-center">
                                        <input
                                            autoFocus
                                            type="text"
                                            value={newCategoryName}
                                            onChange={e => setNewCategoryName(e.target.value)}
                                            placeholder="Nombre de categoría..."
                                            className="flex-1 h-10 rounded-xl border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                                            onKeyDown={async e => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (!newCategoryName.trim()) return;
                                                    const created = await addCategory({ name: newCategoryName.trim(), isFixed: false, icon: '🏷️', color: config.color });
                                                    if (created?.id) setCategoryId(created.id);
                                                    setNewCategoryName(''); setShowNewCategory(false);
                                                }
                                                if (e.key === 'Escape') { setNewCategoryName(''); setShowNewCategory(false); }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (!newCategoryName.trim()) return;
                                                const created = await addCategory({ name: newCategoryName.trim(), isFixed: false, icon: '🏷️', color: config.color });
                                                if (created?.id) setCategoryId(created.id);
                                                setNewCategoryName(''); setShowNewCategory(false);
                                            }}
                                            className="h-10 px-3 rounded-xl text-white text-sm font-semibold shrink-0"
                                            style={{ background: config.color }}
                                        >
                                            Crear
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setNewCategoryName(''); setShowNewCategory(false); }}
                                            className="h-10 px-3 rounded-xl border border-border text-sm text-muted-foreground shrink-0"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowNewCategory(true)}
                                        className="text-xs font-bold"
                                        style={{ color: config.color }}
                                    >
                                        + Agregar categoría
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Numpad */}
                    <div className="px-4 pt-4">
                        <div className="grid grid-cols-3 gap-2">
                            {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map(key => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => handleNumPress(key)}
                                    className={`h-14 rounded-2xl text-xl font-semibold transition-all active:scale-95 select-none ${
                                        key === '⌫'
                                            ? 'bg-red-50 text-red-400 dark:bg-red-500/10 dark:text-red-400'
                                            : 'bg-secondary text-foreground hover:bg-secondary/70'
                                    }`}
                                >
                                    {key}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Continuar */}
                    <div className="px-4 pb-6 pt-3">
                        <button
                            type="button"
                            onClick={() => canProceedToStep2() && setStep(2)}
                            disabled={!canProceedToStep2()}
                            className="w-full h-14 rounded-2xl text-white font-bold text-base transition-all active:scale-[0.98] disabled:opacity-40"
                            style={{ background: config.color, boxShadow: `0 4px 16px ${config.color}55` }}
                        >
                            Continuar →
                        </button>
                    </div>
                </div>
            )}

            {/* ── Step 2: Accounts + Summary ── */}
            {step === 2 && (
                <>
                    <div className="overflow-y-auto px-4 pt-4 space-y-4 pb-4">
                        {/* FROM ACCOUNT */}
                        {type !== 'income' && (
                            <AccountSelector
                                label={type === 'transfer' ? 'Cuenta Origen (Paga)' : type === 'debt_payment' ? 'Cuenta de Pago' : 'Cuenta Origen (Paga)'}
                                accounts={accounts}
                                debts={data.debts}
                                selectedId={fromAccountId}
                                onSelect={setFromAccountId}
                                activeColor={config.color}
                            />
                        )}

                        {/* TO ACCOUNT */}
                        {(type === 'income' || type === 'transfer') && (
                            <div>
                                <AccountSelector
                                    label="Cuenta Destino (Recibe)"
                                    accounts={accounts}
                                    debts={data.debts}
                                    selectedId={toAccountId}
                                    onSelect={setToAccountId}
                                    activeColor={config.color}
                                />
                                {accounts.find(a => a.id === toAccountId)?.type === 'credit_card' && (
                                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl flex items-center gap-2">
                                        <span>💳</span>
                                        <div>
                                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400">Pago de Tarjeta Detectado</p>
                                            <p className="text-[10px] text-blue-500 dark:text-blue-300">
                                                Esta transferencia reducirá tu deuda de TC automáticamente.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* PAYMENT METHOD */}
                        {type === 'expense' && fromAccountId && (
                            accounts.find(a => a.id === fromAccountId)?.type === 'credit_card' ? (
                                <div className="p-3 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-xl flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400">
                                    <span>💳</span>
                                    <span>Pagando con Crédito (Automático)</span>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Método de Pago</p>
                                    <div className="flex gap-2">
                                        {(['cash', 'credit'] as const).map(m => (
                                            <button
                                                key={m}
                                                type="button"
                                                onClick={() => setPaymentMethod(m)}
                                                className="flex-1 py-3 text-sm border-2 rounded-2xl font-semibold transition-all"
                                                style={paymentMethod === m
                                                    ? { borderColor: m === 'credit' ? '#8B5CF6' : config.color, color: m === 'credit' ? '#8B5CF6' : config.color, background: (m === 'credit' ? '#8B5CF6' : config.color) + '10' }
                                                    : { borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }
                                                }
                                            >
                                                {m === 'cash' ? 'Efectivo / Débito' : 'Crédito'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )
                        )}

                        {/* DEBT SELECTOR */}
                        {type === 'debt_payment' && (
                            <div>
                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Deuda a Pagar</p>
                                <div className="space-y-2">
                                    {activeDebts.map(debt => {
                                        const isSelected = debtId === debt.id;
                                        return (
                                            <button
                                                key={debt.id}
                                                type="button"
                                                onClick={() => setDebtId(debt.id)}
                                                className="w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all text-left"
                                                style={isSelected
                                                    ? { borderColor: config.color, background: config.color + '12' }
                                                    : { borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }
                                                }
                                            >
                                                <div>
                                                    <p className="font-semibold text-sm text-foreground">{debt.name}</p>
                                                    <p className="text-xs text-muted-foreground">S/{debt.currentBalance.toFixed(2)} pendiente</p>
                                                </div>
                                                <RadioDot isSelected={isSelected} color={config.color} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* DATE */}
                        <div>
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Fecha</p>
                            <div className="relative h-12">
                                <div className="flex h-12 w-full items-center rounded-2xl border border-border bg-secondary px-4 text-sm font-medium pointer-events-none select-none text-foreground">
                                    {date ? (() => { const [y, m, d] = date.split('-'); return `${d}/${m}/${y}`; })() : ''}
                                </div>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* SUMMARY */}
                        <div className="bg-secondary rounded-2xl p-4 space-y-2.5">
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Resumen</p>
                            <SummaryRow label="Tipo" value={config.label} />
                            <SummaryRow label="Monto" value={`S/${amount}`} />
                            {concept && <SummaryRow label="Descripción" value={concept} />}
                            {needsCategory && categoryId && (
                                <SummaryRow label="Categoría" value={categories.find(c => c.id === categoryId)?.name || ''} />
                            )}
                            {fromAccountId && (
                                <SummaryRow label={type === 'transfer' ? 'Desde' : 'Cuenta'} value={accounts.find(a => a.id === fromAccountId)?.name || ''} />
                            )}
                            {toAccountId && (
                                <SummaryRow label={type === 'transfer' ? 'Hacia' : 'Cuenta destino'} value={accounts.find(a => a.id === toAccountId)?.name || ''} />
                            )}
                            {debtId && (
                                <SummaryRow label="Deuda" value={activeDebts.find(d => d.id === debtId)?.name || ''} />
                            )}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="px-4 pb-6 pt-2 flex gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="flex-1 h-14 rounded-2xl border-2 border-border font-semibold text-sm text-muted-foreground hover:bg-secondary transition-all"
                        >
                            ← Volver
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="flex-1 h-14 rounded-2xl text-white font-bold text-base transition-all active:scale-[0.98]"
                            style={{ background: config.color, boxShadow: `0 4px 16px ${config.color}55` }}
                        >
                            {editId ? 'Guardar cambios ✓' : 'Guardar ✓'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
