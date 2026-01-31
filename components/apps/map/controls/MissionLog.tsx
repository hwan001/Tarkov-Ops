import React, { useState } from 'react';
import { useMissionStore, SavedMission } from '@/store/useMissionStore';
import { useMapStore } from '@/store/useMapStore';
import { useEditorStore } from '@/store/useEditorStore';
import { FolderOpen, ChevronDown, ChevronRight, Save, Trash2 } from 'lucide-react';

export default function MissionLog() {
    const {
        savedMissions, saveMission, deleteMission,
        startPoint, selectedExtracts, isStartPointLocked,
        setStartPoint, resetMission, toggleExtractSelection
    } = useMissionStore();
    const { mapFeatures, setFeatures } = useEditorStore();
    const { currentMap, maps, setCurrentMap, addMap } = useMapStore();

    const [isMissionLogOpen, setIsMissionLogOpen] = useState(false);
    const [missionTitle, setMissionTitle] = useState('');

    const handleSaveMission = () => {
        if (!missionTitle.trim()) return alert("Please enter a mission title.");
        const missionId = `mission-${Date.now()}`;

        saveMission({
            id: missionId,
            title: missionTitle,
            mapId: currentMap.id,
            date: Date.now(),
            data: {
                startPoint,
                selectedExtracts,
                mapFeatures,
                isStartPointLocked,
                customMapData: currentMap.type === 'image' && currentMap.id.startsWith('custom-') ? currentMap : undefined
            }
        });
        setMissionTitle('');
        alert("Mission Saved to Log!");
    };

    const handleLoadMission = (mission: SavedMission) => {
        if (confirm(`Load Mission: "${mission.title}"? Unsaved progress will be lost.`)) {
            // 1. Restore Map
            if (mission.data.customMapData) {
                addMap(mission.data.customMapData);
                setCurrentMap(mission.data.customMapData);
            } else {
                const targetMap = maps.find(m => m.id === mission.mapId);
                if (targetMap) setCurrentMap(targetMap);
            }

            // 2. Restore Mission Data
            setStartPoint(mission.data.startPoint);
            resetMission(); // clear first
            if (mission.data.startPoint) setStartPoint(mission.data.startPoint); // set again

            // Restore extracts
            mission.data.selectedExtracts.forEach((id: string) => toggleExtractSelection(id));

            // 3. Restore Drawings
            setFeatures(mission.data.mapFeatures);
        }
    };

    return (
        <div className="border-b border-zinc-800">
            <button onClick={() => setIsMissionLogOpen(!isMissionLogOpen)} className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors">
                <h2 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2"><FolderOpen size={14} /> Mission Log <span className="text-zinc-600">({savedMissions?.length || 0})</span></h2>
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
                        {savedMissions?.length > 0 ? (
                            savedMissions.map((m: SavedMission) => (
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
                                                    deleteMission(m.id);
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
    );
}
