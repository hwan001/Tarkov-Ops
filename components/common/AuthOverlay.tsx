'use client';

import { useState, useEffect } from 'react';
import { Shield, Key, Terminal } from 'lucide-react';

interface AuthCredentials {
    apiKey: string;
    callsign: string;
}

interface AuthOverlayProps {
    onLogin: (creds: AuthCredentials) => void;
}

export default function AuthOverlay({ onLogin }: AuthOverlayProps) {
    const [apiKey, setApiKey] = useState('');
    const [callsign, setCallsign] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('tarkov_ops_auth');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setApiKey(parsed.apiKey);
                setCallsign(parsed.callsign);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (_) { /* ignore */ }
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Fake verification delay
        setTimeout(() => {
            const creds = { apiKey, callsign: callsign || 'Operator' };
            localStorage.setItem('tarkov_ops_auth', JSON.stringify(creds));
            onLogin(creds);
            setLoading(false);
        }, 800);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-zinc-900/90 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-zinc-950/50 p-6 border-b border-zinc-800 flex items-center gap-3">
                    <div className="p-2 bg-cyan-900/20 rounded border border-cyan-900/50">
                        <Terminal size={24} className="text-cyan-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-cyan-700 tracking-wider">Terra Group secure shell</h2>
                        {/* <h2 className="text-lg font-bold text-emerald-700 tracking-wider">Access control</h2> */}
                        <p className="text-xs text-zinc-500 font-mono">AUTHORIZED PERSONNEL ONLY</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <User size={10} /> Operator Callsign
                        </label>
                        <input
                            type="text"
                            value={callsign}
                            onChange={(e) => setCallsign(e.target.value)}
                            className="w-full bg-zinc-950/50 border border-zinc-700 rounded p-2 text-sm text-white focus:border-emerald-500 outline-none transition-colors font-mono placeholder:text-zinc-700"
                            placeholder="OPERATOR_NAME"
                            autoFocus
                        />
                    </div> */}

                    <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Key size={10} /> Secure API Key
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full bg-zinc-950/50 border border-zinc-700 rounded p-2 text-sm text-white focus:border-cyan-500 outline-none transition-colors font-mono placeholder:text-zinc-700"
                            placeholder="••••••••••••••"
                        />
                        <p className="text-[9px] text-zinc-600 italic text-right">* Internal access only</p>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-2 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>VERIFYING...</span>
                                </>
                            ) : (
                                <>
                                    <Shield size={16} />
                                    <span>INITIALIZE UPLINK</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer Decor */}
                <div className="bg-zinc-950 h-2 w-full flex">
                    <div className="flex-1 bg-red-900/20" />
                    <div className="flex-1 bg-yellow-900/20" />
                    <div className="flex-1 bg-emerald-900/20" />
                </div>
            </div>
        </div>
    );
}
