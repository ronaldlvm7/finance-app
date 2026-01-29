
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { X, ChevronRight, LogOut, Wallet, CreditCard, Goal, Shield, Info, Settings } from 'lucide-react';
import { cn } from '../../utils/utils';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface DrawerMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DrawerMenu = ({ isOpen, onClose }: DrawerMenuProps) => {
    const [isMounted, setIsMounted] = useState(false);
    const { user: authUser, signOut } = useAuth();
    const { user } = useData();

    useEffect(() => {
        setIsMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isMounted) return null;

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Side Drawer */}
            <div
                className={cn(
                    "fixed top-0 left-0 h-full w-[80%] max-w-sm bg-card border-r border-white/10 z-50 transition-transform duration-300 ease-out transform",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-primary/5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-accent p-[2px]">
                            <div className="h-full w-full rounded-full bg-card overflow-hidden">
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || authUser?.email}`}
                                    alt="User"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>
                        <div>
                            <p className="font-bold text-sm">{user?.name || 'Usuario'}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">{authUser?.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={20} className="text-muted-foreground" />
                    </button>
                </div>

                {/* Menu Items */}
                <div className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
                    <DrawerItem to="/goals" icon={<Goal size={20} />} label="Mis Metas" onClick={onClose} />
                    <DrawerItem to="/cards" icon={<CreditCard size={20} />} label="Mis Tarjetas" onClick={onClose} />
                    <DrawerItem to="/debts" icon={<Wallet size={20} />} label="Mis Deudas" onClick={onClose} />

                    <div className="my-4 h-px bg-white/5 mx-2" />

                    <DrawerItem to="/profile" icon={<Shield size={20} />} label="Seguridad y Datos" onClick={onClose} />

                    <div className="my-4 h-px bg-white/5 mx-2" />

                    <DrawerItem to="/settings" icon={<Settings size={20} />} label="Configuración" onClick={onClose} />
                    <DrawerItem to="/profile" icon={<Shield size={20} />} label="Seguridad y Datos" onClick={onClose} />

                    <div className="my-4 h-px bg-white/5 mx-2" />

                    <a href="https://github.com/ronaldlvm7/finance-app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-all group">
                        <Info size={20} />
                        <span className="font-medium text-sm">Acerca de la App</span>
                    </a>
                </div>

                {/* Footer / Logout */}
                <div className="absolute bottom-0 w-full p-4 border-t border-white/5 bg-card">
                    <button
                        onClick={() => {
                            signOut();
                            onClose();
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium text-sm">Cerrar Sesión</span>
                    </button>
                </div>
            </div>
        </>,
        document.body
    );
};

const DrawerItem = ({ to, icon, label, onClick }: { to: string; icon: React.ReactNode; label: string; onClick: () => void }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
            cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-white"
            )
        }
    >
        <div className="flex items-center gap-3">
            <span className={cn("group-hover:scale-110 transition-transform")}>{icon}</span>
            <span className="font-medium text-sm">{label}</span>
        </div>
        <ChevronRight size={16} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
    </NavLink>
);
