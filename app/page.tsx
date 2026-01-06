'use client';

import { useState, useEffect } from 'react';
import { useMapStore } from '@/store/useMapStore';
import { useSquadStore } from '@/store/useSquadStore';
import { useUIStore } from '@/store/useUIStore';

import OpsController from '@/components/apps/map/OpsController';
import MapViewer from '@/components/apps/map/MapViewer';
import AppIcon from '@/components/common/AppIcon';
import BootScreen from '@/components/common/BootScreen';
import AuthOverlay from '@/components/common/AuthOverlay';
import SettingsWindow from '@/components/apps/settings/SettingsWindow';
import BrowserWindow from '@/components/apps/browser/BrowserWindow';
import Wallpaper from '@/components/common/Wallpaper';
import AppBar from '@/components/common/AppBar';
import { Eye, Globe, Settings, ShoppingCart, Target } from 'lucide-react';

import { useDesktopGrid } from '@/hooks/useDesktopGrid';

const APP_REGISTRY = [
  {
    id: 'map',
    name: 'Tactical Map',
    icon: Eye,
    component: null,
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    component: SettingsWindow,
  },
  {
    id: 'market',
    name: 'Market',
    icon: ShoppingCart,
    component: BrowserWindow,
    props: { // 별도 props 전달용 객체
      initialUrl: "https://tarkov-market.com",
      title: "Tarkov Market",
      windowId: "market"
    }
  },
  {
    id: 'tracker',
    name: 'Tracker',
    icon: Target,
    component: BrowserWindow,
    props: {
      initialUrl: "https://tarkovtracker.io/",
      title: "Tarkov Tracker",
      windowId: "tracker"
    }
  }
];

export default function Home() {
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  const { isMapOpen, toggleMapOpen } = useMapStore();
  const { windowStack, focusWindow, isFullscreen, windowStates, setWindowState, restoreWindow } = useUIStore();
  const [bootComplete, setBootComplete] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [openWindows, setOpenWindows] = useState<Set<string>>(new Set());

  const openApp = (id: string) => {
    setOpenWindows(prev => new Set(prev).add(id));
    focusWindow(id);
  };

  const closeApp = (id: string) => {
    setOpenWindows(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Launch Logic
  const handleLaunch = (appId: string) => {
    const isAppOpen = openWindows.has(appId) || (appId === 'map' && isMapOpen);

    // 1. 앱이 아직 안 켜져 있으면 -> 염
    if (!isAppOpen) {
      if (appId === 'map') toggleMapOpen();
      else openApp(appId);

      // 열자마자 초기화 및 포커스
      restoreWindow(appId);
      return;
    }

    // 2. 이미 켜져 있는 상태에서의 동작 제어
    const appState = windowStates[appId];
    const isActive = windowStack[windowStack.length - 1] === appId;

    if (appState?.isMinimized) {
      // A. 최소화되어 있다면 -> 복구 (기존 좌표/크기로)
      restoreWindow(appId);
    } else if (!isActive) {
      // B. 화면엔 있는데 뒤에 있다면 -> 앞으로 가져오기
      focusWindow(appId);
    }
    // else {
    //   // C. 이미 맨 앞에 활성화되어 있다면 -> 최소화 (Toggle 기능)
    //   // 원치 않으시면 이 else 블록을 지우시면 됩니다 
    //   setWindowState(appId, { isMinimized: true });
    // }
  };

  useEffect(() => {
    const saved = localStorage.getItem('tarkov_ops_auth');
    if (saved) {
      try {
        const creds = JSON.parse(saved);
        if (creds.callsign) {
          useSquadStore.setState({ nickname: creds.callsign });
          setIsAuthenticated(true);
          setBootComplete(true);
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

  const desktopIcons = useDesktopGrid(APP_REGISTRY, {
    startX: 32,  // 좌측 여백
    startY: 32,  // 상단 여백
    gapX: 110,   // 가로 간격
    gapY: 90,   // 세로 간격
    itemHeight: 80
  });

  const activeId = windowStack[windowStack.length - 1];

  const runningApps = [
    ...(isMapOpen ? [{ id: 'map', name: 'Tactical Map', icon: Eye, isActive: activeId === 'map' }] : []),
    ...APP_REGISTRY.filter(app => openWindows.has(app.id) && app.id !== 'map').map(app => ({
      id: app.id,
      name: app.name,
      icon: app.icon || Globe,
      isActive: activeId === app.id
    }))
  ];

  return (
    <main className="flex flex-col w-full h-screen overflow-hidden bg-zinc-900 relative" onClick={handleBackgroundClick}>
      <Wallpaper />
      {!bootComplete && <BootScreen onComplete={() => setBootComplete(true)} />}
      {bootComplete && !isAuthenticated && <AuthOverlay onLogin={handleLogin} />}

      {bootComplete && (
        <>
          {!isFullscreen && (
            <AppBar
              openApps={runningApps}
              onAppClick={(id) => handleLaunch(id)}
            />
          )}

          {/* Desktop Area */}
          <div id="desktop-area" className="flex-1 relative overflow-hidden z-10 w-full h-full">

            {isMapOpen && <MapViewer name="Tarkov" />}
            <OpsController />

            {APP_REGISTRY.map(app => {
              if (app.id === 'map' || !app.component) return null;
              const Component = app.component;
              const isOpen = openWindows.has(app.id);

              if (!isOpen) return null;

              return (
                <div key={app.id} style={{ display: 'contents' }}>
                  <Component
                    isOpen={isOpen}
                    onClose={() => closeApp(app.id)}
                    {...(app.props || {})}
                  />
                </div>
              );
            })}

            {desktopIcons.map(app => (
              <AppIcon
                key={app.id}
                id={app.id}
                name={app.name}
                iconUrl={undefined}
                icon={app.icon}
                initialPosition={app.pos}
                isSelected={selectedIconId === app.id}
                onSelect={setSelectedIconId}
                onLaunch={() => handleLaunch(app.id)}
              />
            ))}

            <div className="absolute bottom-4 left-4 z-[50] select-none pointer-events-none opacity-50">
              <h1 className="text-2xl font-black text-white/10 tracking-tighter uppercase select-none">
                Tarkov Operating System by <span className="text-yellow-500/20">Terragroup</span>
              </h1>
            </div>
          </div>
        </>
      )}
    </main>
  );
}