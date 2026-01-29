import React, { useState } from 'react';
import type { Debt, DebtType } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface DebtFormProps {
    onSuccess: (debt: Omit<Debt, 'id'>) => void;
    onCancel: () => void;
    initialData?: Debt;
}

export const DebtForm: React.FC<DebtFormProps> = ({ onSuccess, onCancel, initialData }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [totalAmount, setTotalAmount] = useState(initialData?.totalAmount?.toString() || '');
    const [type, setType] = useState<DebtType>(initialData?.type || 'subscription');
    const [installments, setInstallments] = useState(initialData?.installments?.toString() || '');
    const [startDate, setStartDate] = useState(initialData?.startDate || new Date().toISOString().split('T')[0]);

    // Derived state for logic switching
    const isSubscription = type === 'subscription';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const amountVal = parseFloat(totalAmount);
        if (!name || isNaN(amountVal) || amountVal <= 0) return;

        const debtData: Omit<Debt, 'id'> = {
            name,
            totalAmount: amountVal, // For sub, this is monthly cost. For debt, total principal.
            currentBalance: isSubscription ? 0 : amountVal, // Subs don't have balance to pay off usually, or we track monthly. Let's say 0 for now.
            type,
            status: 'active',
            startDate,
            installments: isSubscription ? undefined : parseInt(installments) || 1,
            installmentsPaid: 0
        };

        if (isSubscription) {
            // For subscriptions, we might want to store the "monthly amount" in totalAmount 
            // but currentBalance is irrelevant? Or maybe currentBalance tracks this month's status?
            // For simplicity V1: totalAmount = monthly price. currentBalance = 0 (infinite).
            debtData.currentBalance = 0;
        }

        onSuccess(debtData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">

            {/* Type Selection */}
            <div className="flex gap-2 p-1 bg-gray-800/50 rounded-lg">
                <button
                    type="button"
                    onClick={() => setType('subscription')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${isSubscription
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                >
                    Suscripción
                </button>
                <button
                    type="button"
                    onClick={() => setType('installments')} // Default to installments for 'Debt' mode
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${!isSubscription
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                >
                    Préstamo / Plazos
                </button>
            </div>

            <Input
                label="Nombre"
                placeholder={isSubscription ? "Netflix, Spotify..." : "Préstamo Personal, Auto..."}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label={isSubscription ? "Costo Mensual" : "Monto Total"}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    required
                />

                <Input
                    label="Fecha Inicio"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                />
            </div>

            {!isSubscription && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                    <Select
                        label="Tipo de Deuda"
                        value={type}
                        onChange={(e) => setType(e.target.value as DebtType)}
                        options={[
                            { value: 'installments', label: 'Plazos Fijos' },
                            { value: 'bank', label: 'Banco' },
                            { value: 'friend', label: 'Amigo / Familiar' },
                        ]}
                    />
                    <Input
                        label="Cuotas"
                        type="number"
                        min="1"
                        placeholder="12"
                        value={installments}
                        onChange={(e) => setInstallments(e.target.value)}
                        required={!isSubscription}
                    />
                </div>
            )}

            {/* Summary preview */}
            {!isSubscription && totalAmount && installments && (
                <div className="p-3 bg-gray-800/50 rounded-lg text-sm text-gray-300 flex justify-between items-center">
                    <span>Cuota Mensual Est.:</span>
                    <span className="font-bold text-white">
                        {((parseFloat(totalAmount) / (parseFloat(installments) || 1))).toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                    </span>
                </div>
            )}

            <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
                    Cancelar
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                    Guardar
                </Button>
            </div>
        </form>
    );
};
