'use client';

import { useState, MouseEvent } from 'react';
import { Globe } from 'lucide-react';
import WindowFrame from '@/components/common/WindowFrame';
import { useUIStore } from '@/store/useUIStore';

interface BrowserWindowProps {
    isOpen: boolean;
    onClose: (e?: MouseEvent) => void;
    initialUrl?: string;
    title?: string;
    windowId?: string;
}

export default function BrowserWindow({
    isOpen,
    onClose,
    initialUrl = '',
    title = 'Cortex Browser',
    windowId = 'browser'
}: BrowserWindowProps) {
    // Browser State
    const [url] = useState(initialUrl);
    const [isLoading, setIsLoading] = useState(false);

    const { isFullscreen } = useUIStore();

    return (
        <WindowFrame
            windowId={windowId}
            title={title}
            icon={Globe}
            isOpen={isOpen}
            onClose={onClose}
            minWidth={800}
            minHeight={600}
            defaultWidth={1000} // 기본 크기 지정
            defaultHeight={700} // 기본 크기 지정
            isFullscreen={isFullscreen}
            contentClassName="flex flex-col h-full bg-zinc-900"
        >
            <div className="flex-1 bg-white relative h-full">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 z-10">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                <iframe
                    src={url}
                    className="w-full h-full border-none"
                    onLoad={() => setIsLoading(false)}
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                    title="Browser Frame"
                />
            </div>
        </WindowFrame>
    );
}