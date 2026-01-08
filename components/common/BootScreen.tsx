'use client';

import { useEffect, useState } from 'react';

interface BootScreenProps {
    onComplete: () => void;
}

const BOOT_LOGS = [
    "SYSTEM_INIT...",
    "CHECKING_INTEGRITY...",
    "CHECKING_INTEGRITY... OK",
    "LOADING_MODULES...",
    "LOADING_MODULES... OK",
    "ESTABLISHING_SECURE_LINK...",
    "ESTABLISHING_SECURE_LINK... OK",
    "DECRYPTING_USER_INTERFACE..."
];

export default function BootScreen({ onComplete }: BootScreenProps) {
    const [step, setStep] = useState(0);

    useEffect(() => {
        let currentIndex = 0;

        const runBootSequence = () => {
            if (currentIndex >= BOOT_LOGS.length) {
                // Sequence complete
                setTimeout(() => {
                    setStep(BOOT_LOGS.length + 1); // Trigger fade out
                    setTimeout(onComplete, 500);
                }, 1000);
                return;
            }

            setStep(currentIndex + 1);
            currentIndex++;

            // Random delay between 100ms and 800ms
            const delay = Math.random() * 1000 + 100;
            setTimeout(runBootSequence, delay);
        };

        // Initial Start Delay
        setTimeout(runBootSequence, 500);
    }, [onComplete]);

    if (step > BOOT_LOGS.length + 1) return null;

    return (
        <div className={`fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center font-mono transition-opacity duration-1000 ${step > BOOT_LOGS.length ? 'opacity-0' : 'opacity-100'}`}>

            {/* Logo Container - Always visible during boot, fades in initially */}
            <div className={`relative transition-all duration-1000 ${step > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className="text-6xl font-black text-cyan-500 tracking-tighter mb-4 animate-pulse">
                    TERRAGROUP LABS
                </div>
                {/* Glitch Effect Layer */}
                <div className="absolute -top-1 -left-1 w-full h-full text-6xl font-black tracking-tighter opacity-30 animate-ping hidden" style={{ display: step % 3 === 0 ? 'block' : 'none' }}>
                    TERRAGROUP LABS
                </div>
                <div className="h-1 w-full bg-cyan-900/50 overflow-hidden">
                    <div className="h-full bg-cyan-500 w-1/3 animate-[spin_2s_linear_infinite]" />
                </div>
            </div>

            {/* Terminal Log */}
            <div className="mt-12 text-xs text-cyan-800 h-6 w-96 text-center flex flex-col items-center justify-center">
                {step > 0 && step <= BOOT_LOGS.length && (
                    <p className="animate-pulse">
                        {'>'} {BOOT_LOGS[step - 1]}
                        <span className="inline-block w-2 h-4 ml-1 bg-cyan-500 animate-pulse align-middle" />
                    </p>
                )}
            </div>

            {/* CRT Effect Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none" />
        </div>
    );
}
