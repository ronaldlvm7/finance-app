import { BalanceWidget } from '../components/dashboard/BalanceWidget';
import { IncomeExpenseSummary } from '../components/dashboard/IncomeExpenseSummary';
import { SavingsGoalsPreview } from '../components/dashboard/SavingsGoalsPreview';
import { UserGreeting } from '../components/dashboard/UserGreeting';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../utils/utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const RecentTransactions = () => {
    const { data } = useData();

    const recent = [...data.transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    if (recent.length === 0) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'income': return <ArrowDownLeft size={16} strokeWidth={2.5} />;
            case 'expense': return <ArrowUpRight size={16} strokeWidth={2.5} />;
            default: return <ArrowLeftRight size={16} />;
        }
    };

    const getStyle = (type: string) => {
        switch (type) {
            case 'income': return {
                icon: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400',
                amount: 'text-emerald-500 dark:text-emerald-400',
                prefix: '+'
            };
            case 'expense': return {
                icon: 'bg-red-50 text-destructive dark:bg-red-500/15 dark:text-red-400',
                amount: 'text-destructive dark:text-red-400',
                prefix: '-'
            };
            case 'debt_payment': return {
                icon: 'bg-orange-50 text-orange-500 dark:bg-orange-500/15 dark:text-orange-400',
                amount: 'text-orange-500 dark:text-orange-400',
                prefix: '-'
            };
            default: return {
                icon: 'bg-blue-50 text-blue-500 dark:bg-blue-500/15 dark:text-blue-400',
                amount: 'text-blue-500 dark:text-blue-400',
                prefix: ''
            };
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-[16px] font-semibold text-foreground">Últimos movimientos</h3>
                <NavLink to="/transactions" className="flex items-center gap-1 text-sm text-primary font-semibold">
                    Ver todo <ChevronRight size={14} />
                </NavLink>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
                {recent.map((txn, i) => {
                    const cat = data.categories.find(c => c.id === txn.categoryId);
                    const style = getStyle(txn.type);
                    return (
                        <div
                            key={txn.id}
                            className={`flex items-center justify-between px-4 py-3.5 ${i < recent.length - 1 ? 'border-b border-border' : ''}`}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.icon}`}>
                                    {getIcon(txn.type)}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm text-foreground truncate">{txn.concept}</p>
                                    <p className="text-[11px] text-muted-foreground">
                                        {format(parseISO(txn.date), "d MMM", { locale: es })}
                                        {cat ? ` · ${cat.name}` : ''}
                                    </p>
                                </div>
                            </div>
                            <p className={`text-sm font-bold shrink-0 ml-2 ${style.amount}`}>
                                {style.prefix}{formatCurrency(txn.amount)}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const DashboardPage = () => {
    return (
        <div className="space-y-6 pb-4">
            <UserGreeting />
            <BalanceWidget />
            <IncomeExpenseSummary />
            <SavingsGoalsPreview />
            <RecentTransactions />
        </div>
    );
};
