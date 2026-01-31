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
  subType?: 'boss' | 'item' | 'quest' | 'exit' | 'user';
  geometry: Record<string, unknown> | unknown; // points for path, {x, y} for marker
  creator?: string; // Callsign
  comment?: string;
  color?: string;
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
  
  // Custom Tile Grid Data (for stitching OSM tiles into a pseudo-image map)
  tileGrid?: {
    base: { z: number; x: number; y: number };
    range: number;
    sideCount: number;
  };
  tileSize?: number;
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

  // Map Controls (UI)
  currentZoom: number; 
  isMapOpen: boolean; 
  isOpsControllerOpen: boolean; 
  setZoom: (zoom: number) => void;
  toggleMapOpen: () => void;
  toggleOpsController: () => void; 

  // Layers Visibility (Static Data)
  showExtracts: boolean;
  showBosses: boolean;
  showQuests: boolean;
  showGrid: boolean;

  toggleExtracts: () => void;
  toggleBosses: () => void;
  toggleQuests: () => void;
  toggleGrid: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  // Default Map
  maps: MAPS,
  currentMap: MAPS[0],
  // Note: We no longer reset mission/editor state here directly. 
  // Components should react to map changes if needed, or we can add a listener.
  setCurrentMap: (map) => set({ currentMap: map }),
  
  addMap: (newMap) => set((state) => ({ maps: [...state.maps, newMap] })),
  
  removeMap: (id) => set((state) => {
      const newMaps = state.maps.filter(m => m.id !== id);
      // If current map is removed, switch to the first available one
      const newCurrent = state.currentMap.id === id ? newMaps[0] : state.currentMap;
      return { maps: newMaps, currentMap: newCurrent };
  }),

  // Map Controls
  currentZoom: 0,
  isMapOpen: false,
  isOpsControllerOpen: false, 
  setZoom: (zoom) => set({ currentZoom: zoom }),
  toggleMapOpen: () => set((state) => ({ isMapOpen: !state.isMapOpen })),
  toggleOpsController: () => set((state) => ({ isOpsControllerOpen: !state.isOpsControllerOpen })),

  // Layers
  showExtracts: false, 
  showBosses: false,
  showQuests: false,
  showGrid: false, 
  
  toggleExtracts: () => set((state) => ({ showExtracts: !state.showExtracts })),
  toggleBosses: () => set((state) => ({ showBosses: !state.showBosses })),
  toggleQuests: () => set((state) => ({ showQuests: !state.showQuests })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
}));