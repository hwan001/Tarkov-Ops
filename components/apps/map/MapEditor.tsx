'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useMapDraw } from '@/hooks/useMapDraw';

export default function MapEditor() {
    const map = useMap();
    useMapDraw(); // Activate drawing logic

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

    return null;
}