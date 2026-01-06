import { create } from 'zustand';
import L from 'leaflet';

// 개별 윈도우의 상태 타입 정의
export interface WindowState {
    x: number;
    y: number;
    width: number;
    height: number;
    isMaximized: boolean;
    isMinimized: boolean;
}

interface UIState {
    // Global Map State
    mapInstance: L.Map | null;
    setMapInstance: (map: L.Map | null) => void;

    // Global UI State
    isFullscreen: boolean;
    toggleFullscreen: (fullscreen: boolean) => void;

    // Window Manager (Z-Index Stack)
    windowStack: string[];
    focusWindow: (id: string) => void;
    closeWindowFromStack: (id: string) => void; 

    // Window States (위치, 크기, 상태 - 현재는 메모리에만 유지)
    windowStates: Record<string, WindowState>;
    setWindowState: (id: string, state: Partial<WindowState>) => void;
    restoreWindow: (id: string) => void; // 최소화 해제 및 포커스
    minimizeAllWindows: () => void; // 모든 윈도우 최소화
}

export const useUIStore = create<UIState>((set, get) => ({
    mapInstance: null,
    isFullscreen: false,
    windowStack: [],
    
    // 윈도우 상태 저장소 (새로고침 시 초기화됨)
    windowStates: {},

    setMapInstance: (map) => set({ mapInstance: map }),
    toggleFullscreen: (fullscreen) => set({ isFullscreen: fullscreen }),

    // 포커스 로직 (스택 최상단으로 이동)
    focusWindow: (id) => set((state) => {
        const stack = state.windowStack.filter((w) => w !== id);
        return { windowStack: [...stack, id] };
    }),
    
    // 닫기 로직 (스택에서만 제거하고 상태는 남겨둘지 여부는 선택사항. 
    // 여기서는 스택만 제거하여 재오픈 시 위치 기억 가능하게 함)
    closeWindowFromStack: (id) => set((state) => ({
        windowStack: state.windowStack.filter((w) => w !== id)
    })),

    // 윈도우 상태 업데이트 (위치, 크기, 최소화 등)
    setWindowState: (id, newState) => set((state) => ({
        windowStates: {
            ...state.windowStates,
            [id]: {
                ...(state.windowStates[id] || { x: 40, y: 40, width: 400, height: 300, isMaximized: false, isMinimized: false }), // 기본값
                ...newState
            }
        }
    })),

    // 태스크바에서 클릭 시 복구 로직
    restoreWindow: (id) => {
        const state = get();
        // 1. 최소화 해제
        state.setWindowState(id, { isMinimized: false });
        // 2. 포커스
        state.focusWindow(id);
    },
    // 모든 윈도우의 상태를 순회하며 isMinimized = true로 설정
    minimizeAllWindows: () => set((state) => {
        const newStates: Record<string, WindowState> = {};
        
        // 현재 등록된 모든 윈도우 상태를 복사하며 minimized만 true로 변경
        Object.keys(state.windowStates).forEach((key) => {
            const current = state.windowStates[key];
            newStates[key] = { ...current, isMinimized: true };
        });

        return { windowStates: newStates };
    })
}));