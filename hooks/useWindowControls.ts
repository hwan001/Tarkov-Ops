import { useRef, useEffect, MouseEvent } from 'react';
import { useUIStore, WindowState } from '@/store/useUIStore';

interface UseWindowControlsProps {
    windowId: string;
    minWidth?: number;
    minHeight?: number;
    initialWidth?: number;
    initialHeight?: number;
    onResize?: () => void;
}

export function useWindowControls({ 
    windowId,
    minWidth = 300, 
    minHeight = 200,
    initialWidth = 400, 
    initialHeight = 300, 
    onResize 
}: UseWindowControlsProps) {
    const nodeRef = useRef<HTMLDivElement>(null);
    const resizeRef = useRef({ isResizing: false, startX: 0, startY: 0, startWidth: 0, startHeight: 0 });

    // Store에서 필요한 상태와 함수들을 가져옵니다.
    const { 
        windowStack, focusWindow, closeWindowFromStack, 
        windowStates, setWindowState 
    } = useUIStore();

    // 현재 윈도우의 상태 가져오기 (없으면 기본값 구조만 리턴, 실제 초기화는 useEffect에서)
    const currentState: WindowState = windowStates[windowId] || {
        x: 40, y: 40, 
        width: initialWidth, height: initialHeight,
        isMaximized: false, isMinimized: false
    };

    // 마운트 시 초기화 및 스택 등록
    useEffect(() => {
        // 창이 열리면 무조건 포커스
        focusWindow(windowId);
        
        // Store에 해당 ID의 상태가 없다면 초기값으로 생성 (새로고침 후 첫 오픈 시)
        if (!windowStates[windowId]) {
            setWindowState(windowId, { 
                width: initialWidth, 
                height: initialHeight,
                // 스택 순서에 따라 약간씩 빗겨서 생성 (겹침 방지)
                x: 40 + (windowStack.length * 20), 
                y: 40 + (windowStack.length * 20)
            });
        }
        
        // 언마운트(닫기) 시 스택에서 제거
        return () => {
             closeWindowFromStack(windowId);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const zIndex = 100 + windowStack.indexOf(windowId);

    const handleFocus = () => focusWindow(windowId);

    const toggleMaximize = (e?: MouseEvent) => {
        e?.stopPropagation();
        handleFocus();
        setWindowState(windowId, { isMaximized: !currentState.isMaximized, isMinimized: false });
    };

    const toggleMinimize = (e?: MouseEvent) => {
        e?.stopPropagation();
        setWindowState(windowId, { isMinimized: !currentState.isMinimized });
    };

    // --- 리사이징 로직 (Store 업데이트) ---
    const startResizing = (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        handleFocus();

        resizeRef.current = {
            isResizing: true,
            startX: e.clientX,
            startY: e.clientY,
            startWidth: currentState.width,
            startHeight: currentState.height
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopResizing);
        document.body.style.cursor = 'nwse-resize';
        document.body.style.userSelect = 'none';
    };

    const handleMouseMove = (e: globalThis.MouseEvent) => {
        if (!resizeRef.current.isResizing) return;
        const deltaX = e.clientX - resizeRef.current.startX;
        const deltaY = e.clientY - resizeRef.current.startY;

        const newWidth = Math.max(minWidth, resizeRef.current.startWidth + deltaX);
        const newHeight = Math.max(minHeight, resizeRef.current.startHeight + deltaY);

        // Store 업데이트 (리렌더링 유발)
        setWindowState(windowId, { width: newWidth, height: newHeight });
        onResize?.();
    };

    const stopResizing = () => {
        resizeRef.current.isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', stopResizing);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    };

    return {
        nodeRef,
        isMaximized: currentState.isMaximized,
        isMinimized: currentState.isMinimized,
        windowSize: { width: currentState.width, height: currentState.height },
        // WindowFrame에서 Draggable position에 넣어줄 좌표
        position: { x: currentState.x, y: currentState.y },
        zIndex,
        setWindowState, 
        toggleMaximize,
        toggleMinimize,
        startResizing,
        handleFocus
    };
}