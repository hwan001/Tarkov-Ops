'use client';

import { useState, useEffect } from 'react';
import { Settings, User, Network, Monitor, RefreshCw, Trash2, Save } from 'lucide-react';
import { useSquadStore } from '@/store/useSquadStore';
import { useSettingStore } from '@/store/useSettingStore';
import StatusIndicator, { StatusType } from '@/components/common/StatusIndicator';
import WindowFrame from '@/components/common/WindowFrame';

interface SettingsWindowProps {
    isOpen: boolean;
    onClose: () => void;
}

type TabType = 'general' | 'network' | 'system';

export default function SettingsWindow({ isOpen, onClose }: SettingsWindowProps) {
    const [activeTab, setActiveTab] = useState<TabType>('general');

    const wallpaperSrc = useSettingStore((state) => state.wallpaperSrc);
    const wallpapers = useSettingStore((state) => state.wallpapers);
    const setWallpaperSrc = useSettingStore((state) => state.setWallpaperSrc);
    const addWallpaperSrc = useSettingStore((state) => state.addWallpaperSrc);

    // Network Settings
    const network = useSettingStore((state) => state.network);
    const setNetwork = useSettingStore((state) => state.setNetwork);

    const updateNetwork = (updates: any) => {
        setNetwork(updates);
    };

    // Store State
    const { nickname } = useSquadStore();

    // Local State for forms
    const [localNick, setLocalNick] = useState(nickname);
    const [localApiKey, setLocalApiKey] = useState('');

    // Testing State
    const [testStatus, setTestStatus] = useState<StatusType>('idle');
    const [testMessage, setTestMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            setLocalNick(nickname);
            const saved = localStorage.getItem('tarkov_ops_auth');
            if (saved) {
                try {
                    const creds = JSON.parse(saved);
                    setLocalApiKey(creds.apiKey || '');
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }, [isOpen, nickname]);

    const handleSaveGeneral = () => {
        useSquadStore.setState({ nickname: localNick });

        // Update LocalStorage
        const saved = localStorage.getItem('tarkov_ops_auth');
        let creds = saved ? JSON.parse(saved) : {};
        creds.callsign = localNick;
        creds.apiKey = localApiKey;
        localStorage.setItem('tarkov_ops_auth', JSON.stringify(creds));

        alert('Settings Saved');
    };

    const handleClearData = () => {
        if (confirm('CAUTION: This will wipe all local data including map drawings and authentication. Continue?')) {
            localStorage.clear();
            location.reload();
        }
    };

    // Test Connection Logic
    const handleTestConnection = async () => {
        setTestStatus('loading');
        setTestMessage('Initializing connection probe...');

        const mode = network.connectionMode;

        try {
            if (mode === 'server') {
                const url = network.webSocketServerUrl;
                if (!url) throw new Error('No WebSocket URL provided');

                setTestMessage(`Connecting to ${url}...`);

                await new Promise<void>((resolve, reject) => {
                    const ws = new WebSocket(url);
                    const timeout = setTimeout(() => {
                        ws.close();
                        reject(new Error('Connection timed out'));
                    }, 5000);

                    ws.onopen = () => {
                        clearTimeout(timeout);
                        ws.close();
                        resolve();
                    };

                    ws.onerror = () => {
                        clearTimeout(timeout);
                        reject(new Error('Connection refused'));
                    };
                });

                setTestStatus('success');
                setTestMessage('Successfully reached Dedicated Server.');

            } else {
                // P2P Mode check
                // Check if we can reach signaling servers
                const urls = network.p2pSignalingUrls?.length
                    ? network.p2pSignalingUrls
                    : ['wss://y-webrtc-signaling-eu.herokuapp.com', 'wss://y-webrtc-signaling-us.herokuapp.com'];

                setTestMessage(`Probing ${urls.length} signaling servers...`);

                let successCount = 0;

                // Try reaching at least one
                const results = await Promise.allSettled(urls.map(url => {
                    return new Promise<void>((resolve, reject) => {
                        try {
                            const ws = new WebSocket(url);
                            const timeout = setTimeout(() => {
                                ws.close();
                                reject(new Error('Timeout'));
                            }, 3000);

                            ws.onopen = () => {
                                clearTimeout(timeout);
                                ws.close();
                                resolve();
                            };
                            ws.onerror = () => reject(new Error('Error'));
                        } catch (e) { reject(e); }
                    });
                }));

                const connected = results.filter(r => r.status === 'fulfilled').length;

                if (connected > 0) {
                    setTestStatus('success');
                    setTestMessage(`Connected to ${connected}/${urls.length} signaling servers.`);
                } else {
                    throw new Error('Unreachable');
                }
            }
        } catch (err: any) {
            console.error(err);
            setTestStatus('error');
            setTestMessage(`Connection Failed: ${err.message || 'Unknown Error'}`);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase mb-2 border-b border-zinc-800 pb-1">User Profile</h3>

                        <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400">Callsign</label>
                            <input
                                type="text"
                                value={localNick}
                                onChange={(e) => setLocalNick(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:border-emerald-500 outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400">API Key</label>
                            <input
                                type="password"
                                value={localApiKey}
                                onChange={(e) => setLocalApiKey(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:border-emerald-500 outline-none font-mono"
                            />
                        </div>

                        <button
                            onClick={handleSaveGeneral}
                            className="w-full mt-4 flex items-center justify-center gap-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition-colors border border-zinc-700"
                        >
                            <Save size={12} /> Save Changes
                        </button>
                    </div>
                );
            case 'network':
                return (
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase mb-2 border-b border-zinc-800 pb-1">Connection Mode</h3>

                        <div className="space-y-2">
                            <label className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-all ${network.connectionMode === 'p2p' ? 'bg-emerald-900/20 border-emerald-500' : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-800'}`}>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="netmode"
                                        checked={network.connectionMode === 'p2p'}
                                        onChange={() => updateNetwork({ connectionMode: 'p2p' })}
                                        className="accent-emerald-500"
                                    />
                                    <div className="text-xs">
                                        <div className="font-bold text-zinc-200">P2P (Serverless)</div>
                                        <div className="text-[10px] text-zinc-500">Fast, local only, no setup required.</div>
                                    </div>
                                </div>
                            </label>

                            <label className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-all ${network.connectionMode === 'server' ? 'bg-blue-900/20 border-blue-500' : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-800'}`}>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="netmode"
                                        checked={network.connectionMode === 'server'}
                                        onChange={() => updateNetwork({ connectionMode: 'server' })}
                                        className="accent-blue-500"
                                    />
                                    <div className="text-xs">
                                        <div className="font-bold text-zinc-200">Dedicated Server</div>
                                        <div className="text-[10px] text-zinc-500">Stable, cross-network, requires Docker.</div>
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Detailed Configuration */}
                        <h3 className="text-xs font-bold text-zinc-500 uppercase mt-6 mb-2 border-b border-zinc-800 pb-1">Configuration</h3>

                        {network.connectionMode === 'p2p' ? (
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-zinc-400">Signaling Servers (One per line)</label>
                                    <textarea
                                        value={network.p2pSignalingUrls?.join('\n') || ''}
                                        onChange={(e) => updateNetwork({ p2pSignalingUrls: e.target.value.split('\n').filter(l => l.trim()) })}
                                        className="w-full h-20 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:border-emerald-500 outline-none font-mono"
                                        placeholder="wss://y-webrtc-signaling-eu.herokuapp.com"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-zinc-400">ICE Servers (STUN/TURN, One per line)</label>
                                    <textarea
                                        value={network.p2pIceServers?.join('\n') || ''}
                                        onChange={(e) => updateNetwork({ p2pIceServers: e.target.value.split('\n').filter(l => l.trim()) })}
                                        className="w-full h-20 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:border-emerald-500 outline-none font-mono"
                                        placeholder="stun:stun.l.google.com:19302"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-zinc-400">WebSocket URL</label>
                                    <input
                                        type="text"
                                        value={network.webSocketServerUrl || ''}
                                        onChange={(e) => updateNetwork({ webSocketServerUrl: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:border-blue-500 outline-none font-mono"
                                        placeholder="ws://localhost:1234"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Test Connection Button */}
                        <div className="space-y-2 mt-4">
                            <button
                                onClick={handleTestConnection}
                                disabled={testStatus === 'loading'}
                                className="w-full flex items-center justify-center gap-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 rounded text-xs transition-colors border border-zinc-700"
                            >
                                <Network size={12} />
                                {testStatus === 'loading' ? 'Testing...' : 'Test Connection'}
                            </button>

                            <StatusIndicator status={testStatus} message={testMessage} />
                        </div>

                    </div>
                );
            case 'system':
                return (
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase mb-2 border-b border-zinc-800 pb-1">Appearance</h3>

                        <div className="space-y-2 mb-6">
                            <label className="text-[10px] text-zinc-400">Wallpaper URL</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={wallpaperSrc}
                                    onChange={(e) => setWallpaperSrc(e.target.value)}
                                    placeholder="Enter image URL..."
                                    className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:border-emerald-500 outline-none"
                                />
                                <button
                                    onClick={() => wallpaperSrc && addWallpaperSrc(wallpaperSrc)}
                                    className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition-colors border border-zinc-700"
                                >
                                    Add
                                </button>
                            </div>
                            <select
                                value={wallpapers.includes(wallpaperSrc) ? wallpaperSrc : ""}
                                onChange={(e) => setWallpaperSrc(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:border-emerald-500 outline-none"
                            >
                                <option value="" disabled>Select from presets...</option>
                                {wallpapers.map((wp: string) => (
                                    <option key={wp} value={wp}>
                                        {wp}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <h3 className="text-xs font-bold text-zinc-500 uppercase mb-2 border-b border-zinc-800 pb-1">Danger Zone</h3>


                        <button
                            onClick={() => location.reload()}
                            className="w-full flex items-center justify-start gap-2 p-2 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors text-xs"
                        >
                            <RefreshCw size={14} className="text-blue-500" />
                            <span>Reboot System (Reload)</span>
                        </button>

                        <button
                            onClick={handleClearData}
                            className="w-full flex items-center justify-start gap-2 p-2 rounded hover:bg-red-900/20 text-zinc-400 hover:text-red-400 transition-colors text-xs"
                        >
                            <Trash2 size={14} className="text-red-500" />
                            <span>Factory Reset (Clear Data)</span>
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <WindowFrame
            windowId="settings"
            title="System Configuration"
            icon={Settings}
            isOpen={isOpen}
            onClose={onClose}
            defaultWidth={400}
            defaultHeight={500}
            contentClassName="flex flex-row h-full"
        >
            {/* Sidebar Tabs */}
            <div className="w-16 bg-zinc-950 flex flex-col border-r border-zinc-800 pt-2 shrink-0">
                <TabButton
                    active={activeTab === 'general'}
                    onClick={() => setActiveTab('general')}
                    icon={User}
                    label="General"
                />
                <TabButton
                    active={activeTab === 'network'}
                    onClick={() => setActiveTab('network')}
                    icon={Network}
                    label="Net"
                />
                <TabButton
                    active={activeTab === 'system'}
                    onClick={() => setActiveTab('system')}
                    icon={Monitor}
                    label="System"
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-zinc-900 p-4 overflow-y-auto custom-scrollbar">
                {renderContent()}
            </div>
        </WindowFrame>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex flex-col items-center justify-center p-2 gap-1 transition-colors ${active ? 'text-emerald-500 bg-zinc-900' : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900/50'}`}
        >
            <Icon size={16} />
            <span className="text-[9px] font-bold uppercase">{label}</span>
        </button>
    );
}