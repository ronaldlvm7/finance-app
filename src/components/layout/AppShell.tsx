import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, Wallet, User, Plus, CalendarRange, Menu, Target } from 'lucide-react';
import { cn } from '../../utils/utils';
import { useState, useEffect, useRef } from 'react';
import { DrawerMenu } from './DrawerMenu';
import { CreditCard } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { TransactionForm } from '../forms/TransactionForm';

const PAGE_TITLES: Record<string, string> = {
    '/': 'Dashboard',
    '/transactions': 'Movimientos',
    '/goals': 'Mis Metas',
    '/cards': 'Tarjetas',
    '/debts': 'Deudas',
    '/calendar': 'Calendario',
    '/profile': 'Perfil',
    '/settings': 'Configuración',
    '/categories': 'Categorías',
};

export const AppShell = ({ children }: { children?: React.ReactNode }) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const mainRef = useRef<HTMLElement>(null);
    const location = useLocation();

    const pageTitle = PAGE_TITLES[location.pathname] ?? 'Finanzas';

    useEffect(() => {
        const handleOpenModal = () => setIsTransactionModalOpen(true);
        window.addEventListener('OPEN_GHOST_TRANSACTION_MODAL', handleOpenModal);
        return () => window.removeEventListener('OPEN_GHOST_TRANSACTION_MODAL', handleOpenModal);
    }, []);

    // Reset scroll state on route change
    useEffect(() => {
        setScrolled(false);
        if (mainRef.current) mainRef.current.scrollTop = 0;
    }, [location.pathname]);

    // Track scroll to collapse Large Title into header
    useEffect(() => {
        const el = mainRef.current;
        if (!el) return;
        const handler = () => setScrolled(el.scrollTop > 56);
        el.addEventListener('scroll', handler, { passive: true });
        return () => el.removeEventListener('scroll', handler);
    }, []);

    return (
        <div className="flex flex-col h-dvh w-full bg-background text-foreground overflow-hidden">
            <DrawerMenu isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

            {/* Mobile Header */}
            <header
                className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 transition-colors duration-300"
                style={{
                    paddingTop: `max(env(safe-area-inset-top, 0px), 0px)`,
                    height: 'calc(3.5rem + env(safe-area-inset-top, 0px))',
                    background: scrolled ? 'hsl(var(--card) / 0.85)' : 'transparent',
                    backdropFilter: scrolled ? 'blur(16px)' : 'none',
                    WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
                    borderBottom: scrolled ? '1px solid hsl(var(--border))' : '1px solid transparent',
                }}
            >
                <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Menu size={22} />
                </button>

                {/* Page title — fades in when scrolled past large title */}
                <span
                    className="font-bold text-[17px] tracking-tight transition-all duration-300 absolute left-1/2 -translate-x-1/2"
                    style={{
                        opacity: scrolled ? 1 : 0,
                        transform: scrolled ? 'translateY(0)' : 'translateY(8px)',
                    }}
                >
                    {pageTitle}
                </span>

                <div className="w-10" />
            </header>

            {/* Main Content Area */}
            <main
                ref={mainRef}
                className="flex-1 overflow-y-auto md:pt-0 md:pb-0 md:pl-64"
                style={{
                    paddingTop: 'calc(3.5rem + env(safe-area-inset-top, 0px))',
                    paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))',
                }}
            >
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

            {/* Bottom Navigation */}
            <nav
                className="md:hidden fixed left-4 right-4 h-16 bg-card/90 backdrop-blur-xl border border-border rounded-2xl z-40 flex items-center justify-between px-2 shadow-2xl shadow-black/20"
                style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
            >
                <NavItem to="/" icon={<Home size={22} />} label="Home" />
                <NavItem to="/transactions" icon={<Wallet size={22} />} label="Gastos" />
                <div className="w-14" />
                <NavItem to="/calendar" icon={<CalendarRange size={22} />} label="Calendario" />
                <NavItem to="/profile" icon={<User size={22} />} label="Perfil" />
            </nav>

            {/* FAB */}
            <div
                className="md:hidden fixed left-1/2 -translate-x-1/2 z-50"
                style={{ bottom: 'calc(2.75rem + env(safe-area-inset-bottom, 0px))' }}
            >
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('OPEN_GHOST_TRANSACTION_MODAL'))}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/40 hover:scale-110 active:scale-95 transition-all outline-none ring-4 ring-background"
                    style={{ boxShadow: '0 8px 28px rgba(0,217,192,0.45), 0 2px 8px rgba(0,0,0,0.3)' }}
                >
                    <Plus size={28} strokeWidth={2.5} />
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
                    <SidebarItem to="/goals" icon={<Target size={20} />} label="Metas" />
                    <SidebarItem to="/cards" icon={<CreditCard size={20} />} label="Tarjetas" />
                    <SidebarItem to="/debts" icon={<Wallet size={20} />} label="Deudas" />
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

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
    <NavLink to={to} end={to === '/'} className="relative flex flex-col items-center justify-center w-16 py-1.5 outline-none">
        {({ isActive }) => (
            <>
                {/* Blob background */}
                <span
                    className="absolute inset-0 rounded-xl transition-all duration-300"
                    style={{
                        background: isActive ? 'rgba(255,159,67,0.13)' : 'transparent',
                        transform: isActive ? 'scale(1)' : 'scale(0.8)',
                        opacity: isActive ? 1 : 0,
                    }}
                />
                {/* Icon */}
                <span
                    className="relative z-10 transition-all duration-300"
                    style={{
                        color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                        transform: isActive ? 'scale(1.15) translateY(-1px)' : 'scale(1)',
                    }}
                >
                    {icon}
                </span>
                {/* Label */}
                <span
                    className="relative z-10 text-[10px] font-medium transition-all duration-300 mt-0.5"
                    style={{
                        color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                        fontWeight: isActive ? 700 : 500,
                    }}
                >
                    {label}
                </span>
                {/* Orange dot indicator */}
                <span
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-primary transition-all duration-300"
                    style={{
                        width: isActive ? '4px' : '0px',
                        height: isActive ? '4px' : '0px',
                        opacity: isActive ? 1 : 0,
                    }}
                />
            </>
        )}
    </NavLink>
);

const SidebarItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
    <NavLink
        to={to}
        end={to === '/'}
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
