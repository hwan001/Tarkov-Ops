import React, { useState } from 'react';
import { useMapStore } from '@/store/useMapStore';
import { Globe, ChevronDown, Info, Trash2 } from 'lucide-react';
import { AddMapForm } from './AddMapForm';

export default function MapSelector() {
    const { maps, currentMap, setCurrentMap, removeMap } = useMapStore();
    const [isMapListOpen, setIsMapListOpen] = useState(false);

    return (
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
    );
}
