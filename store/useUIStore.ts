import { create } from 'zustand';
import L from 'leaflet';

interface UIState {
    mapInstance: L.Map | null;
    isFullscreen: boolean;
    windowStack: string[];
    setMapInstance: (map: L.Map | null) => void;
    toggleFullscreen: (fullscreen: boolean) => void;
    registerWindow: (id: string) => void;
    unregisterWindow: (id: string) => void;
    focusWindow: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
    mapInstance: null,
    isFullscreen: false,
    windowStack: [],
    setMapInstance: (map) => set({ mapInstance: map }),
    toggleFullscreen: (fullscreen) => set({ isFullscreen: fullscreen }),
    registerWindow: (id) => set((state) => {
        if (state.windowStack.includes(id)) return state;
        return { windowStack: [...state.windowStack, id] };
    }),
    unregisterWindow: (id) => set((state) => ({
        windowStack: state.windowStack.filter((w) => w !== id)
    })),
    focusWindow: (id) => set((state) => {
        const stack = state.windowStack.filter((w) => w !== id);
        return { windowStack: [...stack, id] };
    }),
}));
