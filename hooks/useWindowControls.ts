import { useState, useRef, useEffect, MouseEvent } from 'react';
import { useUIStore } from '@/store/useUIStore';

interface UseWindowControlsProps {
    windowId?: string;
    initialWidth?: number;
    initialHeight?: number;
    minWidth?: number;
    minHeight?: number;
    onResize?: () => void;
}

export function useWindowControls({ 
    windowId,
    initialWidth = 400, 
    initialHeight = 300, 
    minWidth = 300, 
    minHeight = 200,
    onResize 
}: UseWindowControlsProps = {}) {
    const nodeRef = useRef<HTMLDivElement>(null);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: initialWidth, height: initialHeight });
    const isResizing = useRef(false);

    // Global Window Focus Logic
    const { windowStack, registerWindow, unregisterWindow, focusWindow } = useUIStore();
    
    useEffect(() => {
        if (windowId) {
            registerWindow(windowId);
            return () => unregisterWindow(windowId);
        }
    }, [windowId, registerWindow, unregisterWindow]);

    const zIndex = windowId 
        ? 100 + windowStack.indexOf(windowId) 
        : 100;

    const handleFocus = () => {
        if (windowId) focusWindow(windowId);
    };

    const toggleMaximize = (e?: MouseEvent) => {
        e?.stopPropagation();
        handleFocus(); // Focus on maximize
        setIsMaximized(prev => {
            const next = !prev;
            // If maximizing, ensure we un-minimize
            if (isMinimized && next) setIsMinimized(false);
            return next;
        });
    };

    const toggleMinimize = (e?: MouseEvent) => {
        e?.stopPropagation();
        handleFocus(); 
        setIsMinimized(prev => !prev);
    };

    const startResizing = (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        handleFocus(); // Focus on resize start
        isResizing.current = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopResizing);
    };

    const handleMouseMove = (e: globalThis.MouseEvent) => {
        if (!isResizing.current || !nodeRef.current) return;
        const rect = nodeRef.current.getBoundingClientRect();
        const newWidth = e.clientX - rect.left;
        const newHeight = e.clientY - rect.top;

        if (newWidth > minWidth && newHeight > minHeight) {
            setWindowSize({ width: newWidth, height: newHeight });
            onResize?.();
        }
    };

    const stopResizing = () => {
        isResizing.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', stopResizing);
    };

    // Cleanup resize listeners on unmount
    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', stopResizing);
        };
    }, []);

    return {
        nodeRef,
        isMaximized,
        isMinimized,
        windowSize,
        zIndex,
        setWindowSize,
        setIsMaximized,
        setIsMinimized,
        toggleMaximize,
        toggleMinimize,
        startResizing,
        handleFocus
    };
}
