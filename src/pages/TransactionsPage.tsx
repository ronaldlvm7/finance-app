import { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../utils/utils';
import { format, subMonths, addMonths, isSameMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { WeeklyBalanceChart } from '../components/dashboard/WeeklyBalanceChart';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';

type FilterType = 'all' | 'income' | 'expense' | 'transfer' | 'debt_payment';

const TYPE_LABELS: Record<FilterType, string> = {
    all: 'Todos',
    income: 'Ingresos',
    expense: 'Gastos',
    transfer: 'Transferencias',
    debt_payment: 'Pagos',
};

export const TransactionsPage = () => {
    const { data } = useData();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);

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
            case 'income': return 'bg-emerald-500/15 text-emerald-400';
            case 'expense': return 'bg-red-500/15 text-red-400';
            case 'debt_payment': return 'bg-orange-500/15 text-orange-400';
            default: return 'bg-blue-500/15 text-blue-400';
        }
    };

    const getAmountStyle = (type: string) => {
        switch (type) {
            case 'income': return 'text-emerald-400';
            case 'expense': return 'text-red-400';
            case 'debt_payment': return 'text-orange-400';
            default: return 'text-blue-400';
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

    // Group transactions by date
    const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, txn) => {
        const key = format(parseISO(txn.date), 'yyyy-MM-dd');
        if (!acc[key]) acc[key] = [];
        acc[key].push(txn);
        return acc;
    }, {});

    const groupedEntries = Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));

    return (
        <div className="space-y-5 pb-20 fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="ios-large-title">Movimientos</h1>
                    <p className="ios-subhead capitalize">{monthLabel}</p>
                </div>
                <button
                    onClick={() => setShowSearch(s => !s)}
                    className="p-2.5 rounded-xl bg-card border border-white/5 text-muted-foreground hover:text-white transition-colors"
                >
                    <SlidersHorizontal size={18} />
                </button>
            </div>

            {/* Search bar */}
            {showSearch && (
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por concepto..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-card border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                </div>
            )}

            {/* Month Navigator */}
            <div className="flex items-center justify-between bg-card border border-white/5 rounded-2xl px-4 py-2.5">
                <button
                    onClick={() => setCurrentMonth(m => subMonths(m, 1))}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <ChevronLeft size={18} className="text-muted-foreground" />
                </button>
                <span className="text-sm font-bold capitalize">{monthLabel}</span>
                <button
                    onClick={() => setCurrentMonth(m => addMonths(m, 1))}
                    disabled={isSameMonth(currentMonth, new Date())}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronRight size={18} className="text-muted-foreground" />
                </button>
            </div>

            {/* Weekly Chart (ya incluye resumen de ingresos/egresos) */}
            <WeeklyBalanceChart />

            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {(Object.keys(TYPE_LABELS) as FilterType[]).map(type => (
                    <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${filterType === type
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                            : 'bg-card border border-white/5 text-muted-foreground hover:text-white'
                            }`}
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
                <div className="space-y-4">
                    {groupedEntries.map(([dateKey, txns]) => {
                        const dayTotal = txns.reduce((sum, t) => {
                            if (t.type === 'income') return sum + t.amount;
                            if (t.type === 'expense' || t.type === 'debt_payment') return sum - t.amount;
                            return sum;
                        }, 0);

                        return (
                            <div key={dateKey}>
                                {/* Date divider */}
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <p className="text-[11px] font-semibold text-muted-foreground capitalize">
                                        {format(parseISO(dateKey), "EEEE, d 'de' MMMM", { locale: es })}
                                    </p>
                                    <p className={`text-[11px] font-bold ${dayTotal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {dayTotal >= 0 ? '+' : ''}{formatCurrency(dayTotal)}
                                    </p>
                                </div>

                                {/* Transactions of this day */}
                                <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
                                    {txns.map((txn, i) => {
                                        const cat = data.categories.find(c => c.id === txn.categoryId);
                                        return (
                                            <div
                                                key={txn.id}
                                                className={`flex items-center justify-between px-4 py-3.5 hover:bg-white/3 transition-colors ${i < txns.length - 1 ? 'border-b border-white/5' : ''}`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getIconStyle(txn.type)}`}>
                                                        {getIcon(txn.type)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-sm truncate">{txn.concept}</p>
                                                        <p className="text-[11px] text-muted-foreground">
                                                            {cat ? cat.name : txn.type === 'debt_payment' ? 'Pago de deuda' : txn.type === 'transfer' ? 'Transferencia' : '—'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className={`font-bold text-sm shrink-0 ml-2 ${getAmountStyle(txn.type)}`}>
                                                    {getAmountPrefix(txn.type)}{formatCurrency(txn.amount)}
                                                </p>
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
    );
};
