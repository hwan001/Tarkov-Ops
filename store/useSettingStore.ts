import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingState {
    wallpaperSrc: string;
    wallpapers: string[];
    appIcon: {
        src : string;
        position: { x: number, y: number };
        isOpen: boolean;
    }[];
    network: {
        connectionMode: 'p2p' | 'server';
        // P2P Settings
        p2pSignalingUrls: string[];
        p2pIceServers: string[];
        // Server Settings
        webSocketServerUrl: string; 
    }
    setWallpaperSrc: (src: string) => void;
    addWallpaperSrc: (src: string) => void;
    setAppIcon: (icons: any[]) => void;
    setNetwork: (net: Partial<SettingState['network']>) => void;
}


export const useSettingStore = create<SettingState>()(
    persist(
        (set) => ({
            wallpaperSrc: 'https://i.imgur.com/v7rLSp1.jpeg',
            wallpapers: ['https://i.imgur.com/v7rLSp1.jpeg'],
            appIcon: [],
            network: {
                connectionMode: 'p2p',
                p2pSignalingUrls: ['wss://y-webrtc-signaling-eu.herokuapp.com', 'wss://y-webrtc-signaling-us.herokuapp.com'],
                p2pIceServers: ['stun:stun.l.google.com:19302', 'stun:global.stun.twilio.com:3478'],
                webSocketServerUrl: 'ws://localhost:1234'
            },
            setWallpaperSrc: (wallpaperSrc: string) => set({ wallpaperSrc: wallpaperSrc }),
            addWallpaperSrc: (src: string) => set((state) => ({ wallpapers: [...state.wallpapers, src] })),
            setAppIcon: (appIcon: { src: string; position: { x: number, y: number }; isOpen: boolean }[]) => set({ appIcon }),
            setNetwork: (networkUpdate) => set((state) => ({ 
                network: { ...state.network, ...networkUpdate } 
            })),
        }),
        {
            name: 'tarkov-ops-settings',
            partialize: (state) => ({ wallpaperSrc: state.wallpaperSrc, network: state.network }), // Only persist these
        }
    )
);