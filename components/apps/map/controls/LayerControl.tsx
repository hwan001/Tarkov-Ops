import React, { useState } from 'react';
import { useMapStore } from '@/store/useMapStore';
import { useEditorStore } from '@/store/useEditorStore';
import { Map as MapIcon, ChevronDown, ChevronRight, Grid, PenTool } from 'lucide-react';

export default function LayerControl() {
    const {
        showExtracts, showBosses, showGrid,
        toggleExtracts, toggleBosses, toggleGrid
    } = useMapStore();
    const { showDrawings, toggleDrawings } = useEditorStore();
    const [isLayersOpen, setIsLayersOpen] = useState(false);

    return (
        <div className="border-b border-zinc-800">
            <button
                onClick={() => setIsLayersOpen(!isLayersOpen)}
                className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors"
            >
                <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <MapIcon size={12} /> Layers
                </h2>
                {isLayersOpen ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
            </button>

            {isLayersOpen && (
                <div className="p-3 pt-0 space-y-1.5">
                    {/* MGRS Grid Toggle */}
                    <button
                        onClick={toggleGrid}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded border transition-all ${showGrid
                            ? 'bg-amber-900/20 border-amber-500/30 text-amber-200'
                            : 'bg-zinc-800/50 border-transparent text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Grid size={12} className={showGrid ? 'text-amber-500' : 'text-zinc-500'} />
                            <span className="text-xs font-medium">MGRS Grid System</span>
                        </div>
                    </button>

                    {/* Show Extracts */}
                    <button
                        onClick={toggleExtracts}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded border transition-all ${showExtracts
                            ? 'bg-green-900/20 border-green-500/30 text-green-200'
                            : 'bg-zinc-800/50 border-transparent text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${showExtracts ? 'bg-green-500' : 'bg-zinc-600'}`} />
                            <span className="text-xs font-medium">Show All Extracts</span>
                        </div>
                    </button>

                    {/* Show Boss Spawns */}
                    <button
                        onClick={toggleBosses}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded border transition-all ${showBosses
                            ? 'bg-red-900/20 border-red-500/30 text-red-200'
                            : 'bg-zinc-800/50 border-transparent text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${showBosses ? 'bg-red-500' : 'bg-zinc-600'}`} />
                            <span className="text-xs font-medium">Show Boss Spawns</span>
                        </div>
                    </button>

                    {/* Show Drawings */}
                    <button
                        onClick={toggleDrawings}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded border transition-all ${showDrawings
                            ? 'bg-orange-900/20 border-orange-500/30 text-orange-200'
                            : 'bg-zinc-800/50 border-transparent text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <PenTool size={12} className={showDrawings ? 'text-orange-500' : 'text-zinc-500'} />
                            <span className="text-xs font-medium">Show Drawn Objects</span>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
}
