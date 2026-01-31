'use client';

import { useState, useEffect } from 'react';
import { useMapStore } from '@/store/useMapStore';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';

import OpsController from '@/components/apps/map/OpsController';
import MapViewer from '@/components/apps/map/MapViewer';
import AppIcon from '@/components/common/AppIcon';
// import BootScreen from '@/components/common/BootScreen';
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
    props: {
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

  // Stores
  const { isMapOpen, toggleMapOpen } = useMapStore();
  const { windowStack, focusWindow, isFullscreen, windowStates, restoreWindow } = useUIStore();

  // Auth Store에서 상태 가져오기 (localStorage 로직 대체)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // bootComplete는 UI 흐름 제어용이므로 로컬 유지하되, 인증된 상태면 true로 시작
  const [bootComplete, setBootComplete] = useState(false);
  const [openWindows, setOpenWindows] = useState<Set<string>>(new Set());

  // 마운트 시 인증 상태 체크하여 부팅 화면 스킵 여부 결정
  useEffect(() => {
    // 이미 인증되어 있다면 부팅 화면을 보여주지 않고 바로 진입
    if (isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBootComplete(true);
    }
  }, [isAuthenticated]);

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

  const handleLaunch = (appId: string) => {
    const isAppOpen = openWindows.has(appId) || (appId === 'map' && isMapOpen);

    if (!isAppOpen) {
      if (appId === 'map') toggleMapOpen();
      else openApp(appId);

      restoreWindow(appId);
      return;
    }

    const appState = windowStates[appId];
    const activeId = windowStack[windowStack.length - 1];

    if (appState?.isMinimized) {
      restoreWindow(appId);
    } else if (activeId !== appId) {
      focusWindow(appId);
    }
  };

  const handleBackgroundClick = () => {
    setSelectedIconId(null);
  };

  // AuthOverlay에서 로그인이 완료되면 Store가 업데이트되어 isAuthenticated가 true가 됨
  // 따라서 별도의 핸들러 로직이 필요 없음 (빈 함수 전달)
  const handleLoginSuccess = () => {
    // 필요 시 추가 로직 (예: 환영 사운드 재생 등)
  };

  const desktopIcons = useDesktopGrid(APP_REGISTRY, {
    startX: 32,
    startY: 32,
    gapX: 110,
    gapY: 90,
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

  // 렌더링 로직:
  // 1. 미인증 && 부팅전 -> BootScreen
  // 2. 미인증 && 부팅완료 -> AuthOverlay
  // 3. 인증됨 -> Desktop (BootScreen, AuthOverlay 무시)

  return (
    <main className="flex flex-col w-full h-screen overflow-hidden bg-zinc-900 relative" onClick={handleBackgroundClick}>
      <Wallpaper />

      {/* 인증되지 않았을 때만 부팅/로그인 화면 표시 */}
      {!isAuthenticated && (
        <>
          {/* {!bootComplete && <BootScreen onComplete={() => setBootComplete(true)} />} */}
          {bootComplete && <AuthOverlay onLogin={handleLoginSuccess} />}
        </>
      )}

      {/* 인증 완료 시 데스크탑 표시 (부팅 여부 상관없이 isAuthenticated가 우선) */}
      {isAuthenticated && (
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
                TG-OS // <span className="text-yellow-500/20">TERRAGROUP</span> RESEARCH LABS // AUTHORIZED ACCESS ONLY
              </h1>
            </div>
          </div>
        </>
      )}
    </main>
  );
}