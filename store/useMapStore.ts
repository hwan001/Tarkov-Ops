import { create } from 'zustand';

// Point of Interest Data
export interface POIData {
  id: string;
  mapId: string;
  name: string;
  type: 'Extract' | 'Boss' | 'Quest';
  subType?: 'PMC' | 'Scav' | 'All';
  x: number;
  y: number;
  description?: string;
}

export interface FeatureData {
  id: string;
  type: 'path' | 'marker' | 'spawn' | 'danger';
  subType?: 'boss' | 'item' | 'quest' | 'exit';
  geometry: any; // points for path, {x, y} for marker
  creator?: string; // Callsign
  comment?: string;
  color?: string;
}

export interface SavedMission {
  id: string;
  title: string;
  mapId: string;
  date: number;
  data: {
    startPoint: { x: number, y: number } | null;
    selectedExtracts: string[];
    mapFeatures: FeatureData[];
    isStartPointLocked: boolean;
    customMapData?: MapData; 
  }
}

export interface MapData {
  id: string;
  name: string;
  type: 'image' | 'tile'; // 'image' = Game Map, 'tile' = Real World Map
  imageUrl?: string;
  tileUrl?: string; // e.g., 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  width?: number; 
  height?: number;
  attribution?: string; // For OSM/Google compliance
}

export const MAPS: MapData[] = [
  { id: 'customs', name: 'Customs', type: 'image', imageUrl: 'maps/Customs_Interactive_Map_Base.png', width: 4097, height: 2142 }, // https://escapefromtarkov.fandom.com/wiki/Customs?, Made by GLORY4LIFE, MONKMONKMONK
  { id: 'reserve', name: 'Reserve', type: 'image', imageUrl: 'maps/Reserve_Interactive_Map_Base.png', width: 4701, height: 2785 }, // https://escapefromtarkov.fandom.com/wiki/Map:Reserve?, Made by JINDOUZ
  { id: 'woods', name: 'Woods', type: 'image', imageUrl: 'maps/Woods_Interactive_Map_Base.png', width: 6994, height: 6843 }, // https://escapefromtarkov.fandom.com/wiki/Map:Woods?, Made by JINDOUZ
];

interface MapState {
  maps: MapData[];
  currentMap: MapData;
  setCurrentMap: (map: MapData) => void;
  addMap: (map: MapData) => void;
  removeMap: (id: string) => void;

  // Mission Planning
  startPoint: { x: number, y: number } | null;
  selectedExtracts: string[]; // ONE POI ID (Single Selection)
  isStartPointLocked: boolean; // Lock logic
  setStartPoint: (point: { x: number, y: number } | null) => void;
  toggleExtractSelection: (id: string) => void;
  toggleStartPointLock: () => void;
  resetMission: () => void;

  // Map Controls (External)
  // mapInstance, isFullscreen moved to useUIStore
  currentZoom: number; // Current Zoom Level
  isMapOpen: boolean; // Window Visibility
  isOpsControllerOpen: boolean; // New state for OpsController visibility
  setZoom: (zoom: number) => void;
  toggleMapOpen: () => void;
  toggleOpsController: () => void; // Action to toggle OpsController

  // Editor State
  isEditMode: boolean;
  drawType: 'path' | 'marker' | 'spawn' | 'danger' | 'hand';
  mapFeatures: FeatureData[];

  // Actions
  toggleEditMode: () => void;
  setDrawType: (type: 'path' | 'marker' | 'spawn' | 'danger' | 'hand') => void;
  addFeature: (feature: FeatureData) => void;
  updateFeature: (id: string, partial: Partial<FeatureData>) => void;
  removeFeature: (id: string) => void;
  clearFeatures: () => void;
  setFeatures: (features: FeatureData[]) => void;
  
  // Layers Visibility
  showExtracts: boolean;
  showBosses: boolean;
  showQuests: boolean;
  showGrid: boolean;
  showDrawings: boolean; 
  toggleExtracts: () => void;
  toggleBosses: () => void;
  toggleQuests: () => void;
  toggleGrid: () => void;
  toggleDrawings: () => void;

  // Mission Manager
  savedMissions: SavedMission[];
  saveMission: (mission: SavedMission) => void;
  loadMission: (id: string) => void; // Optional if handled in UI
  deleteMission: (id: string) => void;
  initMissions: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  // Default Map
  maps: MAPS,
  currentMap: MAPS[0],
  setCurrentMap: (map) => set({ currentMap: map, mapFeatures: [], startPoint: null, selectedExtracts: [], isStartPointLocked: true }),
  addMap: (newMap) => set((state) => ({ maps: [...state.maps, newMap] })),
  removeMap: (id) => set((state) => {
      const newMaps = state.maps.filter(m => m.id !== id);
      // If current map is removed, switch to the first available one
      const newCurrent = state.currentMap.id === id ? newMaps[0] : state.currentMap;
      return { maps: newMaps, currentMap: newCurrent };
  }),

  // Mission Planning
  startPoint: null,
  selectedExtracts: [],
  isStartPointLocked: true, // Default Locked per request
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

  // Map Controls (External)
  currentZoom: 0,
  isMapOpen: false,
  isOpsControllerOpen: false, // Default
  setZoom: (zoom) => set({ currentZoom: zoom }),
  toggleMapOpen: () => set((state) => ({ isMapOpen: !state.isMapOpen })),
  toggleOpsController: () => set((state) => ({ isOpsControllerOpen: !state.isOpsControllerOpen })),

  // Editor Defaults
  isEditMode: false,
  drawType: 'hand', // Default
  mapFeatures: [],
  
  toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),
  setDrawType: (type) => set({ drawType: type }),
  addFeature: (feature) => set((state) => ({ mapFeatures: [...state.mapFeatures, feature] })),
  updateFeature: (id, partial) => set((state) => ({
    mapFeatures: state.mapFeatures.map((f) => f.id === id ? { ...f, ...partial } : f)
  })),
  removeFeature: (id) => set((state) => ({ 
    mapFeatures: state.mapFeatures.filter((f) => f.id !== id) 
  })),
  clearFeatures: () => set({ mapFeatures: [] }),
  setFeatures: (features) => set({ mapFeatures: features }),

  showExtracts: false, // Default hidden to show cleaned map first
  showBosses: false,
  showQuests: false,
  showGrid: false, // Default Grid OFF
  showDrawings: true, // Default Drawings ON
  toggleExtracts: () => set((state) => ({ showExtracts: !state.showExtracts })),
  toggleBosses: () => set((state) => ({ showBosses: !state.showBosses })),
  toggleQuests: () => set((state) => ({ showQuests: !state.showQuests })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleDrawings: () => set((state) => ({ showDrawings: !state.showDrawings })),


  // Mission Manager (Saved Missions)
  savedMissions: [],
  saveMission: (mission) => set((state) => {
    const updated = [mission, ...state.savedMissions.filter(m => m.id !== mission.id)];
    localStorage.setItem('tarkov-ops-missions', JSON.stringify(updated));
    return { savedMissions: updated };
  }),
  loadMission: (id) => {
    // Logic handled in component or here? Easier here if we pass everything. 
    // Actually store actions usually update state.
    // Let's implement delete first.
    return; 
  },
  deleteMission: (id) => set((state) => {
    const updated = state.savedMissions.filter(m => m.id !== id);
    localStorage.setItem('tarkov-ops-missions', JSON.stringify(updated));
    return { savedMissions: updated };
  }),
  initMissions: () => {
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

// Initialize missions on module load (or call in component)
// Better to export a hook or call init in component