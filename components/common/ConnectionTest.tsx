import React, { useState } from 'react';
import { useLocalConnection } from '@/hooks/useLocalConnection'; // 위에서 만든 훅 경로

const ConnectionTest = () => {
    const { status, logs, startConnection, sendMessage } = useLocalConnection();
    const [input, setInput] = useState('');

    return (
        <div className="p-6 max-w-md bg-black/90 border border-green-500 text-green-500 font-mono rounded shadow-[0_0_20px_rgba(0,255,0,0.2)]">
            <h2 className="text-xl font-bold border-b border-green-700 pb-2 mb-4 flex justify-between">
                <span>📡 COMMS CHECK</span>
                <span className={`text-sm ${status === 'CONNECTED' ? 'animate-pulse text-green-400' : 'text-red-500'}`}>
                    [{status}]
                </span>
            </h2>

            {/* 로그 창 */}
            <div className="h-48 overflow-y-auto bg-black border border-green-800 p-2 mb-4 text-xs space-y-1">
                {logs.length === 0 && <span className="text-gray-600">Waiting for signal...</span>}
                {logs.map((log, i) => (
                    <div key={i}>{log}</div>
                ))}
            </div>

            {/* 컨트롤 패널 */}
            <div className="flex gap-2">
                {status === 'IDLE' ? (
                    <button
                        onClick={startConnection}
                        className="flex-1 bg-green-900/40 hover:bg-green-800 border border-green-600 py-2 px-4 transition-colors"
                    >
                        INITIATE UPLINK (HOST)
                    </button>
                ) : (
                    <div className="flex w-full gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    sendMessage(input);
                                    setInput('');
                                }
                            }}
                            className="flex-1 bg-black border border-green-700 p-2 text-white outline-none focus:border-green-400"
                            placeholder="Type command..."
                            disabled={status !== 'CONNECTED'}
                        />
                        <button
                            onClick={() => { sendMessage(input); setInput(''); }}
                            className="bg-green-700 text-black font-bold px-4 hover:bg-green-600 disabled:opacity-50"
                            disabled={status !== 'CONNECTED'}
                        >
                            SEND
                        </button>
                    </div>
                )}
            </div>

            <p className="mt-4 text-[10px] text-gray-500 text-center">
                * Open this page in TWO tabs. Click "INITIATE" on ONE tab only.
            </p>
        </div>
    );
};

export default ConnectionTest;