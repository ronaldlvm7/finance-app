import { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../utils/utils';
import { format, subMonths, addMonths, isSameMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { WeeklyBalanceChart } from '../components/dashboard/WeeklyBalanceChart';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, ChevronLeft, ChevronRight, Search, SlidersHorizontal, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import type { Transaction } from '../types';
import { TransactionForm } from '../components/forms/TransactionForm';
import { Modal } from '../components/ui/Modal';

type FilterType = 'all' | 'income' | 'expense' | 'transfer' | 'debt_payment';

const TYPE_LABELS: Record<FilterType, string> = {
    all: 'Todos',
    income: 'Ingresos',
    expense: 'Gastos',
    transfer: 'Transferencias',
    debt_payment: 'Pagos',
};

export const TransactionsPage = () => {
    const { data, deleteTransaction, updateTransaction } = useData();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    const [actionTxn, setActionTxn] = useState<Transaction | null>(null);
    const [deleteTxn, setDeleteTxn] = useState<Transaction | null>(null);
    const [editTxn, setEditTxn] = useState<Transaction | null>(null);
    const [pendingEditData, setPendingEditData] = useState<Omit<Transaction, 'id'> | null>(null);

    const allSorted = [...data.transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const filtered = allSorted.filter(txn => {
        const matchMonth = isSameMonth(parseISO(txn.date), currentMonth);
        const matchType = filterType === 'all' || txn.type === filterType;
        const matchSearch = !search || txn.concept.toLowerCase().includes(search.toLowerCase());
        return matchMonth && matchType && matchSearch;
    });

    const monthLabel = format(currentMonth, 'MMMM yyyy', { locale: es });

    const getIcon = (type: string) => {
        switch (type) {
            case 'income': return <ArrowDownLeft size={18} strokeWidth={2.5} />;
            case 'expense': return <ArrowUpRight size={18} strokeWidth={2.5} />;
            default: return <ArrowLeftRight size={18} strokeWidth={2} />;
        }
    };

    const getIconStyle = (type: string) => {
        switch (type) {
            case 'income': return 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400';
            case 'expense': return 'bg-red-50 text-destructive dark:bg-red-500/15 dark:text-red-400';
            case 'debt_payment': return 'bg-orange-50 text-orange-500 dark:bg-orange-500/15 dark:text-orange-400';
            default: return 'bg-blue-50 text-blue-500 dark:bg-blue-500/15 dark:text-blue-400';
        }
    };

    const getAmountStyle = (type: string) => {
        switch (type) {
            case 'income': return 'text-emerald-500 dark:text-emerald-400';
            case 'expense': return 'text-destructive dark:text-red-400';
            case 'debt_payment': return 'text-orange-500 dark:text-orange-400';
            default: return 'text-blue-500 dark:text-blue-400';
        }
    };

    const getAmountPrefix = (type: string) => {
        switch (type) {
            case 'income': return '+';
            case 'expense': return '-';
            case 'debt_payment': return '-';
            default: return '';
        }
    };

    const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, txn) => {
        const key = format(parseISO(txn.date), 'yyyy-MM-dd');
        if (!acc[key]) acc[key] = [];
        acc[key].push(txn);
        return acc;
    }, {});

    const groupedEntries = Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));

    return (
        <>
        <div className="space-y-5 pb-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="ios-large-title">Movimientos</h1>
                    <p className="ios-subhead capitalize">{monthLabel}</p>
                </div>
                <button
                    onClick={() => setShowSearch(s => !s)}
                    className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
                    style={{ boxShadow: 'var(--shadow-card)' }}
                >
                    <SlidersHorizontal size={18} />
                </button>
            </div>

            {/* Search bar */}
            {showSearch && (
                <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por concepto..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-card border border-border rounded-2xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        style={{ boxShadow: 'var(--shadow-card)' }}
                    />
                </div>
            )}

            {/* Month Navigator */}
            <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-3" style={{ boxShadow: 'var(--shadow-card)' }}>
                <button
                    onClick={() => setCurrentMonth(m => subMonths(m, 1))}
                    className="p-1.5 hover:bg-secondary rounded-xl transition-colors"
                >
                    <ChevronLeft size={18} className="text-muted-foreground" />
                </button>
                <span className="text-sm font-bold capitalize text-foreground">{monthLabel}</span>
                <button
                    onClick={() => setCurrentMonth(m => addMonths(m, 1))}
                    disabled={isSameMonth(currentMonth, new Date())}
                    className="p-1.5 hover:bg-secondary rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronRight size={18} className="text-muted-foreground" />
                </button>
            </div>

            {/* Weekly Chart */}
            <WeeklyBalanceChart />

            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {(Object.keys(TYPE_LABELS) as FilterType[]).map(type => (
                    <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${filterType === type
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
                        }`}
                        style={filterType === type ? { boxShadow: '0 4px 12px rgba(245,156,42,0.3)' } : { boxShadow: 'var(--shadow-card)' }}
                    >
                        {TYPE_LABELS[type]}
                    </button>
                ))}
            </div>

            {/* Grouped Transactions */}
            {filtered.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                    <ArrowLeftRight size={32} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Sin movimientos para este período.</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {groupedEntries.map(([dateKey, txns]) => {
                        const dayTotal = txns.reduce((sum, t) => {
                            if (t.type === 'income') return sum + t.amount;
                            if (t.type === 'expense' || t.type === 'debt_payment') return sum - t.amount;
                            return sum;
                        }, 0);

                        return (
                            <div key={dateKey}>
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <p className="text-[12px] font-semibold text-muted-foreground capitalize">
                                        {format(parseISO(dateKey), "EEEE, d 'de' MMMM", { locale: es })}
                                    </p>
                                    <p className={`text-[12px] font-bold ${dayTotal >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-destructive dark:text-red-400'}`}>
                                        {dayTotal >= 0 ? '+' : ''}{formatCurrency(dayTotal)}
                                    </p>
                                </div>

                                <div className="bg-card rounded-2xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
                                    {txns.map((txn, i) => {
                                        const cat = data.categories.find(c => c.id === txn.categoryId);
                                        return (
                                            <div
                                                key={txn.id}
                                                className={`flex items-center justify-between px-4 py-3.5 hover:bg-secondary/50 transition-colors ${i < txns.length - 1 ? 'border-b border-border' : ''}`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getIconStyle(txn.type)}`}>
                                                        {getIcon(txn.type)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-sm text-foreground truncate">{txn.concept}</p>
                                                        <p className="text-[11px] text-muted-foreground">
                                                            {cat ? cat.name : txn.type === 'debt_payment' ? 'Pago de deuda' : txn.type === 'transfer' ? 'Transferencia' : '—'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                                    <p className={`font-bold text-sm ${getAmountStyle(txn.type)}`}>
                                                        {getAmountPrefix(txn.type)}{formatCurrency(txn.amount)}
                                                    </p>
                                                    <button
                                                        onClick={e => { e.stopPropagation(); setActionTxn(txn); }}
                                                        className="p-1.5 rounded-xl hover:bg-secondary text-muted-foreground transition-colors ml-1"
                                                    >
                                                        <MoreVertical size={15} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        {/* ── ACTION SHEET ── */}
        {actionTxn && (
            <div className="fixed inset-0 z-50 flex items-end justify-center">
                <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setActionTxn(null)} />
                <div
                    className="relative w-full max-w-lg bg-card rounded-t-3xl px-4 pt-3 pb-6 space-y-2"
                    style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))', boxShadow: '0 -4px 40px rgba(0,0,0,0.12)' }}
                >
                    <div className="w-10 h-1 rounded-full bg-border mx-auto mb-3" />
                    <p className="text-center text-xs text-muted-foreground font-medium mb-1 truncate px-4">{actionTxn.concept}</p>
                    <button
                        onClick={() => { setEditTxn(actionTxn); setActionTxn(null); }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-secondary hover:bg-secondary/80 transition-colors text-left"
                    >
                        <Pencil size={18} className="text-primary shrink-0" />
                        <span className="font-semibold text-sm text-foreground">Editar movimiento</span>
                    </button>
                    <button
                        onClick={() => { setDeleteTxn(actionTxn); setActionTxn(null); }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-destructive/10 hover:bg-destructive/15 transition-colors text-left"
                    >
                        <Trash2 size={18} className="text-destructive shrink-0" />
                        <span className="font-semibold text-sm text-destructive">Eliminar movimiento</span>
                    </button>
                    <button
                        onClick={() => setActionTxn(null)}
                        className="w-full py-3.5 rounded-2xl bg-secondary text-muted-foreground font-semibold text-sm mt-1"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        )}

        {/* ── DELETE CONFIRM ── */}
        {deleteTxn && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
                <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setDeleteTxn(null)} />
                <div className="relative bg-card rounded-3xl p-6 w-full max-w-sm" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
                    <div className="text-center mb-5">
                        <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={24} className="text-destructive" />
                        </div>
                        <h3 className="font-bold text-lg text-foreground mb-2">¿Eliminar movimiento?</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Se eliminará <span className="font-semibold text-foreground">"{deleteTxn.concept}"</span> permanentemente.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setDeleteTxn(null)}
                            className="flex-1 py-3.5 rounded-2xl border border-border text-sm font-semibold hover:bg-secondary transition-colors text-foreground"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={async () => { await deleteTransaction(deleteTxn.id); setDeleteTxn(null); }}
                            className="flex-1 py-3.5 rounded-2xl bg-destructive hover:bg-destructive/90 text-white text-sm font-bold transition-colors"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* ── EDIT MODAL ── */}
        <Modal
            isOpen={!!editTxn && !pendingEditData}
            onClose={() => setEditTxn(null)}
            title="Editar Movimiento"
            hideHeader
            noPadding
        >
            {editTxn && (
                <TransactionForm
                    initialValues={editTxn}
                    editId={editTxn.id}
                    onPendingEdit={data => setPendingEditData(data)}
                    onSuccess={() => setEditTxn(null)}
                    onCancel={() => setEditTxn(null)}
                />
            )}
        </Modal>

        {/* ── EDIT CONFIRM ── */}
        {pendingEditData && editTxn && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
                <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setPendingEditData(null)} />
                <div className="relative bg-card rounded-3xl p-6 w-full max-w-sm" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
                    <div className="text-center mb-5">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <Pencil size={24} className="text-primary" />
                        </div>
                        <h3 className="font-bold text-lg text-foreground mb-2">¿Confirmar cambios?</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Se guardarán los cambios en <span className="font-semibold text-foreground">"{editTxn.concept}"</span>.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setPendingEditData(null)}
                            className="flex-1 py-3.5 rounded-2xl border border-border text-sm font-semibold hover:bg-secondary transition-colors text-foreground"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={async () => {
                                await updateTransaction({ ...pendingEditData, id: editTxn.id });
                                setPendingEditData(null);
                                setEditTxn(null);
                            }}
                            className="flex-1 py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold transition-colors"
                        >
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};
