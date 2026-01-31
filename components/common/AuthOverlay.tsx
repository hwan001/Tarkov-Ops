'use client';

import { useState } from 'react';
import { Shield, Key, Terminal, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface AuthCredentials {
    apiKey: string;
    callsign: string;
}

interface AuthOverlayProps {
    onLogin?: (creds: AuthCredentials) => void;
}

export default function AuthOverlay({ onLogin }: AuthOverlayProps) {
    const [inputApiKey, setInputApiKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const setAuth = useAuthStore((state) => state.setAuth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // const authResult = await checkAuth(inputApiKey); 
        const authResult = { valid: true, username: 'Operator', error: null };

        if (authResult.valid && authResult.username) {
            setAuth(inputApiKey, authResult.username);

            setTimeout(() => {
                if (onLogin) {
                    onLogin({ apiKey: inputApiKey, callsign: authResult.username! });
                }
                setLoading(false);
            }, 500);
        } else {
            setError(authResult.error || 'Unknown Error');
            setLoading(false);
        }
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
                        <p className="text-xs text-zinc-500 font-mono">AUTHORIZED PERSONNEL ONLY</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Key size={10} /> Secure API Key
                        </label>
                        <input
                            type="password"
                            value={inputApiKey}
                            onChange={(e) => {
                                setInputApiKey(e.target.value);
                                if (error) setError(null);
                            }}
                            className={`w-full bg-zinc-950/50 border rounded p-2 text-sm text-white outline-none transition-colors font-mono placeholder:text-zinc-700 ${error ? 'border-red-500 focus:border-red-500' : 'border-zinc-700 focus:border-cyan-500'
                                }`}
                            placeholder="Paste your TarkovTracker API Token"
                            autoFocus
                        />
                        <div className="flex justify-between items-start">
                            <p className="text-[9px] text-zinc-600 italic">* Settings {'>'} API Tokens {'>'} Create Token</p>
                            {error && (
                                <p className="text-[10px] text-red-400 font-bold flex items-center gap-1 animate-pulse">
                                    <AlertCircle size={10} /> {error}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || !inputApiKey}
                            className={`w-full py-2 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>ESTABLISHING LINK...</span>
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