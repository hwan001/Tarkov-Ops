'use client';

import { useState } from 'react';
import { useMapEvents, Polyline, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useEditorStore } from '@/store/useEditorStore';

export default function MapTriangulator() {
    const { drawType, addFeature, setDrawType } = useEditorStore();
    const [points, setPoints] = useState<L.LatLng[]>([]);
    const [cursorPos, setCursorPos] = useState<L.LatLng | null>(null);

    useMapEvents({
        click(e) {
            if (drawType !== 'resection') return;

            if (points.length < 2) {
                setPoints(prev => [...prev, e.latlng]);
            }
            else {
                const id = crypto.randomUUID();

                addFeature({
                    id,
                    type: 'marker',
                    subType: 'user', // 마커 타입 추가 필요
                    geometry: {
                        type: 'Point',
                        coordinates: [e.latlng.lng, e.latlng.lat]
                    },
                    color: '#22d3ee', // Cyan
                    creator: 'Triangulation',
                    comment: 'Estimated Position'
                });

                setPoints([]);
                setDrawType('hand');
            }
        },
        mousemove(e) {
            if (drawType === 'resection') {
                setCursorPos(e.latlng);
            }
        },
        contextmenu() {
            // 우클릭 시 취소
            if (drawType === 'resection') {
                setPoints([]);
            }
        }
    });

    if (drawType !== 'resection' || !cursorPos) return null;

    const getBearing = (from: L.LatLng, to: L.LatLng) => {
        const dLon = (to.lng - from.lng);
        const dLat = (to.lat - from.lat);
        const angleRad = Math.atan2(dLon, dLat);
        return (angleRad * 180 / Math.PI + 360) % 360;
    };

    return (
        <>
            {points.map((p, idx) => (
                <Marker
                    key={idx}
                    position={p}
                    interactive={false}
                    icon={L.divIcon({
                        className: 'bg-cyan-500 rounded-sm border border-white shadow-[0_0_10px_rgba(34,211,238,0.8)]',
                        iconSize: [10, 10],
                        iconAnchor: [5, 5]
                    })}
                />
            ))}

            {points.length === 2 && points.map((p, idx) => {
                const bearing = getBearing(cursorPos, p);
                return (
                    <div key={`line-${idx}`}>
                        <Polyline
                            positions={[cursorPos, p]}
                            pathOptions={{ color: '#22d3ee', weight: 1, dashArray: '4, 4', opacity: 0.8 }}
                        />
                        <Marker position={cursorPos} opacity={0} interactive={false}>
                            <Tooltip
                                permanent
                                direction={idx === 0 ? "left" : "right"}
                                offset={[idx === 0 ? -10 : 10, 0]}
                                className="!bg-black/80 !border-cyan-500 !text-cyan-400 !px-1.5 !py-0.5 !rounded font-mono text-[10px]"
                            >
                                {idx === 0 ? "A" : "B"}: {bearing.toFixed(0)}°
                            </Tooltip>
                        </Marker>
                    </div>
                );
            })}

            <Marker
                position={cursorPos}
                interactive={false}
                icon={L.divIcon({
                    className: 'border-2 border-cyan-500 rounded-full',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })}
            />
            <Marker position={cursorPos} opacity={0} interactive={false}>
                <Tooltip permanent direction="bottom" offset={[0, 20]} className="!bg-transparent !border-none !shadow-none !text-cyan-200 font-bold text-[10px] text-center">
                    {points.length === 0 && "CLICK LANDMARK 1"}
                    {points.length === 1 && "CLICK LANDMARK 2"}
                    {points.length === 2 && "MATCH BEARING & CLICK TO MARK"}
                </Tooltip>
            </Marker>
        </>
    );
}