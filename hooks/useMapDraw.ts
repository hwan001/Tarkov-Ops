import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { useEditorStore } from '@/store/useEditorStore';
import { useMapStore } from '@/store/useMapStore';

export function useMapDraw() {
    const map = useMap();
    const { isEditMode, drawType, addFeature } = useEditorStore();
    const { currentMap } = useMapStore();

    // 1. Programmatic Drawing Trigger (Sync Store -> Geoman)
    useEffect(() => {
        if (!map || !isEditMode) return;

        // Reset previous draw mode
        map.pm.disableDraw();

        const drawOptions = {
            snappable: true,
            snapDistance: 20,
            continueDrawing: true, // Enable continuous drawing
        };

        // Use setTimeout to avoid conflict with initial map interactions
        const timer = setTimeout(() => {
            console.log(`[MapEditor] Enabling Draw Mode: ${drawType}`);

            if (drawType === 'path') {
                map.pm.enableDraw('Line', { ...drawOptions, finishOn: 'dblclick' }); // Finish line on dblclick
            } else if (drawType === 'marker') {
                map.pm.enableDraw('Marker', drawOptions);
            } else if (drawType === 'danger') {
                map.pm.enableDraw('Polygon', drawOptions);
            } else if (drawType === 'hand') {
                 map.pm.disableDraw();
            }
        }, 100);

        // ESC Key Listener
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                map.pm.disableDraw();
                useEditorStore.getState().setDrawType('hand');
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            map.pm.disableDraw();
            window.removeEventListener('keydown', handleKeyDown);
            clearTimeout(timer);
        };
    }, [map, isEditMode, drawType]);

    // 2. Handle Creation
    useEffect(() => {
        if (!map) return;

        // Typed event handler
        const handleCreate = (e: { layer: L.Layer }) => {
            const layer = e.layer;

            // 0. Boundary Check (Create) - Only for Image Maps
            if (currentMap.type === 'image') {
                const mapW = currentMap.width || 2000;
                const mapH = currentMap.height || 2000;
                let boundsValid = true;

                // @ts-expect-error -- Leaflet types check
                if (layer.getBounds) {
                    // @ts-expect-error -- Leaflet types check
                    const b = layer.getBounds();
                    // Strict check for Image Maps (Simple CRS)
                    if (b.getSouth() < 0 || b.getNorth() > mapH || b.getWest() < 0 || b.getEast() > mapW) {
                        boundsValid = false;
                    }
                    // @ts-expect-error -- Leaflet types check
                } else if (layer.getLatLng) {
                    // @ts-expect-error -- Leaflet types check
                    const ll = layer.getLatLng();
                    if (ll.lat < 0 || ll.lat > mapH || ll.lng < 0 || ll.lng > mapW) {
                        boundsValid = false;
                    }
                }

                if (!boundsValid) {
                    alert("설정된 맵 구역 밖에는 생성할 수 없습니다.");
                    map.removeLayer(layer);
                    return;
                }
            }

            // 1. GeoJSON 변환 및 스토어 저장
            // @ts-expect-error -- toGeoJSON exists on Layer
            const geoJson = layer.toGeoJSON();
            const id = crypto.randomUUID();

            addFeature({
                id,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                type: drawType as any,
                geometry: geoJson.geometry,
                creator: 'Operator', // TODO: Get from SquadStore
                color: '#ffffff'
            });

            // 2. Geoman이 생성한 임시 레이어는 제거 (리액트 렌더링으로 대체)
            map.removeLayer(layer);
        };

        map.on('pm:create', handleCreate);

        return () => {
            map.off('pm:create', handleCreate);
        };
    }, [map, isEditMode, drawType, addFeature, currentMap]);

    // 3. Initial Setup (Hide Controls)
    useEffect(() => {
        if (!map) return;
        map.pm.setGlobalOptions({ layerGroup: map, allowSelfIntersection: false });
        map.pm.removeControls();
    }, [map]);
}
