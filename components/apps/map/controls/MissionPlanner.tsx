import React, { useState } from 'react';
import { useMissionStore } from '@/store/useMissionStore';
import { useEditorStore } from '@/store/useEditorStore';
import { useMapStore } from '@/store/useMapStore';
import { Target, ChevronDown, ChevronRight, RotateCcw, Milestone } from 'lucide-react';

export default function MissionPlanner() {
    const {
        startPoint, selectedExtracts, isStartPointLocked,
        setStartPoint, toggleStartPointLock, toggleExtractSelection, resetMission
    } = useMissionStore();
    const { mapFeatures } = useEditorStore();
    const { currentMap } = useMapStore();
    const [isMissionOpen, setIsMissionOpen] = useState(false);

    const customExtracts = mapFeatures
        .filter(f => f.type === 'marker' && f.subType === 'exit')
        .map(f => ({
            id: f.id,
            mapId: currentMap.id,
            name: f.comment || 'Custom Exit',
            type: 'Extract',
            subType: 'Custom',
            x: (f.geometry as { coordinates: number[] }).coordinates[0],
            y: (f.geometry as { coordinates: number[] }).coordinates[1]
        }));

    const extracts = [...customExtracts];

    return (
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
    );
}
