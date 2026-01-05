'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useMapStore } from '@/store/useMapStore';
import { useSquadStore } from '@/store/useSquadStore';

import OpsController from '@/components/apps/map/OpsController';
import MapViewer from '@/components/apps/map/MapViewer';
import AppIcon from '@/components/common/AppIcon';
import BootScreen from '@/components/common/BootScreen';
import AuthOverlay from '@/components/common/AuthOverlay';

import SettingsWindow from '@/components/apps/settings/SettingsWindow';
import BrowserWindow from '@/components/apps/browser/BrowserWindow'; // [NEW]
import Wallpaper from '@/components/common/Wallpaper';
import ConnectionTest from '@/components/common/ConnectionTest';
import { Globe, ShoppingCart, Target } from 'lucide-react'; // [NEW]

// Map 관련 컴포넌트는 SSR 불가 (window 객체 사용)
const TarkovMap = dynamic(() => import('@/components/apps/map/TarkovMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-zinc-900 flex flex-col items-center justify-center text-white gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      <p className="text-zinc-400 text-sm">Loading Tarkov Ops...</p>
    </div>
  ),
});

export default function Home() {
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  const { isMapOpen, toggleMapOpen } = useMapStore();

  // System State
  const [bootComplete, setBootComplete] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  useEffect(() => {
    // Check for saved credentials
    const saved = localStorage.getItem('tarkov_ops_auth');
    if (saved) {
      try {
        const creds = JSON.parse(saved);
        if (creds.callsign) {
          useSquadStore.setState({ nickname: creds.callsign });
          setIsAuthenticated(true);
          setBootComplete(true); // Skip boot animation
        }
      } catch (e) { }
    }
  }, []);

  const handleLogin = (creds: { apiKey: string; callsign: string }) => {
    useSquadStore.setState({ nickname: creds.callsign });
    setIsAuthenticated(true);
  };

  const handleBackgroundClick = () => {
    setSelectedIconId(null);
  };


  return (
    <main
      className="relative w-full h-screen overflow-hidden bg-zinc-900"
      onClick={handleBackgroundClick}
    >
      <Wallpaper />

      {/* System Flow */}
      {!bootComplete && <BootScreen onComplete={() => setBootComplete(true)} />}

      {
        bootComplete && !isAuthenticated && (
          <AuthOverlay onLogin={handleLogin} />
        )
      }

      {/* Main OS Content (Visible only after auth, or maybe visible behind auth but disabled?) */}
      {/* Let's show it behind Auth for the "transparency" effect user asked for */}
      {
        bootComplete && (
          <>
            {/* Only render if launched (isMapOpen) */}
            {isMapOpen && <MapViewer name="Tarkov" />}

            {/* 2. 우측 작전 패널 (Independent Window) */}
            <OpsController />

            {/* Settings Window */}
            <SettingsWindow isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            {/* Browser Window */}
            <BrowserWindow isOpen={isBrowserOpen} onClose={() => setIsBrowserOpen(false)} windowId="browser" />

            {/* Market Window */}
            <BrowserWindow
              isOpen={isMarketOpen}
              onClose={() => setIsMarketOpen(false)}
              initialUrl="https://tarkov-market.com"
              title="Tarkov Market"
              windowId="market"
            />

            <BrowserWindow
              isOpen={isTrackerOpen}
              onClose={() => setIsTrackerOpen(false)}
              initialUrl="https://tarkovtracker.io/"
              title="Tarkov Tracker"
              windowId="tracker"
            />

            {/* <ConnectionTest /> */}

            {/* 3. 데스크탑 아이콘 (Launcher) */}
            <AppIcon
              id="bms"
              name="BMS"
              iconUrl="/icons/bms.png"
              initialPosition={{ x: 40, y: 40 }}
              isSelected={selectedIconId === 'bms'}
              onSelect={setSelectedIconId}
              onLaunch={() => {
                if (!isMapOpen) toggleMapOpen();
              }}
            />

            <AppIcon
              id="setting"
              name="Settings"
              iconUrl="/icons/settings.png"
              initialPosition={{ x: 40, y: 130 }}
              isSelected={selectedIconId === 'setting'}
              onSelect={setSelectedIconId}
              onLaunch={() => setIsSettingsOpen(true)}
            />

            <AppIcon
              id="market"
              name="Market"
              icon={ShoppingCart}
              initialPosition={{ x: 40, y: 220 }}
              isSelected={selectedIconId === 'market'}
              onSelect={setSelectedIconId}
              onLaunch={() => setIsMarketOpen(true)}
            />

            <AppIcon
              id="tracker"
              name="Tracker"
              icon={Target}
              initialPosition={{ x: 40, y: 310 }}
              isSelected={selectedIconId === 'tracker'}
              onSelect={setSelectedIconId}
              onLaunch={() => setIsTrackerOpen(true)}
            />

            {/* 4. 하단 저작권/버전 표시 */}
            <div className="absolute bottom-4 left-4 z-[500] select-none pointer-events-none opacity-50">
              <h1 className="text-2xl font-black text-white/10 tracking-tighter uppercase select-none">
                Tarkov Operating System by <span className="text-yellow-500/20">Terragroup</span>
              </h1>
            </div>
          </>
        )
      }
    </main >
  );
}