
import { useState } from 'react';
import { useData } from '../context/DataContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO, isAfter, startOfDay, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, ArrowUpCircle, ArrowDownCircle, AlertCircle, RefreshCw, Plus, Bell } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { TransactionForm } from '../components/forms/TransactionForm';
import { cn, formatCurrency } from '../utils/utils';
import type { Debt } from '../types';

// Returns the amount due per installment for display on the calendar.
const getMonthlyAmount = (debt: Debt): number => {
    if (debt.type === 'subscription') return debt.totalAmount;
    if (debt.installments && debt.installments > 0) return debt.totalAmount / debt.installments;
    return debt.currentBalance;
};

// Returns the Date when `debt` occurs within the given month/year, or null.
// Handles: subscriptions (infinite), installments (limited), and edge cases.
const getDebtOccurrenceInMonth = (debt: Debt, year: number, month: number): Date | null => {
    // Resolve the pay day: prefer startDate's day over dueDate
    let payDay: number | null = null;
    let startYear: number | null = null;
    let startMonth: number | null = null;

    if (debt.startDate) {
        const s = debt.startDate.substring(0, 10);
        const [sy, sm, sd] = s.split('-').map(Number);
        if (sy && sm && sd) {
            startYear = sy;
            startMonth = sm - 1; // JS month 0-indexed
            payDay = sd;
        }
    }

    if (payDay === null && debt.dueDate) {
        payDay = debt.dueDate;
    }

    if (payDay === null) return null;

    // Clamp to last day of target month (e.g. Feb 31 → Feb 28)
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const day = Math.min(payDay, lastDayOfMonth);
    const candidate = new Date(year, month, day);

    // If we have a startDate, the target month must be >= start month
    if (startYear !== null && startMonth !== null) {
        const monthsSinceStart = (year - startYear) * 12 + (month - startMonth);
        if (monthsSinceStart < 0) return null; // before start

        // For non-subscription debts with installments, enforce limit
        if (debt.type !== 'subscription' && debt.installments) {
            if (monthsSinceStart >= debt.installments) return null;
        }
    }

    return candidate;
};

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

    // Active debts (any debt with startDate or dueDate is eligible)
    const activeDebts = data.debts.filter(d => d.status === 'active' && (d.dueDate || d.startDate));

    // Helpers
    const getEventsForDay = (day: Date) => {
        const dayTransactions = monthTransactions.filter(t => isSameDay(parseISO(t.date), day));

        const dayDebts = activeDebts.filter(debt => {
            const occurrence = getDebtOccurrenceInMonth(debt, day.getFullYear(), day.getMonth());
            return occurrence !== null && isSameDay(occurrence, day);
        });

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
                <div>
                    <h1 className="ios-large-title">Calendario</h1>
                    <p className="ios-subhead capitalize">{format(currentDate, 'MMMM yyyy', { locale: es })}</p>
                </div>
                <div className="flex items-center gap-1 bg-card border border-border p-1 rounded-xl" style={{ boxShadow: 'var(--shadow-card)' }}>
                    <button onClick={prevMonth} className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                        <ChevronLeft size={18} />
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                        <ChevronRight size={18} />
                    </button>
                </div>
            </header>

            {/* Calendar Grid */}
            <div className="bg-card border border-border rounded-3xl p-4 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
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
                                    isTodayDate ? "bg-primary/15 border-primary" : "bg-background hover:bg-secondary border-border",
                                    isSelected && !isTodayDate && "ring-2 ring-primary bg-primary/8"
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

            {/* Upcoming Events This Month */}
            <UpcomingEvents activeDebts={activeDebts} currentDate={currentDate} onPayDebt={(debt) => { setSelectedDebtToPay(debt); setIsPayModalOpen(true); }} />

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
                                    className="w-full py-3 mt-2 border border-dashed border-border rounded-xl flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
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
                                                            {debt.type === 'subscription' ? 'Suscripción' : 'Deuda'} • {formatCurrency(getMonthlyAmount(debt))}
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
                                                <div key={t.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl">
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
                hideHeader
                noPadding
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
                hideHeader
                noPadding
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

interface UpcomingEventsProps {
    activeDebts: Debt[];
    currentDate: Date;
    onPayDebt: (debt: Debt) => void;
}

const UpcomingEvents = ({ activeDebts, currentDate, onPayDebt }: UpcomingEventsProps) => {
    const today = startOfDay(new Date());
    const isSameDisplayMonth = isSameMonth(currentDate, today);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Build list of { debt, occurrenceDate } for the current displayed month
    const occurrences = activeDebts
        .map(debt => {
            const occurrenceDate = getDebtOccurrenceInMonth(debt, year, month);
            return occurrenceDate ? { debt, occurrenceDate } : null;
        })
        .filter((x): x is { debt: Debt; occurrenceDate: Date } => x !== null)
        .filter(({ occurrenceDate }) => {
            // When viewing current calendar month, hide events that already passed
            if (isSameDisplayMonth && !isAfter(occurrenceDate, addDays(today, -1))) return false;
            return true;
        })
        .sort((a, b) => a.occurrenceDate.getTime() - b.occurrenceDate.getTime())
        .slice(0, 5);

    const upcoming = occurrences.map(o => o.debt);
    const occurrenceMap = new Map(occurrences.map(o => [o.debt.id, o.occurrenceDate]));

    if (upcoming.length === 0) return null;

    return (
        <div className="space-y-3 pb-6">
            <div className="flex items-center gap-2 px-1">
                <Bell size={14} className="text-orange-400" />
                <h3 className="text-sm font-semibold text-muted-foreground">
                    {isSameDisplayMonth ? 'Próximos vencimientos' : `Vencimientos — ${format(currentDate, 'MMMM', { locale: es })}`}
                </h3>
            </div>
            <div className="space-y-2">
                {upcoming.map(debt => {
                    const dueDate = occurrenceMap.get(debt.id)!;
                    const isOverdue = isSameDisplayMonth && !isAfter(dueDate, addDays(today, -1));

                    return (
                        <div
                            key={debt.id}
                            className={cn(
                                "flex items-center justify-between p-3.5 rounded-2xl border",
                                isOverdue
                                    ? "bg-red-500/10 border-red-500/20"
                                    : "bg-card border-border"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold",
                                    isOverdue ? "bg-red-500/20 text-red-400" : "bg-orange-500/15 text-orange-400"
                                )}>
                                    {dueDate.getDate()}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{debt.name}</p>
                                    <p className="text-[11px] text-muted-foreground">
                                        {debt.type === 'subscription'
                                            ? `Suscripción • día ${dueDate.getDate()} de cada mes`
                                            : `Deuda • ${format(dueDate, "d 'de' MMMM yyyy", { locale: es })}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-orange-300">{formatCurrency(getMonthlyAmount(debt))}</p>
                                {isSameDisplayMonth && (
                                    <button
                                        onClick={() => onPayDebt(debt)}
                                        className="px-2.5 py-1.5 bg-orange-500/20 hover:bg-orange-500 text-orange-300 hover:text-white text-[11px] font-bold rounded-lg transition-all"
                                    >
                                        Pagar
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

