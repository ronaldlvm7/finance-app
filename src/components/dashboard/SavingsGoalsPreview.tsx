import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/utils';
import { useData } from '../../context/DataContext';

const GOAL_COLORS = ['#3B82F6', '#8B5CF6', '#22C55E', '#F59C2A', '#EF4444', '#06B6D4'];

export const SavingsGoalsPreview = () => {
    const { data } = useData();
    const navigate = useNavigate();
    const goals = data.goals.slice(0, 4);

    if (goals.length === 0) return null;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <h3 className="font-semibold text-[16px] text-foreground">Mis Metas</h3>
                <button onClick={() => navigate('/goals')} className="text-sm text-primary font-semibold">
                    Ver todo
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {goals.map((goal, i) => {
                    const progress = goal.targetAmount > 0
                        ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
                        : 0;
                    const color = GOAL_COLORS[i % GOAL_COLORS.length];

                    return (
                        <button
                            key={goal.id}
                            onClick={() => navigate('/goals')}
                            className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3 text-left hover:bg-secondary/50 transition-colors active:scale-[0.98]"
                            style={{ boxShadow: 'var(--shadow-card)' }}
                        >
                            <p className="font-bold text-sm text-foreground truncate">{goal.name}</p>

                            {/* Progress bar */}
                            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%`, background: color }}
                                />
                            </div>

                            {/* Amount + percentage */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                    {formatCurrency(goal.targetAmount)}
                                </span>
                                <span className="text-xs font-bold" style={{ color }}>
                                    {Math.round(progress)}%
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
