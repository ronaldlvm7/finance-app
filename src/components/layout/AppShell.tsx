import { NavLink, Outlet } from 'react-router-dom';
import { Home, Wallet, User, Plus, CalendarRange, Menu } from 'lucide-react';
import { cn } from '../../utils/utils';
import { useState } from 'react';
import { DrawerMenu } from './DrawerMenu';
import { CreditCard, Goal } from 'lucide-react'; // Imports for SidebarItem
import { Modal } from '../ui/Modal';
import { TransactionForm } from '../forms/TransactionForm';

export const AppShell = ({ children }: { children?: React.ReactNode }) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

    // Listen for Global FAB Click
    useState(() => {
        const handleOpenModal = () => setIsTransactionModalOpen(true);
        window.addEventListener('OPEN_GHOST_TRANSACTION_MODAL', handleOpenModal);
        return () => window.removeEventListener('OPEN_GHOST_TRANSACTION_MODAL', handleOpenModal);
    });

    return (
        <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden">
            <DrawerMenu isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

            {/* Mobile Header with Hamburger */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-md flex items-center justify-between px-4 z-30 border-b border-white/5">
                <button onClick={() => setIsDrawerOpen(true)} className="p-2 -ml-2 text-muted-foreground hover:text-white">
                    <Menu size={24} />
                </button>
                <span className="font-bold text-lg">Finanzas</span>
                <div className="w-10" /> {/* Spacer to center title */}
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-24 pt-16 md:pt-0 md:pb-0 md:pl-64">
                <div className="container max-w-lg mx-auto p-4 md:max-w-4xl md:p-8">
                    {children || <Outlet />}
                </div>
            </main>

            {/* Global Transaction Modal */}
            <Modal
                isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
                title="Nuevo Movimiento"
            >
                <TransactionForm
                    onSuccess={() => setIsTransactionModalOpen(false)}
                    onCancel={() => setIsTransactionModalOpen(false)}
                />
            </Modal>

            {/* Bottom Navigation (Mobile) */}
            <nav className="md:hidden fixed bottom-6 left-4 right-4 h-16 bg-card/90 backdrop-blur-xl border border-white/10 rounded-2xl z-40 flex items-center justify-between px-4 shadow-2xl shadow-black/50">
                <NavItem to="/" icon={<Home size={22} />} label="Home" />
                <NavItem to="/transactions" icon={<Wallet size={22} />} label="Movimientos" />

                {/* FAB Placeholder - Actual button is separate */}
                <div className="w-12" />

                <NavItem to="/calendar" icon={<CalendarRange size={22} />} label="Calendario" />
                <NavItem to="/profile" icon={<User size={22} />} label="Perfil" />
            </nav>

            {/* FAB (Floating Action Button) - Centered and Raised */}
            <div className="md:hidden fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('OPEN_GHOST_TRANSACTION_MODAL'))}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/40 hover:scale-110 active:scale-95 transition-all outline-none ring-4 ring-background"
                >
                    <Plus size={30} strokeWidth={2.5} />
                </button>
            </div>

            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex fixed top-0 left-0 w-64 h-full flex-col border-r border-white/10 bg-card/50 backdrop-blur-xl p-4">
                <div className="flex items-center gap-2 mb-8 px-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                        <Wallet className="text-white h-5 w-5" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Finanzas</h1>
                </div>

                <div className="space-y-1">
                    <SidebarItem to="/" icon={<Home size={20} />} label="Dashboard" />
                    <SidebarItem to="/transactions" icon={<Wallet size={20} />} label="Movimientos" />
                    <SidebarItem to="/goals" icon={<Goal size={20} />} label="Metas" />
                    <SidebarItem to="/cards" icon={<CreditCard size={20} />} label="Tarjetas" />
                    <SidebarItem to="/debts" icon={<CreditCard size={20} />} label="Deudas" />
                    <SidebarItem to="/calendar" icon={<CalendarRange size={20} />} label="Calendario" />
                    <SidebarItem to="/profile" icon={<User size={20} />} label="Perfil" />
                </div>

                <div className="mt-auto">
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('OPEN_GHOST_TRANSACTION_MODAL'))}
                        className="flex w-full items-center gap-3 rounded-xl bg-accent px-4 py-3 text-accent-foreground font-bold hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
                    >
                        <Plus size={20} /> Nuevo Movimiento
                    </button>
                </div>
            </aside>
        </div>
    );
};

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                cn(
                    'flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all duration-300 w-16',
                    isActive ? 'text-primary scale-110' : 'text-muted-foreground hover:text-white'
                )
            }
        >
            {icon}
            <span className="text-[10px] font-medium">{label}</span>
        </NavLink>
    );
};

const SidebarItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm',
                    isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
            }
        >
            {icon}
            <span>{label}</span>
        </NavLink>
    );
};
