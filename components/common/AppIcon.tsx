'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { useMapStore } from '@/store/useMapStore';
import { LucideIcon } from 'lucide-react';

interface AppIconProps {
    id: string;
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
    const { isMapOpen } = useMapStore();
    const [isMounted, setIsMounted] = useState(false);

    // 드래그 여부를 판단하기 위한 좌표 저장
    const dragStartPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    const handleStart = (e: DraggableEvent, data: DraggableData) => {
        // 배경 클릭 방지
        e.stopPropagation();
        onSelect(id);
        // 시작 지점 저장
        dragStartPos.current = { x: data.x, y: data.y };
    };

    const handleStop = (e: DraggableEvent, data: DraggableData) => {
        e.stopPropagation();

        // 이동 거리 계산 (거의 움직이지 않았다면 클릭/탭으로 간주)
        const distance = Math.sqrt(
            Math.pow(data.x - dragStartPos.current.x, 2) +
            Math.pow(data.y - dragStartPos.current.y, 2)
        );

        // 5픽셀 미만으로 움직였다면 '실행' (모바일 탭 대응)
        if (distance < 5) {
            onLaunch?.();
        }
    };

    return (
        <Draggable
            nodeRef={nodeRef}
            bounds="parent"
            defaultPosition={initialPosition}
            onStart={handleStart}
            onStop={handleStop}
            // 모바일에서 터치 인식을 더 명확하게 함
            enableUserSelectHack={false}
        >
            <div
                ref={nodeRef}
                className="absolute flex flex-col items-center gap-1 w-20 cursor-pointer group z-0 select-none touch-none"
            >
                <div className={`
                    w-14 h-14 rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center overflow-hidden border
                    active:scale-95 active:bg-blue-500/20
                    ${isSelected
                        ? 'bg-zinc-700/80 border-blue-400 ring-2 ring-blue-500/50 scale-105'
                        : 'bg-zinc-800 border-zinc-700 group-hover:bg-zinc-700'
                    } 
                    ${isMapOpen ? 'grayscale opacity-75' : ''}
                `}>
                    {iconUrl ? (
                        <Image src={iconUrl} alt={name} fill className="object-cover pointer-events-none" sizes="56px" />
                    ) : Icon ? (
                        <Icon size={32} className={`${isSelected ? 'text-blue-400' : 'text-zinc-400'}`} />
                    ) : (
                        <div className="text-2xl font-bold text-zinc-500">?</div>
                    )}
                </div>
                <span className={`
                    text-xs font-medium text-white shadow-black drop-shadow-md px-1.5 py-0.5 rounded
                    ${isSelected ? 'bg-blue-600' : 'group-hover:bg-zinc-800/50'}
                `}>
                    {name}
                </span>
            </div>
        </Draggable>
    );
}