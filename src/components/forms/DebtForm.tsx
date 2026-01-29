import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import type { DebtType } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';


interface DebtFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export const DebtForm = ({ onSuccess, onCancel }: DebtFormProps) => {
    const { addDebt, data } = useData();
    const [name, setName] = useState('');
    const [type, setType] = useState<DebtType>('bank');
    const [totalAmount, setTotalAmount] = useState('');
    const [currentBalance, setCurrentBalance] = useState('');
    const [dueDate, setDueDate] = useState('');

    // For Credit Card linking
    const [accountId, setAccountId] = useState('');

    const accounts = data.accounts;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !totalAmount) return;

        addDebt({
            name,
            type,
            totalAmount: Number(totalAmount),
            currentBalance: currentBalance ? Number(currentBalance) : Number(totalAmount),
            dueDate: dueDate ? Number(dueDate) : undefined,
            status: 'active',
            accountId: type === 'credit_card' ? accountId : undefined,
        });

        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nombre de la deuda" value={name} onChange={e => setName(e.target.value)} required placeholder="Ej. Préstamo BCP" />

            <Select
                label="Tipo"
                value={type}
                onChange={e => setType(e.target.value as DebtType)}
                options={[
                    { value: 'bank', label: 'Bancaria' },
                    { value: 'friend', label: 'Amigo/Familia' },
                    { value: 'installments', label: 'Cuotas' },
                    { value: 'subscription', label: 'Suscripción' },
                    { value: 'credit_card', label: 'Tarjeta de Crédito' },
                ]}
            />

            {type === 'credit_card' && (
                <Select
                    label="Asociar a Cuenta"
                    value={accountId}
                    onChange={e => setAccountId(e.target.value)}
                    options={[
                        { value: '', label: 'Seleccionar cuenta de TC...' },
                        ...accounts.filter(a => a.type === 'credit_card').map(a => ({ value: a.id, label: a.name }))
                    ]}
                    required
                />
            )}

            <div className="grid grid-cols-2 gap-4">
                <Input label="Monto total" type="number" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} required />
                <Input label="Saldo actual" type="number" value={currentBalance} onChange={e => setCurrentBalance(e.target.value)} placeholder="Igual al total si es nuevo" />
            </div>

            <Input label="Día de pago (1-31)" type="number" min="1" max="31" value={dueDate} onChange={e => setDueDate(e.target.value)} placeholder="Ej. 5" />

            <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" className="flex-1" onClick={onCancel}>Cancelar</Button>
                <Button type="submit" className="flex-1">Guardar</Button>
            </div>
        </form>
    );
};
