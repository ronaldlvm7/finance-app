import { ArrowDownLeft, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const IncomeExpenseSummary = () => {
    const { data } = useData();
    const currentMonth = format(new Date(), 'yyyy-MM');
    const monthLabel = format(new Date(), 'MMMM', { locale: es });
    const txns = data.transactions.filter(t => t.date.startsWith(currentMonth));

    const income = txns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = txns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;
    const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <p className="text-sm font-semibold text-muted-foreground capitalize">
                    Resumen de {monthLabel}
                </p>
                {income > 0 && (
                    <div className="flex items-center gap-1.5 text-xs">
                        <TrendingUp size={13} className={balance >= 0 ? 'text-emerald-500' : 'text-destructive'} />
                        <span className={`font-semibold ${balance >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                            {savingsRate}% ahorro
                        </span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                {/* Ingresos */}
                <div
                    className="bg-card rounded-2xl p-4 border border-border flex items-center gap-3"
                    style={{ boxShadow: 'var(--shadow-card)' }}
                >
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0 dark:bg-emerald-500/15 dark:text-emerald-400">
                        <ArrowDownLeft size={20} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground font-medium">Ingresos</p>
                        <p className="text-base font-bold tracking-tight text-emerald-500 truncate dark:text-emerald-400">{formatCurrency(income)}</p>
                    </div>
                </div>

                {/* Gastos */}
                <div
                    className="bg-card rounded-2xl p-4 border border-border flex items-center gap-3"
                    style={{ boxShadow: 'var(--shadow-card)' }}
                >
                    <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center text-destructive shrink-0 dark:bg-red-500/15 dark:text-red-400">
                        <ArrowUpRight size={20} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground font-medium">Gastos</p>
                        <p className="text-base font-bold tracking-tight text-destructive truncate dark:text-red-400">{formatCurrency(expenses)}</p>
                    </div>
                </div>
            </div>

            {/* Balance bar */}
            {(income > 0 || expenses > 0) && (
                <div className="bg-card rounded-2xl p-4 border border-border flex items-center justify-between" style={{ boxShadow: 'var(--shadow-card)' }}>
                    <div>
                        <p className="text-[11px] text-muted-foreground font-medium">Balance del mes</p>
                        <p className={`text-lg font-bold tracking-tight ${balance >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-destructive dark:text-red-400'}`}>
                            {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
                        </p>
                    </div>
                    {income > 0 && (
                        <div className="w-24">
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${balance >= 0 ? 'bg-emerald-500' : 'bg-destructive'}`}
                                    style={{ width: `${Math.min(Math.abs(savingsRate), 100)}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground/60 text-right mt-1">de ingresos</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
