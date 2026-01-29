import { useData } from '../../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';
import { formatCurrency } from '../../utils/utils';
import { format } from 'date-fns';

export const CashFlowWidget = () => {
    const { data } = useData();
    const currentMonth = format(new Date(), 'yyyy-MM');

    // Filter transactions for current month
    const monthlyTransactions = data.transactions.filter(t => t.date.startsWith(currentMonth));

    // Calculate details
    const income = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    // Real Money Outflow:
    // 1. Expenses paid with CASH/DEBIT (not credit)
    // 2. Debt Payments (money leaving to pay off debt)
    // 3. Transfers ?? (Usually internal, but if to external maybe. For now assume internal)
    const cashExpenses = monthlyTransactions
        .filter(t => t.type === 'expense' && t.paymentMethod !== 'credit')
        .reduce((sum, t) => sum + t.amount, 0);

    const debtPayments = monthlyTransactions
        .filter(t => t.type === 'debt_payment')
        .reduce((sum, t) => sum + t.amount, 0);

    // Transfers to Credit Card (Technically a debt payment, but tracked as transfer in our logic)
    // The user's logic handles "Transfer to Credit Card" as debt reduction.
    // We should count this as cash outflow from the "Bank" perspective?
    // "Flujo de Caja" usually means change in liquid assets.
    // If I transfer Bank -> CC, my liquid assets decrease. So yes, it's an outflow.
    const ccPayments = monthlyTransactions
        .filter(t => t.type === 'transfer' &&
            data.accounts.find(a => a.id === t.toAccountId)?.type === 'credit_card')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalOutflow = cashExpenses + debtPayments + ccPayments;
    const netCashFlow = income - totalOutflow;

    return (
        <Card className="col-span-12 border-l-4 border-l-emerald-500 shadow-md bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-emerald-500 flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5" />
                    Flujo de Caja (Dinero Real)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Income */}
                    <div className="flex flex-col gap-1 text-center md:text-left">
                        <span className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-1">
                            <TrendingUp className="h-4 w-4 text-emerald-500" /> Ingresos Reales
                        </span>
                        <span className="text-2xl font-bold text-emerald-500">{formatCurrency(income)}</span>
                    </div>

                    {/* Outflow */}
                    <div className="flex flex-col gap-1 text-center md:text-left">
                        <span className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-1">
                            <TrendingDown className="h-4 w-4 text-red-500" /> Salidas de Efectivo
                        </span>
                        <span className="text-2xl font-bold text-red-500">{formatCurrency(totalOutflow)}</span>
                        <div className="text-[10px] text-muted-foreground hidden md:block">
                            (Gastos efec. + Pagos deuda)
                        </div>
                    </div>

                    {/* Net */}
                    <div className="flex flex-col gap-1 text-center md:text-left mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-border/50 md:pl-6">
                        <span className="text-sm text-muted-foreground">Flujo Neto</span>
                        <span className={`text-3xl font-bold ${netCashFlow >= 0 ? 'text-foreground' : 'text-red-500'}`}>
                            {formatCurrency(netCashFlow)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
