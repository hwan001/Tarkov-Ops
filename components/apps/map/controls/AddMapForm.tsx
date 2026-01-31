import React, { useState } from 'react';
import { useMapStore } from '@/store/useMapStore';
import { Plus } from 'lucide-react';

export function AddMapForm({ onClose }: { onClose: () => void }) {
    const { addMap, setCurrentMap } = useMapStore();
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState<'image' | 'tile'>('image');
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');

    const [width] = useState<number | ''>('');
    const [height] = useState<number | ''>('');
    const [tileSize, setTileSize] = useState<number>(256);
    const [range, setRange] = useState<number>(1);

    const parseOsmUrl = (inputUrl: string) => {
        const osmPattern = /#map=(\d+(?:\.\d+)?)\/(-?\d+\.\d+)\/(-?\d+\.\d+)/;
        const match = inputUrl.match(osmPattern);
        if (match) {
            const z = Math.round(parseFloat(match[1]));
            const lat = parseFloat(match[2]);
            const lon = parseFloat(match[3]);
            const x = Math.floor(((lon + 180) / 360) * Math.pow(2, z));
            const y = Math.floor(((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * Math.pow(2, z));
            return { z, x, y };
        }
        return null;
    };

    const handleSubmit = () => {
        if (!name || !url) return;

        if (type === 'tile') {
            const coords = parseOsmUrl(url);
            if (!coords) {
                alert("OSM URL 형식이 올바르지 않습니다.");
                return;
            }

            const sideCount = (range * 2 + 1);

            const newMap = {
                id: `tile-${Date.now()}`,
                name,
                type: 'tile' as const,
                tileGrid: {
                    base: coords,
                    range: range,
                    sideCount: sideCount
                },
                tileSize,
                width: sideCount * tileSize,
                height: sideCount * tileSize,
            };

            addMap(newMap);
            setCurrentMap(newMap);
        } else {
            const newMap = {
                id: `custom-${Date.now()}`,
                name,
                type: 'image' as const,
                imageUrl: url,
                width: Number(width) || 2000,
                height: Number(height) || 2000,
            };
            addMap(newMap);
            setCurrentMap(newMap);
        }
        onClose();
    };

    const handleUrlChange = (value: string) => {
        setUrl(value);
        if (type === 'tile' && !name && value.includes('openstreetmap.org')) {
            setName('OSM Custom Area');
        }
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
            <input type="text" placeholder="Map Name" className="w-full bg-black/40 border border-zinc-700 rounded px-2 py-1 text-xs text-white outline-none" value={name} onChange={e => setName(e.target.value)} />

            <div className="flex bg-black/40 rounded p-0.5 border border-zinc-700">
                <button onClick={() => setType('image')} className={`flex-1 text-[10px] font-bold py-1 rounded ${type === 'image' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500'}`}>IMAGE</button>
                <button onClick={() => setType('tile')} className={`flex-1 text-[10px] font-bold py-1 rounded ${type === 'tile' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500'}`}>TILE GRID</button>
            </div>

            <input type="text" placeholder={type === 'image' ? "Image URL" : "Paste OSM URL (e.g. https://www.openstreetmap.org/#map=...)"} className="w-full bg-black/40 border border-zinc-700 rounded px-2 py-1 text-xs text-white font-mono outline-none" value={url} onChange={e => handleUrlChange(e.target.value)} />

            {type === 'tile' && (
                <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                        <div className="text-[9px] text-zinc-500 font-bold uppercase">Range (n*n)</div>
                        <select className="w-full bg-black/40 border border-zinc-700 rounded px-1 py-1 text-xs text-white" value={range} onChange={e => setRange(Number(e.target.value))}>
                            <option value={0}>1x1</option>
                            <option value={1}>3x3</option>
                            <option value={2}>5x5</option>
                            <option value={3}>7x7</option>
                        </select>
                    </div>
                    <div className="flex-1 space-y-1">
                        <div className="text-[9px] text-zinc-500 font-bold uppercase">Tile Size</div>
                        <div className="flex gap-1">
                            {[256, 512].map(s => (
                                <button key={s} onClick={() => setTileSize(s)} className={`flex-1 py-1 text-[10px] rounded border ${tileSize === s ? 'bg-blue-600 border-blue-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>{s}</button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-2 pt-1">
                <button onClick={() => setIsOpen(false)} className="flex-1 py-1 text-xs font-bold text-zinc-500 hover:bg-zinc-800 rounded">Cancel</button>
                <button onClick={handleSubmit} className="flex-1 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded shadow-lg">Add & Load</button>
            </div>
        </div>
    );
}