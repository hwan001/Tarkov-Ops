import { useMap, Polyline, Marker, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import { useMapStore } from '@/store/useMapStore';
import { useMemo } from 'react';

interface MGRSGridProps {
    gridSize?: number; // 기본 그리드 간격 (예: 100)
    lineColor?: string; // 전술적 색상 (기본: amber-500)
}

export default function MGRSGrid({ gridSize = 100, lineColor = '#f59e0b' }: MGRSGridProps) {
    useMap();
    const { currentMap, showGrid } = useMapStore();

    // 성능 최적화를 위해 메모이제이션 사용
    const gridElements = useMemo(() => {
        if (!showGrid) return null;

        const width = currentMap.width || 0;
        const height = currentMap.height || 0;

        const verticalLines = [];
        const horizontalLines = [];
        const labels = [];
        const intersections = [];

        // MGRS 스타일 라벨 생성 함수 (01, 02, 12 등 2자리 수)
        const getMgrsLabel = (val: number) => {
            const gridNum = Math.floor(val / gridSize);
            return String(gridNum).padStart(2, '0');
        };

        const createLabelIcon = (text: string, type: 'x' | 'y') => L.divIcon({
            className: `
                font-mono font-bold text-[10px] 
                ${type === 'x' ? 'text-amber-500' : 'text-amber-500'} 
                bg-black/60 px-1 rounded border border-amber-500/30
                flex items-center justify-center shadow-sm
            `,
            html: text,
            iconSize: [24, 16],
            iconAnchor: [12, 8] // 아이콘 중심점
        });

        // X축 루프 (수직선)
        for (let x = 0; x <= width; x += gridSize) {
            const labelText = getMgrsLabel(x);

            verticalLines.push(
                <Polyline
                    key={`v-${x}`}
                    positions={[[0, x], [height, x]]}
                    pathOptions={{
                        color: lineColor,
                        weight: 0.5,
                        opacity: 0.4
                    }}
                />
            );

            // 상단, 하단 라벨
            labels.push(
                <Marker key={`lbl-x-${x}-top`} position={[0, x]} icon={createLabelIcon(labelText, 'x')} />,
                <Marker key={`lbl-x-${x}-bot`} position={[height, x]} icon={createLabelIcon(labelText, 'x')} />
            );
        }

        // Y축 루프 (수평선)
        for (let y = 0; y <= height; y += gridSize) {
            const labelText = getMgrsLabel(y);

            horizontalLines.push(
                <Polyline
                    key={`h-${y}`}
                    positions={[[y, 0], [y, width]]}
                    pathOptions={{
                        color: lineColor,
                        weight: 0.5,
                        opacity: 0.4
                    }}
                />
            );

            // 좌측, 우측 라벨
            labels.push(
                <Marker key={`lbl-y-${y}-l`} position={[y, 0]} icon={createLabelIcon(labelText, 'y')} />,
                <Marker key={`lbl-y-${y}-r`} position={[y, width]} icon={createLabelIcon(labelText, 'y')} />
            );
        }

        // 여기서는 시각적 효과를 위해 2배 간격으로 교차점 표시
        const crossSVG = `
        <svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
            <line x1="6" y1="0" x2="6" y2="12" stroke="#f59e0b" stroke-width="1" stroke-opacity="0.6" />
            <line x1="0" y1="6" x2="12" y2="6" stroke="#f59e0b" stroke-width="1" stroke-opacity="0.6" />
        </svg>
        `;

        const crossIcon = L.divIcon({
            className: 'bg-transparent', // 배경 투명
            html: crossSVG,
            iconSize: [12, 12],   // 아이콘 전체 크기
            iconAnchor: [6, 6],   // 중심점 (12의 절반인 6, 6)을 맵 좌표에 맞춤
        });

        for (let x = gridSize; x < width; x += gridSize * 2) {
            for (let y = gridSize; y < height; y += gridSize * 2) {
                intersections.push(
                    <Marker
                        key={`cross-${x}-${y}`}
                        // Leaflet 좌표계는 [Latitude(Y), Longitude(X)] 순서임에 주의
                        position={[y, x]}
                        icon={crossIcon}
                        interactive={false}
                        zIndexOffset={-100} // 라벨보다 뒤에, 선보다는 위에 보이도록 조정
                    />
                );
            }
        }

        return (
            <LayerGroup>
                {verticalLines}
                {horizontalLines}
                {intersections}
                {labels}
            </LayerGroup>
        );
    }, [currentMap, showGrid, gridSize, lineColor]);

    return gridElements;
}