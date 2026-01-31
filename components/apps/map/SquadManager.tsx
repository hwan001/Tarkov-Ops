'use client';

import { useEffect, useRef } from 'react';
import * as Y from 'yjs';
// import { useMapStore } from '@/store/useMapStore'; // Removed as no longer needed for these props
import { useEditorStore } from '@/store/useEditorStore';
import { useMissionStore } from '@/store/useMissionStore';
import { useSquadStore } from '@/store/useSquadStore';

/**
 * SquadManager
 * Handles the logic (Controller) for syncing local stores with remote Yjs Doc.
 * This component is headless and just runs the sync effects.
 */
export default function SquadManager() {
    const { ydoc, isConnected } = useSquadStore();
    const { mapFeatures, setFeatures } = useEditorStore();
    const { startPoint, selectedExtracts } = useMissionStore();

    // To prevent loop: Local -> Yjs -> Local -> Yjs
    const isRemoteUpdate = useRef(false);

    // 1. Sync Features (Drawings) - EditorStore
    useEffect(() => {
        if (!ydoc || !isConnected) return;

        const yFeatures = ydoc.getArray('mapFeatures');

        // Observer: Remote -> Local
        const observer = () => {
            isRemoteUpdate.current = true;
            // @ts-expect-error -- Yjs array types differ from local state
            setFeatures(yFeatures.toArray());
            isRemoteUpdate.current = false;
        };

        yFeatures.observe(observer);

        return () => yFeatures.unobserve(observer);
    }, [ydoc, isConnected, setFeatures]);

    // Listener: Local -> Remote (Drawings)
    useEffect(() => {
        if (!ydoc || !isConnected || isRemoteUpdate.current) return;

        const yFeatures = ydoc.getArray('mapFeatures');
        // Simple JSON comparison to avoid unnecessary updates
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

    // 2. Sync Mission Data (StartPoint, Extracts) - MissionStore
    useEffect(() => {
        if (!ydoc || !isConnected) return;

        const yMission = ydoc.getMap('mission');

        // Observer: Remote -> Local
        const observer = (event: Y.YMapEvent<unknown>) => {
            isRemoteUpdate.current = true;
            if (event.keysChanged.has('startPoint')) {
                const sp = yMission.get('startPoint');
                // @ts-expect-error -- Direct store update
                useMissionStore.setState({ startPoint: sp });
            }
            if (event.keysChanged.has('selectedExtracts')) {
                const ex = yMission.get('selectedExtracts');
                // @ts-expect-error -- Direct store update
                useMissionStore.setState({ selectedExtracts: ex });
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