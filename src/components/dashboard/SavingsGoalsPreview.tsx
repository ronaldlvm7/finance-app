import { Target, Plus } from 'lucide-react';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/utils';
import { useData } from '../../context/DataContext';
import { useNavigate } from 'react-router-dom';

export const SavingsGoalsPreview = () => {
    const { data } = useData();
    const navigate = useNavigate();

    // Take top 5 goals
    const goals = data.goals.slice(0, 5);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Target size={18} className="text-primary" />
                    Mis Metas
                </h3>
                <button onClick={() => navigate('/goals')} className="text-sm text-primary font-medium hover:underline">Ver todo</button>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 snap-x custom-scrollbar">
                {/* Add New Goal Card */}
                <div className="snap-start shrink-0">
                    <button
                        onClick={() => navigate('/goals')}
                        className="w-32 h-40 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors group"
                    >
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus size={20} className="text-muted-foreground" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">Nueva Meta</span>
                    </button>
                </div>

                {goals.map(goal => {
                    const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                    return (
                        <Card key={goal.id} className="snap-start shrink-0 w-40 h-40 p-4 flex flex-col justify-between bg-card border-white/5 relative overflow-hidden group">
                            {/* Background Progress Bar */}
                            <div
                                className="absolute bottom-0 left-0 h-1 bg-primary"
                                style={{ width: `${progress}%` }}
                            />

                            <div className="flex justify-between items-start">
                                <span className="text-2xl">{goal.icon || '🎯'}</span>
                                <span className="text-xs font-bold text-muted-foreground">{Math.round(progress)}%</span>
                            </div>

                            <div>
                                <h4 className="font-bold text-sm line-clamp-1">{goal.name}</h4>
                                <p className="text-xs text-muted-foreground mt-1">{formatCurrency(goal.currentAmount)}</p>
                                <p className="text-[10px] text-muted-foreground/50">de {formatCurrency(goal.targetAmount)}</p>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
