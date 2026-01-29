import { useData } from '../../context/DataContext';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/utils';
import { startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, format, subWeeks, addWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';

export const WeeklyBalanceChart = () => {
    const { data } = useData();
    const [currentDate, setCurrentDate] = useState(new Date());

    const start = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday start
    const end = endOfWeek(currentDate, { weekStartsOn: 0 });

    const days = eachDayOfInterval({ start, end });

    // Aggregate Data
    const chartData = days.map(day => {
        const dayTransactions = data.transactions.filter(t =>
            isSameDay(new Date(t.date), day) && t.type !== 'transfer'
        );

        const income = dayTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = dayTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            day: format(day, 'EEE', { locale: es }).charAt(0).toUpperCase() + format(day, 'EEE', { locale: es }).slice(1),
            fullDate: day,
            ingresos: income,
            egresos: expense
        };
    });

    const totalIncome = chartData.reduce((acc, curr) => acc + curr.ingresos, 0);
    const totalExpense = chartData.reduce((acc, curr) => acc + curr.egresos, 0);
    const weeklyBalance = totalIncome - totalExpense;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900 border border-white/10 p-3 rounded-lg shadow-xl">
                    <p className="text-gray-300 text-xs mb-2">{label}</p>
                    <p className="text-emerald-400 text-sm font-bold flex items-center gap-1">
                        <ArrowDown size={12} /> +{formatCurrency(payload[0].value)}
                    </p>
                    <p className="text-red-400 text-sm font-bold flex items-center gap-1">
                        <ArrowUp size={12} /> -{formatCurrency(payload[1].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-4">
            {/* Top Stats */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 flex items-center justify-between bg-zinc-900/50 border-white/5">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Ingresos</p>
                        <p className="text-lg font-bold text-emerald-500">{formatCurrency(totalIncome)}</p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <ArrowDown size={16} />
                    </div>
                </Card>
                <Card className="p-4 flex items-center justify-between bg-zinc-900/50 border-white/5">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Egresos</p>
                        <p className="text-lg font-bold text-red-500">{formatCurrency(totalExpense)}</p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                        <ArrowUp size={16} />
                    </div>
                </Card>
            </div>

            {/* Main Chart Card */}
            <Card className="bg-zinc-900/90 border-white/5 overflow-hidden">
                <div className="p-6 pb-2">
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="p-1 hover:bg-white/5 rounded-full text-muted-foreground">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">Balance de esta semana</p>
                            <h3 className="text-2xl font-bold text-white">{formatCurrency(weeklyBalance)}</h3>
                        </div>
                        <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="p-1 hover:bg-white/5 rounded-full text-muted-foreground">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    tick={{ fill: '#6B7280', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                                <Line
                                    type="monotone"
                                    dataKey="ingresos"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    dot={false}
                                    activeDot={{ r: 4, fill: '#10B981', strokeWidth: 0 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="egresos"
                                    stroke="#EF4444"
                                    strokeWidth={3}
                                    dot={false}
                                    activeDot={{ r: 4, fill: '#EF4444', strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="flex justify-center gap-6 mt-4 pb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-xs text-muted-foreground">Ingresos</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-xs text-muted-foreground">Egresos</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};
