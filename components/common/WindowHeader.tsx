import { ReactNode, MouseEvent } from 'react';
import { LucideIcon } from 'lucide-react';

interface WindowHeaderProps {
    title: ReactNode;
    icon?: LucideIcon;
    onClose?: (e: MouseEvent) => void;
    onMinimize?: (e: MouseEvent) => void;
    onMaximize?: (e: MouseEvent) => void;
    isMinimized?: boolean;
    isMaximized?: boolean;
    className?: string;
    onDoubleClick?: (e: MouseEvent) => void;
}

export default function WindowHeader({
    title,
    icon: Icon,
    onClose,
    onMinimize,
    onMaximize,
    isMinimized,
    isMaximized,
    className = '',
    onDoubleClick
}: WindowHeaderProps) {
    return (
        <div
            className={`h-8 bg-zinc-800 border-b border-zinc-700 flex items-center justify-between px-3 select-none group shrink-0 ${className}`}
            onDoubleClick={onDoubleClick}
        >
            <div className="flex items-center gap-2 text-zinc-400">
                {Icon && <Icon size={14} />}
                <span className="text-xs font-bold font-mono uppercase tracking-wider">
                    {title}
                </span>
            </div>

            <div className="flex gap-1.5" onMouseDown={(e) => e.stopPropagation()}>
                {/* Green: Toggle Maximize (Window) */}
                {onMaximize && (
                    <button
                        onClick={onMaximize}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${isMaximized ? 'bg-green-500 hover:bg-green-600' : 'bg-zinc-600 hover:bg-green-500'}`}
                        title="Maximize Window"
                    />
                )}

                {/* Yellow: Minimize */}
                {onMinimize && (
                    <button
                        onClick={onMinimize}
                        className="w-2.5 h-2.5 rounded-full bg-zinc-600 hover:bg-yellow-500 transition-colors"
                        title={isMinimized ? "Expand" : "Minimize"}
                    />
                )}

                {/* Red: Close */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="w-2.5 h-2.5 rounded-full bg-zinc-600 hover:bg-red-500 transition-colors"
                        title="Close"
                    />
                )}
            </div>
        </div>
    );
}
