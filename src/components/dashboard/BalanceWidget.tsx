import { ChevronLeft, ChevronRight, CreditCard as CardIcon, Wallet, Landmark, Banknote, TrendingUp } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';

const GRADIENTS: Record<string, string> = {
    total: 'from-[#F59C2A] via-[#e08518] to-[#c0392b]',
    cash: 'from-emerald-500 via-emerald-600 to-emerald-800',
    bank: 'from-blue-500 via-blue-600 to-blue-800',
    savings: 'from-sky-500 via-sky-600 to-sky-800',
    credit_card: 'from-purple-500 via-purple-600 to-purple-800',
    default: 'from-gray-600 via-gray-700 to-gray-800',
};

const SHADOWS: Record<string, string> = {
    total: '0 12px 40px rgba(245,156,42,0.45), 0 4px 16px rgba(245,156,42,0.2)',
    cash: '0 12px 40px rgba(52,211,153,0.3), 0 4px 16px rgba(52,211,153,0.15)',
    bank: '0 12px 40px rgba(96,165,250,0.3), 0 4px 16px rgba(96,165,250,0.15)',
    savings: '0 12px 40px rgba(56,189,248,0.3), 0 4px 16px rgba(56,189,248,0.15)',
    credit_card: '0 12px 40px rgba(167,139,250,0.3), 0 4px 16px rgba(167,139,250,0.15)',
    default: '0 12px 40px rgba(0,0,0,0.25)',
};

export const BalanceWidget = () => {
    const { data } = useData();
    const [currentIndex, setCurrentIndex] = useState(0);

    const totalBalance = data.accounts
        .filter(acc => acc.type !== 'credit_card')
        .reduce((sum, acc) => sum + acc.balance, 0);

    const items = [
        { id: 'total', name: 'Saldo Total', balance: totalBalance, type: 'total', creditLimit: undefined, displayLabel: 'Patrimonio Líquido' },
        ...data.accounts.map(acc => {
            let displayBalance = acc.balance;
            let displayLabel = 'Saldo disponible';
            if (acc.type === 'credit_card') {
                const limit = acc.creditLimit || 0;
                const accountDebts = data.debts.filter(d => d.accountId === acc.id && d.status === 'active');
                const totalDebt = accountDebts.reduce((sum, d) => sum + d.currentBalance, 0);
                displayBalance = limit - totalDebt;
                displayLabel = 'Crédito disponible';
            }
            return { id: acc.id, name: acc.name, balance: displayBalance, type: acc.type, creditLimit: acc.creditLimit, displayLabel };
        })
    ];

    const currentItem = items[currentIndex];
    const gradient = GRADIENTS[currentItem.type] ?? GRADIENTS.default;
    const cardShadow = SHADOWS[currentItem.type] ?? SHADOWS.default;

    const nextItem = () => setCurrentIndex(prev => (prev + 1) % items.length);
    const prevItem = () => setCurrentIndex(prev => (prev - 1 + items.length) % items.length);

    const getIcon = (type: string) => {
        switch (type) {
            case 'total': return <TrendingUp size={20} className="text-white/80" />;
            case 'cash': return <Banknote size={20} className="text-white/80" />;
            case 'bank': return <Landmark size={20} className="text-white/80" />;
            case 'credit_card': return <CardIcon size={20} className="text-white/80" />;
            default: return <Wallet size={20} className="text-white/80" />;
        }
    };

    const currentDate = format(new Date(), "EEEE, d MMMM yyyy", { locale: es });
    const capitalizedDate = currentDate.charAt(0).toUpperCase() + currentDate.slice(1);
    const itemCount = `${currentIndex + 1}/${items.length}`;

    return (
        <div
            className={`relative overflow-hidden bg-gradient-to-br ${gradient} rounded-3xl h-56 flex flex-col justify-between p-6 transition-all duration-500`}
            style={{ boxShadow: cardShadow }}
        >
            {/* Decorative orbs */}
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/8 pointer-events-none" />
            <div className="absolute -bottom-12 -left-4 w-32 h-32 rounded-full bg-white/6 pointer-events-none" />

            {/* Top row */}
            <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-2.5">
                    {getIcon(currentItem.type)}
                    <div>
                        <h3 className="font-bold text-white text-[15px] leading-tight">{currentItem.name}</h3>
                        <p className="text-white/50 text-[11px] mt-0.5 capitalize">{capitalizedDate}</p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <span className="text-[10px] text-white/40 font-mono mr-1">{itemCount}</span>
                    <button onClick={prevItem} className="p-1.5 hover:bg-white/15 rounded-full transition-colors">
                        <ChevronLeft size={16} className="text-white/60" />
                    </button>
                    <button onClick={nextItem} className="p-1.5 hover:bg-white/15 rounded-full transition-colors">
                        <ChevronRight size={16} className="text-white/60" />
                    </button>
                </div>
            </div>

            {/* Amount */}
            <div className="relative z-10">
                <p className="text-[11px] text-white/50 font-medium uppercase tracking-widest mb-1">{currentItem.displayLabel}</p>
                <span className="text-[40px] font-bold tracking-tight text-white leading-none">
                    {formatCurrency(currentItem.balance)}
                </span>
                {currentItem.type === 'credit_card' && currentItem.creditLimit && (
                    <p className="text-[11px] text-white/40 mt-1">
                        Límite: {formatCurrency(currentItem.creditLimit)}
                    </p>
                )}
            </div>

            {/* Dots */}
            <div className="flex items-center gap-1.5 relative z-10">
                {items.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/30'}`}
                    />
                ))}
            </div>
        </div>
    );
};
