import { useNavigate } from 'react-router-dom';
import { Settings, Trash2, Tag, Download, ChevronRight, AlertTriangle, Sun, Moon } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { exportDataToExcel } from '../utils/utils';

export const SettingsPage = () => {
    const navigate = useNavigate();
    const { data, clearAllData } = useData();
    const { theme, toggleTheme } = useTheme();

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
                    <h1 className="ios-large-title">Configuración</h1>
                    <p className="ios-subhead">Gestiona tus preferencias y datos.</p>
                </div>
            </div>

            {/* Apariencia */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-1">Apariencia</h3>
                <Card className="overflow-hidden">
                    <div className="w-full p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-secondary rounded-lg text-foreground">
                                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <div>
                                <span className="font-medium">Tema</span>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {theme === 'dark' ? 'Modo oscuro activo' : 'Modo claro activo'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${theme === 'light' ? 'bg-primary' : 'bg-secondary'}`}
                        >
                            <span
                                className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${theme === 'light' ? 'translate-x-6' : 'translate-x-1'}`}
                            />
                        </button>
                    </div>
                </Card>
            </div>

            {/* General Settings */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-1">General</h3>
                <Card className="divide-y divide-border overflow-hidden">
                    <SettingsItem
                        icon={<Tag size={20} />}
                        label="Categorías de Ingresos y Gastos"
                        description="Crea, edita o elimina tus categorías."
                        onClick={() => navigate('/categories')}
                    />
                </Card>
            </div>

            {/* Data Management */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-1">Datos y Seguridad</h3>
                <Card className="divide-y divide-border overflow-hidden">
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
                <p className="text-xs text-muted-foreground/30">Finance App v2.0.0 • Powered by Supabase</p>
            </div>
        </div>
    );
};

const SettingsItem = ({ icon, label, description, onClick }: { icon: React.ReactNode, label: string, description?: string, onClick: () => void }) => (
    <button
        onClick={onClick}
        className="w-full p-4 flex items-center justify-between hover:bg-secondary transition-all group active:bg-secondary/80 text-left"
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
