'use client';

import { useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { useMapStore } from '@/store/useMapStore';
import { useSquadStore } from '@/store/useSquadStore';

/**
 * SquadManager
 * Handles the logic (Controller) for syncing local MapStore with remote Yjs Doc.
 * This component is headless and just runs the sync effects.
 */
export default function SquadManager() {
    const { ydoc, isConnected } = useSquadStore();
    const {
        mapFeatures, setFeatures,
        startPoint, setStartPoint,
        selectedExtracts, toggleExtractSelection
    } = useMapStore();

    // To prevent loop: Local -> Yjs -> Local -> Yjs
    const isRemoteUpdate = useRef(false);

    // 1. Sync Features (Drawings)
    useEffect(() => {
        if (!ydoc || !isConnected) return;

        const yFeatures = ydoc.getArray('mapFeatures');

        // Observer: Remote -> Local
        const observer = () => {
            isRemoteUpdate.current = true;
            // @ts-ignore
            setFeatures(yFeatures.toArray());
            isRemoteUpdate.current = false;
        };

        yFeatures.observe(observer);

        return () => yFeatures.unobserve(observer);
    }, [ydoc, isConnected]);

    // Listener: Local -> Remote
    useEffect(() => {
        if (!ydoc || !isConnected || isRemoteUpdate.current) return;

        const yFeatures = ydoc.getArray('mapFeatures');
        if (JSON.stringify(yFeatures.toArray()) !== JSON.stringify(mapFeatures)) {
            ydoc.transact(() => {
                const arr = yFeatures.toArray();
                if (JSON.stringify(arr) !== JSON.stringify(mapFeatures)) {
                    yFeatures.delete(0, yFeatures.length);
                    yFeatures.push(mapFeatures);
                }
            });
        }
    }, [mapFeatures, ydoc, isConnected]);

    // Using yMap for key-value sync
    useEffect(() => {
        if (!ydoc || !isConnected) return;

        const yMission = ydoc.getMap('mission');

        // Observer: Remote -> Local
        const observer = (event: Y.YMapEvent<any>) => {
            isRemoteUpdate.current = true;
            if (event.keysChanged.has('startPoint')) {
                const sp = yMission.get('startPoint');
                // @ts-ignore
                useMapStore.setState({ startPoint: sp });
            }
            if (event.keysChanged.has('selectedExtracts')) {
                const ex = yMission.get('selectedExtracts');
                // @ts-ignore
                useMapStore.setState({ selectedExtracts: ex });
            }
            isRemoteUpdate.current = false;
        };

        yMission.observe(observer);
        return () => yMission.unobserve(observer);
    }, [ydoc, isConnected]);

    // Local -> Remote (Mission)
    useEffect(() => {
        if (!ydoc || !isConnected || isRemoteUpdate.current) return;
        const yMission = ydoc.getMap('mission');

        const currentSp = yMission.get('startPoint');
        if (JSON.stringify(currentSp) !== JSON.stringify(startPoint)) {
            yMission.set('startPoint', startPoint);
        }

        const currentEx = yMission.get('selectedExtracts');
        if (JSON.stringify(currentEx) !== JSON.stringify(selectedExtracts)) {
            yMission.set('selectedExtracts', selectedExtracts);
        }

    }, [startPoint, selectedExtracts, ydoc, isConnected]);


    return null; // Headless
}
