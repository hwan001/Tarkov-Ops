'use client';

import { useRef, useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { useMapStore } from '@/store/useMapStore';

import { LucideIcon } from 'lucide-react';

interface AppIconProps {
    id: string; // Unique ID for selection
    name: string;
    iconUrl?: string;
    icon?: LucideIcon;
    initialPosition?: { x: number; y: number };
    isSelected: boolean;
    onSelect: (id: string) => void;
    onLaunch?: () => void;
}

export default function AppIcon({
    id, name, iconUrl, icon: Icon, initialPosition = { x: 24, y: 24 },
    isSelected, onSelect, onLaunch
}: AppIconProps) {
    const nodeRef = useRef(null);
    const { isMapOpen } = useMapStore(); // Only read status
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMouseDown = (e: any) => {
        // e might be MouseEvent or TouchEvent from Draggable
        e.stopPropagation?.(); // Safely call stopPropagation
        onSelect(id);
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onLaunch?.();
    };

    return (
        <Draggable
            nodeRef={nodeRef}
            bounds="parent"
            defaultPosition={initialPosition}
            onStart={handleMouseDown} // Select on drag start
        >
            <div
                ref={nodeRef}
                className="absolute flex flex-col items-center gap-1 w-20 cursor-pointer group z-0"
                onMouseDown={handleMouseDown} // Select on click
                onDoubleClick={handleDoubleClick}
                onTouchEnd={onLaunch}
            >
                <div className={`w-14 h-14 rounded-xl shadow-lg transition-transform group-active:scale-95 flex items-center justify-center overflow-hidden border ${isSelected ? 'bg-zinc-700/80 border-blue-400 ring-2 ring-blue-500/50 scale-105' : 'bg-zinc-800 border-zinc-700 group-hover:bg-zinc-700'} ${isMapOpen ? 'grayscale opacity-75' : ''}`}>
                    {iconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={iconUrl} alt={name} className="w-full h-full object-cover pointer-events-none select-none" />
                    ) : Icon ? (
                        <Icon size={32} className="text-zinc-400" />
                    ) : (
                        <div className="text-2xl font-bold text-zinc-500">?</div>
                    )}
                </div>
                <span className={`text-xs font-medium text-white shadow-black drop-shadow-md px-1.5 py-0.5 rounded select-none ${isSelected ? 'bg-blue-600' : 'group-hover:bg-zinc-800/50'}`}>
                    {name}
                </span>
            </div>
        </Draggable>
    );
}
