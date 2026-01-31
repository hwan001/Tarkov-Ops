import { create } from 'zustand';
import { FeatureData, MapData } from './useMapStore';

export interface SavedMission {
  id: string;
  title: string;
  mapId: string;
  date: number;
  data: {
    startPoint: { x: number, y: number } | null;
    selectedExtracts: string[];
    mapFeatures: FeatureData[]; // Snapshot of drawings
    isStartPointLocked: boolean;
    customMapData?: MapData; 
  }
}

interface MissionState {
  // Active Mission State
  startPoint: { x: number, y: number } | null;
  selectedExtracts: string[];
  isStartPointLocked: boolean; // Default Locked per request
  
  setStartPoint: (point: { x: number, y: number } | null) => void;
  toggleExtractSelection: (id: string) => void;
  toggleStartPointLock: () => void;
  resetMission: () => void;

  // Saved Missions (Persisted)
  savedMissions: SavedMission[];
  saveMission: (mission: SavedMission) => void;
  deleteMission: (id: string) => void;
  initMissions: () => void;
}

export const useMissionStore = create<MissionState>((set) => ({
  startPoint: null,
  selectedExtracts: [],
  isStartPointLocked: true,
  savedMissions: [],

  setStartPoint: (point) => set({ startPoint: point }),
  
  toggleExtractSelection: (id) => set((state) => {
    // Single usage logic: If clicked same, deselect. If clicked different, replace.
    const isSelected = state.selectedExtracts.includes(id);
    return {
      selectedExtracts: isSelected ? [] : [id] 
    };
  }),
  
  toggleStartPointLock: () => set((state) => ({ isStartPointLocked: !state.isStartPointLocked })),
  
  resetMission: () => set({ startPoint: null, selectedExtracts: [], isStartPointLocked: true }),

  // Mission Manager Logic
  saveMission: (mission) => set((state) => {
    const updated = [mission, ...state.savedMissions.filter(m => m.id !== mission.id)];
    localStorage.setItem('tarkov-ops-missions', JSON.stringify(updated));
    return { savedMissions: updated };
  }),
  
  deleteMission: (id) => set((state) => {
    const updated = state.savedMissions.filter(m => m.id !== id);
    localStorage.setItem('tarkov-ops-missions', JSON.stringify(updated));
    return { savedMissions: updated };
  }),
  
  initMissions: () => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('tarkov-ops-missions');
    if (saved) {
        try {
            set({ savedMissions: JSON.parse(saved) });
        } catch (e) {
            console.error("Failed to parse missions", e);
        }
    }
  }
}));
