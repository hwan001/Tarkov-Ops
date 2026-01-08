'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import L from 'leaflet';
import { useMapStore } from '@/store/useMapStore';

export default function MapEditor() {
    const map = useMap();
    // unused variables removed (mapFeatures, updateFeature, removeFeature, showDrawings)
    const { isEditMode, drawType, addFeature, currentMap } = useMapStore();
    const featureLayerRef = useRef<L.LayerGroup | null>(null);

    // Fix Leaflet's default icon path issues in Next.js
    useEffect(() => {
        // @ts-expect-error -- Leaflet prototype manipulation needed for Next.js image loading
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        });
    }, []);

    // 1. 초기화 및 레이어 그룹 생성
    useEffect(() => {
        if (!map) return;

        // 피쳐들을 담을 레이어 그룹 생성
        if (!featureLayerRef.current) {
            featureLayerRef.current = new L.LayerGroup().addTo(map);
        }

        return () => {
            if (featureLayerRef.current) {
                featureLayerRef.current.clearLayers();
                featureLayerRef.current.remove();
                featureLayerRef.current = null;
            }
        };
    }, [map]);

    // 4. Programmatic Drawing Trigger (Sync Store -> Geoman)
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
            }
        }, 100);

        // ESC Key Listener
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                map.pm.disableDraw();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            map.pm.disableDraw();
            window.removeEventListener('keydown', handleKeyDown);
            clearTimeout(timer);
        };
    }, [map, isEditMode, drawType]);

    // Handle Creation
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


    // Initial Setup (Hide Controls)
    useEffect(() => {
        if (!map) return;
        map.pm.setGlobalOptions({ layerGroup: map, allowSelfIntersection: false });
        map.pm.removeControls();
    }, [map]);

    return null;
}