import { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { formatCurrency } from '../utils/utils';
import { useData } from '../context/DataContext';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const GoalsPage = () => {
    const { data, addGoal } = useData();
    const [isAddOpen, setIsAddOpen] = useState(false);

    // New Goal State
    const [name, setName] = useState('');
    const [target, setTarget] = useState('');
    const [current, setCurrent] = useState('');

    const handleAddGoal = () => {
        if (!name || !target) return;
        addGoal({
            name,
            targetAmount: Number(target),
            currentAmount: Number(current) || 0,
            deadline: '', // optional for v1
            icon: '🎯' // Default icon
        });
        setIsAddOpen(false);
        setName('');
        setTarget('');
        setCurrent('');
    };

    return (
        <div className="space-y-6 pb-20 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Metas</h1>
                    <p className="text-muted-foreground">Ahorra para tus sueños.</p>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus size={24} />
                </button>
            </div>

            {data.goals.length === 0 ? (
                <Card className="p-8 flex flex-col items-center justify-center text-center gap-4 border-dashed border-2 border-white/10 bg-transparent">
                    <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center">
                        <Target size={32} className="text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Sin Metas Aún</h3>
                        <p className="text-sm text-muted-foreground">Define tu primer objetivo de ahorro.</p>
                    </div>
                    <Button variant="outline" onClick={() => setIsAddOpen(true)}>Crear Meta</Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {data.goals.map(goal => {
                        const progress = (goal.currentAmount / goal.targetAmount) * 100;
                        return (
                            <Card key={goal.id} className="p-5 flex flex-col gap-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-2xl">
                                            {goal.icon || '🎯'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{goal.name}</h3>
                                            <p className="text-xs text-muted-foreground">Objetivo: {formatCurrency(goal.targetAmount)}</p>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-bold ${progress >= 100 ? 'text-emerald-500' : 'text-primary'}`}>
                                        {Math.round(progress)}%
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-1000 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold">{formatCurrency(goal.currentAmount)}</span>
                                    <span className="text-muted-foreground text-xs">Falta {formatCurrency(goal.targetAmount - goal.currentAmount)}</span>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Nueva Meta">
                <div className="space-y-4">
                    <Input label="Nombre de la Meta" placeholder="Ej. Viaje, Auto, Laptop..." value={name} onChange={e => setName(e.target.value)} />
                    <Input label="Monto Objetivo" type="number" placeholder="0.00" value={target} onChange={e => setTarget(e.target.value)} />
                    <Input label="Ahorro Inicial (Opcional)" type="number" placeholder="0.00" value={current} onChange={e => setCurrent(e.target.value)} />
                    <Button className="w-full text-lg py-6 mt-4" onClick={handleAddGoal}>Crear Meta 🚀</Button>
                </div>
            </Modal>
        </div>
    );
};
