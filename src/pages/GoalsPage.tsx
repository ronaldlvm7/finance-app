import { useState } from 'react';
import { Plus, Target, Trash2, Sparkles } from 'lucide-react';
import { formatCurrency } from '../utils/utils';
import { useData } from '../context/DataContext';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import type { Goal } from '../types';

const GOAL_EMOJIS = ['🎯', '✈️', '🏠', '🚗', '💻', '📱', '🎓', '💍', '🌴', '💰'];

export const GoalsPage = () => {
    const { data, addGoal, deleteGoal } = useData();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [name, setName] = useState('');
    const [target, setTarget] = useState('');
    const [current, setCurrent] = useState('');
    const [deadline, setDeadline] = useState('');
    const [icon, setIcon] = useState('🎯');

    const handleAddGoal = () => {
        if (!name || !target) return;
        addGoal({
            name,
            targetAmount: Number(target),
            currentAmount: Number(current) || 0,
            deadline: deadline || undefined,
            icon,
        });
        setIsAddOpen(false);
        setName(''); setTarget(''); setCurrent(''); setDeadline(''); setIcon('🎯');
    };

    const totalTarget = data.goals.reduce((s, g) => s + g.targetAmount, 0);
    const totalSaved = data.goals.reduce((s, g) => s + g.currentAmount, 0);
    const completedGoals = data.goals.filter(g => g.currentAmount >= g.targetAmount).length;

    return (
        <div className="space-y-6 pb-20 fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Mis Metas</h1>
                    <p className="text-muted-foreground text-sm">Ahorra para tus sueños.</p>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="h-11 w-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus size={22} />
                </button>
            </div>

            {/* Summary bar (only when goals exist) */}
            {data.goals.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-card rounded-2xl p-3.5 border border-white/5 text-center">
                        <p className="text-lg font-bold">{data.goals.length}</p>
                        <p className="text-[10px] text-muted-foreground">Metas</p>
                    </div>
                    <div className="bg-card rounded-2xl p-3.5 border border-white/5 text-center">
                        <p className="text-lg font-bold text-emerald-400">{completedGoals}</p>
                        <p className="text-[10px] text-muted-foreground">Logradas</p>
                    </div>
                    <div className="bg-card rounded-2xl p-3.5 border border-white/5 text-center">
                        <p className="text-sm font-bold text-primary truncate">{formatCurrency(totalSaved)}</p>
                        <p className="text-[10px] text-muted-foreground">Ahorrado</p>
                    </div>
                </div>
            )}

            {/* Goals list or empty state */}
            {data.goals.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center gap-5 py-16 px-6">
                    <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center">
                        <Sparkles size={36} className="text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Sin Metas Aún</h3>
                        <p className="text-sm text-muted-foreground mt-1">Define tu primer objetivo de ahorro y empieza a construir tu futuro.</p>
                    </div>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        Crear mi primera meta
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {data.goals.map(goal => {
                        const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                        const isComplete = goal.currentAmount >= goal.targetAmount;
                        const remaining = goal.targetAmount - goal.currentAmount;

                        return (
                            <GoalCard
                                key={goal.id}
                                goal={goal}
                                progress={progress}
                                isComplete={isComplete}
                                remaining={remaining}
                                onDelete={() => {
                                    if (confirm(`¿Eliminar la meta "${goal.name}"?`)) deleteGoal?.(goal.id);
                                }}
                            />
                        );
                    })}

                    {/* Total progress */}
                    {data.goals.length > 1 && totalTarget > 0 && (
                        <div className="bg-card rounded-2xl p-4 border border-white/5">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm font-semibold text-muted-foreground">Progreso total</p>
                                <p className="text-sm font-bold">{formatCurrency(totalSaved)} / {formatCurrency(totalTarget)}</p>
                            </div>
                            <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
                                    style={{ width: `${Math.min((totalSaved / totalTarget) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Add Goal Modal */}
            <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Nueva Meta de Ahorro">
                <div className="space-y-4">
                    {/* Emoji picker */}
                    <div>
                        <p className="text-xs text-muted-foreground font-medium mb-2">Ícono</p>
                        <div className="flex flex-wrap gap-2">
                            {GOAL_EMOJIS.map(e => (
                                <button
                                    key={e}
                                    onClick={() => setIcon(e)}
                                    className={`w-10 h-10 rounded-xl text-xl transition-all ${icon === e ? 'bg-primary/20 ring-2 ring-primary scale-110' : 'bg-card border border-white/5 hover:bg-white/5'}`}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>
                    <Input label="Nombre de la Meta" placeholder="Ej. Viaje, Auto, Laptop..." value={name} onChange={e => setName(e.target.value)} />
                    <Input label="Monto Objetivo" type="number" placeholder="0.00" value={target} onChange={e => setTarget(e.target.value)} />
                    <Input label="Ahorro Inicial (Opcional)" type="number" placeholder="0.00" value={current} onChange={e => setCurrent(e.target.value)} />
                    <Input label="Fecha Límite (Opcional)" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
                    <Button className="w-full py-5 mt-2" onClick={handleAddGoal}>Crear Meta</Button>
                </div>
            </Modal>
        </div>
    );
};

interface GoalCardProps {
    goal: Goal;
    progress: number;
    isComplete: boolean;
    remaining: number;
    onDelete: () => void;
}

const GoalCard = ({ goal, progress, isComplete, remaining, onDelete }: GoalCardProps) => (
    <div className={`bg-card rounded-2xl p-5 border ${isComplete ? 'border-emerald-500/30' : 'border-white/5'} relative overflow-hidden`}>
        {isComplete && (
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                ✓ Lograda
            </div>
        )}

        <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl ${isComplete ? 'bg-emerald-500/15' : 'bg-white/5'}`}>
                    {goal.icon || '🎯'}
                </div>
                <div>
                    <h3 className="font-bold">{goal.name}</h3>
                    <p className="text-xs text-muted-foreground">
                        Objetivo: {formatCurrency(goal.targetAmount)}
                        {goal.deadline ? ` · ${new Date(goal.deadline).toLocaleDateString('es-PE', { month: 'short', year: 'numeric' })}` : ''}
                    </p>
                </div>
            </div>
            <button
                onClick={onDelete}
                className="p-1.5 text-muted-foreground/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            >
                <Trash2 size={15} />
            </button>
        </div>

        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden mb-3">
            <div
                className={`h-full rounded-full transition-all duration-700 ${isComplete ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary to-accent'}`}
                style={{ width: `${progress}%` }}
            />
        </div>

        <div className="flex justify-between items-center">
            <div>
                <p className={`text-base font-bold ${isComplete ? 'text-emerald-400' : 'text-foreground'}`}>
                    {formatCurrency(goal.currentAmount)}
                </p>
                <p className="text-[10px] text-muted-foreground">ahorrado</p>
            </div>
            <div className="text-right">
                <p className="text-base font-bold text-muted-foreground">{Math.round(progress)}%</p>
                {!isComplete && <p className="text-[10px] text-muted-foreground">Falta {formatCurrency(remaining)}</p>}
            </div>
        </div>
    </div>
);
