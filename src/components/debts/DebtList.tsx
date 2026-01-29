import { DebtCard } from './DebtCard';
import type { Debt } from '../../types';

interface DebtListProps {
    debts: Debt[];
    onEditDebt: (debt: Debt) => void;
}

export const DebtList = ({ debts, onEditDebt }: DebtListProps) => {
    // Filter active debts
    const activeDebts = debts.filter(d => d.status === 'active');

    const activeSubscriptions = activeDebts.filter(d => d.type === 'subscription');
    const activeLoans = activeDebts.filter(d => d.type !== 'subscription');

    if (activeDebts.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>No tienes deudas ni suscripciones activas.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeSubscriptions.length > 0 && (
                <section>
                    <h2 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                        Suscripciones y Pagos Recurrentes
                        <span className="text-xs font-normal text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                            {activeSubscriptions.length}
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeSubscriptions.map(debt => (
                            <DebtCard key={debt.id} debt={debt} onClick={() => onEditDebt(debt)} />
                        ))}
                    </div>
                </section>
            )}

            {activeLoans.length > 0 && (
                <section>
                    <h2 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                        Préstamos y Deudas a Plazos
                        <span className="text-xs font-normal text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                            {activeLoans.length}
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeLoans.map(debt => (
                            <DebtCard key={debt.id} debt={debt} onClick={() => onEditDebt(debt)} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};
