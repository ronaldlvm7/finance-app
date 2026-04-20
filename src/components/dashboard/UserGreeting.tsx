import { Bell } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const UserGreeting = () => {
    const { user } = useData();
    return (
        <div className="flex items-center justify-between py-2">
            <div>
                <p className="text-[13px] text-muted-foreground mb-0.5">Buenos días,</p>
                <h2 className="text-[22px] font-bold text-foreground leading-tight tracking-tight">
                    {user.name} 👋
                </h2>
            </div>
            <button className="h-10 w-10 rounded-2xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative" style={{ boxShadow: 'var(--shadow-card)' }}>
                <Bell size={20} />
                <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-destructive border-2 border-card" />
            </button>
        </div>
    );
};
