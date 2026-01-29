import { useState } from 'react';
import { useData } from '../context/DataContext';
import type { Debt } from '../types';
import { DebtList } from '../components/debts/DebtList';
import { DebtForm } from '../components/debts/DebtForm';
import { Modal } from '../components/ui/Modal';
import { PlusCircle, Wallet, CalendarRange } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const DebtsPage = () => {
    const { data, addDebt, updateDebt } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDebt, setEditingDebt] = useState<Debt | undefined>(undefined);

    const activeDebts = data.debts.filter(d => d.status === 'active');

    // Calculate metrics
    const totalMonthlyFixed = activeDebts.reduce((sum, debt) => {
        if (debt.type === 'subscription') return sum + debt.totalAmount;
        if (debt.installments && debt.installments > 0) return sum + (debt.totalAmount / debt.installments);
        return sum; // Fallback for other types
    }, 0);

    const totalRemainingDebt = activeDebts.reduce((sum, debt) => {
        if (debt.type === 'subscription') return sum; // Subs don't have "remaining debt" usually
        return sum + debt.currentBalance;
    }, 0);

    const handleOpenAdd = () => {
        setEditingDebt(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (debt: Debt) => {
        setEditingDebt(debt);
        setIsModalOpen(true);
    };

    const handleSave = (debtData: Omit<Debt, 'id'>) => {
        if (editingDebt) {
            updateDebt({ ...editingDebt, ...debtData });
        } else {
            addDebt(debtData);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 fade-in pb-20 md:pb-0">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl bg-gradient-to-br from-indigo-900/20 to-indigo-900/5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                            <CalendarRange size={24} />
                        </div>
                        <h2 className="text-gray-400 font-medium">Fijos Mensuales</h2>
                    </div>
                    <p className="text-3xl font-bold text-white tracking-tight">
                        {totalMonthlyFixed.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Suscripciones + Cuotas</p>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl bg-gradient-to-br from-red-900/20 to-red-900/5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
                            <Wallet size={24} />
                        </div>
                        <h2 className="text-gray-400 font-medium">Deuda Total Restante</h2>
                    </div>
                    <p className="text-3xl font-bold text-white tracking-tight">
                        {totalRemainingDebt.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Capital pendiente de pago</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Mis Compromisos</h1>
                <Button onClick={handleOpenAdd} variant="primary" className="flex items-center gap-2">
                    <PlusCircle size={18} />
                    <span className="hidden sm:inline">Nuevo Compromiso</span>
                    <span className="sm:hidden">Nuevo</span>
                </Button>
            </div>

            {/* List */}
            <DebtList debts={data.debts} onEditDebt={handleEdit} />

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingDebt ? "Editar Compromiso" : "Nuevo Compromiso"}
            >
                {isModalOpen && (
                    <DebtForm
                        onSuccess={handleSave}
                        onCancel={() => setIsModalOpen(false)}
                        initialData={editingDebt}
                    />
                )}
            </Modal>
        </div>
    );
};
