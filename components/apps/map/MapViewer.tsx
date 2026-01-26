'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useMapStore } from '@/store/useMapStore';
import { useUIStore } from '@/store/useUIStore';
import MapControls from './MapControls';
import MapEditorTools from './MapEditorTools';
import { Move } from 'lucide-react';
import WindowFrame from '@/components/common/WindowFrame';

const TarkovMap = dynamic(() => import('./TarkovMap'), { ssr: false });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function MapViewer({ name }: { name: string }) {
    const { currentMap, isMapOpen, toggleMapOpen } = useMapStore();
    const { mapInstance, isFullscreen, toggleFullscreen: setFullscreen } = useUIStore();
    const [isMounted, setIsMounted] = useState(false);

    // 초기 사이즈 계산
    const initialSize = useMemo(() => {
        if (!currentMap) return { width: 1200, height: 800 };
        if (typeof window === 'undefined') return { width: 1200, height: 800 };

        const mapWidth = currentMap.width || 1200;
        const mapHeight = currentMap.height || 800;
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.8;

        const scale = Math.min(maxWidth / mapWidth, maxHeight / mapHeight, 1);

        return {
            width: Math.floor(mapWidth * scale),
            height: Math.floor(mapHeight * scale)
        };
    }, [currentMap]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
        const handleFsChange = () => setFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, [setFullscreen]);

    // const handleToggleFullscreen = async (e?: React.MouseEvent) => {
    //     e?.stopPropagation();
    //     try {
    //         if (!document.fullscreenElement) {
    //             await document.documentElement.requestFullscreen();
    //         } else {
    //             await document.exitFullscreen();
    //         }
    //     } catch (err) { console.error(err); }
    // };
    const handleToggleFullscreen = async (e?: React.MouseEvent | React.PointerEvent) => {
        e?.stopPropagation();

        // 모바일 Safari 등 대응을 위한 타입 확장
        const docEl = document.documentElement as any;
        const doc = document as any;

        try {
            if (!doc.fullscreenElement && !doc.webkitFullscreenElement && !doc.mozFullScreenElement) {
                // 표준 API 및 벤더 프리픽스 대응
                if (docEl.requestFullscreen) {
                    await docEl.requestFullscreen();
                } else if (docEl.webkitRequestFullscreen) {
                    await docEl.webkitRequestFullscreen();
                } else if (docEl.mozRequestFullScreen) {
                    await docEl.mozRequestFullScreen();
                }
            } else {
                if (doc.exitFullscreen) {
                    await doc.exitFullscreen();
                } else if (doc.webkitExitFullscreen) {
                    await doc.webkitExitFullscreen();
                } else if (doc.mozCancelFullScreen) {
                    await doc.mozCancelFullScreen();
                }
            }
        } catch (err) {
            console.error("Fullscreen toggle failed:", err);
            // 모바일에서는 특정 브라우저 UI 환경에 따라 거부될 수 있음
        }
    };

    if (!isMounted) return null;

    return (
        <WindowFrame
            windowId="map"
            title={`Tactical Display - [${currentMap.name}]`}
            icon={Move}
            isOpen={isMapOpen}
            onClose={(e) => {
                e.stopPropagation();
                toggleMapOpen();
            }}
            defaultWidth={initialSize.width}
            defaultHeight={initialSize.height}
            onResize={() => mapInstance?.invalidateSize()}
            isFullscreen={isFullscreen}
            // Map은 이동 제약 없게 설정
            bounds={false}
            contentClassName="flex flex-col w-full h-full relative"
        >
            <div className="absolute inset-0 z-0 bg-[#1a1a1a]">
                <TarkovMap />
            </div>

            <div className="absolute top-0 left-0 bottom-0 z-[1000] flex flex-col pointer-events-none">
                <div className="pointer-events-auto flex flex-col gap-0 border-r border-zinc-700/50 bg-zinc-900/80 backdrop-blur-sm h-full max-w-min">
                    <MapControls
                        isFullscreen={isFullscreen}
                        onToggleFullscreen={handleToggleFullscreen}
                        className="relative top-0 left-0 w-10 !rounded-none !shadow-none !border-none !bg-transparent"
                    />
                    <div className="h-[1px] bg-zinc-700 w-full" />
                    <MapEditorTools
                        className="relative top-0 left-0 w-10 !rounded-none !shadow-none !border-none !bg-transparent !animate-none"
                    />
                </div>
            </div>
        </WindowFrame>
    );
}