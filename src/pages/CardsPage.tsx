import { useState } from 'react';
import { CreditCardWidget } from '../components/dashboard/CreditCardWidget';
import { UpcomingDebtsWidget } from '../components/dashboard/UpcomingDebtsWidget';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { formatCurrency } from '../utils/utils';
import { CreditCard as CardIcon, Plus } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const CardsPage = () => {
    const { data, addAccount } = useData();
    const creditCards = data.accounts.filter(a => a.type === 'credit_card');

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [cardName, setCardName] = useState('');
    const [limit, setLimit] = useState('');

    const handleAddCard = () => {
        if (!cardName || !limit) return;
        addAccount({
            name: cardName,
            type: 'credit_card',
            balance: 0, // Initial balance for CC is usually 0 (or debt but we treat balance as 0 for simplicity here)
            creditLimit: Number(limit),
            isArchived: false
        });
        setIsAddOpen(false);
        setCardName('');
        setLimit('');
    };

    return (
        <div className="space-y-6 pb-20 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tarjetas</h1>
                    <p className="text-muted-foreground">Gestión de créditos y deudas.</p>
                </div>
            </div>

            {/* Main Widget Reuse */}
            <CreditCardWidget />

            {/* List of Cards Details */}
            <h3 className="text-lg font-bold mt-8 mb-4">Mis Plásticos</h3>
            <div className="space-y-4">
                {creditCards.map(card => {
                    // Logic to find active debt for this card
                    const debt = data.debts.find(d => d.accountId === card.id && d.status === 'active');
                    const debtAmount = debt ? debt.currentBalance : 0;
                    const limit = card.creditLimit || 0;
                    const available = limit - debtAmount;

                    return (
                        <Card key={card.id} className="p-4 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                    <CardIcon size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold">{card.name}</h4>
                                    <p className="text-xs text-muted-foreground">**** {card.id.slice(0, 4)}</p>
                                    <p className="text-[10px] text-emerald-500">Disp: {formatCurrency(available)}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-red-400">{formatCurrency(debtAmount)}</p>
                                <p className="text-[10px] text-muted-foreground">Deuda actual</p>
                            </div>
                        </Card>
                    );
                })}

                <button
                    onClick={() => setIsAddOpen(true)}
                    className="w-full py-4 border border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2 text-muted-foreground hover:bg-white/5 transition-colors"
                >
                    <Plus size={20} /> Agregar Tarjeta
                </button>
            </div>

            <div className="mt-8">
                <UpcomingDebtsWidget />
            </div>

            <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Nueva Tarjeta">
                <div className="space-y-4">
                    <Input label="Nombre de la Tarjeta" placeholder="Ej. VISA Signature" value={cardName} onChange={e => setCardName(e.target.value)} />
                    <Input label="Límite de Crédito" type="number" placeholder="0.00" value={limit} onChange={e => setLimit(e.target.value)} />
                    <Button className="w-full mt-4" onClick={handleAddCard}>Guardar Tarjeta</Button>
                </div>
            </Modal>
        </div>
    );
};
