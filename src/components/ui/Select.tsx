import React from 'react';
import { cn } from '../../utils/utils';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, ...props }, ref) => {
        return (
            <div className="space-y-2">
                {label && <label className="text-sm font-medium leading-none text-muted-foreground">{label}</label>}
                <div className="relative">
                    <select
                        ref={ref}
                        className={cn(
                            'flex h-12 w-full appearance-none rounded-xl border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
                            error && 'border-destructive',
                            className
                        )}
                        {...props}
                    >
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-popover text-popover-foreground">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-5 w-5 opacity-50 pointer-events-none" />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
        );
    }
);
