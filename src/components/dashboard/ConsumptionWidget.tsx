import { useData } from '../../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { PieChart, ShoppingBag, CreditCard, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils/utils';
import { format } from 'date-fns';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#6b7280'];

export const ConsumptionWidget = () => {
    const { data } = useData();
    const currentMonth = format(new Date(), 'yyyy-MM');

    // Filter TOTAL expenses (Cash + Credit) for consumption
    const expenses = data.transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth));

    const totalConsumption = expenses.reduce((sum, t) => sum + t.amount, 0);

    const cashConsumption = expenses
        .filter(t => t.paymentMethod !== 'credit')
        .reduce((sum, t) => sum + t.amount, 0);

    const creditConsumption = expenses
        .filter(t => t.paymentMethod === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);

    // Calculate Category Breakdown
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(t => {
        if (t.categoryId) {
            categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + t.amount;
        }
    });

    const chartData = Object.entries(categoryTotals)
        .map(([id, value]) => {
            const cat = data.categories.find(c => c.id === id);
            return { name: cat ? cat.name : 'Otros', value };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5

    return (
        <Card className="col-span-12 md:col-span-6 bg-card">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-blue-500 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Consumo Real (Estilo de Vida)
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Visual Blocks */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-center gap-2 text-blue-400 mb-1">
                            <Wallet className="h-3 w-3" />
                            <span className="text-xs font-semibold">Pagado (Efectivo)</span>
                        </div>
                        <p className="text-lg font-bold">{formatCurrency(cashConsumption)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <div className="flex items-center gap-2 text-purple-400 mb-1">
                            <CreditCard className="h-3 w-3" />
                            <span className="text-xs font-semibold">Financiado (TC)</span>
                        </div>
                        <p className="text-lg font-bold">{formatCurrency(creditConsumption)}</p>
                    </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-end border-b border-border pb-4">
                    <div>
                        <p className="text-muted-foreground text-sm">Total Consumido este Mes</p>
                        <h2 className="text-3xl font-bold">{formatCurrency(totalConsumption)}</h2>
                    </div>
                    <PieChart className="h-8 w-8 text-muted-foreground opacity-20" />
                </div>

                {/* Chart */}
                <div className="h-48 w-full flex items-center justify-center">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: any) => formatCurrency(value || 0)}
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                />
                            </RePieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-sm text-muted-foreground">Sin datos de consumo aún</p>
                    )}
                </div>

                {/* Legend */}
                <div className="space-y-2">
                    {chartData.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span className="text-muted-foreground">{entry.name}</span>
                            </div>
                            <span className="font-medium">{formatCurrency(entry.value)}</span>
                        </div>
                    ))}
                </div>

            </CardContent>
        </Card>
    );
};
