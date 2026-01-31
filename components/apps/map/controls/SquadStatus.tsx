import React, { useState, useEffect } from 'react';
import { useSquadStore } from '@/store/useSquadStore';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Radio, ChevronDown, ChevronRight } from 'lucide-react';

export default function SquadStatus() {
    const [isSquadOpen, setIsSquadOpen] = useState(false);
    const [roomId, setRoomId] = useState('');
    const { isConnected, users, connect, disconnect, roomId: currentRoomId } = useSquadStore();

    // URL Sync
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Auto-connect from URL
    useEffect(() => {
        const room = searchParams.get('room');
        if (room && !isConnected) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setRoomId(room);
            connect(room, `Operator-${Math.floor(Math.random() * 100)}`);
            setIsSquadOpen(true);
        }
    }, [searchParams, isConnected, connect]);

    // Update URL on connect/disconnect
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
    }, [isConnected, currentRoomId, pathname, router, searchParams]);

    const handleConnectSquad = () => {
        if (!roomId.trim()) return alert("Enter a Squad Code");
        connect(roomId, `Operator-${Math.floor(Math.random() * 100)}`); // Random ID for now
    };

    const handleDisconnectSquad = () => {
        if (confirm("Disconnect from Squad?")) disconnect();
    };

    return (
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
                                        {/* Simple check for 'You' - can be improved with a proper ID check if available in store */}
                                        {u.clientId === users[users.length - 1]?.clientId && <span className="text-[9px] text-zinc-600">(You)</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
