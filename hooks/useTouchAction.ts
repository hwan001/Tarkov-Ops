// hooks/useTouchAction.ts
'use client';

import { useState, useRef, useCallback } from 'react';

interface TouchActionProps {
  onTap?: () => void;       // 모바일: 탭 / PC: 더블클릭 (주요 액션)
  onHold?: () => void;      // 모바일: 롱프레스 / PC: 클릭 (선택/메뉴)
  vibrate?: boolean;
}

export function useTouchAction({ onTap, onHold, vibrate = true }: TouchActionProps) {
  const [isMobile] = useState(() => 
    typeof window !== 'undefined' && /Mobi|Android|iPhone/i.test(navigator.userAgent)
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    isLongPress.current = false;
    
    if (isMobile && onHold) {
      timerRef.current = setTimeout(() => {
        isLongPress.current = true;
        onHold(); 
        if (vibrate && navigator.vibrate) navigator.vibrate(50);
      }, 600);
    }
  }, [isMobile, onHold, vibrate]);

  const handlePointerUp = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMobile) {
      if (!isLongPress.current) onTap?.();
    } else {
      onHold?.(); // PC에선 한 번 클릭이 선택(Hold) 역할
    }
  }, [isMobile, onTap, onHold]);

  return {
    bind: {
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerUp,
      onClick: handleClick,
      onDoubleClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isMobile) onTap?.();
      },
    }
  };
}