import { create } from 'zustand';
import { FeatureData } from './useMapStore';

interface EditorState {
  isEditMode: boolean;
  drawType: 'path' | 'marker' | 'spawn' | 'danger' | 'hand' | 'ruler' | 'resection';
  mapFeatures: FeatureData[]; // The drawings on the map

  toggleEditMode: () => void;
  setDrawType: (type: 'path' | 'marker' | 'spawn' | 'danger' | 'hand' | 'ruler' | 'resection') => void;
  
  // Feature Actions
  addFeature: (feature: FeatureData) => void;
  updateFeature: (id: string, partial: Partial<FeatureData>) => void;
  removeFeature: (id: string) => void;
  clearFeatures: () => void;
  setFeatures: (features: FeatureData[]) => void;
  
  // Layer Visibility (Specific to Editor overlays)
  showDrawings: boolean;
  toggleDrawings: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  isEditMode: false,
  drawType: 'hand',
  mapFeatures: [],
  showDrawings: true,

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
  toggleDrawings: () => set((state) => ({ showDrawings: !state.showDrawings })),
}));
