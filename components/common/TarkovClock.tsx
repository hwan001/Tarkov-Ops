'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function TarkovClock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const updateTime = () => {
            // Tarkov Time Calculation (Approximate 7x speed)
            // This is a naive implementation. For exact sync, we'd need an API.
            // We'll simulate a persistent "Left" and "Right" time (usually 12h apart).
            // For UI purposes, we'll just show one "Raid Time" which moves fast.

            const now = new Date();
            // Arbitrary offset to make it look like a specific time of day if needed
            // Just running 7x faster than real time
            const gameTime = new Date(now.getTime() * 7);
            setTime(gameTime);
        };

        const timer = setInterval(updateTime, 1000); // Update every second (game time moves ~7s per real second)
        updateTime();

        return () => clearInterval(timer);
    }, []);

    // Format: HH:MM:SS
    const formatted = time.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return (
        <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded border border-zinc-800 text-zinc-300 font-mono text-xs select-none">
            <Clock size={12} className="text-yellow-600" />
            <span className="font-bold tracking-wider">{formatted}</span>
        </div>
    );
}
