import { useState } from 'react';
import { useData } from '../context/DataContext';
import type { AppData } from '../context/DataContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import * as XLSX from 'xlsx';

export const exportDataToExcel = (data: AppData) => {
    const wb = XLSX.utils.book_new();

    // 1. Transactions Sheet
    const txnsWs = XLSX.utils.json_to_sheet(data.transactions.map(t => ({
        ...t,
        category: data.categories.find(c => c.id === t.categoryId)?.name || '',
        accountFrom: data.accounts.find(a => a.id === t.fromAccountId)?.name || '',
        accountTo: data.accounts.find(a => a.id === t.toAccountId)?.name || '',
    })));
    XLSX.utils.book_append_sheet(wb, txnsWs, "Movimientos");

    // 2. Debts
    const debtsWs = XLSX.utils.json_to_sheet(data.debts);
    XLSX.utils.book_append_sheet(wb, debtsWs, "Deudas");

    // 3. Accounts
    const accountsWs = XLSX.utils.json_to_sheet(data.accounts);
    XLSX.utils.book_append_sheet(wb, accountsWs, "Cuentas");

    XLSX.writeFile(wb, "Finanzas_Backup.xlsx");
};

export const SettingsPage = () => {
    const { data, addAccount, clearAllData } = useData();
    const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

    // Form State
    const [accName, setAccName] = useState('');
    const [accType, setAccType] = useState<'cash' | 'bank' | 'credit_card' | 'savings'>('bank');
    const [initialBalance, setInitialBalance] = useState('');
    const [creditLimit, setCreditLimit] = useState('');

    const handleAddAccount = (e: React.FormEvent) => {
        e.preventDefault();
        addAccount({
            name: accName,
            type: accType,
            balance: Number(initialBalance),
            creditLimit: accType === 'credit_card' ? Number(creditLimit) : undefined,
            isArchived: false
        });
        setIsAddAccountOpen(false);
        setAccName('');
        setInitialBalance('');
    };

    const handleReset = () => {
        if (confirm("¿Estás seguro de BORRAR TODO? Esta acción no se puede deshacer.")) {
            clearAllData();
            alert("Datos borrados.");
        }
    };

    return (
        <div className="space-y-6 pb-20 fade-in">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
                <p className="text-muted-foreground">Administra tus cuentas y datos.</p>
            </div>

            {/* Account List */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Mis Cuentas</CardTitle>
                    <Button size="sm" onClick={() => setIsAddAccountOpen(true)}>Agregar</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {data.accounts.map(acc => (
                        <div key={acc.id} className="flex justify-between items-center p-3 rounded-lg border bg-background/50">
                            <div>
                                <p className="font-medium">{acc.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{(acc.type || '').replace('_', ' ')}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold">S/ {acc.balance.toFixed(2)}</p>
                                {acc.type === 'credit_card' && (
                                    <p className="text-[10px] text-muted-foreground">Límite: S/ {acc.creditLimit}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Data Actions */}
            <Card>
                <CardHeader><CardTitle>Gestión de Datos</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <Button variant="outline" onClick={() => exportDataToExcel(data)}>Exportar Excel</Button>
                    <Button variant="danger" onClick={handleReset}>Resetear Todo (Borrar data)</Button>
                </CardContent>
            </Card>

            <Modal isOpen={isAddAccountOpen} onClose={() => setIsAddAccountOpen(false)} title="Nueva Cuenta">
                <form onSubmit={handleAddAccount} className="space-y-4">
                    <Input label="Nombre de Cuenta" value={accName} onChange={e => setAccName(e.target.value)} required placeholder="Ej. BCP Ahorros" />
                    <Select
                        label="Tipo"
                        value={accType}
                        onChange={e => setAccType(e.target.value as any)}
                        options={[
                            { value: 'cash', label: 'Efectivo' },
                            { value: 'bank', label: 'Cuenta Bancaria' },
                            { value: 'credit_card', label: 'Tarjeta de Crédito' },
                            { value: 'savings', label: 'Ahorros' },
                        ]}
                    />
                    <Input label="Saldo Inicial" type="number" value={initialBalance} onChange={e => setInitialBalance(e.target.value)} required placeholder="0.00" />

                    {accType === 'credit_card' && (
                        <Input label="Límite de Crédito" type="number" value={creditLimit} onChange={e => setCreditLimit(e.target.value)} required placeholder="5000.00" />
                    )}

                    <Button type="submit" className="w-full">Guardar Cuenta</Button>
                </form>
            </Modal>
        </div>
    );
};
