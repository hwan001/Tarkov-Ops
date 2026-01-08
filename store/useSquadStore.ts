import { create } from 'zustand';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { WebrtcProvider } from 'y-webrtc';

interface UserAwareness {
    clientId: number;
    user: {
        name: string;
        color: string;
        point: { x: number, y: number } | null;
    }
}

type ConnectionMode = 'p2p' | 'server';

interface SquadState {
    isConnected: boolean;
    connectionMode: ConnectionMode;
    roomId: string | null;
    nickname: string;
    users: UserAwareness[];
    ydoc: Y.Doc | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provider: any | null;

    // Actions
    setConnectionMode: (mode: ConnectionMode) => void;
    connect: (roomId: string, nickname: string) => void;
    disconnect: () => void;
    updateCursor: (point: { x: number, y: number } | null) => void;
}

const COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff', '#ffa500', '#800080'];

import { useSettingStore } from './useSettingStore';

export const useSquadStore = create<SquadState>((set, get) => ({
    isConnected: false,
    connectionMode: 'p2p', // Default to P2P as requested
    roomId: null,
    nickname: 'Operator',
    users: [],
    ydoc: null,
    provider: null,

    setConnectionMode: (mode) => set({ connectionMode: mode }),

    connect: (roomId, nickname) => {
        const { provider: oldProvider } = get();
        if (oldProvider) oldProvider.destroy();

        // Get Network Config from SettingStore
        const { network } = useSettingStore.getState();
        const connectionMode = network.connectionMode;

        // Sync local state mode with setting store mode (just in case)
        set({ connectionMode });

        const ydoc = new Y.Doc();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let provider: any;

        if (connectionMode === 'server') {
             const wsUrl = network.webSocketServerUrl || 'ws://localhost:1234';
             console.log(`Connecting via WebSocket: ${wsUrl}`);
             provider = new WebsocketProvider(wsUrl, roomId, ydoc);
        } else {
             console.log(`Connecting via WebRTC (P2P)`);
             const signaling = network.p2pSignalingUrls && network.p2pSignalingUrls.length > 0 
                ? network.p2pSignalingUrls 
                : ['wss://y-webrtc-signaling-eu.herokuapp.com', 'wss://y-webrtc-signaling-us.herokuapp.com'];
             
             const iceServers = network.p2pIceServers && network.p2pIceServers.length > 0
                ? network.p2pIceServers.map(url => ({ urls: [url] })) // Map string array to object structure
                : [{ urls: ['stun:stun.l.google.com:19302', 'stun:global.stun.twilio.com:3478'] }];

             provider = new WebrtcProvider(roomId, ydoc, {
                signaling,
                peerOpts: {
                    config: {
                        iceServers
                    }
                }
            });
        }

        // Awareness (Cursors)
        const awareness = provider.awareness;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        
        awareness.setLocalState({
            name: nickname,
            color: color,
            point: null
        });

        // Force initial update to show self
        const updateUsers = () => {
             const states = new Map(awareness.getStates());
             const userList: UserAwareness[] = [];
             
             for (const [key, value] of states) {
                 userList.push({ 
                     clientId: Number(key), 
                     user: value as { name: string; color: string; point: { x: number; y: number } | null } 
                 });
             }
             
            set({ users: userList });
        };
        updateUsers();

        awareness.on('change', updateUsers);

        // Connection Handling
        provider.on('status', (event: { status: string }) => {
            console.log('Squad Link Status:', event.status);
            set({ isConnected: event.status === 'connected' });
        });
        
        provider.on('sync', (isSynced: boolean) => {
            console.log('Squad Link Synced:', isSynced);
        });

        // Do not set isConnected: true manually. Wait for status.
        set({ roomId, nickname, ydoc, provider });
    },

    disconnect: () => {
        const { provider, ydoc } = get();
        if (provider) provider.destroy();
        if (ydoc) ydoc.destroy();
        set({ isConnected: false, roomId: null, users: [], ydoc: null, provider: null });
    },

    updateCursor: (point) => {
        const { provider } = get();
        if (!provider) return;
        provider.awareness.setLocalStateField('point', point);
    }
}));
