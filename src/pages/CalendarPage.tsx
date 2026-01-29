
import { useState } from 'react';
import { useData } from '../context/DataContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, ArrowUpCircle, ArrowDownCircle, AlertCircle, RefreshCw, Plus } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { TransactionForm } from '../components/forms/TransactionForm';
import { cn } from '../utils/utils';
import type { Debt } from '../types';

export const CalendarPage = () => {
    const { data } = useData();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Payment Modal State
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [selectedDebtToPay, setSelectedDebtToPay] = useState<Debt | undefined>(undefined);

    // Add Transaction Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [dateForAdd, setDateForAdd] = useState<Date | null>(null);

    const firstDay = startOfMonth(currentDate);
    const lastDay = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: firstDay, end: lastDay });

    // Filter events for the current month view (optimization)
    const monthTransactions = data.transactions.filter(t =>
        isSameMonth(parseISO(t.date), currentDate)
    );

    // Active debts that have a due date
    const activeDebts = data.debts.filter(d => d.status === 'active' && d.dueDate);

    // Helpers
    const getEventsForDay = (day: Date) => {
        const dayTransactions = monthTransactions.filter(t => isSameDay(parseISO(t.date), day));
        const dayDebts = activeDebts.filter(d => d.dueDate === day.getDate());
        return { transactions: dayTransactions, debts: dayDebts };
    };

    const handleDayClick = (day: Date) => {
        setSelectedDate(day);
        setIsDetailsOpen(true);
    };

    const handlePayDebt = (debt: Debt) => {
        setSelectedDebtToPay(debt);
        setIsDetailsOpen(false); // Close details
        setIsPayModalOpen(true); // Open payment form
    };

    const handleAddTransaction = (e: React.MouseEvent, day: Date) => {
        e.stopPropagation(); // Prevent opening details
        setDateForAdd(day);
        setIsAddModalOpen(true);
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                    Calendario
                </h1>
                <div className="flex items-center gap-2 bg-card/50 p-1 rounded-xl border border-white/5">
                    <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-bold w-32 text-center capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </header>

            {/* Calendar Grid */}
            <div className="bg-card/50 backdrop-blur-xl border border-white/5 rounded-3xl p-4 overflow-hidden shadow-2xl">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 mb-2">
                    {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(day => (
                        <div key={day} className="text-center text-xs text-muted-foreground font-medium py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-1 md:gap-2">
                    {/* Padding for start of month */}
                    {Array.from({ length: firstDay.getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {days.map((day) => {
                        const { transactions, debts } = getEventsForDay(day);
                        const hasIncome = transactions.some(t => t.type === 'income');
                        const hasExpense = transactions.some(t => t.type === 'expense');
                        const hasDebt = debts.length > 0;
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isTodayDate = isToday(day);

                        return (
                            <button
                                key={day.toString()}
                                onClick={() => handleDayClick(day)}
                                className={cn(
                                    "group aspect-square rounded-xl md:rounded-2xl p-1 md:p-2 border relative transition-all hover:scale-105 active:scale-95 flex flex-col justify-between items-start",
                                    isTodayDate ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]" : "bg-card hover:bg-accent/50 border-white/5",
                                    isSelected && !isTodayDate && "ring-2 ring-primary bg-accent"
                                )}
                            >
                                <div className="flex justify-between w-full">
                                    <span className={cn(
                                        "text-xs md:text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full",
                                        isTodayDate ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                    {/* Quick Add Button (Visible on Hover) */}
                                    <div
                                        onClick={(e) => handleAddTransaction(e, day)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center hover:bg-primary/90 hover:scale-110 shadow-lg"
                                        title="Agregar movimiento"
                                    >
                                        <Plus size={12} strokeWidth={3} />
                                    </div>
                                </div>

                                <div className="flex gap-1 flex-wrap content-end w-full px-0.5 pb-0.5">
                                    {hasIncome && <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />}
                                    {hasExpense && <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]" />}
                                    {hasDebt && <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-orange-400 shadow-[0_0_5px_rgba(251,146,60,0.5)]" />}
                                </div>
                            </button>
                        );
                    })
                    }
                </div>
            </div>

            {/* Day Details Modal */}
            <Modal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                title={selectedDate ? format(selectedDate, "d 'de' MMMM, yyyy", { locale: es }) : 'Detalles'}
            >
                {selectedDate && (
                    <div className="space-y-6">
                        {(() => {
                            const { transactions, debts } = getEventsForDay(selectedDate);

                            // Show "Add" button even in details view
                            const renderAddButton = () => (
                                <button
                                    onClick={(e) => {
                                        handleAddTransaction(e as any, selectedDate);
                                        setIsDetailsOpen(false);
                                    }}
                                    className="w-full py-3 mt-2 border border-dashed border-white/20 rounded-xl flex items-center justify-center gap-2 text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    <Plus size={18} /> Agregar Movimiento
                                </button>
                            );

                            if (transactions.length === 0 && debts.length === 0) {
                                return (
                                    <div className="py-8 text-center text-muted-foreground">
                                        <p className="mb-4">No hay eventos registrados para este día.</p>
                                        {renderAddButton()}
                                    </div>
                                );
                            }

                            return (
                                <>
                                    {/* Debts & Recurring */}
                                    {debts.length > 0 && (
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-bold text-orange-400 flex items-center gap-2">
                                                <AlertCircle size={16} /> Vencimientos / Pagos
                                            </h3>
                                            {debts.map(debt => (
                                                <div key={debt.id} className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-between">
                                                    <div>
                                                        <p className="font-bold text-orange-100">{debt.name}</p>
                                                        <p className="text-xs text-orange-300">
                                                            {debt.type === 'subscription' ? 'Suscripción' : 'Deuda'} • Vence hoy
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handlePayDebt(debt)}
                                                        className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-orange-500/20"
                                                    >
                                                        Pagar
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Transactions */}
                                    {transactions.length > 0 && (
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                                                <RefreshCw size={16} /> Movimientos
                                            </h3>
                                            {transactions.map(t => (
                                                <div key={t.id} className="flex items-center justify-between p-3 bg-card border border-white/5 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "p-2 rounded-lg",
                                                            t.type === 'income' ? "bg-emerald-500/20 text-emerald-500" :
                                                                t.type === 'expense' ? "bg-red-500/20 text-red-500" :
                                                                    "bg-blue-500/20 text-blue-500"
                                                        )}>
                                                            {t.type === 'income' ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm">{t.concept}</p>
                                                            <p className="text-xs text-muted-foreground capitalize">
                                                                {t.type === 'income' ? 'Ingreso' : t.type === 'expense' ? 'Gasto' : t.type}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className={cn(
                                                        "font-bold font-mono",
                                                        t.type === 'income' ? "text-emerald-400" : "text-red-400"
                                                    )}>
                                                        {t.type === 'income' ? '+' : '-'} {t.amount.toFixed(2)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {renderAddButton()}
                                </>
                            );
                        })()}
                    </div>
                )}
            </Modal>

            {/* Payment Modal */}
            <Modal
                isOpen={isPayModalOpen}
                onClose={() => setIsPayModalOpen(false)}
                title={`Pagar ${selectedDebtToPay?.name || ''}`}
            >
                {selectedDebtToPay && (
                    <TransactionForm
                        initialValues={{
                            type: 'debt_payment',
                            amount: selectedDebtToPay.currentBalance,
                            debtId: selectedDebtToPay.id,
                            concept: `Pago de ${selectedDebtToPay.name}`,
                            date: format(new Date(), 'yyyy-MM-dd')
                        }}
                        onSuccess={() => {
                            setIsPayModalOpen(false);
                            setIsDetailsOpen(false);
                        }}
                        onCancel={() => setIsPayModalOpen(false)}
                    />
                )}
            </Modal>

            {/* Add Transaction Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Nuevo Movimiento"
            >
                {dateForAdd && (
                    <TransactionForm
                        initialValues={{
                            date: format(dateForAdd, 'yyyy-MM-dd'),
                            type: 'expense' // Default
                        }}
                        onSuccess={() => {
                            setIsAddModalOpen(false);
                            // Optionally re-open details or just stay on calendar
                        }}
                        onCancel={() => setIsAddModalOpen(false)}
                    />
                )}
            </Modal>
        </div>
    );
};

