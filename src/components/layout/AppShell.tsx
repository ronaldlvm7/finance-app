import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, Wallet, User, Plus, CalendarRange, Target, CreditCard } from 'lucide-react';
import { cn } from '../../utils/utils';
import { useState, useEffect, useRef } from 'react';
import { DrawerMenu } from './DrawerMenu';
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

    useEffect(() => {
        setScrolled(false);
        if (mainRef.current) mainRef.current.scrollTop = 0;
    }, [location.pathname]);

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
                className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-5 transition-all duration-300"
                style={{
                    paddingTop: `max(env(safe-area-inset-top, 0px), 0px)`,
                    height: 'calc(3.5rem + env(safe-area-inset-top, 0px))',
                    background: scrolled ? 'hsl(var(--card) / 0.92)' : 'transparent',
                    backdropFilter: scrolled ? 'blur(20px)' : 'none',
                    WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
                    borderBottom: scrolled ? '1px solid hsl(var(--border))' : '1px solid transparent',
                }}
            >
                <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="p-2 -ml-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <line x1="3" y1="12" x2="21" y2="12"/>
                        <line x1="3" y1="18" x2="21" y2="18"/>
                    </svg>
                </button>

                <span
                    className="font-bold text-[17px] tracking-tight transition-all duration-300 absolute left-1/2 -translate-x-1/2"
                    style={{
                        opacity: scrolled ? 1 : 0,
                        transform: scrolled ? 'translateY(0)' : 'translateY(8px)',
                    }}
                >
                    {pageTitle}
                </span>

                <div className="w-8" />
            </header>

            {/* Main Content Area */}
            <main
                ref={mainRef}
                className="flex-1 overflow-y-auto md:pt-0 md:pb-0 md:pl-64"
                style={{
                    paddingTop: 'calc(3.5rem + env(safe-area-inset-top, 0px))',
                    paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))',
                }}
            >
                <div className="container max-w-lg mx-auto px-4 py-4 md:max-w-4xl md:p-8">
                    {children || <Outlet />}
                </div>
            </main>

            {/* Global Transaction Modal */}
            <Modal
                isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
                title="Nuevo Movimiento"
                hideHeader
                noPadding
            >
                <TransactionForm
                    onSuccess={() => setIsTransactionModalOpen(false)}
                    onCancel={() => setIsTransactionModalOpen(false)}
                />
            </Modal>

            {/* Bottom Navigation */}
            <nav
                className="md:hidden fixed left-0 right-0 bottom-0 bg-card border-t border-border z-40 flex items-center justify-around px-2"
                style={{
                    paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
                    paddingTop: '8px',
                }}
            >
                <NavItem to="/" icon={<Home size={22} />} label="Inicio" />
                <NavItem to="/transactions" icon={<Wallet size={22} />} label="Gastos" />

                {/* FAB center */}
                <div className="flex flex-col items-center gap-1 pb-1">
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('OPEN_GHOST_TRANSACTION_MODAL'))}
                        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground active:scale-95 transition-all outline-none"
                        style={{ boxShadow: '0 6px 24px rgba(245,156,42,0.5)' }}
                    >
                        <Plus size={26} strokeWidth={2.5} />
                    </button>
                    <span className="text-[10px] font-semibold text-muted-foreground">Nuevo</span>
                </div>

                <NavItem to="/calendar" icon={<CalendarRange size={22} />} label="Calendario" />
                <NavItem to="/profile" icon={<User size={22} />} label="Perfil" />
            </nav>

            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex fixed top-0 left-0 w-64 h-full flex-col border-r border-border bg-card p-4">
                <div className="flex items-center gap-3 mb-8 px-2">
                    <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg" style={{ boxShadow: '0 4px 12px rgba(245,156,42,0.4)' }}>
                        <Wallet className="text-white h-5 w-5" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground">Finanzas</h1>
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
                        className="flex w-full items-center gap-3 rounded-xl bg-primary px-4 py-3 text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
                        style={{ boxShadow: '0 4px 16px rgba(245,156,42,0.35)' }}
                    >
                        <Plus size={20} /> Nuevo Movimiento
                    </button>
                </div>
            </aside>
        </div>
    );
};

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
    <NavLink to={to} end={to === '/'} className="relative flex flex-col items-center justify-center w-16 py-1 outline-none">
        {({ isActive }) => (
            <>
                {/* Pill background */}
                <span
                    className="absolute inset-x-1 rounded-xl transition-all duration-300"
                    style={{
                        top: '2px',
                        height: '32px',
                        background: isActive ? 'hsl(var(--primary) / 0.12)' : 'transparent',
                    }}
                />
                <span
                    className="relative z-10 transition-all duration-200"
                    style={{ color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
                >
                    {icon}
                </span>
                <span
                    className="relative z-10 text-[10px] font-semibold mt-0.5"
                    style={{ color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
                >
                    {label}
                </span>
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
                isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )
        }
    >
        {icon}
        <span>{label}</span>
    </NavLink>
);
