import { useState, useEffect } from 'react';

interface GridConfig {
    startX: number;
    startY: number;
    gapX: number;
    gapY: number;
    itemHeight: number;
}

const DEFAULT_CONFIG: GridConfig = {
    startX: 24,
    startY: 24,
    gapX: 100,
    gapY: 96,
    itemHeight: 80
};

export function useDesktopGrid<T extends { id: string }>(items: T[], config = DEFAULT_CONFIG) {
    const [positionedItems, setPositionedItems] = useState<(T & { pos: { x: number; y: number } })[]>([]);

    const { startX, startY, gapX, gapY } = config;

    useEffect(() => {
        const calculatePositions = () => {
            const availableHeight = window.innerHeight - startY;
            const itemsPerColumn = Math.max(1, Math.floor(availableHeight / gapY));

            const newItems = items.map((item, index) => {
                const colIndex = Math.floor(index / itemsPerColumn);
                const rowIndex = index % itemsPerColumn;

                return {
                    ...item,
                    pos: {
                        x: startX + (colIndex * gapX),
                        y: startY + (rowIndex * gapY)
                    }
                };
            });

            setPositionedItems(newItems);
        };

        calculatePositions();

        window.addEventListener('resize', calculatePositions);
        return () => window.removeEventListener('resize', calculatePositions);
    }, [items, startX, startY, gapX, gapY]); 

    return positionedItems;
}