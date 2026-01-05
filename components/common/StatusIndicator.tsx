import { Circle, Loader2 } from 'lucide-react';

export type StatusType = 'idle' | 'loading' | 'success' | 'error';

interface StatusIndicatorProps {
    status: StatusType;
    message?: string;
    className?: string;
}

export default function StatusIndicator({ status, message, className = '' }: StatusIndicatorProps) {
    if (status === 'idle') return null;

    let colorClass = 'text-zinc-500';
    let Icon = Circle;
    let animate = false;

    switch (status) {
        case 'loading':
            colorClass = 'text-yellow-500';
            Icon = Loader2;
            animate = true;
            break;
        case 'success':
            colorClass = 'text-emerald-500';
            Icon = Circle;
            break;
        case 'error':
            colorClass = 'text-red-500';
            Icon = Circle;
            break;
    }

    return (
        <div className={`flex items-center gap-2 text-xs font-mono px-3 py-2 bg-zinc-950/50 rounded border border-zinc-800 ${className}`}>
            <Icon
                size={12}
                className={`${colorClass} ${animate ? 'animate-spin' : ''} ${status !== 'loading' ? 'fill-current' : ''}`}
            />
            <span className={colorClass}>
                {message || status.toUpperCase()}
            </span>
        </div>
    );
}
