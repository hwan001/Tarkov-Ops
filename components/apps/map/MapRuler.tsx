'use client';

import { useState } from 'react';
import { useMapEvents, Polyline, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useMapStore } from '@/store/useMapStore';

export default function MapRuler() {
    const { drawType } = useMapStore();
    const [startPos, setStartPos] = useState<L.LatLng | null>(null);
    const [currentPos, setCurrentPos] = useState<L.LatLng | null>(null);

    useMapEvents({
        click(e) {
            if (drawType !== 'ruler') return;

            if (!startPos) {
                // 첫 클릭: 시작점 설정
                setStartPos(e.latlng);
                setCurrentPos(e.latlng);
            } else {
                // 두 번째 클릭: 초기화 (측정 완료 후 해제)
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

    // 계산 로직
    // 1. 거리 (Meters) - Leaflet의 distanceTo는 미터 단위 반환
    const distance = startPos.distanceTo(currentPos);

    // 2. 방위각 (Bearing) - Degree
    // Math.atan2(dLon, dLat) 사용
    const dLon = (currentPos.lng - startPos.lng);
    const dLat = (currentPos.lat - startPos.lat);
    // 라디안 -> 디그리 변환 및 북쪽 기준(0도) 보정
    const angleRad = Math.atan2(dLon, dLat);
    const angleDeg = (angleRad * 180 / Math.PI + 360) % 360;

    return (
        <>
            {/* 측정 선 (점선) */}
            <Polyline
                positions={[startPos, currentPos]}
                pathOptions={{ color: '#34d399', weight: 2, dashArray: '5, 10' }}
            />

            {/* 끝점 마커 및 정보 툴팁 */}
            <Marker
                position={currentPos}
                opacity={0} // 마커 자체는 숨김
            >
                <Tooltip permanent direction="right" offset={[10, 0]} className="!bg-black/80 !border-emerald-500 !text-emerald-400 font-mono">
                    <div className="text-xs font-bold whitespace-nowrap">
                        <div>DIST: {distance.toFixed(1)}</div>
                        <div>AZIM: {angleDeg.toFixed(0)}°</div>
                    </div>
                </Tooltip>
            </Marker>

            {/* 시작점 표시 (작은 원) */}
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