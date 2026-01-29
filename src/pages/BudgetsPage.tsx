import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { ProgressBar } from '../components/ui/ProgressBar';
import { formatCurrency } from '../utils/utils';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';

export const BudgetsPage = () => {
    const { data, setBudget } = useData();
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Form State
    const [catId, setCatId] = useState('');
    const [amount, setAmount] = useState('');

    const currentMonth = format(new Date(), 'yyyy-MM');
    const expenses = data.transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth));

    // Calculate spending per category
    const spending: Record<string, number> = {};
    expenses.forEach(t => {
        if (t.categoryId) spending[t.categoryId] = (spending[t.categoryId] || 0) + t.amount;
    });

    const activeBudgets = data.budgets.filter(b => b.month === currentMonth);

    const handleSave = () => {
        if (!catId || !amount) return;
        setBudget({
            id: '', // Context handles ID
            categoryId: catId,
            amount: Number(amount),
            month: currentMonth
        });
        setIsAddOpen(false);
        setCatId('');
        setAmount('');
    };

    const categories = data.categories.filter(c => c.isFixed !== undefined && c.id !== 'cat_ingreso');

    return (
        <div className="space-y-6 pb-20 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Presupuestos</h1>
                    <p className="text-muted-foreground">Mes de {format(new Date(), 'MMMM yyyy')}</p>
                </div>
                <Button size="sm" onClick={() => setIsAddOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Definir
                </Button>
            </div>

            <div className="grid gap-4">
                {activeBudgets.length === 0 ? (
                    <Card className="p-10 text-center text-muted-foreground">
                        <p>No has definido presupuestos para este mes.</p>
                    </Card>
                ) : activeBudgets.map(b => {
                    const cat = data.categories.find(c => c.id === b.categoryId);
                    const spent = spending[b.categoryId] || 0;
                    const progress = (spent / b.amount) * 100;
                    const isOver = spent > b.amount;

                    return (
                        <Card key={b.id} className="p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold">{cat?.name}</span>
                                <span className={isOver ? 'text-red-500 font-bold' : 'text-muted-foreground'}>
                                    {formatCurrency(spent)} <span className="text-xs font-normal">/ {formatCurrency(b.amount)}</span>
                                </span>
                            </div>
                            <ProgressBar
                                progress={progress}
                                colorClass={isOver ? 'bg-red-500' : (progress > 80 ? 'bg-yellow-500' : 'bg-primary')}
                            />
                            {isOver && <p className="text-xs text-red-500 mt-1 font-medium">¡Has excedido el presupuesto!</p>}
                        </Card>
                    );
                })}
            </div>

            <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Definir Presupuesto">
                <div className="space-y-4">
                    <Select
                        label="Categoría"
                        value={catId}
                        onChange={e => setCatId(e.target.value)}
                        options={[
                            { value: '', label: 'Seleccionar...' },
                            ...categories.map(c => ({ value: c.id, label: c.name }))
                        ]}
                    />
                    <Input label="Monto Límite" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
                    <Button className="w-full" onClick={handleSave}>Guardar</Button>
                </div>
            </Modal>
        </div>
    );
};
