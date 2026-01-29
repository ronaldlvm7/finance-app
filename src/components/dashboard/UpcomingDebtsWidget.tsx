
import { useData } from '../../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { formatCurrency } from '../../utils/utils';
import { AlertCircle } from 'lucide-react';

export const UpcomingDebtsWidget = () => {
    const { data } = useData();
    const activeDebts = data.debts.filter(d => d.status === 'active');

    // Sort by due date (if avail) or just show all
    // Logic: if due date exists, sort ascending.
    const sortedDebts = [...activeDebts].sort((a, b) => (a.dueDate || 99) - (b.dueDate || 99)).slice(0, 3);

    return (
        <Card className="col-span-12 md:col-span-6">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    Deudas Pendientes
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {sortedDebts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">¡Estás libre de deudas!</p>
                    ) : sortedDebts.map(debt => (
                        <div key={debt.id} className="flex justify-between items-center p-3 rounded-xl bg-secondary/50 border border-white/5">
                            <div>
                                <p className="font-medium text-sm">{debt.name}</p>
                                <p className="text-xs text-muted-foreground">{debt.type === 'credit_card' ? 'Tarjeta' : 'Préstamo'}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-sm text-destructive">{formatCurrency(debt.currentBalance)}</p>
                                {debt.dueDate && <p className="text-[10px] text-muted-foreground">Vence día {debt.dueDate}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
