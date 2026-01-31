'use client';

import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { useMapStore } from '@/store/useMapStore';
import { useEditorStore } from '@/store/useEditorStore';
import { useMissionStore } from '@/store/useMissionStore';
import { useUIStore } from '@/store/useUIStore';
import { PenTool, MonitorPlay } from 'lucide-react';
import dynamic from 'next/dynamic';
import WindowHeader from '@/components/common/WindowHeader';

import MapSelector from './controls/MapSelector';
import MissionPlanner from './controls/MissionPlanner';
import MissionLog from './controls/MissionLog';
import LayerControl from './controls/LayerControl';
import SquadStatus from './controls/SquadStatus';

const SquadManager = dynamic(() => import('./SquadManager'), { ssr: false });

export default function OpsController() {
    const nodeRef = useRef(null);
    const [isMounted, setIsMounted] = useState(false);
    const { isFullscreen } = useUIStore();

    // Store access
    const { isMapOpen, isOpsControllerOpen, toggleMapOpen, toggleOpsController } = useMapStore();
    const { isEditMode } = useEditorStore();
    const { initMissions } = useMissionStore();

    // UI Local State
    const [isMinimized, setIsMinimized] = useState(false);
    const stopPropagation = (e: React.SyntheticEvent) => e.stopPropagation();

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => setIsMounted(true), []);

    // Init missions
    useEffect(() => {
        initMissions();
    }, [initMissions]);

    // Minimize on Edit Mode
    useEffect(() => {
        if (isEditMode) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsMinimized(true);
        }
    }, [isEditMode]);

    if (!isMounted || !isOpsControllerOpen) return null; // Hide if closed

    return (
        <Draggable nodeRef={nodeRef} bounds="parent" handle=".drag-handle" disabled={isFullscreen}>
            <div
                ref={nodeRef}
                className={`absolute top-16 right-4 z-[10000] flex flex-col ${isMinimized ? 'w-auto' : 'w-72'} bg-zinc-900/95 rounded-xl shadow-2xl border border-zinc-700 backdrop-blur-sm overflow-hidden`}
                onMouseDown={stopPropagation}
                onDoubleClick={stopPropagation}
                onWheel={stopPropagation}
                onClick={stopPropagation}
            >
                {/* Header / Drag Handle */}
                <WindowHeader
                    title="Tactical Map"
                    icon={PenTool}
                    onClose={toggleOpsController}
                    onMinimize={() => setIsMinimized(!isMinimized)}
                    isMinimized={isMinimized}
                    className="drag-handle cursor-move"
                />

                {!isMinimized && (
                    <div className="flex flex-col max-h-[80vh] overflow-y-auto custom-scrollbar bg-zinc-900/50">

                        {/* Reopen Map Button (Only visible if closed) */}
                        {!isMapOpen && (
                            <div className="p-3 border-b border-zinc-800 bg-red-900/10">
                                <button onClick={toggleMapOpen} className="w-full flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded shadow-lg transition-all animate-pulse">
                                    <MonitorPlay size={14} />
                                    REOPEN MAP VIEWER
                                </button>
                            </div>
                        )}

                        <MapSelector />
                        <MissionPlanner />
                        <MissionLog />
                        <SquadStatus />
                        <LayerControl />

                    </div>
                )}
                <SquadManager />
            </div>
        </Draggable>
    );
}