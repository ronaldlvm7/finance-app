import React from 'react';
import type { Debt } from '../../types';
import { AlertCircle, Calendar, CreditCard } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';

interface DebtCardProps {
    debt: Debt;
    onClick?: () => void;
}

export const DebtCard: React.FC<DebtCardProps> = ({ debt, onClick }) => {
    const isSubscription = debt.type === 'subscription';

    const progress = !isSubscription && debt.totalAmount > 0
        ? ((debt.totalAmount - debt.currentBalance) / debt.totalAmount) * 100
        : 0;

    const monthlyPayment = isSubscription
        ? debt.totalAmount
        : (debt.installments && debt.installments > 0)
            ? (debt.totalAmount / debt.installments)
            : 0;

    const nextPaymentDate = new Date(debt.startDate || Date.now());
    const payDay = nextPaymentDate.getDate();

    return (
        <div
            onClick={onClick}
            className="bg-card border border-border rounded-2xl p-4 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
            style={{ boxShadow: 'var(--shadow-card)' }}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isSubscription ? 'bg-purple-50 text-purple-500 dark:bg-purple-500/15 dark:text-purple-400' : 'bg-blue-50 text-blue-500 dark:bg-blue-500/15 dark:text-blue-400'}`}>
                        {isSubscription ? <Calendar size={20} /> : <CreditCard size={20} />}
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {debt.name}
                        </h3>
                        <p className="text-xs text-muted-foreground capitalize">
                            {debt.type === 'subscription' ? 'Suscripción' : debt.type === 'installments' ? 'Préstamo' : debt.type}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-foreground">
                        {monthlyPayment.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                    </p>
                    <p className="text-xs text-muted-foreground">mensual</p>
                </div>
            </div>

            {!isSubscription ? (
                <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progreso ({Math.round(progress)}%)</span>
                        <span>Restante: {debt.currentBalance.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}</span>
                    </div>
                    <ProgressBar progress={progress} className="h-2" />
                    <div className="flex justify-between text-xs mt-1">
                        <span className="text-muted-foreground">{debt.installmentsPaid || 0} / {debt.installments} cuotas</span>
                    </div>
                </div>
            ) : (
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-secondary p-2.5 rounded-xl">
                    <AlertCircle size={14} />
                    <span>Se renueva el día {payDay} de cada mes</span>
                </div>
            )}
        </div>
    );
};
