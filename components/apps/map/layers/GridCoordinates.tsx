'use client';

import { useState } from 'react';
import { useMapEvents } from 'react-leaflet';
import { Target, Compass, Copy, Check } from 'lucide-react';

interface GridCoordinatesProps {
    gridSize?: number; // 1000 정도 추천
}

export default function GridCoordinates({ gridSize = 1000 }: GridCoordinatesProps) {
    // 8자리 좌표 상태 (포맷: "XXxx YYyy")
    const [coordString, setCoordString] = useState<string>('-- --');
    const [rawCoords, setRawCoords] = useState<{ x: number, y: number } | null>(null);
    const [copied, setCopied] = useState(false);

    useMapEvents({
        mousemove(e) {
            // Leaflet 좌표 (x: lng, y: lat)
            // 맵 밖으로 나갔을 때 음수 방지
            const x = Math.max(0, e.latlng.lng);
            const y = Math.max(0, e.latlng.lat);

            setRawCoords({ x, y });

            // ----------------------------------------------------------------
            // 8계단 좌표 변환 로직 (수정됨)
            // ----------------------------------------------------------------

            // 1. Major Grid (앞 2자리): 큰 격자 번호
            // 전체 픽셀을 그리드 사이즈로 나눈 몫. (예: 1500px / 1000 = 1 -> '01')
            const majorX = Math.floor(x / gridSize).toString().padStart(2, '0');
            const majorY = Math.floor(y / gridSize).toString().padStart(2, '0');

            // 2. Minor Grid (뒤 2자리): 격자 내부 정밀 위치 (0~99)
            // 나머지를 구해서 백분율(%)로 환산. (예: 1500px % 1000 = 500 -> 50%)
            const minorX = Math.floor(((x % gridSize) / gridSize) * 100).toString().padStart(2, '0');
            const minorY = Math.floor(((y % gridSize) / gridSize) * 100).toString().padStart(2, '0');

            // 최종 포맷: "0150 0215" 형태
            setCoordString(`${majorX}${minorX} ${majorY}${minorY}`);
        },
        mouseout() {
            setRawCoords(null);
            setCoordString('-- --');
        }
    });

    const copyToClipboard = () => {
        if (!rawCoords) return;
        navigator.clipboard.writeText(coordString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!rawCoords) return null;

    // 렌더링을 위해 문자열 분리
    const [strX, strY] = coordString.split(' ');

    return (
        <div className="absolute bottom-4 right-4 z-[1000] flex flex-col items-end gap-1 pointer-events-none">

            {/* 8-Digit MGRS Reader */}
            <div className="pointer-events-auto group cursor-pointer bg-black/80 backdrop-blur border border-amber-500/50 p-3 rounded-sm flex items-center gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all hover:bg-black/90 hover:border-amber-500"
                onClick={copyToClipboard}
                title="Click to Copy Coordinates"
            >
                <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5 mb-0.5">
                        <span className="text-[9px] text-amber-500/70 font-bold uppercase tracking-[0.2em]">
                            TARGET GRID (8-DIGIT)
                        </span>
                        {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} className="text-zinc-600 group-hover:text-amber-500 transition-colors" />}
                    </div>

                    {/* 8자리 숫자 표시부 */}
                    <div className="flex items-center gap-2 font-mono font-black text-2xl tracking-widest leading-none text-amber-500">
                        {/* X Coordinate */}
                        <span className="tabular-nums">
                            {/* 앞 2자리 (Grid) - 밝게 */}
                            <span className="text-amber-500/80">{strX?.slice(0, 2) ?? '--'}</span>
                            {/* 뒤 2자리 (Precision) - 약간 어둡게 */}
                            <span className="text-amber-700/80">{strX?.slice(2) ?? '--'}</span>
                        </span>

                        <span className="text-amber-900/50">/</span>

                        {/* Y Coordinate */}
                        <span className="tabular-nums">
                            <span className="text-amber-500/80">{strY?.slice(0, 2) ?? '--'}</span>
                            <span className="text-amber-700/80">{strY?.slice(2) ?? '--'}</span>
                        </span>
                    </div>
                </div>

                {/* Visual Decoration */}
                <div className="relative flex items-center justify-center w-8 h-8">
                    <Target className="text-amber-500 animate-[spin_4s_linear_infinite] opacity-80" size={32} strokeWidth={1} />
                    <div className="absolute w-1 h-1 bg-amber-500 rounded-full animate-pulse" />
                </div>
            </div>

            {/* Debug Info (Precise) */}
            <div className="bg-black/60 backdrop-blur border border-zinc-800 p-1 rounded px-2 flex items-center gap-2 opacity-50">
                <Compass size={10} className="text-zinc-400" />
                <span className="font-mono text-[9px] text-zinc-500">
                    RAW: {rawCoords.x.toFixed(0)}, {rawCoords.y.toFixed(0)}
                </span>
            </div>
        </div>
    );
}