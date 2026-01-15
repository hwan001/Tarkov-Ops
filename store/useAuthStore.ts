import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
    apiKey: string | null;
    callsign: string | null;
    isAuthenticated: boolean;
    setAuth: (apiKey: string, callsign: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            apiKey: null,
            callsign: null,
            isAuthenticated: false,

            setAuth: (apiKey, callsign) => set({ 
                apiKey, 
                callsign, 
                isAuthenticated: true 
            }),

            logout: () => set({ 
                apiKey: null, 
                callsign: null, 
                isAuthenticated: false 
            }),
        }),
        {
            name: 'tarkov-ops-session',
            storage: createJSONStorage(() => sessionStorage),  // 이게 없으면 세션 스토리지에 저장되지 않음 (기본 값은 localStorage)
        }
    )
);