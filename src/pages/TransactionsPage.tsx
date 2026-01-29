
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { formatCurrency } from '../utils/utils';
import { format } from 'date-fns';
import { WeeklyBalanceChart } from '../components/dashboard/WeeklyBalanceChart';

export const TransactionsPage = () => {
    const { data } = useData();
    const transactions = [...data.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-6 pb-20 fade-in">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Movimientos</h1>
                <p className="text-muted-foreground">Historial completo.</p>
            </div>

            <WeeklyBalanceChart />

            <Card>
                <CardHeader>
                    <CardTitle>Últimos Movimientos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {transactions.length === 0 ? (
                            <p className="text-center text-muted-foreground py-10">No hay movimientos registrados.</p>
                        ) : transactions.map(txn => {
                            const cat = data.categories.find(c => c.id === txn.categoryId);
                            return (
                                <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${txn.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            <span className="text-xs font-bold uppercase">{txn.type.substring(0, 2)}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium">{txn.concept}</p>
                                            <div className="flex gap-2 text-xs text-muted-foreground">
                                                <span>{format(new Date(txn.date), 'dd MMM yyyy')}</span>
                                                {cat && <span>• {cat.name}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`font-bold ${txn.type === 'income' ? 'text-green-500' : 'text-foreground'}`}>
                                        {txn.type === 'income' ? '+' : '-'} {formatCurrency(txn.amount)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
