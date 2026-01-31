'use client';

import { useState } from 'react';
import { useMapEvents, Polyline, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useEditorStore } from '@/store/useEditorStore';

export default function MapRuler() {
    const { drawType } = useEditorStore();
    const [startPos, setStartPos] = useState<L.LatLng | null>(null);
    const [currentPos, setCurrentPos] = useState<L.LatLng | null>(null);

    useMapEvents({
        click(e) {
            if (drawType !== 'ruler') return;

            if (!startPos) {
                setStartPos(e.latlng);
                setCurrentPos(e.latlng);
            } else {
                setStartPos(null);
                setCurrentPos(null);
            }
        },
        mousemove(e) {
            if (drawType === 'ruler' && startPos) {
                setCurrentPos(e.latlng);
            }
        }
    });

    if (drawType !== 'ruler' || !startPos || !currentPos) return null;

    const distance = startPos.distanceTo(currentPos);

    const dLon = (currentPos.lng - startPos.lng);
    const dLat = (currentPos.lat - startPos.lat);

    // 라디안 -> 디그리 (Radian to degree) 변환 및 북쪽 기준(0도) 보정
    const angleRad = Math.atan2(dLon, dLat);
    const angleDeg = (angleRad * 180 / Math.PI + 360) % 360;

    return (
        <>
            <Polyline
                positions={[startPos, currentPos]}
                pathOptions={{ color: '#34d399', weight: 2, dashArray: '5, 10' }}
            />
            <Marker
                position={currentPos}
                opacity={0}
            >
                <Tooltip permanent direction="right" offset={[10, 0]} className="!bg-black/80 !border-emerald-500 !text-emerald-400 font-mono">
                    <div className="text-xs font-bold whitespace-nowrap">
                        <div>DIST: {distance.toFixed(1)}</div>
                        <div>AZIM: {angleDeg.toFixed(0)}°</div>
                    </div>
                </Tooltip>
            </Marker>

            <Marker
                position={startPos}
                icon={L.divIcon({
                    className: 'bg-emerald-500 rounded-full border border-white',
                    iconSize: [8, 8],
                    iconAnchor: [4, 4]
                })}
            />
        </>
    );
}