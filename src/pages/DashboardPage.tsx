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
            case 'income': return { icon: 'bg-emerald-500/15 text-emerald-400', amount: 'text-emerald-400', prefix: '+' };
            case 'expense': return { icon: 'bg-red-500/15 text-red-400', amount: 'text-red-400', prefix: '-' };
            case 'debt_payment': return { icon: 'bg-orange-500/15 text-orange-400', amount: 'text-orange-400', prefix: '-' };
            default: return { icon: 'bg-blue-500/15 text-blue-400', amount: 'text-blue-400', prefix: '' };
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-muted-foreground">Últimos movimientos</h3>
                <NavLink to="/transactions" className="flex items-center gap-1 text-xs text-primary font-semibold hover:text-primary/80 transition-colors">
                    Ver todo <ChevronRight size={14} />
                </NavLink>
            </div>

            <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
                {recent.map((txn, i) => {
                    const cat = data.categories.find(c => c.id === txn.categoryId);
                    const style = getStyle(txn.type);
                    return (
                        <div
                            key={txn.id}
                            className={`flex items-center justify-between px-4 py-3.5 ${i < recent.length - 1 ? 'border-b border-white/5' : ''}`}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style.icon}`}>
                                    {getIcon(txn.type)}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm truncate">{txn.concept}</p>
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
        <div className="space-y-6 pb-20 md:pb-0 fade-in">
            <UserGreeting />

            <div className="flex flex-col gap-6">
                <BalanceWidget />
                <IncomeExpenseSummary />
                <SavingsGoalsPreview />
                <RecentTransactions />
            </div>
        </div>
    );
};
