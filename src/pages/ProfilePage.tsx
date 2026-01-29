import { User, Shield, Download, Trash2, LogOut, ChevronRight, Wallet, Plus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/ui/Modal';
import { useState } from 'react';
import { formatCurrency, exportDataToExcel } from '../utils/utils';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';

export const ProfilePage = () => {
    const { data, user, updateUser, clearAllData } = useData();
    const { signOut } = useAuth();
    const [isAccountsOpen, setIsAccountsOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isSecurityOpen, setIsSecurityOpen] = useState(false);
    const [newName, setNewName] = useState(user.name);

    // Calculate Net Worth roughly
    const totalAssets = data.accounts.filter(a => a.type !== 'credit_card').reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = data.debts.reduce((sum, d) => sum + d.currentBalance, 0);
    const netWorth = totalAssets - totalLiabilities;

    const handleReset = () => {
        if (confirm('¿Estás seguro de que quieres borrar TODOS los datos? Esta acción es irreversible.')) {
            clearAllData();
            window.location.href = '/';
        }
    };

    const handleSaveProfile = () => {
        if (newName.trim()) {
            updateUser(newName);
            setIsEditProfileOpen(false);
        }
    };

    return (
        <div className="space-y-6 pb-24 fade-in">
            {/* Header Profile */}
            <div className="flex flex-col items-center pt-8 pb-4">
                <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-primary to-accent p-[3px] mb-4 shadow-xl shadow-primary/20">
                    <div className="h-full w-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="User" className="h-full w-full object-cover" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground">Premium Member</p>

                <div className="mt-6 flex gap-8">
                    <div className="text-center">
                        <p className="text-2xl font-bold">{data.transactions.length}</p>
                        <p className="text-xs text-muted-foreground">Movim.</p>
                    </div>
                    <div className="text-center">
                        <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {formatCurrency(netWorth)}
                        </p>
                        <p className="text-xs text-muted-foreground">Patrimonio</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{data.goals.length}</p>
                        <p className="text-xs text-muted-foreground">Metas</p>
                    </div>
                </div>
            </div>

            {/* Menu Groups */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-1">General</h3>
                <Card className="divide-y divide-white/5 overflow-hidden">
                    <MenuItem icon={<User size={20} />} label="Editar Perfil" onClick={() => setIsEditProfileOpen(true)} />
                    <MenuItem icon={<Wallet size={20} />} label="Mis Cuentas" onClick={() => setIsAccountsOpen(true)} />
                    <MenuItem icon={<Shield size={20} />} label="Seguridad y Privacidad" onClick={() => setIsSecurityOpen(true)} />
                </Card>

                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-1 mt-6">Datos</h3>
                <Card className="divide-y divide-white/5 overflow-hidden">
                    <MenuItem
                        icon={<Download size={20} />}
                        label="Exportar a Excel"
                        onClick={() => exportDataToExcel(data)}
                    />
                    <MenuItem
                        icon={<Trash2 size={20} className="text-red-500" />}
                        label="Borrar Todo"
                        textColor="text-red-500"
                        showArrow={false}
                        onClick={handleReset}
                    />
                </Card>

                <div className="pt-6">
                    <button
                        onClick={() => signOut()}
                        className="w-full py-4 text-center text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut size={20} /> Cerrar Sesión
                    </button>
                    <p className="text-center text-xs text-muted-foreground/30 mt-4">v1.1.0 Finance App</p>
                </div>
            </div>

            <AccountsDrawer isOpen={isAccountsOpen} onClose={() => setIsAccountsOpen(false)} />

            {/* Edit Profile Modal */}
            <Modal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} title="Editar Perfil">
                <div className="space-y-4">
                    <Input label="Tu Nombre" value={newName} onChange={e => setNewName(e.target.value)} />
                    <Button className="w-full" onClick={handleSaveProfile}>Guardar Cambios</Button>
                </div>
            </Modal>

            {/* Security Modal */}
            <Modal isOpen={isSecurityOpen} onClose={() => setIsSecurityOpen(false)} title="Seguridad">
                <div className="space-y-4 text-sm text-gray-300">
                    <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 text-emerald-400 flex gap-3">
                        <Shield className="shrink-0" />
                        <p>Tus datos están encriptados y almacenados localmente en este dispositivo.</p>
                    </div>
                    <p>Esta aplicación funciona bajo una filosofía <strong>Local-First</strong> (Primero Local). Esto significa que:</p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-400">
                        <li>No enviamos tus datos financieros a la nube.</li>
                        <li>Nadie más que tú tiene acceso a tu información.</li>
                        <li>Si borras el caché de tu navegador, asegúrate de haber exportado un respaldo en Excel.</li>
                    </ul>
                </div>
            </Modal>
        </div>
    );
};

// We can just embed the Accounts List logic here for better mobile UX
const AccountsDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const { data, addAccount } = useData();
    const [isAddMode, setIsAddMode] = useState(false);
    const [accName, setAccName] = useState('');
    const [accType, setAccType] = useState('cash');
    const [amount, setAmount] = useState('');

    const handleAddAccount = () => {
        if (!accName || !amount) return;
        addAccount({
            name: accName,
            type: accType as any,
            balance: Number(amount),
            isArchived: false,
            creditLimit: 0
        });
        setIsAddMode(false);
        setAccName('');
        setAmount('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isAddMode ? "Nueva Cuenta" : "Mis Cuentas"}>
            {!isAddMode ? (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <Button size="sm" variant="outline" onClick={() => setIsAddMode(true)} className="flex items-center gap-2">
                            <Plus size={16} /> Nueva Cuenta
                        </Button>
                    </div>

                    {data.accounts.filter(a => a.type !== 'credit_card').map(acc => (
                        <Card key={acc.id} className="p-4 flex items-center justify-between bg-secondary/20 border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-card flex items-center justify-center text-lg">
                                    {acc.type === 'cash' ? '💵' : '🏦'}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">{acc.name}</h4>
                                    <p className="text-xs text-muted-foreground capitalize">{acc.type.replace('_', ' ')}</p>
                                </div>
                            </div>
                            <span className="font-bold text-emerald-500">{formatCurrency(acc.balance)}</span>
                        </Card>
                    ))}

                    <div className="pt-4 border-t border-white/5">
                        <p className="text-xs text-muted-foreground text-center mb-2">Tarjetas de Crédito</p>
                        {data.accounts.filter(a => a.type === 'credit_card').map(acc => (
                            <div key={acc.id} className="p-3 flex items-center justify-between opacity-70">
                                <div className="flex items-center gap-3">
                                    <span>💳</span>
                                    <span className="text-sm">{acc.name}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">Gestionar en Tarjetas</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-8">
                    <Input label="Nombre de Cuenta" placeholder="Ej. Efectivo, BCP Ahorros" value={accName} onChange={e => setAccName(e.target.value)} />
                    <Select
                        label="Tipo"
                        value={accType}
                        onChange={e => setAccType(e.target.value)}
                        options={[
                            { value: 'cash', label: 'Efectivo 💵' },
                            { value: 'bank', label: 'Banco 🏦' },
                            { value: 'savings', label: 'Ahorros 🐖' }
                        ]}
                    />
                    <Input label="Saldo Inicial" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />

                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" className="flex-1" onClick={() => setIsAddMode(false)}>Cancelar</Button>
                        <Button className="flex-1" onClick={handleAddAccount}>Guardar</Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

const MenuItem = ({ icon, label, onClick, textColor = 'text-foreground', showArrow = true }: any) => (
    <button
        onClick={onClick}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all group active:bg-white/10"
    >
        <div className={`flex items-center gap-4 ${textColor}`}>
            <span className="text-muted-foreground group-hover:text-primary transition-colors">{icon}</span>
            <span className="font-medium">{label}</span>
        </div>
        {showArrow && <ChevronRight size={18} className="text-muted-foreground/30" />}
    </button>
);
