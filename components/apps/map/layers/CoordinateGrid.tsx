import { useMap, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
import { useMapStore } from '@/store/useMapStore';

interface CoordinateGridProps {
    gridSize?: number; // Distance between lines (default 100)
}

export default function CoordinateGrid({ gridSize = 100 }: CoordinateGridProps) {
    useMap();
    const { currentMap, showGrid } = useMapStore();

    if (!showGrid) return null;

    const width = currentMap.width || 0;
    const height = currentMap.height || 0;

    const verticalLines = [];
    const horizontalLines = [];

    const labels = [];

    const labelIcon = (text: string) => L.divIcon({
        className: 'text-[10px] font-mono text-white/50 bg-black/50 px-1 rounded',
        html: text,
        iconSize: [40, 15],
        iconAnchor: [20, 7]
    });

    // X lines
    for (let x = 0; x <= width; x += gridSize) {
        verticalLines.push(
            <Polyline
                key={`v-${x}`}
                positions={[[0, x], [height, x]]}
                pathOptions={{ color: 'rgba(255, 255, 255, 0.2)', weight: 1, dashArray: '4, 4' }}
            />
        );

        labels.push(
            <Marker key={`label-x-${x}-top`} position={[0, x]} icon={labelIcon(`${x}`)} />,
            <Marker key={`label-x-${x}-bottom`} position={[height, x]} icon={labelIcon(`${x}`)} />
        );
    }

    // Y lines
    for (let y = 0; y <= height; y += gridSize) {
        horizontalLines.push(
            <Polyline
                key={`h-${y}`}
                positions={[[y, 0], [y, width]]}
                pathOptions={{ color: 'rgba(255, 255, 255, 0.2)', weight: 1, dashArray: '4, 4' }}
            />
        );

        labels.push(
            <Marker key={`label-y-${y}-left`} position={[y, 0]} icon={labelIcon(`${y}`)} />,
            <Marker key={`label-y-${y}-right`} position={[y, width]} icon={labelIcon(`${y}`)} />
        );
    }

    return (
        <>
            {verticalLines}
            {horizontalLines}
            {labels}
        </>
    );
}
