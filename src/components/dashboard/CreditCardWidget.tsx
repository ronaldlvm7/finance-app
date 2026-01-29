
import { useData } from '../../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { CreditCard as CardIcon } from 'lucide-react';
import { formatCurrency } from '../../utils/utils';

export const CreditCardWidget = () => {
    const { data } = useData();

    // Find active credit card debts
    const ccDebts = data.debts.filter(d => d.type === 'credit_card' && d.status === 'active');

    // Calculate total debt
    const totalDebt = ccDebts.reduce((sum, d) => sum + d.currentBalance, 0);

    // Find CC accounts to get limits (Optional enhancement: link specific CC debts to Accounts properly)
    // For V1 MVP, assuming one main Credit Card or aggregate
    const ccAccounts = data.accounts.filter(a => a.type === 'credit_card');
    const totalLimit = ccAccounts.reduce((sum, a) => sum + (a.creditLimit || 0), 0);
    const available = totalLimit - totalDebt;

    if (ccDebts.length === 0 && ccAccounts.length === 0) return null;

    return (
        <Card className="col-span-12 md:col-span-6 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-indigo-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-indigo-100">Tarjeta de Crédito</CardTitle>
                <CardIcon className="h-4 w-4 text-indigo-200" />
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div>
                        <div className="text-2xl font-bold text-white">{formatCurrency(totalDebt)}</div>
                        <p className="text-xs text-indigo-200">Deuda total pendiente</p>
                    </div>
                    {totalLimit > 0 && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-indigo-200">
                                <span>Disponible</span>
                                <span>{formatCurrency(available)}</span>
                            </div>
                            <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-400"
                                    style={{ width: `${Math.min(100, (totalDebt / totalLimit) * 100)}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
