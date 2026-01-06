'use client';

import { useUIStore } from '@/store/useUIStore';
import { LayoutGrid } from 'lucide-react';

interface AppItem {
    id: string;
    name: string;
    icon: any;
    isActive: boolean;
}

interface AppBarProps {
    openApps: AppItem[];
    onAppClick: (id: string) => void;
}

export default function AppBar({ openApps, onAppClick }: AppBarProps) {
    const { minimizeAllWindows } = useUIStore();

    return (
        <div className="h-12 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 flex items-center px-4 gap-4 z-[5000] shrink-0">
            {/* 1. Show Desktop (Minimize All) Button */}
            <button
                onClick={minimizeAllWindows}
                className="p-2 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors group relative"
                title="Show Desktop"
            >
                <LayoutGrid size={20} />
                {/* 툴팁 (선택 사항) */}
                <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-black text-[10px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Show Desktop
                </span>
            </button>

            {/* Separator */}
            <div className="w-[1px] h-6 bg-zinc-800" />

            {/* 2. Running Apps List */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {openApps.map((app) => {
                    const Icon = app.icon;
                    return (
                        <button
                            key={app.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onAppClick(app.id);
                            }}
                            className={`
                                relative flex items-center gap-2 px-3 py-1.5 rounded-md transition-all border
                                ${app.isActive
                                    ? 'bg-zinc-800 text-white border-zinc-700 shadow-sm'
                                    : 'bg-transparent text-zinc-500 border-transparent hover:bg-zinc-800/50 hover:text-zinc-300'
                                }
                            `}
                        >
                            <Icon size={16} className={app.isActive ? 'text-blue-400' : ''} />
                            <span className="text-xs font-medium">{app.name}</span>

                            {/* Active Indicator Bar */}
                            {app.isActive && (
                                <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-blue-500 rounded-t-full" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Right Side: Clock or Status (Optional) */}
            <div className="ml-auto flex items-center gap-4 text-xs text-zinc-500 font-mono">
                <span>ONLINE</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
        </div>
    );
}