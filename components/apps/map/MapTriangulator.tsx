'use client';

import { useState } from 'react';
import { useMapEvents, Polyline, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useMapStore } from '@/store/useMapStore';

export default function MapTriangulator() {
    const { drawType, addFeature, setDrawType } = useMapStore();
    const [points, setPoints] = useState<L.LatLng[]>([]);
    const [cursorPos, setCursorPos] = useState<L.LatLng | null>(null);

    useMapEvents({
        click(e) {
            if (drawType !== 'resection') return;

            // 1단계: 랜드마크 1, 2 선택
            if (points.length < 2) {
                setPoints(prev => [...prev, e.latlng]);
            }
            // 2단계: 내 위치 확정 (3번째 클릭)
            else {
                const id = crypto.randomUUID();
                // 내 위치에 마커 생성
                addFeature({
                    id,
                    type: 'marker',
                    subType: 'user', // 또는 별도의 'user' 타입
                    geometry: {
                        type: 'Point',
                        coordinates: [e.latlng.lng, e.latlng.lat]
                    },
                    color: '#22d3ee', // Cyan
                    creator: 'Triangulation',
                    comment: 'Estimated Position'
                });

                // 초기화 및 핸드 모드로 복귀 (연속 사용 원하면 초기화만)
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

    // 각도 계산 함수 (마우스 -> 타겟)
    const getBearing = (from: L.LatLng, to: L.LatLng) => {
        const dLon = (to.lng - from.lng);
        const dLat = (to.lat - from.lat);
        const angleRad = Math.atan2(dLon, dLat);
        return (angleRad * 180 / Math.PI + 360) % 360;
    };

    return (
        <>
            {/* 선택된 랜드마크 표시 (A, B 지점) */}
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

            {/* 마우스 커서에서 랜드마크로 이어지는 선 (points가 2개 다 찍혔을 때만 활성화) */}
            {points.length === 2 && points.map((p, idx) => {
                const bearing = getBearing(cursorPos, p);
                return (
                    <div key={`line-${idx}`}>
                        <Polyline
                            positions={[cursorPos, p]}
                            pathOptions={{ color: '#22d3ee', weight: 1, dashArray: '4, 4', opacity: 0.8 }}
                        />
                        {/* 마우스 근처에 각도 표시 HUD */}
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

            {/* 마우스 커서 가이드 */}
            <Marker
                position={cursorPos}
                interactive={false}
                icon={L.divIcon({
                    className: 'border-2 border-cyan-500 rounded-full',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })}
            />

            {/* 사용자 안내 문구 (마우스 따라다님) */}
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