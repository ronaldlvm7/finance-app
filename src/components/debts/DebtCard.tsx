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

    // Calculate progress for loans
    const progress = !isSubscription && debt.totalAmount > 0
        ? ((debt.totalAmount - debt.currentBalance) / debt.totalAmount) * 100
        : 0;

    // Calculate monthly payment (estimate)
    const monthlyPayment = isSubscription
        ? debt.totalAmount
        : (debt.installments && debt.installments > 0)
            ? (debt.totalAmount / debt.installments)
            : 0;

    const nextPaymentDate = new Date(debt.startDate || Date.now());
    // In a real app, we'd calculate the *next* occurrence based on today's date.
    // For V1 visual, we just show the start day.
    const payDay = nextPaymentDate.getDate();

    return (
        <div
            onClick={onClick}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all cursor-pointer group shadow-sm bg-gradient-to-br from-gray-900/50 to-gray-900/10"
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSubscription ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {isSubscription ? <Calendar size={20} /> : <CreditCard size={20} />}
                    </div>
                    <div>
                        <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {debt.name}
                        </h3>
                        <p className="text-xs text-gray-500 capitalize">
                            {debt.type === 'subscription' ? 'Suscripción' : debt.type === 'installments' ? 'Préstamo' : debt.type}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-white">
                        {monthlyPayment.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                    </p>
                    <p className="text-xs text-gray-500">mensual</p>
                </div>
            </div>

            {!isSubscription ? (
                <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>Progreso ({Math.round(progress)}%)</span>
                        <span>Restante: {debt.currentBalance.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}</span>
                    </div>
                    <ProgressBar progress={progress} className="h-2" />
                    <div className="flex justify-between text-xs mt-1">
                        <span className="text-gray-500">{debt.installmentsPaid || 0} / {debt.installments} cuotas</span>
                    </div>
                </div>
            ) : (
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 bg-gray-800/30 p-2 rounded-md">
                    <AlertCircle size={14} className="text-gray-500" />
                    <span>Se renueva el día {payDay} de cada mes</span>
                </div>
            )}
        </div>
    );
};
