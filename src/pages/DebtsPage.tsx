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
                <div className="bg-card border border-border p-5 rounded-2xl" style={{ boxShadow: 'var(--shadow-card)' }}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-blue-50 rounded-xl text-blue-500 dark:bg-blue-500/15 dark:text-blue-400">
                            <CalendarRange size={22} />
                        </div>
                        <h2 className="text-muted-foreground font-medium text-sm">Fijos Mensuales</h2>
                    </div>
                    <p className="text-[28px] font-bold text-foreground tracking-tight">
                        {totalMonthlyFixed.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Suscripciones + Cuotas</p>
                </div>

                <div className="bg-card border border-border p-5 rounded-2xl" style={{ boxShadow: 'var(--shadow-card)' }}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-red-50 rounded-xl text-destructive dark:bg-red-500/15 dark:text-red-400">
                            <Wallet size={22} />
                        </div>
                        <h2 className="text-muted-foreground font-medium text-sm">Deuda Total Restante</h2>
                    </div>
                    <p className="text-[28px] font-bold text-foreground tracking-tight">
                        {totalRemainingDebt.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Capital pendiente de pago</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
                <h1 className="ios-large-title">Mis Compromisos</h1>
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
