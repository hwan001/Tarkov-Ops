'use client';

import { ReactNode, MouseEvent, useEffect } from 'react';
import Draggable, { DraggableEvent, DraggableData } from 'react-draggable';
import { useWindowControls } from '@/hooks/useWindowControls';
import WindowHeader from '@/components/common/WindowHeader';
import { LucideIcon } from 'lucide-react';

interface WindowFrameProps {
    windowId: string;
    title: string;
    icon?: LucideIcon;
    isOpen: boolean;
    onClose: (e: MouseEvent) => void;
    minWidth?: number;
    minHeight?: number;
    defaultWidth?: number;
    defaultHeight?: number;
    isFullscreen?: boolean;
    onResize?: () => void;
    bounds?: string | false;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
}

export default function WindowFrame({
    windowId,
    title,
    icon,
    isOpen,
    onClose,
    minWidth = 300,
    minHeight = 200,
    defaultWidth,
    defaultHeight,
    isFullscreen = false,
    onResize,
    bounds = false,
    children,
    className = '',
    contentClassName = ''
}: WindowFrameProps) {
    const {
        nodeRef,
        isMaximized,
        isMinimized,
        windowSize,
        position, // Hook(Store)에서 받아온 현재 좌표
        zIndex,
        setWindowState, // 좌표 업데이트 함수
        toggleMaximize,
        toggleMinimize,
        startResizing,
        handleFocus
    } = useWindowControls({
        windowId,
        minWidth,
        minHeight,
        initialWidth: defaultWidth,
        initialHeight: defaultHeight,
        onResize
    });

    // defaultWidth/Height가 동적으로 변할 때(맵 로딩 등) Store 업데이트
    useEffect(() => {
        if (defaultWidth && defaultHeight) {
            setWindowState(windowId, { width: defaultWidth, height: defaultHeight });
        }
    }, [defaultWidth, defaultHeight, windowId, setWindowState]);

    // [핵심] 드래그가 끝났을 때 Store에 최종 위치 저장
    const handleStop = (e: DraggableEvent, data: DraggableData) => {
        if (!isMaximized && !isFullscreen) {
            setWindowState(windowId, { x: data.x, y: data.y });
        }
    };

    if (!isOpen) return null;
    const displayStyle = isMinimized ? 'none' : 'flex';
    const appliedWidth = isMinimized ? minWidth : ((isFullscreen || isMaximized) ? '100%' : windowSize.width);
    const appliedHeight = isMinimized ? 'min-content' : ((isFullscreen || isMaximized) ? '100%' : windowSize.height);
    const disableDrag = (isFullscreen || isMaximized) && !isMinimized;
    const currentPosition = (isMaximized || isFullscreen) ? { x: 0, y: 0 } : position;

    return (
        <Draggable
            handle=".drag-handle"
            nodeRef={nodeRef}
            bounds={bounds}
            disabled={disableDrag}
            position={currentPosition} // Controlled Position: Store 값 사용
            onStop={handleStop}        // 드래그 종료 시 Store 업데이트
            onMouseDown={handleFocus}
        >
            <div
                ref={nodeRef}
                style={{
                    display: displayStyle,
                    width: appliedWidth,
                    height: appliedHeight,
                    zIndex: isFullscreen ? 9999 : zIndex
                }}
                className={`flex flex-col bg-zinc-900 shadow-2xl rounded-xl overflow-hidden border border-zinc-700 absolute
                    ${isFullscreen
                        ? '!fixed !inset-0 !rounded-none !border-0 !m-0' // 전체화면은 여전히 화면 전체(fixed)
                        : (isMaximized && !isMinimized
                            ? '!absolute !inset-0 !rounded-none !border-0 !m-0 !w-full !h-full' // [변경] 최대화는 부모 컨테이너 기준 꽉 채우기
                            : '')
                    }
                    ${className}
                `}
            >
                {!isFullscreen && (
                    <WindowHeader
                        title={title}
                        icon={icon}
                        onClose={onClose}
                        onMinimize={toggleMinimize}
                        onMaximize={toggleMaximize}
                        isMinimized={isMinimized}
                        isMaximized={isMaximized}
                        onDoubleClick={toggleMaximize}
                        className={`drag-handle cursor-move ${disableDrag ? 'cursor-default' : ''}`}
                    />
                )}

                <div className={`relative flex-1 bg-[#1a1a1a] overflow-hidden ${isMinimized ? 'hidden' : 'block'} ${contentClassName}`}>
                    {children}
                    {!isFullscreen && !isMaximized && (
                        <div
                            className="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize z-[2000] flex items-end justify-end p-1.5"
                            onMouseDown={startResizing}
                        >
                            <div className="w-1.5 h-1.5 bg-zinc-500/50 rounded-sm" />
                        </div>
                    )}
                </div>
            </div>
        </Draggable>
    );
}