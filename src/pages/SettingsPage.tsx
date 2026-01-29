import { useNavigate } from 'react-router-dom';
import { Settings, Trash2, Tag, Download, ChevronRight, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useData } from '../context/DataContext';
import { exportDataToExcel } from '../utils/utils';

export const SettingsPage = () => {
    const navigate = useNavigate();
    const { data, clearAllData } = useData();

    const handleReset = async () => {
        if (confirm('PELIGRO: ¿Estás seguro de que quieres borrar TODOS los datos de la aplicación? Esto incluye movimientos, cuentas, deudas y categorías personalizadas. Esta acción es irreversible.')) {
            await clearAllData();
            alert("La aplicación se ha reiniciado correctamente.");
            navigate('/');
        }
    };

    return (
        <div className="space-y-6 pb-20 fade-in">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                    <Settings size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
                    <p className="text-muted-foreground text-sm">Gestiona tus preferencias y datos.</p>
                </div>
            </div>

            {/* General Settings */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-1">General</h3>
                <Card className="divide-y divide-white/5 overflow-hidden">
                    <SettingsItem
                        icon={<Tag size={20} />}
                        label="Categorías de Ingresos y Gastos"
                        description="Crea, edita o elimina tus categorías."
                        onClick={() => navigate('/categories')}
                    />
                    {/* Future: Coin currency, Language, etc. */}
                </Card>
            </div>

            {/* Data Management */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-1">Datos y Seguridad</h3>
                <Card className="divide-y divide-white/5 overflow-hidden">
                    <SettingsItem
                        icon={<Download size={20} />}
                        label="Exportar Copia de Seguridad"
                        description="Descarga todos tus movimientos en Excel."
                        onClick={() => exportDataToExcel(data)}
                    />

                    <button
                        onClick={handleReset}
                        className="w-full p-4 flex items-center justify-between hover:bg-red-500/5 transition-all group text-left"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                <Trash2 size={20} />
                            </div>
                            <div>
                                <span className="font-medium text-red-500">Borrar Todos los Datos</span>
                                <p className="text-xs text-red-400/70 mt-0.5">Elimina cuentas, categorías y movimientos.</p>
                            </div>
                        </div>
                        <AlertTriangle size={18} className="text-red-500 opacity-50" />
                    </button>
                </Card>
            </div>

            <div className="text-center p-4">
                <p className="text-xs text-muted-foreground/30">Finance App v1.2.0 • Local-First</p>
            </div>
        </div>
    );
};

const SettingsItem = ({ icon, label, description, onClick }: { icon: React.ReactNode, label: string, description?: string, onClick: () => void }) => (
    <button
        onClick={onClick}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all group active:bg-white/10 text-left"
    >
        <div className="flex items-center gap-4">
            <div className="p-2 bg-secondary rounded-lg text-foreground">
                {icon}
            </div>
            <div>
                <span className="font-medium">{label}</span>
                {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
            </div>
        </div>
        <ChevronRight size={18} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
    </button>
);
