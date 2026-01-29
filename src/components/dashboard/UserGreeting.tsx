import { Bell } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const UserGreeting = () => {
    const { user } = useData();
    return (
        <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#FF9F43] to-[#FF6B6B] p-[2px]">
                    <div className="h-full w-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                        {/* Placeholder Avatar */}
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="User" className="h-full w-full object-cover" />
                    </div>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground font-medium">Bienvenido de nuevo,</p>
                    <h2 className="text-lg font-bold leading-none">{user.name}</h2>
                </div>
            </div>
            <button className="h-10 w-10 rounded-full bg-card border border-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-2.5 right-3 h-2 w-2 rounded-full bg-red-500 border border-card"></span>
            </button>
        </div>
    );
};
