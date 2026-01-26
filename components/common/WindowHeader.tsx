'use client';

import { ReactNode, MouseEvent, PointerEvent } from 'react';
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

    // 통합 핸들러: TypeScript 에러를 방지하기 위해 이벤트를 적절히 캐스팅하여 전달합니다.
    const handleButtonClick = (
        e: PointerEvent<HTMLButtonElement>,
        action?: (e: MouseEvent<any>) => void
    ) => {
        e.stopPropagation();
        // PointerEvent를 MouseEvent 타입으로 안전하게 캐스팅하여 기존 함수에 전달
        if (action) {
            action(e as unknown as MouseEvent<any>);
        }
    };

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

            {/* 버튼 영역: 전파를 차단하여 헤더 드래그와 충돌 방지 */}
            <div className="flex gap-2.5" onPointerDown={(e) => e.stopPropagation()}>
                {onMaximize && (
                    <button
                        onPointerDown={(e) => handleButtonClick(e, onMaximize)}
                        className={`w-3.5 h-3.5 rounded-full transition-all active:scale-75 ${isMaximized ? 'bg-green-500' : 'bg-zinc-600 hover:bg-green-500'
                            }`}
                        title="Maximize"
                    />
                )}

                {onMinimize && (
                    <button
                        onPointerDown={(e) => handleButtonClick(e, onMinimize)}
                        className="w-3.5 h-3.5 rounded-full bg-zinc-600 hover:bg-yellow-500 transition-all active:scale-75"
                        title="Minimize"
                    />
                )}

                {onClose && (
                    <button
                        onPointerDown={(e) => handleButtonClick(e, onClose)}
                        className="w-3.5 h-3.5 rounded-full bg-zinc-600 hover:bg-red-500 transition-all active:scale-75"
                        title="Close"
                    />
                )}
            </div>
        </div>
    );
}