import { ChevronLeft, ChevronRight, CreditCard as CardIcon, Wallet, Landmark, Banknote, TrendingUp } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';

const GRADIENTS: Record<string, string> = {
    total: 'from-[#FF9F43] via-[#e67e22] to-[#c0392b]',
    cash: 'from-emerald-700 via-emerald-800 to-emerald-950',
    bank: 'from-blue-700 via-blue-800 to-blue-950',
    savings: 'from-sky-600 via-sky-800 to-sky-950',
    credit_card: 'from-purple-700 via-purple-800 to-purple-950',
    default: 'from-gray-700 via-gray-800 to-gray-900',
};

const SHADOWS: Record<string, string> = {
    total: '0 20px 60px rgba(255,159,67,0.35), 0 4px 20px rgba(255,159,67,0.2)',
    cash: '0 20px 60px rgba(52,211,153,0.25), 0 4px 20px rgba(52,211,153,0.15)',
    bank: '0 20px 60px rgba(96,165,250,0.25), 0 4px 20px rgba(96,165,250,0.15)',
    savings: '0 20px 60px rgba(56,189,248,0.25), 0 4px 20px rgba(56,189,248,0.15)',
    credit_card: '0 20px 60px rgba(167,139,250,0.25), 0 4px 20px rgba(167,139,250,0.15)',
    default: '0 20px 60px rgba(0,0,0,0.4)',
};

const ACCENT_COLORS: Record<string, string> = {
    total: 'bg-primary',
    cash: 'bg-emerald-500',
    bank: 'bg-blue-500',
    savings: 'bg-sky-400',
    credit_card: 'bg-purple-500',
    default: 'bg-white/30',
};

const AMOUNT_COLORS: Record<string, string> = {
    total: 'text-primary',
    cash: 'text-emerald-400',
    bank: 'text-blue-400',
    savings: 'text-sky-300',
    credit_card: 'text-purple-300',
    default: 'text-white',
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
    const accentColor = ACCENT_COLORS[currentItem.type] ?? ACCENT_COLORS.default;
    const amountColor = currentItem.type === 'total' ? 'text-white' : (AMOUNT_COLORS[currentItem.type] ?? AMOUNT_COLORS.default);
    const cardShadow = SHADOWS[currentItem.type] ?? SHADOWS.default;

    const nextItem = () => setCurrentIndex(prev => (prev + 1) % items.length);
    const prevItem = () => setCurrentIndex(prev => (prev - 1 + items.length) % items.length);

    const getIcon = (type: string) => {
        const cls = 'shrink-0';
        switch (type) {
            case 'total': return <TrendingUp size={22} className={`${cls} text-primary`} />;
            case 'cash': return <Banknote size={22} className={`${cls} text-emerald-400`} />;
            case 'bank': return <Landmark size={22} className={`${cls} text-blue-400`} />;
            case 'credit_card': return <CardIcon size={22} className={`${cls} text-purple-400`} />;
            default: return <Wallet size={22} className={`${cls} text-white/60`} />;
        }
    };

    const currentDate = format(new Date(), "EEEE, d MMMM yyyy", { locale: es });
    const capitalizedDate = currentDate.charAt(0).toUpperCase() + currentDate.slice(1);
    const itemCount = String(currentIndex + 1).padStart(1, '0') + '/' + items.length;

    return (
        <div
            className={`relative overflow-hidden bg-gradient-to-br ${gradient} border border-white/10 rounded-3xl h-56 flex flex-col justify-between p-6 transition-all duration-500`}
            style={{ boxShadow: cardShadow }}
        >
            {/* Accent left stripe */}
            <div className={`absolute top-0 left-0 w-1 h-full ${accentColor} opacity-80`} />

            {/* Glowing orb decoration */}
            <div className={`absolute -top-8 -right-8 w-36 h-36 rounded-full ${accentColor} opacity-10 blur-2xl pointer-events-none`} />
            <div className={`absolute -bottom-10 -left-4 w-28 h-28 rounded-full ${accentColor} opacity-10 blur-3xl pointer-events-none`} />

            {/* Top row */}
            <div className="flex justify-between items-start pl-3 relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        {getIcon(currentItem.type)}
                        <h3 className="font-bold text-white text-base leading-tight">{currentItem.name}</h3>
                    </div>
                    <p className="text-white/40 text-[11px] capitalize pl-[30px]">{capitalizedDate}</p>
                </div>

                <div className="flex items-center gap-1">
                    <span className="text-[10px] text-white/30 font-mono mr-1">{itemCount}</span>
                    <button onClick={prevItem} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft size={18} className="text-white/50" />
                    </button>
                    <button onClick={nextItem} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronRight size={18} className="text-white/50" />
                    </button>
                </div>
            </div>

            {/* Amount */}
            <div className="pl-3 relative z-10">
                <p className="text-[11px] text-white/40 font-medium uppercase tracking-widest mb-1">{currentItem.displayLabel}</p>
                <span className={`text-4xl font-bold tracking-tight ${amountColor}`}>
                    {formatCurrency(currentItem.balance)}
                </span>
                {currentItem.type === 'credit_card' && currentItem.creditLimit && (
                    <p className="text-[11px] text-white/30 mt-1">
                        Límite: {formatCurrency(currentItem.creditLimit)}
                    </p>
                )}
            </div>

            {/* Bottom dots */}
            <div className="flex items-center gap-1.5 pl-3 relative z-10">
                {items.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? `w-6 ${accentColor}` : 'w-1.5 bg-white/20'}`}
                    />
                ))}
            </div>
        </div>
    );
};
