import { MoreHorizontal } from 'lucide-react';
import { Card } from '../ui/Card';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const BalanceWidget = () => {
    const { data } = useData();

    // Calculate Total Liquid Balance (Cash + Bank + Savings)
    // Exclude Credit Cards (which are liabilities usually, or negative balance)
    const totalBalance = data.accounts
        .filter(acc => acc.type !== 'credit_card')
        .reduce((sum, acc) => sum + acc.balance, 0);

    const currentDate = format(new Date(), "EEEE, d MMMM yyyy", { locale: es });
    const capitalizedDate = currentDate.charAt(0).toUpperCase() + currentDate.slice(1);

    return (
        <Card className="col-span-12 relative overflow-hidden bg-[#F2F2F7] text-gray-900 border-none shadow-xl rounded-3xl h-56 flex flex-col justify-between p-6">
            {/* Orange Accent Stripe */}
            <div className="absolute top-0 left-0 w-2 h-full bg-[#FF9F43]" />

            <div className="flex justify-between items-start pl-2">
                <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Saldo Total</h3>
                    <p className="text-gray-500 text-xs mt-1 capitalize">{capitalizedDate}</p>
                </div>
                <button className="p-1 hover:bg-black/5 rounded-full transition-colors">
                    <MoreHorizontal size={24} className="text-gray-600" />
                </button>
            </div>

            <div className="pl-2 relative z-10">
                <span className="text-4xl font-bold tracking-tight text-[#5D5FEF]">{formatCurrency(totalBalance)}</span>
            </div>

            <div className="flex justify-end items-end relative z-10">
                <span className="font-bold text-[#1A1F71] text-2xl italic">VISA</span>
            </div>

            {/* Decorative Background Curves - subtle */}
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full opacity-50 blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-200 rounded-full opacity-50 blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            {/* Carousel Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                <div className="w-6 h-1.5 rounded-full bg-[#FF9F43]" />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            </div>
        </Card>
    );
};
