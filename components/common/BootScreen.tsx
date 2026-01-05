'use client';

import { useEffect, useState } from 'react';

interface BootScreenProps {
    onComplete: () => void;
}

export default function BootScreen({ onComplete }: BootScreenProps) {
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Step 1: Initialize
        setTimeout(() => setStep(1), 500);
        // Step 2: Show Logo
        setTimeout(() => setStep(2), 1200);
        // Step 3: Loading Text
        setTimeout(() => setStep(3), 2500);
        // Step 4: Complete
        setTimeout(() => {
            setStep(4);
            setTimeout(onComplete, 500); // Fade out time
        }, 4000);
    }, []);

    if (step >= 4) return null; // Or handle fade out in parent/css

    return (
        <div className={`fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center font-mono transition-opacity duration-1000 ${step === 4 ? 'opacity-0' : 'opacity-100'}`}>

            {/* Logo Container */}
            <div className={`relative transition-all duration-1000 ${step >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className="text-6xl font-black text-emerald-500 tracking-tighter mb-4 animate-pulse">
                    TERRAGROUP
                </div>
                <div className="absolute -top-1 -left-1 w-full h-full text-6xl font-black tracking-tighter opacity-30 animate-ping hidden" style={{ display: step === 2 ? 'block' : 'none' }}>
                    TERRAGROUP
                </div>
                <div className="h-1 w-full bg-emerald-900/50 overflow-hidden">
                    <div className="h-full bg-emerald-500 w-1/3 animate-[spin_2s_linear_infinite]" />
                </div>
            </div>

            {/* Terminal Log */}
            <div className="mt-12 text-xs text-emerald-800 space-y-1 w-64">
                {step >= 1 && <p>{'>'} SYSTEM_INIT...</p>}
                {step >= 1 && <p>{'>'} CHECKING_INTEGRITY... OK</p>}
                {step >= 2 && <p>{'>'} LOADING_MODULES... OK</p>}
                {step >= 2 && <p>{'>'} ESTABLISHING_SECURE_LINK... OK</p>}
                {step >= 3 && <p className="text-emerald-500 animate-pulse">{'>'} DECRYPTING_USER_INTERFACE...</p>}
            </div>

            {/* CRT Effect Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none" />
        </div>
    );
}
