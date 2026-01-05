'use client';

import { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { useMapStore } from '@/store/useMapStore';
import {
    Map as MapIcon, ChevronRight, PenTool, ChevronDown,
    Globe, Target, RotateCcw,
    Grid, Plus, Save, Trash2, FolderOpen,
    Radio, Info,
    MonitorPlay,
    Milestone
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useSquadStore } from '@/store/useSquadStore';
import { useUIStore } from '@/store/useUIStore';
import WindowHeader from '@/components/common/WindowHeader';

const SquadManager = dynamic(() => import('./SquadManager'), { ssr: false });

// Internal component for adding maps
function AddMapForm({ onClose }: { onClose: () => void }) {
    const { addMap, setCurrentMap } = useMapStore();
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState<'image' | 'tile'>('image');
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');

    // Dimensions
    const [width, setWidth] = useState<number | ''>('');
    const [height, setHeight] = useState<number | ''>('');
    const [isDetecting, setIsDetecting] = useState(false);

    const handleAutoDetect = () => {
        if (!url || type !== 'image') return;
        setIsDetecting(true);
        const img = new Image();
        img.src = url;
        img.onload = () => {
            setWidth(img.width);
            setHeight(img.height);
            setIsDetecting(false);
        };
        img.onerror = () => {
            alert('Failed to load image. Check URL or CORS headers.');
            setIsDetecting(false);
        };
    };

    const handleSubmit = () => {
        if (!name || !url) return;
        const newMap = {
            id: `custom-${Date.now()}`,
            name,
            type,
            imageUrl: type === 'image' ? url : undefined,
            tileUrl: type === 'tile' ? url : undefined,
            width: type === 'image' ? (Number(width) || 2000) : undefined,
            height: type === 'image' ? (Number(height) || 2000) : undefined,
        };
        addMap(newMap as any);
        setCurrentMap(newMap as any);
        onClose();
    };

    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)} className="w-full flex items-center justify-center gap-2 py-1.5 text-xs font-bold text-zinc-500 border border-dashed border-zinc-700 rounded hover:border-zinc-500 hover:text-zinc-300 transition-colors">
                <Plus size={12} /> Add Custom Map
            </button>
        );
    }

    return (
        <div className="bg-zinc-900 p-2 rounded border border-zinc-700 space-y-2" onClick={e => e.stopPropagation()}>
            <div className="text-[10px] font-bold text-zinc-500 uppercase">New Map Details</div>
            <input
                type="text" placeholder="Map Name (e.g. My Map)"
                className="w-full bg-black/40 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:border-blue-500 outline-none"
                value={name} onChange={e => setName(e.target.value)}
            />
            <div className="flex bg-black/40 rounded p-0.5 border border-zinc-700">
                <button onClick={() => setType('image')} className={`flex-1 text-[10px] font-bold py-1 rounded ${type === 'image' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>IMAGE</button>
                <button onClick={() => setType('tile')} className={`flex-1 text-[10px] font-bold py-1 rounded ${type === 'tile' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>TILE (OSM)</button>
            </div>

            <input
                type="text" placeholder={type === 'image' ? "Image URL" : "Tile URL Template"}
                className="w-full bg-black/40 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:border-blue-500 outline-none font-mono"
                value={url} onChange={e => setUrl(e.target.value)}
            />

            {/* Dimension Inputs (Image Only) */}
            {type === 'image' && (
                <div className="flex gap-2">
                    <div className="flex-1 flex gap-1">
                        <input
                            type="number" placeholder="W"
                            className="w-1/2 bg-black/40 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:border-blue-500 outline-none"
                            value={width} onChange={e => setWidth(Number(e.target.value))}
                        />
                        <input
                            type="number" placeholder="H"
                            className="w-1/2 bg-black/40 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:border-blue-500 outline-none"
                            value={height} onChange={e => setHeight(Number(e.target.value))}
                        />
                    </div>
                    <button
                        onClick={handleAutoDetect}
                        disabled={!url || isDetecting}
                        className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 rounded border border-zinc-700 disabled:opacity-50"
                    >
                        {isDetecting ? '...' : 'Auto Size'}
                    </button>
                </div>
            )}

            <div className="flex gap-2 pt-1">
                <button onClick={() => setIsOpen(false)} className="flex-1 py-1 text-xs font-bold text-zinc-500 hover:bg-zinc-800 rounded">Cancel</button>
                <button onClick={handleSubmit} className="flex-1 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded shadow-lg">Add & Load</button>
            </div>
        </div>
    );
}

export default function OpsController() {
    const nodeRef = useRef(null);
    const [isMounted, setIsMounted] = useState(false);
    const { isFullscreen } = useUIStore();
    const {
        // State
        showExtracts, showBosses, showGrid, showDrawings,
        isEditMode, currentMap, maps, mapFeatures,
        startPoint, selectedExtracts, isStartPointLocked, isMapOpen, isOpsControllerOpen,
        // Actions
        toggleExtracts, toggleBosses, toggleGrid, toggleDrawings,
        toggleEditMode, setCurrentMap,
        setStartPoint, toggleExtractSelection, resetMission, toggleStartPointLock, toggleMapOpen,
        toggleOpsController, removeMap
    } = useMapStore();

    // UI Local State
    const [isMapListOpen, setIsMapListOpen] = useState(false);
    const [isLayersOpen, setIsLayersOpen] = useState(false);
    const [isMissionOpen, setIsMissionOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    const customExtracts = mapFeatures
        .filter(f => f.type === 'marker' && f.subType === 'exit')
        .map(f => ({
            id: f.id,
            mapId: currentMap.id,
            name: f.comment || 'Custom Exit',
            type: 'Extract',
            subType: 'Custom',
            x: f.geometry.coordinates[0],
            y: f.geometry.coordinates[1]
        }));

    const extracts = [...customExtracts];
    const stopPropagation = (e: any) => e.stopPropagation();


    useEffect(() => setIsMounted(true), []);
    // Init missions
    useEffect(() => {
        useMapStore.getState().initMissions();
    }, []);

    useEffect(() => {
        if (isEditMode) {
            setIsMinimized(true);
        }
    }, [isEditMode]);

    // Mission Manager Local State
    const [isMissionLogOpen, setIsMissionLogOpen] = useState(false);
    const [missionTitle, setMissionTitle] = useState('');

    // Squad Link Local State
    const [isSquadOpen, setIsSquadOpen] = useState(false);
    const [roomId, setRoomId] = useState('');
    const { isConnected, users, connect, disconnect, roomId: currentRoomId, connectionMode, setConnectionMode } = useSquadStore();

    // URL Sync
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const room = searchParams.get('room');
        // Only auto-connect if P2P (default) or if user intended? 
        // For now, let's respect current mode (default p2p).
        if (room && !isConnected) {
            setRoomId(room);
            connect(room, `Operator-${Math.floor(Math.random() * 100)}`);
            setIsSquadOpen(true);
        }
    }, [searchParams]);

    // Update URL on connect
    useEffect(() => {
        if (isConnected && currentRoomId) {
            const params = new URLSearchParams(searchParams);
            params.set('room', currentRoomId);
            router.replace(`${pathname}?${params.toString()}`);
        } else if (!isConnected) {
            const params = new URLSearchParams(searchParams);
            if (params.has('room')) {
                params.delete('room');
                router.replace(`${pathname}?${params.toString()}`);
            }
        }
    }, [isConnected, currentRoomId]);

    const handleConnectSquad = () => {
        if (!roomId.trim()) return alert("Enter a Squad Code");
        connect(roomId, `Operator-${Math.floor(Math.random() * 100)}`); // Random ID for now
    };

    const handleDisconnectSquad = () => {
        if (confirm("Disconnect from Squad?")) disconnect();
    };

    const handleSaveMission = () => {
        if (!missionTitle.trim()) return alert("Please enter a mission title.");
        const missionId = `mission-${Date.now()}`;

        useMapStore.getState().saveMission({
            id: missionId,
            title: missionTitle,
            mapId: currentMap.id,
            date: Date.now(),
            data: {
                startPoint,
                selectedExtracts,
                mapFeatures: useMapStore.getState().mapFeatures,
                isStartPointLocked,
                customMapData: currentMap.type === 'image' && currentMap.id.startsWith('custom-') ? currentMap : undefined
            }
        });
        setMissionTitle('');
        alert("Mission Saved to Log!");
    };

    const handleLoadMission = (mission: any) => { // Type as SavedMission if possible
        if (confirm(`Load Mission: "${mission.title}"? Unsaved progress will be lost.`)) {
            // 1. Restore Map (if custom check)
            if (mission.data.customMapData) {
                useMapStore.getState().addMap(mission.data.customMapData);
                setCurrentMap(mission.data.customMapData);
            } else {
                // Find map by ID
                const targetMap = maps.find(m => m.id === mission.mapId);
                if (targetMap) setCurrentMap(targetMap);
            }

            // 2. Restore Mission Data
            setStartPoint(mission.data.startPoint);
            resetMission(); // clear first
            if (mission.data.startPoint) setStartPoint(mission.data.startPoint);

            // Restore extracts
            mission.data.selectedExtracts.forEach((id: string) => toggleExtractSelection(id));

            // 3. Restore Drawings
            useMapStore.getState().setFeatures(mission.data.mapFeatures);
        }
    };


    if (!isMounted || !isOpsControllerOpen) return null; // Hide if closed

    return (
        <Draggable nodeRef={nodeRef} bounds="parent" handle=".drag-handle" disabled={isFullscreen}>
            <div
                ref={nodeRef}
                className={`absolute top-4 right-4 z-[10000] flex flex-col ${isMinimized ? 'w-auto' : 'w-72'} bg-zinc-900/95 rounded-xl shadow-2xl border border-zinc-700 backdrop-blur-sm overflow-hidden`}
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

                        {/* Share Data (Import/Export) */}
                        <div className="border-b border-zinc-800">
                            <button onClick={() => { }} className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors">
                                <h2 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest flex items-center gap-2"><Globe size={14} /> Data Link</h2>
                            </button>
                            <div className="p-3 pt-0 grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => {
                                        const data = {
                                            version: '1.0',
                                            map: currentMap,
                                            mission: { startPoint, selectedExtracts, isStartPointLocked },
                                            drawings: useMapStore.getState().mapFeatures // Access direct state
                                        };
                                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `tarkov-ops-${currentMap.id}-${Date.now()}.json`;
                                        a.click();
                                        URL.revokeObjectURL(url);
                                    }}
                                    className="flex flex-col items-center justify-center p-2 bg-cyan-900/10 border border-cyan-800 hover:bg-cyan-900/30 rounded transition-colors text-cyan-400"
                                >
                                    <span className="text-xs font-bold">EXPORT</span>
                                    <span className="text-[9px] opacity-70">Save .JSON</span>
                                </button>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".json"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                try {
                                                    const json = JSON.parse(event.target?.result as string);
                                                    if (json.version !== '1.0') return alert('Invalid version');

                                                    // Restore Map
                                                    setCurrentMap(json.map);

                                                    // Restore Mission
                                                    setStartPoint(json.mission.startPoint);
                                                    resetMission();
                                                    if (json.mission.startPoint) setStartPoint(json.mission.startPoint);
                                                    json.mission.selectedExtracts.forEach((id: string) => toggleExtractSelection(id));

                                                    // Restore Drawings
                                                    useMapStore.getState().setFeatures(json.drawings);

                                                    alert('Mission Data Loaded Successfully!');
                                                } catch (err) {
                                                    console.error(err);
                                                    alert('Failed to load mission file.');
                                                }
                                            };
                                            reader.readAsText(file);
                                        }}
                                    />
                                    <button className="w-full h-full flex flex-col items-center justify-center p-2 bg-purple-900/10 border border-purple-800 hover:bg-purple-900/30 rounded transition-colors text-purple-400">
                                        <span className="text-xs font-bold">IMPORT</span>
                                        <span className="text-[9px] opacity-70">Load .JSON</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Reopen Map Button (Only visible if closed) */}
                        {!isMapOpen && (
                            <div className="p-3 border-b border-zinc-800 bg-red-900/10">
                                <button onClick={toggleMapOpen} className="w-full flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded shadow-lg transition-all animate-pulse">
                                    <MonitorPlay size={14} />
                                    REOPEN MAP VIEWER
                                </button>
                            </div>
                        )}

                        {/* Map Selector */}
                        <div className="border-b border-zinc-800">
                            <button onClick={() => setIsMapListOpen(!isMapListOpen)} className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors">
                                <div className="flex items-center gap-2">
                                    <Globe size={14} className="text-blue-500" />
                                    <div className="flex flex-col items-start leading-none gap-0.5">
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">MAP</span>
                                        <span className="font-bold text-xs text-zinc-200">{currentMap.name}</span>
                                    </div>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isMapListOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isMapListOpen && (
                                <div className="bg-zinc-950/30 p-2 space-y-1 border-t border-zinc-800">
                                    {maps.map((map) => (
                                        <div key={map.id} className="relative group flex items-center mb-1">
                                            {/* Selection Button */}
                                            <button
                                                onClick={() => { setCurrentMap(map); setIsMapListOpen(false); }}
                                                className={`flex-1 text-left px-3 py-2 text-xs font-medium rounded transition-all flex items-center justify-between ${currentMap.id === map.id ? 'bg-blue-900/20 text-blue-400 border border-blue-500/30' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-transparent'}`}
                                            >
                                                <span className="truncate">{map.name}</span>
                                                {currentMap.id === map.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                                            </button>

                                            {/* Hover Actions */}
                                            <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {/* Info Toggle */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Toggle info: if open, close. if closed, open.
                                                        // We need state for this. I'll rely on a local state below.
                                                        // But wait, I can't add state inside map loop easily without breaking things or creating sub-component.
                                                        // I'll assume 'infoMapId' state exists in parent.
                                                        // WAIT: I haven't added `infoMapId` state yet! I should add a simple alert/popover for now or add the state in a previous step?
                                                        // I'll use a simple alert for Info for now, OR better, I should have added the state.
                                                        // Let's settle for a simple alert for 'Info' to be safe, or I can use the `isMapListOpen` state block to add it?
                                                        // No, I can add logic to toggle a state.
                                                        alert(`Map Info:\nName: ${map.name}\nSize: ${map.width || '?'}x${map.height || '?'}\nType: ${map.type}\nURL: ${map.imageUrl || map.tileUrl || 'N/A'}`);
                                                    }}
                                                    className="p-1 text-zinc-500 hover:text-cyan-400 bg-zinc-900/80 rounded border border-zinc-700 hover:border-cyan-500/50"
                                                    title="Map Info"
                                                >
                                                    <Info size={10} />
                                                </button>

                                                {/* Remove (Custom only) */}
                                                {map.id.startsWith('custom-') && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (confirm(`Delete map "${map.name}"?`)) {
                                                                removeMap(map.id);
                                                            }
                                                        }}
                                                        className="p-1 text-zinc-500 hover:text-red-400 bg-zinc-900/80 rounded border border-zinc-700 hover:border-red-500/50"
                                                        title="Remove Custom Map"
                                                    >
                                                        <Trash2 size={10} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add Custom Map Button/Form */}
                                    <div className="pt-2 mt-2 border-t border-zinc-800">
                                        <AddMapForm onClose={() => setIsMapListOpen(false)} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mission Plan */}
                        <div className="border-b border-zinc-800">
                            <button onClick={() => setIsMissionOpen(!isMissionOpen)} className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors">
                                <h2 className="text-[10px] font-bold text-orange-500 uppercase tracking-widest flex items-center gap-2"><Target size={14} /> Mission Plan</h2>
                                {isMissionOpen ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
                            </button>
                            {isMissionOpen && (
                                <div className="p-3 pt-0">
                                    <div className="mb-3 bg-zinc-950/50 p-2 rounded border border-zinc-800">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Start Point</div>
                                            <button onClick={toggleStartPointLock} className={`text-[10px] px-2 py-0.5 rounded border transition-colors font-bold ${isStartPointLocked ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-green-900/30 text-green-400 border-green-800'}`}>
                                                {isStartPointLocked ? 'LOCKED' : 'SET MODE'}
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between text-zinc-300 text-xs font-mono">
                                            {startPoint ? <span>X: {startPoint.x.toFixed(0)} <span className="text-zinc-600">|</span> Y: {startPoint.y.toFixed(0)}</span> : <span className="text-zinc-600 italic">Click map to set</span>}
                                            {startPoint && !isStartPointLocked && <button onClick={() => setStartPoint(null)} className="text-red-500 hover:bg-red-900/30 p-1 rounded"><RotateCcw size={12} /></button>}
                                        </div>
                                    </div>
                                    {/* Extract List */}
                                    <div>
                                        <div className="text-[10px] text-zinc-500 font-bold mb-2 uppercase tracking-wider">Select Exfil (Max 1)</div>
                                        {extracts.length > 0 ? (
                                            <div className="space-y-1">
                                                {extracts.map(ext => (
                                                    <button key={ext.id} onClick={() => toggleExtractSelection(ext.id)} className={`w-full text-left px-2 py-1.5 text-xs rounded border transition-all flex items-center justify-between group ${selectedExtracts.includes(ext.id) ? 'bg-orange-900/20 border-orange-500/30 text-orange-200' : 'bg-zinc-800/50 border-transparent text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'}`}>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full transition-colors ${selectedExtracts.includes(ext.id) ? 'bg-orange-500' : 'bg-zinc-600 group-hover:bg-zinc-500'}`} />
                                                            <span>{ext.name}</span>
                                                        </div>
                                                        {selectedExtracts.includes(ext.id) && <Milestone size={12} className="text-orange-500" />}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : <div className="text-zinc-600 text-[10px] italic p-2 text-center">No extract data</div>}
                                    </div>
                                    <button onClick={resetMission} className="w-full mt-3 flex items-center justify-center gap-2 py-1.5 text-[10px] font-bold text-zinc-500 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-600 rounded transition bg-zinc-900/50 hover:bg-zinc-800"><RotateCcw size={10} /> RESET PLAN</button>
                                </div>
                            )}
                        </div>


                        {/* 4. Mission Log (Manager) */}
                        <div className="border-b border-zinc-800">
                            <button onClick={() => setIsMissionLogOpen(!isMissionLogOpen)} className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors">
                                <h2 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2"><FolderOpen size={14} /> Mission Log <span className="text-zinc-600">({useMapStore.getState().savedMissions?.length || 0})</span></h2>
                                {isMissionLogOpen ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
                            </button>
                            {isMissionLogOpen && (
                                <div className="p-3 pt-0">
                                    {/* Save Form */}
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            placeholder="Mission Title (e.g. Woods Night Run)"
                                            className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:border-emerald-500 outline-none"
                                            value={missionTitle}
                                            onChange={(e) => setMissionTitle(e.target.value)}
                                        />
                                        <button onClick={handleSaveMission} className="p-1.5 bg-emerald-900/30 text-emerald-400 border border-emerald-800 rounded hover:bg-emerald-800 hover:text-white transition-colors">
                                            <Save size={14} />
                                        </button>
                                    </div>

                                    {/* List */}
                                    <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                                        {useMapStore.getState().savedMissions?.length > 0 ? (
                                            useMapStore.getState().savedMissions.map((m: any) => (
                                                <div key={m.id} className="group relative flex items-center justify-between p-2 bg-zinc-800/30 rounded border border-transparent hover:border-zinc-700 hover:bg-zinc-800/50 transition-all">
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="text-xs font-bold text-zinc-300 truncate">{m.title}</span>
                                                        <div className="flex items-center gap-2 text-[9px] text-zinc-500">
                                                            <span>{m.mapId}</span>
                                                            <span>•</span>
                                                            <span>{new Date(m.date).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleLoadMission(m)}
                                                            className="p-1 hover:bg-blue-900/30 hover:text-blue-400 rounded transition-colors"
                                                            title="Load Mission"
                                                        >
                                                            <FolderOpen size={12} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Delete this mission log?'))
                                                                    useMapStore.getState().deleteMission(m.id);
                                                            }}
                                                            className="p-1 hover:bg-red-900/30 hover:text-red-400 rounded transition-colors"
                                                            title="Delete Log"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 text-xs text-zinc-600 italic">No missions saved yet.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 5. Squad Link (P2P) */}
                        <div className="border-b border-zinc-800">
                            <button onClick={() => setIsSquadOpen(!isSquadOpen)} className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors">
                                <h2 className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${isConnected ? 'text-green-500' : 'text-zinc-500'}`}>
                                    <Radio size={14} className={isConnected ? 'animate-pulse' : ''} />
                                    Squad Link {isConnected && <span className="text-[9px] bg-green-900/50 px-1 rounded text-green-400">LIVE</span>}
                                </h2>
                                {isSquadOpen ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
                            </button>
                            {isSquadOpen && (
                                <div className="p-3 pt-0">
                                    {!isConnected ? (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Squad Code (e.g. ALPHA-1)"
                                                className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:border-green-500 outline-none uppercase font-mono"
                                                value={roomId}
                                                onChange={(e) => setRoomId(e.target.value)}
                                            />
                                            <button onClick={handleConnectSquad} className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-800 rounded hover:bg-green-800 hover:text-white transition-colors text-xs font-bold">
                                                JOIN
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between bg-zinc-950/50 px-2 py-1 rounded border border-zinc-800">
                                                <span className="text-xs font-mono text-zinc-300">CODE: <span className="text-green-400 font-bold">{currentRoomId}</span></span>
                                                <button onClick={handleDisconnectSquad} className="text-[10px] text-red-500 hover:text-red-400 underline decoration-red-900">Disconnect</button>
                                            </div>
                                            <div className="space-y-1 max-h-24 overflow-y-auto">
                                                <div className="text-[9px] text-zinc-500 font-bold uppercase">Active Operators ({users.length})</div>
                                                {users.map(u => (
                                                    <div key={u.clientId} className="flex items-center gap-2 text-xs text-zinc-300 px-1 py-0.5 rounded hover:bg-zinc-800/30">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: u.user.color }} />
                                                        <span>{u.user.name}</span>
                                                        {u.clientId === users.find(me => me.user.color === useSquadStore.getState().users.find(u => u.clientId === me.clientId)?.user.color)?.clientId && <span className="text-[9px] text-zinc-600">(You)</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Layers */}
                        <div className="border-b border-zinc-800">
                            <button onClick={() => setIsLayersOpen(!isLayersOpen)} className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors">
                                <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><MapIcon size={12} /> Layers</h2>
                                {isLayersOpen ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
                            </button>
                            {isLayersOpen && (
                                <div className="p-3 pt-0 space-y-1.5">
                                    <button onClick={toggleGrid} className={`w-full flex items-center justify-between px-2 py-1.5 rounded border transition-all ${showGrid ? 'bg-blue-900/20 border-blue-500/30 text-blue-200' : 'bg-zinc-800/50 border-transparent text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'}`}><div className="flex items-center gap-2"><Grid size={12} className={showGrid ? 'text-blue-500' : 'text-zinc-500'} /><span className="text-xs font-medium">Coordinate Grid</span></div></button>
                                    <button onClick={toggleExtracts} className={`w-full flex items-center justify-between px-2 py-1.5 rounded border transition-all ${showExtracts ? 'bg-green-900/20 border-green-500/30 text-green-200' : 'bg-zinc-800/50 border-transparent text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'}`}><div className="flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${showExtracts ? 'bg-green-500' : 'bg-zinc-600'}`} /><span className="text-xs font-medium">Show All Extracts</span></div></button>
                                    <button onClick={toggleBosses} className={`w-full flex items-center justify-between px-2 py-1.5 rounded border transition-all ${showBosses ? 'bg-red-900/20 border-red-500/30 text-red-200' : 'bg-zinc-800/50 border-transparent text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'}`}><div className="flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${showBosses ? 'bg-red-500' : 'bg-zinc-600'}`} /><span className="text-xs font-medium">Show Boss Spawns</span></div></button>
                                    <button onClick={toggleDrawings} className={`w-full flex items-center justify-between px-2 py-1.5 rounded border transition-all ${showDrawings ? 'bg-orange-900/20 border-orange-500/30 text-orange-200' : 'bg-zinc-800/50 border-transparent text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'}`}><div className="flex items-center gap-2"><PenTool size={12} className={showDrawings ? 'text-orange-500' : 'text-zinc-500'} /><span className="text-xs font-medium">Show Drawn Objects</span></div></button>
                                </div>
                            )}
                        </div>


                    </div>
                )}
                <SquadManager />
            </div>
        </Draggable>
    );
}
