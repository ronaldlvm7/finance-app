import { useState } from 'react';
import { Plus, Trash2, Sparkles } from 'lucide-react';
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
                    <h1 className="ios-large-title">Mis Metas</h1>
                    <p className="ios-subhead">Ahorra para tus sueños.</p>
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
                    <Input label="Monto Objetivo" type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*" placeholder="0.00" value={target} onChange={e => { const v = e.target.value; if (v === '' || /^\d*\.?\d*$/.test(v)) setTarget(v); }} />
                    <Input label="Ahorro Inicial (Opcional)" type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*" placeholder="0.00" value={current} onChange={e => { const v = e.target.value; if (v === '' || /^\d*\.?\d*$/.test(v)) setCurrent(v); }} />
                    <Input label="Fecha Límite (Opcional)" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
                    <Button className="w-full py-5 mt-2" onClick={handleAddGoal}>Crear Meta</Button>
                </div>
            </Modal>
        </div>
    );
};

// Deterministic color per goal based on name hash
const RING_COLORS = [
    { stroke: '#FF9F43', bg: 'rgba(255,159,67,0.10)', border: 'rgba(255,159,67,0.20)' },
    { stroke: '#a29bfe', bg: 'rgba(162,155,254,0.10)', border: 'rgba(162,155,254,0.20)' },
    { stroke: '#00D9C0', bg: 'rgba(0,217,192,0.10)', border: 'rgba(0,217,192,0.20)' },
    { stroke: '#fd79a8', bg: 'rgba(253,121,168,0.10)', border: 'rgba(253,121,168,0.20)' },
    { stroke: '#74b9ff', bg: 'rgba(116,185,255,0.10)', border: 'rgba(116,185,255,0.20)' },
    { stroke: '#55efc4', bg: 'rgba(85,239,196,0.10)', border: 'rgba(85,239,196,0.20)' },
];

const goalColor = (id: string) => {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    return RING_COLORS[h % RING_COLORS.length];
};

interface ActivityRingProps { progress: number; stroke: string; size?: number; strokeWidth?: number; }

const ActivityRing = ({ progress, stroke, size = 64, strokeWidth = 5.5 }: ActivityRingProps) => {
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - Math.min(progress / 100, 1) * circ;
    const cx = size / 2;
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
            <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={strokeWidth} />
            <circle
                cx={cx} cy={cx} r={r} fill="none"
                stroke={stroke} strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
            />
        </svg>
    );
};

interface GoalCardProps {
    goal: Goal;
    progress: number;
    isComplete: boolean;
    remaining: number;
    onDelete: () => void;
}

const GoalCard = ({ goal, progress, isComplete, remaining, onDelete }: GoalCardProps) => {
    const color = isComplete
        ? { stroke: '#34d399', bg: 'rgba(52,211,153,0.07)', border: 'rgba(52,211,153,0.25)' }
        : goalColor(goal.id);

    return (
        <div
            className="rounded-2xl p-4 relative"
            style={{ background: color.bg, border: `1px solid ${color.border}` }}
        >
            <div className="flex items-center gap-4">
                {/* Activity Ring with emoji */}
                <div className="relative shrink-0">
                    <ActivityRing progress={progress} stroke={color.stroke} />
                    <span className="absolute inset-0 flex items-center justify-center text-[22px] rotate-90">
                        {goal.icon || '🎯'}
                    </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                        <h3 className="ios-headline truncate pr-2">{goal.name}</h3>
                        {isComplete ? (
                            <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full text-emerald-400" style={{ background: 'rgba(52,211,153,0.15)' }}>
                                ✓ Lograda
                            </span>
                        ) : (
                            <span className="shrink-0 ios-headline font-bold" style={{ color: color.stroke }}>
                                {Math.round(progress)}%
                            </span>
                        )}
                    </div>

                    <p className="ios-caption mb-2">
                        {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                        {goal.deadline ? ` · ${new Date(goal.deadline).toLocaleDateString('es-PE', { month: 'short', year: 'numeric' })}` : ''}
                    </p>

                    {/* Mini progress bar */}
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${progress}%`, background: color.stroke }}
                        />
                    </div>

                    {!isComplete && (
                        <p className="ios-caption mt-1.5">Falta {formatCurrency(remaining)}</p>
                    )}
                </div>

                {/* Delete */}
                <button
                    onClick={onDelete}
                    className="shrink-0 p-1.5 text-muted-foreground/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all self-start"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
};
