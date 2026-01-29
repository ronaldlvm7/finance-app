import { useData } from '../../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { CreditCard as CardIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils/utils';
import { useState } from 'react';
import { Button } from '../ui/Button';

export const CreditCardWidget = () => {
    const { data } = useData();
    const [currentIndex, setCurrentIndex] = useState(0);

    // Filter only accounts of type 'credit_card'
    const creditCards = data.accounts.filter(a => a.type === 'credit_card');

    if (creditCards.length === 0) return null; // Or show specific Empty State

    const currentCard = creditCards[currentIndex];

    // Find debts associated specifically with this account
    // Assuming debt.accountId maps correctly, OR we simply look for debts linked to it
    // There might be multiple debts (one per purchase logic?) or one consolidated.
    // Let's assume user wants to see 'Total Debt' for this card.
    // We sum up debts where account_id matches currentCard.id
    const cardDebts = data.debts.filter(d => d.accountId === currentCard.id && d.type === 'credit_card');
    const usedBalance = cardDebts.reduce((sum, d) => sum + d.currentBalance, 0); // Logic might differ if CC logic is "Debt based"

    // Actually, for "Credit Card Widget", usually we show: 
    // - Limit (from account)
    // - Debt (sum of debts linked? OR if we use the 'negative balance' approach?)
    // In our system: CC Purchase -> Increases Debt, Account Balance (Available) decreases.
    // So 'Available' = currentCard.balance (if we update it correctly on transactions)
    // OR 'Available' = Limit - Used. 
    // Let's trust the Account Balance as 'Available' if our logic is solid.
    // If not, let's calc Used = Limit - Balance.

    // Check if balance is tracked as 'Available Limit' or 'Current Balance' (often negative).
    // In our seed/logic: 'balance' for CC usually means "Available Credit".
    // Let's assume 'balance' is Available Amount.
    const available = currentCard.balance;
    const limit = currentCard.creditLimit || 0;
    const debt = limit - available; // Rough estimate if balance is available. 
    // Better: Sum of linked debts. 
    const verifiedDebt = cardDebts.reduce((sum, d) => sum + d.currentBalance, 0);

    // Use verifiedDebt for display if > 0, else fall back to calc? 
    // Let's use verifiedDebt as "Deuda Facturada/Pendiente" and assume available is correct.

    const utilization = limit > 0 ? (verifiedDebt / limit) * 100 : 0;

    const nextCard = () => {
        setCurrentIndex((prev) => (prev + 1) % creditCards.length);
    };

    const prevCard = () => {
        setCurrentIndex((prev) => (prev - 1 + creditCards.length) % creditCards.length);
    };

    return (
        <Card className="col-span-12 md:col-span-6 bg-gradient-to-br from-indigo-900/80 to-purple-900/80 border-indigo-500/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <CardIcon size={120} />
            </div>

            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                <CardTitle className="text-sm font-medium text-indigo-100 flex items-center gap-2">
                    {creditCards.length > 1 && (
                        <div className="flex items-center gap-1 mr-2 bg-black/20 rounded-full px-2 py-0.5 text-[10px]">
                            {currentIndex + 1}/{creditCards.length}
                        </div>
                    )}
                    {currentCard.name}
                </CardTitle>
                <div className="flex gap-1">
                    {creditCards.length > 1 && (
                        <>
                            <button onClick={prevCard} className="p-1 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={16} className="text-indigo-200" /></button>
                            <button onClick={nextCard} className="p-1 hover:bg-white/10 rounded-full transition-colors"><ChevronRight size={16} className="text-indigo-200" /></button>
                        </>
                    )}
                </div>
            </CardHeader>

            <CardContent className="relative z-10">
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-3xl font-bold text-white tracking-tight">{formatCurrency(verifiedDebt)}</div>
                            <p className="text-xs text-indigo-300 font-medium">Deuda Actual</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-emerald-400">{formatCurrency(available)}</p>
                            <p className="text-[10px] text-indigo-300 uppercase tracking-wider">Disponible</p>
                        </div>
                    </div>

                    {limit > 0 && (
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-indigo-200">
                                <span>Límite: {formatCurrency(limit)}</span>
                                <span>{utilization.toFixed(1)}% uso</span>
                            </div>
                            <div className="h-2 w-full bg-black/30 rounded-full overflow-hidden backdrop-blur-sm">
                                <div
                                    className={`h-full transition-all duration-500 rounded-full ${utilization > 80 ? 'bg-red-500' : 'bg-indigo-400'}`}
                                    style={{ width: `${Math.min(100, utilization)}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
