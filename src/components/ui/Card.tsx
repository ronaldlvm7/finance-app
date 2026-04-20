import React from 'react';
import { cn } from '../../utils/utils';

export const Card = ({ className, children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn('rounded-2xl border border-border bg-card text-card-foreground', className)}
        style={{ boxShadow: 'var(--shadow-card)', ...style }}
        {...props}
    >
        {children}
    </div>
);

export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>
        {children}
    </div>
);

export const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn('font-semibold leading-none tracking-tight text-foreground', className)} {...props}>
        {children}
    </h3>
);

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('p-6 pt-0', className)} {...props}>
        {children}
    </div>
);
