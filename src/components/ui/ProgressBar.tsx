
import { cn } from '../../utils/utils';

interface ProgressBarProps {
    progress: number; // 0 to 100
    className?: string;
    colorClass?: string;
}

export const ProgressBar = ({ progress, className, colorClass = 'bg-primary' }: ProgressBarProps) => {
    return (
        <div className={cn('h-2 w-full overflow-hidden rounded-full bg-secondary/50', className)}>
            <div
                className={cn('h-full transition-all duration-500 ease-in-out', colorClass)}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
        </div>
    );
};
