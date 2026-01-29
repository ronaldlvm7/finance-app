import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils/utils';
import { format } from 'date-fns';

export const IncomeExpenseSummary = () => {
    const { data } = useData();
    const currentMonth = format(new Date(), 'yyyy-MM');
    const txns = data.transactions.filter(t => t.date.startsWith(currentMonth));

    const income = txns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = txns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Income */}
            <div className="bg-card rounded-3xl p-5 border border-white/5 shadow-lg shadow-black/10 flex flex-col gap-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ArrowDownLeft size={48} className="text-emerald-500" />
                </div>

                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <ArrowDownLeft size={20} />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Ingresos</p>
                    <p className="text-xl font-bold tracking-tight text-emerald-500">{formatCurrency(income)}</p>
                </div>
            </div>

            {/* Expenses */}
            <div className="bg-card rounded-3xl p-5 border border-white/5 shadow-lg shadow-black/10 flex flex-col gap-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ArrowUpRight size={48} className="text-red-500" />
                </div>

                <div className="h-10 w-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                    <ArrowUpRight size={20} />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Gastos</p>
                    <p className="text-xl font-bold tracking-tight text-red-500">{formatCurrency(expenses)}</p>
                </div>
            </div>
        </div>
    );
};
