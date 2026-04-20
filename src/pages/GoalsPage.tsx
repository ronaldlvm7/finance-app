import { useState } from 'react';
import { Plus, Trash2, Sparkles, PiggyBank } from 'lucide-react';
import { formatCurrency } from '../utils/utils';
import { useData } from '../context/DataContext';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import type { Goal } from '../types';

const GOAL_EMOJIS = ['🎯', '✈️', '🏠', '🚗', '💻', '📱', '🎓', '💍', '🌴', '💰'];

export const GoalsPage = () => {
    const { data, addGoal, updateGoal, updateAccount, deleteGoal } = useData();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [depositGoal, setDepositGoal] = useState<Goal | null>(null);
    const [depositAmount, setDepositAmount] = useState('');
    const [depositAccountId, setDepositAccountId] = useState('');
    const [name, setName] = useState('');
    const [target, setTarget] = useState('');
    const [current, setCurrent] = useState('');
    const [deadline, setDeadline] = useState('');
    const [icon, setIcon] = useState('🎯');

    const handleDeposit = async () => {
        if (!depositGoal || !depositAmount || Number(depositAmount) <= 0) return;
        const amt = Number(depositAmount);
        const account = data.accounts.find(a => a.id === depositAccountId);
        if (!account) { alert('Selecciona una cuenta origen'); return; }
        if (amt > account.balance) {
            alert(`Fondos insuficientes. ${account.name} solo tiene ${formatCurrency(account.balance)} disponible.`);
            return;
        }
        await Promise.all([
            updateGoal({ ...depositGoal, currentAmount: depositGoal.currentAmount + amt }),
            updateAccount({ ...account, balance: account.balance - amt }),
        ]);
        setDepositGoal(null);
        setDepositAmount('');
        setDepositAccountId('');
    };

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
                    <div className="bg-card rounded-2xl p-3.5 border border-border text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
                        <p className="text-lg font-bold text-foreground">{data.goals.length}</p>
                        <p className="text-[10px] text-muted-foreground">Metas</p>
                    </div>
                    <div className="bg-card rounded-2xl p-3.5 border border-border text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
                        <p className="text-lg font-bold text-emerald-500 dark:text-emerald-400">{completedGoals}</p>
                        <p className="text-[10px] text-muted-foreground">Logradas</p>
                    </div>
                    <div className="bg-card rounded-2xl p-3.5 border border-border text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
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
                                onDeposit={() => { setDepositGoal(goal); setDepositAmount(''); setDepositAccountId(''); }}
                                onDelete={() => {
                                    if (confirm(`¿Eliminar la meta "${goal.name}"?`)) deleteGoal?.(goal.id);
                                }}
                            />
                        );
                    })}

                    {/* Total progress */}
                    {data.goals.length > 1 && totalTarget > 0 && (
                        <div className="bg-card rounded-2xl p-4 border border-border" style={{ boxShadow: 'var(--shadow-card)' }}>
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm font-semibold text-muted-foreground">Progreso total</p>
                                <p className="text-sm font-bold text-foreground">{formatCurrency(totalSaved)} / {formatCurrency(totalTarget)}</p>
                            </div>
                            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700"
                                    style={{ width: `${Math.min((totalSaved / totalTarget) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Deposit Modal */}
            <Modal
                isOpen={!!depositGoal}
                onClose={() => { setDepositGoal(null); setDepositAmount(''); }}
                title={`Ahorrar en "${depositGoal?.name}"`}
            >
                {depositGoal && (
                    <div className="space-y-5">
                        {/* Progress reminder */}
                        <div className="bg-secondary rounded-2xl p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Ahorrado</span>
                                <span className="font-bold text-foreground">{formatCurrency(depositGoal.currentAmount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Meta</span>
                                <span className="font-semibold text-foreground">{formatCurrency(depositGoal.targetAmount)}</span>
                            </div>
                            <div className="h-2 bg-border rounded-full overflow-hidden mt-1">
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${Math.min((depositGoal.currentAmount / depositGoal.targetAmount) * 100, 100)}%`,
                                        background: goalColor(depositGoal.id).stroke,
                                    }}
                                />
                            </div>
                        </div>

                        <Input
                            label="¿Cuánto quieres agregar?"
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*\.?[0-9]*"
                            placeholder="0.00"
                            value={depositAmount}
                            onChange={e => {
                                const v = e.target.value;
                                if (v === '' || /^\d*\.?\d*$/.test(v)) setDepositAmount(v);
                            }}
                            autoFocus
                        />

                        {/* Account selector */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Descontar de</p>
                            <div className="space-y-2">
                                {data.accounts.filter(a => a.type !== 'credit_card').map(account => {
                                    const isSelected = depositAccountId === account.id;
                                    const icons: Record<string, string> = { cash: '💵', bank: '🏦', debit: '💳', savings: '🏦' };
                                    return (
                                        <button
                                            key={account.id}
                                            type="button"
                                            onClick={() => setDepositAccountId(account.id)}
                                            className="w-full flex items-center justify-between p-3 rounded-2xl border-2 transition-all"
                                            style={isSelected
                                                ? { borderColor: goalColor(depositGoal.id).stroke, background: goalColor(depositGoal.id).bg }
                                                : { borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }
                                            }
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{icons[account.type] ?? '💰'}</span>
                                                <div className="text-left">
                                                    <p className="text-sm font-semibold text-foreground">{account.name}</p>
                                                    <p className="text-xs text-muted-foreground">{formatCurrency(account.balance)} disponible</p>
                                                </div>
                                            </div>
                                            <div
                                                className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                                                style={isSelected
                                                    ? { borderColor: goalColor(depositGoal.id).stroke, background: goalColor(depositGoal.id).stroke }
                                                    : { borderColor: 'hsl(var(--border))' }
                                                }
                                            >
                                                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {depositAmount && Number(depositAmount) > 0 && depositAccountId && (
                            <p className="text-xs text-muted-foreground text-center">
                                Nuevo total:{' '}
                                <span className="font-bold text-foreground">
                                    {formatCurrency(depositGoal.currentAmount + Number(depositAmount))}
                                </span>
                                {' '}de {formatCurrency(depositGoal.targetAmount)}
                            </p>
                        )}

                        <Button
                            className="w-full py-5"
                            onClick={handleDeposit}
                            disabled={!depositAmount || Number(depositAmount) <= 0 || !depositAccountId}
                        >
                            <PiggyBank size={18} className="mr-2" />
                            Registrar ahorro
                        </Button>
                    </div>
                )}
            </Modal>

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
                                    className={`w-10 h-10 rounded-xl text-xl transition-all ${icon === e ? 'bg-primary/15 ring-2 ring-primary scale-110' : 'bg-secondary border border-border hover:bg-primary/10'}`}
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
            <circle cx={cx} cy={cx} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={strokeWidth} />
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
    onDeposit: () => void;
    onDelete: () => void;
}

const GoalCard = ({ goal, progress, isComplete, remaining, onDeposit, onDelete }: GoalCardProps) => {
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
                    <div className="h-1.5 rounded-full overflow-hidden bg-secondary dark:bg-white/8">
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${progress}%`, background: color.stroke }}
                        />
                    </div>

                    {!isComplete && (
                        <p className="ios-caption mt-1.5">Falta {formatCurrency(remaining)}</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 shrink-0 self-start">
                    {!isComplete && (
                        <button
                            onClick={onDeposit}
                            className="p-1.5 rounded-lg transition-all hover:scale-110 active:scale-95"
                            style={{ background: color.bg, color: color.stroke }}
                            title="Agregar ahorro"
                        >
                            <Plus size={15} strokeWidth={2.5} />
                        </button>
                    )}
                    <button
                        onClick={onDelete}
                        className="p-1.5 text-muted-foreground/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};
