'use client';

import { useState, useRef, useEffect, MouseEvent } from 'react';
import dynamic from 'next/dynamic';
import Draggable from 'react-draggable';
import { useMapStore } from '@/store/useMapStore';
import { useUIStore } from '@/store/useUIStore';
import { useWindowControls } from '@/hooks/useWindowControls';
import MapControls from './MapControls';
import MapEditorTools from './MapEditorTools';
import WindowHeader from '@/components/common/WindowHeader';
import { Move } from 'lucide-react';

const TarkovMap = dynamic(() => import('./TarkovMap'), { ssr: false });

export default function MapViewer({ name }: { name: string }) {
    const { currentMap, isMapOpen, toggleMapOpen } = useMapStore();
    const { mapInstance, isFullscreen, toggleFullscreen: setFullscreen } = useUIStore();
    const [isMounted, setIsMounted] = useState(false);

    // Use Custom Hook for Window Controls
    // Pass onResize to invalidate map size when resizing
    const {
        nodeRef,
        isMaximized,
        isMinimized,
        windowSize,
        zIndex,
        setWindowSize,
        setIsMaximized,
        toggleMaximize,
        toggleMinimize,
        startResizing,
        handleFocus
    } = useWindowControls({
        windowId: 'map',
        minWidth: 300,
        minHeight: 200,
        onResize: () => {
            mapInstance?.invalidateSize();
        }
    });

    useEffect(() => {
        setIsMounted(true);

        const calculateSize = () => {
            const mapWidth = currentMap.width || 1200;
            const mapHeight = currentMap.height || 800;
            const maxWidth = window.innerWidth * 0.9;
            const maxHeight = window.innerHeight * 0.8;
            const scale = Math.min(maxWidth / mapWidth, maxHeight / mapHeight, 1);
            setWindowSize({ width: Math.floor(mapWidth * scale), height: Math.floor(mapHeight * scale) });
        };

        if (isMapOpen) {
            calculateSize();
        }

        const handleFsChange = () => setFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFsChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFsChange);
        };
    }, [currentMap, setFullscreen, isMapOpen, setWindowSize]);

    // Global Fullscreen (Browser API on Body) - Keeps OpsController visible
    const handleToggleFullscreen = async (e?: MouseEvent) => {
        e?.stopPropagation();
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (err) { console.error(err); }
    };

    const handleMinimize = (e: MouseEvent) => toggleMinimize(e);

    const handleClose = (e: MouseEvent) => {
        e.stopPropagation();
        toggleMapOpen();
    };

    if (!isMounted || !isMapOpen) {
        return null; // Return null if closed or not mounted
    }

    const appliedWidth = isMinimized ? 300 : ((isFullscreen || isMaximized) ? '100%' : windowSize.width);
    const appliedHeight = isMinimized ? 'min-content' : ((isFullscreen || isMaximized) ? '100%' : windowSize.height);

    // Disable Dragging if Fullscreen OR Maximized (but allow if Minimized)
    const disableDrag = (isFullscreen || isMaximized) && !isMinimized;

    return (
        <Draggable handle=".drag-handle" nodeRef={nodeRef} bounds="parent" disabled={disableDrag}>
            <div
                ref={nodeRef}
                style={{ width: appliedWidth, height: appliedHeight, zIndex: isFullscreen ? 9999 : zIndex }}
                onMouseDownCapture={handleFocus}
                className={`flex flex-col bg-zinc-900 shadow-2xl rounded-xl overflow-hidden border border-zinc-700 
                    ${isFullscreen
                        ? '!fixed !inset-0 !rounded-none !border-0 !transform-none !m-0'
                        : (isMaximized && !isMinimized
                            ? '!fixed !inset-0 !rounded-none !border-0 !transform-none !m-0'
                            : 'absolute top-10 left-10')
                    }
                `}
            >
                {/* Drag Handle Header - Hidden only in True Fullscreen */}
                {!isFullscreen && (
                    <WindowHeader
                        title={`Tactical Display - [${currentMap.name}]${isMinimized ? ' (Minimized)' : ''}`}
                        icon={Move}
                        onClose={handleClose}
                        onMinimize={handleMinimize}
                        onMaximize={(e: any) => toggleMaximize(e)}
                        isMinimized={isMinimized}
                        isMaximized={isMaximized}
                        onDoubleClick={(e: any) => toggleMaximize(e)}
                        className={`drag-handle cursor-move ${disableDrag ? 'cursor-default' : ''}`}
                    />
                )}

                {/* Content Area (Hidden if Minimized) */}
                <div className={`relative flex-1 bg-[#1a1a1a] overflow-hidden ${isMinimized ? 'hidden' : 'block'}`}>
                    {/* The Map */}
                    <div className="absolute inset-0 z-0">
                        <TarkovMap />
                    </div>

                    {/* Integrated Controls (Flush Left) */}
                    <div className="absolute top-0 left-0 bottom-0 z-[1000] flex flex-col pointer-events-none">
                        {/* Wrapper for pointer-events-auto */}
                        <div className="pointer-events-auto flex flex-col gap-0 border-r border-zinc-700/50 bg-zinc-900/80 backdrop-blur-sm h-full max-w-min">

                            {/* MapControls (Zoom/Full) */}
                            <MapControls
                                isFullscreen={isFullscreen}
                                onToggleFullscreen={handleToggleFullscreen}
                                className="relative top-0 left-0 w-10 !rounded-none !shadow-none !border-none !bg-transparent"
                            />

                            {/* Separator */}
                            <div className="h-[1px] bg-zinc-700 w-full" />

                            {/* Editor Tools */}
                            <MapEditorTools
                                className="relative top-0 left-0 w-10 !rounded-none !shadow-none !border-none !bg-transparent !animate-none"
                            />
                        </div>
                    </div>

                    {/* Custom Resize Handle (Bottom Right) */}
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