import { BalanceWidget } from '../components/dashboard/BalanceWidget';
import { IncomeExpenseSummary } from '../components/dashboard/IncomeExpenseSummary';
import { SavingsGoalsPreview } from '../components/dashboard/SavingsGoalsPreview';
import { UserGreeting } from '../components/dashboard/UserGreeting';

export const DashboardPage = () => {
    return (
        <div className="space-y-6 pb-20 md:pb-0 fade-in">
            {/* Header: User Greeting */}
            <UserGreeting />

            <div className="flex flex-col gap-6">
                {/* Balance Card - Main Feature */}
                <BalanceWidget />

                {/* Income / Expense Summary */}
                <IncomeExpenseSummary />

                {/* Goals Preview */}
                <SavingsGoalsPreview />

                {/* Note: "Movimientos" list could go here in future iteration */}
            </div>
        </div>
    );
};
