'use client';

import { useMapStore } from '@/store/useMapStore';
import { useUIStore } from '@/store/useUIStore';
import { Plus, Minus, RotateCcw, Maximize2, Minimize2, Map as MapIcon } from 'lucide-react';
import { MouseEvent } from 'react';

interface MapControlsProps {
    isFullscreen: boolean;
    onToggleFullscreen: (e: MouseEvent) => void;
    className?: string;
}

export default function MapControls({ isFullscreen, onToggleFullscreen, className }: MapControlsProps) {
    const { currentMap, currentZoom } = useMapStore();
    const { mapInstance } = useUIStore();
    const stopPropagation = (e: React.SyntheticEvent) => e.stopPropagation();

    const handleZoomIn = (e: MouseEvent) => { e.stopPropagation(); mapInstance?.zoomIn(0.4); };
    const handleZoomOut = (e: MouseEvent) => { e.stopPropagation(); mapInstance?.zoomOut(0.4); };
    const handleResetZoom = (e: MouseEvent) => {
        e.stopPropagation();
        if (mapInstance && currentMap) {
            if (currentMap.type === 'image') {
                const height = currentMap.height || 2000;
                const width = currentMap.width || 2000;
                mapInstance.fitBounds([[0, 0], [height, width]], { animate: true });
            } else {
                mapInstance.setView([51.505, -0.09], 13);
            }
        }
    };

    return (
        <div
            className={`z-[1000] flex flex-col bg-zinc-900/95 rounded-lg shadow-xl border border-zinc-700 backdrop-blur-sm overflow-hidden w-10 transition-all duration-300 ${className ?? 'absolute top-4 left-4'}`}
            onMouseDown={stopPropagation}
            onDoubleClick={stopPropagation}
            onWheel={stopPropagation}
            onClick={stopPropagation}
        >
            <div className="p-1.5 flex items-center justify-center bg-zinc-800/80 border-b border-zinc-700 select-none">
                <span className="text-[10px] font-bold text-zinc-500">
                    {currentZoom.toFixed(1)}x
                </span>
            </div>
            <button onClick={handleZoomIn} className="p-2.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition flex justify-center"><Plus size={16} /></button>
            <button onClick={handleResetZoom} className="p-2 text-zinc-500 hover:text-blue-400 hover:bg-zinc-800 transition flex justify-center border-y border-zinc-800" title="Reset Zoom">
                <RotateCcw size={12} />
            </button>
            <button onClick={handleZoomOut} className="p-2.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition flex justify-center"><Minus size={16} /></button>

            <div className="h-[1px] bg-zinc-800 my-0.5 mx-2" />

            {/* Toggle OpsController */}
            <button onClick={(e) => { e.stopPropagation(); useMapStore.getState().toggleOpsController(); }} className="p-2.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition flex justify-center" title="Toggle Ops Controller">
                <MapIcon size={16} />
            </button>
            <div className="h-[1px] bg-zinc-800 my-0.5 mx-2" />

            {/* Fullscreen Button */}
            <button onClick={onToggleFullscreen} className="p-2.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition flex justify-center" title="Toggle Fullscreen">
                {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            </button>
        </div>
    );
}