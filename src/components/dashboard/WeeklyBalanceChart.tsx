import { useData } from '../../context/DataContext';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/utils';
import { startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, format, subWeeks, addWeeks, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowDown, ArrowUp } from 'lucide-react';

const todayInLima = (): Date => {
    const limaStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date());
    return new Date(limaStr + 'T00:00:00');
};

export const WeeklyBalanceChart = () => {
    const { data } = useData();
    const [currentDate, setCurrentDate] = useState(todayInLima);

    const WEEK_OPTIONS = { weekStartsOn: 1 as const };
    const start = startOfWeek(currentDate, WEEK_OPTIONS);
    const end = endOfWeek(currentDate, WEEK_OPTIONS);

    const days = eachDayOfInterval({ start, end });

    const chartData = days.map(day => {
        const dayTransactions = data.transactions.filter(t =>
            isSameDay(parseISO(t.date), day) && t.type !== 'transfer'
        );
        const income = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = dayTransactions.filter(t => t.type === 'expense' || t.type === 'debt_payment').reduce((sum, t) => sum + t.amount, 0);
        return {
            day: format(day, 'EEE', { locale: es }).charAt(0).toUpperCase() + format(day, 'EEE', { locale: es }).slice(1),
            ingresos: income,
            gastos: expense,
        };
    });

    const totalIncome = chartData.reduce((acc, c) => acc + c.ingresos, 0);
    const totalExpense = chartData.reduce((acc, c) => acc + c.gastos, 0);
    const weeklyBalance = totalIncome - totalExpense;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card border border-border p-3 rounded-xl shadow-lg">
                    <p className="text-muted-foreground text-xs mb-2">{label}</p>
                    <p className="text-emerald-500 text-sm font-bold flex items-center gap-1">
                        <ArrowDown size={12} /> +{formatCurrency(payload[0].value)}
                    </p>
                    <p className="text-destructive text-sm font-bold flex items-center gap-1">
                        <ArrowUp size={12} /> -{formatCurrency(payload[1]?.value ?? 0)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
                <Card className="p-4 flex items-center justify-between border-border" style={{ boxShadow: 'var(--shadow-card)' }}>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Ingresos</p>
                        <p className="text-lg font-bold text-emerald-500">{formatCurrency(totalIncome)}</p>
                    </div>
                    <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 dark:bg-emerald-500/10">
                        <ArrowDown size={18} />
                    </div>
                </Card>
                <Card className="p-4 flex items-center justify-between border-border" style={{ boxShadow: 'var(--shadow-card)' }}>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Gastos</p>
                        <p className="text-lg font-bold text-destructive">{formatCurrency(totalExpense)}</p>
                    </div>
                    <div className="h-9 w-9 rounded-xl bg-red-50 flex items-center justify-center text-destructive dark:bg-red-500/10">
                        <ArrowUp size={18} />
                    </div>
                </Card>
            </div>

            {/* Chart */}
            <Card className="border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="p-5 pb-4">
                    <div className="flex items-center justify-between mb-5">
                        <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="p-1.5 hover:bg-secondary rounded-xl text-muted-foreground transition-colors">
                            <ChevronLeft size={18} />
                        </button>
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-0.5">
                                {format(start, "d", { locale: es })}
                                {format(start, 'MMM', { locale: es }) !== format(end, 'MMM', { locale: es })
                                    ? ' ' + format(start, 'MMM', { locale: es }) : ''}
                                {' – '}{format(end, "d MMM yyyy", { locale: es })}
                            </p>
                            <h3 className={`text-2xl font-bold ${weeklyBalance >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                                {weeklyBalance >= 0 ? '' : '-'}{formatCurrency(Math.abs(weeklyBalance))}
                            </h3>
                        </div>
                        <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="p-1.5 hover:bg-secondary rounded-xl text-muted-foreground transition-colors">
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 2 }} />
                                <Line type="monotone" dataKey="ingresos" stroke="#22C55E" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#22C55E', strokeWidth: 0 }} />
                                <Line type="monotone" dataKey="gastos" stroke="#EF4444" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#EF4444', strokeWidth: 0 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex justify-center gap-6 mt-3">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span className="text-xs text-muted-foreground">Ingresos</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
                            <span className="text-xs text-muted-foreground">Gastos</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};
