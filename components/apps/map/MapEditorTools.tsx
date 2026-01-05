'use client';

import { useMapStore } from '@/store/useMapStore';
import { PenTool, Save, Upload, Route, MapPin, AlertTriangle, Hand, Trash2 } from 'lucide-react';

interface MapEditorToolsProps {
    className?: string;
}

export default function MapEditorTools({ className }: MapEditorToolsProps) {
    const {
        isEditMode, drawType, mapFeatures, currentMap,
        setDrawType, setFeatures, setCurrentMap, clearFeatures, toggleEditMode
    } = useMapStore();

    const stopPropagation = (e: any) => e.stopPropagation();

    // Import/Export Logic
    const handleExportJson = () => {
        const exportData = { mapId: currentMap.id, version: 1, features: mapFeatures };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `tarkov_ops_${currentMap.id}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImportJson = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e: any) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const json = JSON.parse(event.target?.result as string);
                    if (json.mapId && json.features) {
                        if (json.mapId !== currentMap.id) {
                            const foundMap = useMapStore.getState().maps.find((m: any) => m.id === json.mapId);
                            if (foundMap) setCurrentMap(foundMap);
                        }
                        setFeatures(json.features);
                    }
                } catch (err) { alert('Invalid JSON'); }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    if (!currentMap) return null;

    return (
        <div
            className={`z-[1000] flex flex-col bg-zinc-900/95 rounded-lg shadow-xl border border-orange-500/50 backdrop-blur-sm overflow-hidden w-10 animate-in slide-in-from-left-2 duration-300 ${className ?? 'absolute top-40 left-4'}`}
            onMouseDown={stopPropagation} onClick={stopPropagation}
        >
            <button
                onClick={toggleEditMode}
                className={`p-1.5 w-full flex items-center justify-center border-b transition-colors ${isEditMode ? 'bg-orange-900/30 border-orange-500/30' : 'bg-zinc-900 border-zinc-700 hover:bg-zinc-800'}`}
                title={isEditMode ? "Collapse Tools" : "Expand Tools"}
            >
                <PenTool size={10} className={isEditMode ? "text-orange-500" : "text-zinc-500"} />
            </button>

            {isEditMode && (
                <div className="flex flex-col animate-in slide-in-from-top-2 duration-200">
                    <button
                        onClick={() => setDrawType('hand')}
                        title="Pan Mode (Hand)"
                        className={`p-2.5 transition flex justify-center ${drawType === 'hand' ? 'text-zinc-100 bg-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <Hand size={16} />
                    </button>

                    <button
                        onClick={() => setDrawType('path')}
                        title="Draw Path (Route)"
                        className={`p-2.5 transition flex justify-center ${drawType === 'path' ? 'text-yellow-400 bg-yellow-900/30' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <Route size={16} />
                    </button>

                    <button
                        onClick={() => setDrawType('marker')}
                        title="Place Marker (Loot, Key, Info)"
                        className={`p-2.5 transition flex justify-center ${drawType === 'marker' ? 'text-blue-400 bg-blue-900/30' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <MapPin size={16} />
                    </button>

                    <button
                        onClick={() => setDrawType('danger')}
                        title="Danger Zone"
                        className={`p-2.5 transition flex justify-center ${drawType === 'danger' ? 'text-red-400 bg-red-900/30' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <AlertTriangle size={16} />
                    </button>
                    <div className="h-[1px] bg-zinc-800 my-0.5 mx-2" />
                    <button
                        onClick={() => {
                            if (confirm('Clear all drawings? This cannot be undone.')) clearFeatures();
                        }}
                        title="Clear All Drawings"
                        className="p-2.5 text-red-500 hover:text-red-400 hover:bg-red-900/20 transition flex justify-center"
                    >
                        <Trash2 size={14} />
                    </button>
                    <div className="h-[1px] bg-zinc-800 my-0.5 mx-2" />
                    <button onClick={handleExportJson} className="p-2.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition flex justify-center"><Save size={14} /></button>
                    <button onClick={handleImportJson} className="p-2.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition flex justify-center"><Upload size={14} /></button>
                </div>
            )}
        </div>
    );
}
