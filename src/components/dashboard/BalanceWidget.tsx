import { ChevronLeft, ChevronRight, CreditCard as CardIcon, Wallet, Landmark, Banknote } from 'lucide-react';
import { Card } from '../ui/Card';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';

export const BalanceWidget = () => {
    const { data } = useData();
    const [currentIndex, setCurrentIndex] = useState(0);

    // Calculate Total Liquid Balance
    const totalBalance = data.accounts
        .filter(acc => acc.type !== 'credit_card')
        .reduce((sum, acc) => sum + acc.balance, 0);

    // Prepare list of items to show: Total + Individual Accounts
    const items = [
        { id: 'total', name: 'Saldo Total', balance: totalBalance, type: 'total', currency: 'PEN', creditLimit: undefined },
        ...data.accounts.map(acc => ({
            id: acc.id,
            name: acc.name,
            balance: acc.balance,
            type: acc.type,
            currency: 'PEN',
            creditLimit: acc.creditLimit
        }))
    ];

    const currentItem = items[currentIndex];

    const nextItem = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const prevItem = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'total': return <Landmark size={24} className="text-[#1A1F71]" />;
            case 'cash': return <Banknote size={24} className="text-emerald-600" />;
            case 'bank': return <Landmark size={24} className="text-blue-600" />;
            case 'credit_card': return <CardIcon size={24} className="text-purple-600" />;
            default: return <Wallet size={24} className="text-gray-600" />;
        }
    };

    const currentDate = format(new Date(), "EEEE, d MMMM yyyy", { locale: es });
    const capitalizedDate = currentDate.charAt(0).toUpperCase() + currentDate.slice(1);

    return (
        <Card className="col-span-12 relative overflow-hidden bg-[#F2F2F7] text-gray-900 border-none shadow-xl rounded-3xl h-56 flex flex-col justify-between p-6 transition-all duration-300">
            {/* Accent Stripe based on type */}
            <div className={`absolute top-0 left-0 w-2 h-full ${currentItem.type === 'total' ? 'bg-[#FF9F43]' : currentItem.type === 'credit_card' ? 'bg-purple-500' : 'bg-blue-500'}`} />

            <div className="flex justify-between items-start pl-2">
                <div>
                    <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                        {getIcon(currentItem.type)}
                        {currentItem.name}
                    </h3>
                    <p className="text-gray-500 text-xs mt-1 capitalize">{capitalizedDate}</p>
                </div>

                {/* Navigation Arrows */}
                <div className="flex gap-1">
                    <button onClick={prevItem} className="p-1 hover:bg-black/5 rounded-full transition-colors"><ChevronLeft size={20} className="text-gray-500" /></button>
                    <button onClick={nextItem} className="p-1 hover:bg-black/5 rounded-full transition-colors"><ChevronRight size={20} className="text-gray-500" /></button>
                </div>
            </div>

            <div className="pl-2 relative z-10">
                <span className="text-4xl font-bold tracking-tight text-[#5D5FEF]">{formatCurrency(currentItem.balance)}</span>
                {currentItem.type === 'credit_card' && currentItem.creditLimit && (
                    <p className="text-xs text-gray-500 mt-1">Límite: {formatCurrency(currentItem.creditLimit)}</p>
                )}
            </div>

            <div className="flex justify-between items-end relative z-10 pl-2">
                <div className="flex gap-1">
                    {items.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-[#FF9F43]' : 'w-1.5 bg-gray-300'}`}
                        />
                    ))}
                </div>
                {currentItem.type === 'total' && <span className="font-bold text-[#1A1F71] text-xl italic">VISA</span>}
            </div>

            {/* Decorative Background Curves */}
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full opacity-50 blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-200 rounded-full opacity-50 blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        </Card>
    );
};
