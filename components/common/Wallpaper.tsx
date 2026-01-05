'use client';

import { useSettingStore } from "@/store/useSettingStore";


export default function Wallpaper() {
    const { wallpaperSrc } = useSettingStore();

    return (
        <div className="absolute inset-0 z-0 select-none pointer-events-none" >
            <img
                src={wallpaperSrc}
                alt="Wallpaper"
                className="w-full h-full object-cover opacity-100"
            />
            <div className="absolute inset-0 bg-black/60 mix-blend-multiply" />
        </div >
    );
}