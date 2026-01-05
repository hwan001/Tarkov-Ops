'use client';

import { useState } from 'react';
import Draggable from 'react-draggable';
import { Globe, RefreshCw, X, ArrowRight } from 'lucide-react';
import WindowHeader from '@/components/common/WindowHeader';
import { useWindowControls } from '@/hooks/useWindowControls';

interface BrowserWindowProps {
    isOpen: boolean;
    onClose: () => void;
    initialUrl?: string;
    title?: string;
    windowId?: string;
}

export default function BrowserWindow({
    isOpen,
    onClose,
    initialUrl = 'https://www.google.com/search?igu=1',
    title = 'Cortex Browser',
    windowId = 'browser'
}: BrowserWindowProps) {
    // Window State
    const {
        nodeRef,
        isMaximized,
        isMinimized,
        windowSize,
        zIndex,
        toggleMaximize,
        toggleMinimize,
        startResizing,
        handleFocus
    } = useWindowControls({
        windowId, // Use prop
        initialWidth: 800,
        initialHeight: 600
    });

    // Browser State
    const [url, setUrl] = useState(initialUrl);
    const [inputUrl, setInputUrl] = useState(url);
    const [isLoading, setIsLoading] = useState(false);

    const handleNavigate = (e?: React.FormEvent) => {
        e?.preventDefault();
        let target = inputUrl;
        if (!target.startsWith('http://') && !target.startsWith('https://')) {
            target = `https://${target}`;
        }
        setUrl(target);
        setIsLoading(true);
    };

    const handleMinimize = (e?: any) => toggleMinimize(e);

    if (!isOpen) return null;

    const appliedStyle = isMinimized
        ? { height: 'min-content', width: '300px', zIndex }
        : (isMaximized
            ? { width: '100%', height: '100%', transform: 'none', zIndex }
            : { width: windowSize.width, height: windowSize.height, zIndex });

    return (
        <Draggable nodeRef={nodeRef} handle=".window-header" bounds="parent" disabled={isMaximized && !isMinimized}>
            <div
                ref={nodeRef}
                style={appliedStyle}
                onMouseDownCapture={handleFocus}
                className={`flex flex-col bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden
                    ${isMaximized && !isMinimized ? '!fixed !inset-0 !rounded-none !border-0 !m-0 !top-0 !left-0 !transform-none' : 'absolute top-10 left-10'}
                `}
            >
                <WindowHeader
                    title={title}
                    icon={Globe}
                    onMinimize={handleMinimize}
                    onMaximize={toggleMaximize}
                    isMinimized={isMinimized}
                    isMaximized={isMaximized}
                    onDoubleClick={toggleMaximize}
                    onClose={onClose}
                    className="window-header cursor-move bg-zinc-950"
                />

                {!isMinimized && (
                    <div className="flex flex-col flex-1 h-full relative">
                        {/* Address Bar */}
                        {/* <div className="flex items-center gap-2 p-2 bg-zinc-800 border-b border-zinc-700">
                            <form onSubmit={handleNavigate} className="flex-1 flex gap-2">
                                <input
                                    type="text"
                                    value={inputUrl}
                                    onChange={(e) => setInputUrl(e.target.value)}
                                    // onFocus={(e) => e.target.select()}
                                    className="flex-1 bg-zinc-900 border border-zinc-600 rounded px-3 py-1.5 text-xs text-zinc-200 focus:border-blue-500 focus:outline-none font-mono"
                                    placeholder="Enter URL (e.g. tarkov.dev)"
                                />
                                <button type="submit" className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded">
                                    <ArrowRight size={14} />
                                </button>
                            </form>
                            <button
                                onClick={() => { setIsLoading(true); const u = url; setUrl(''); setTimeout(() => setUrl(u), 10); }}
                                className="p-1.5 text-zinc-400 hover:bg-zinc-700 rounded"
                            >
                                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                            </button>
                        </div> */}

                        {/* Iframe */}
                        <div className="flex-1 bg-white relative">
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

                        {/* Resize Handle */}
                        {!isMaximized && (
                            <div
                                className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-50 pointer-events-auto"
                                onMouseDown={startResizing}
                            />
                        )}
                    </div>
                )}
            </div>
        </Draggable>
    );
}
