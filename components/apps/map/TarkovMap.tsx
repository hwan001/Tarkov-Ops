'use client';

import { useState, useEffect } from 'react';
import { MapContainer, ImageOverlay, TileLayer, useMapEvents, Popup, Marker, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapStore } from '@/store/useMapStore';
import { useUIStore } from '@/store/useUIStore';
import MapEditor from './MapEditor';
import CoordinateGrid from '@/components/apps/map/layers/CoordinateGrid';

const CRS = L.CRS.Simple;

// SVG Icons
const spawnIcon = L.icon({
  iconUrl: '/marker/spawn.svg',
  iconSize: [20, 20],
  iconAnchor: [10, 10], // Center
  popupAnchor: [0, -10],
});

const extractIcon = L.icon({
  iconUrl: '/marker/extract.svg',
  iconSize: [20, 20],
  iconAnchor: [10, 10], // Center
  popupAnchor: [0, -10],
});

// Leaflet 기본 마커 아이콘 깨짐 현상 수정 (Boss용)
const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// 커스텀 인터랙션 핸들러: 트랙패드 휠(Pan)과 핀치(Zoom) 구분
function MapInteractionHandler() {
  const map = useMapEvents({});

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // 1. Pinch Zoom (Ctrl + Wheel / Trackpad Pinch)
      // ctrlKey가 눌려있으면 Leaflet이 처리하도록 둡니다 (Zoom 동작)
      if (e.ctrlKey) {
        return;
      }

      // 2. Pan (일반 Wheel / Trackpad 이동)
      // Leaflet의 기본 Zoom 동작을 막고, 맵을 이동시킵니다.
      e.preventDefault();       // 브라우저 스크롤 방지
      e.stopPropagation();      // **CRITICAL**: Leaflet으로 이벤트 전파 방지 (Zoom 방지)

      map.panBy([e.deltaX, e.deltaY], { animate: false });
    };

    const container = map.getContainer();

    // **Capture Phase** 사용 (Leaflet보다 먼저 이벤트를 가로채기 위해 capture: true 설정)
    container.addEventListener('wheel', handleWheel, { passive: false, capture: true });

    return () => {
      container.removeEventListener('wheel', handleWheel, { capture: true });
    };
  }, [map]);

  return null;
}

// 클릭 이벤트를 처리하는 내부 컴포넌트
function ClickHandler() {
  const { setStartPoint, isStartPointLocked } = useMapStore();
  useMapEvents({
    click(e) {
      // Shift 키 누른 상태에서는 무시 (Shift+Drag Zoom 방지 및 다른 단축키 충돌 예방)
      // if (e.originalEvent.shiftKey) return;
      if (isStartPointLocked) return; // Locked 상태면 무시

      // 맵을 클릭하면 해당 위치(latlng)를 시작점으로 설정 (Store 업데이트)
      setStartPoint({ x: e.latlng.lng, y: e.latlng.lat });
      console.log(`[Click] Coords: [x:${e.latlng.lng.toFixed(0)}, y:${e.latlng.lat.toFixed(0)}]`);
    },
  });
  return null;
}

// [수정 1] 줌/이동 이벤트 핸들러 (이벤트가 발생했을 때만 스토어 업데이트)
function MapStateSync() {
  const { setZoom } = useMapStore();

  useMapEvents({
    // 줌이 끝났을 때만 실행 (무한 루프 방지)
    zoomend: (e) => {
      setZoom(e.target.getZoom());
    },
    // 필요하다면 moveend 등 추가
  });

  return null;
}

// [수정 2] 맵 인스턴스 등록 및 리사이즈 처리
function MapRegistrar() {
  const map = useMap();
  const { setMapInstance } = useUIStore();

  useEffect(() => {
    setMapInstance(map);
    return () => setMapInstance(null);
  }, [map, setMapInstance]);

  // 창 크기가 변하거나 드래그로 사이즈가 변할 때 맵 깨짐 방지
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });

    // map container의 부모 요소를 관찰
    if (map.getContainer().parentElement) {
      resizeObserver.observe(map.getContainer().parentElement as Element);
    }

    return () => resizeObserver.disconnect();
  }, [map]);

  return null;
}

export default function TarkovMap() {
  const [isMounted, setIsMounted] = useState(false);

  // Zustand 스토어 구독
  const {
    showExtracts, showBosses, currentMap,
    startPoint, selectedExtracts,
    updateFeature, removeFeature, showDrawings, mapFeatures
  } = useMapStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="w-full h-screen bg-zinc-900 text-white flex items-center justify-center">Loading Map Engine...</div>;

  const isImageMap = currentMap.type === 'image';
  // Fallback defaults to prevent TS undefined errors
  const mapWidth = currentMap.width || 2000;
  const mapHeight = currentMap.height || 2000;

  const mapCRS = isImageMap ? CRS : L.CRS.EPSG3857;
  const mapCenter: L.LatLngExpression = isImageMap ? [mapHeight / 2, mapWidth / 2] : [51.505, -0.09];
  const initialZoom = isImageMap ? -1 : 13;
  const minZoom = isImageMap ? -2.4 : 2;
  const maxZoom = isImageMap ? 2.4 : 19;

  const mapBounds: L.LatLngBoundsExpression = isImageMap ? [[0, 0], [mapHeight, mapWidth]] : [[-90, -180], [90, 180]];
  const maxBounds: L.LatLngBoundsExpression | undefined = isImageMap ? [[-500, -500], [mapHeight + 500, mapWidth + 500]] : undefined;

  return (
    <div className="w-full h-full relative bg-[#1a1a1a]">
      {/* MapContainer ... */}
      <MapContainer
        key={currentMap.id}
        center={mapCenter}
        zoom={initialZoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        crs={mapCRS}
        zoomControl={false} // Disable default
        scrollWheelZoom={true} // Pinch enabled
        boxZoom={false}
        doubleClickZoom={false}
        style={{ height: '100%', width: '100%', background: '#1a1a1a' }}
        maxBounds={maxBounds}
        attributionControl={false}
        zoomSnap={0.4}  // 0.4 단위 줌 스냅
        zoomDelta={0.4} // 한 번 휠/버튼 줌 시 변경량
      >
        <MapRegistrar />
        <MapStateSync />

        {/* 1. Base Layer: Image vs Tile */}
        {isImageMap ? (
          <>
            <ImageOverlay url={currentMap.imageUrl!} bounds={mapBounds} />
            {/* 0. Coordinate Grid (Only for Image Maps) */}
            <CoordinateGrid />
          </>
        ) : (
          <TileLayer
            attribution={currentMap.attribution || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
            url={currentMap.tileUrl || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
          />
        )}

        {/* 2. 에디터 로직 (Drawing Inteactions only) */}
        <MapEditor />

        {/* 3. Render User Drawings (Paths, Markers, Danger) */}
        {showDrawings && mapFeatures.map((feature) => {
          // Helper to reverse coords for Leaflet [lat, lng]
          // GeoJSONPoint: [lng, lat]

          if (feature.type === 'marker' && feature.geometry.type === 'Point') {
            const [lng, lat] = feature.geometry.coordinates;
            const isSelected = selectedExtracts.includes(feature.id);

            // Determine Icon based on subType
            let markerIcon = iconDefault; // Default Blue
            if (feature.subType === 'boss') {
              markerIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.5);"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
              }) as any;
            } else if (feature.subType === 'quest') {
              markerIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #eab308; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.5);"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
              }) as any;
            } else if (feature.subType === 'exit') {
              if (isSelected) {
                markerIcon = extractIcon; // Selected -> Runner Icon
              } else {
                // Unselected -> Green Dot
                markerIcon = L.divIcon({
                  className: 'custom-div-icon',
                  html: `<div style="background-color: #22c55e; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.5);"></div>`,
                  iconSize: [12, 12],
                  iconAnchor: [6, 6]
                }) as any;
              }
            } else if (feature.subType === 'item') {
              markerIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.5);"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
              }) as any;
            }

            return (
              <Marker
                key={feature.id}
                position={[lat, lng]}
                icon={markerIcon}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const m = e.target;
                    const pos = m.getLatLng();
                    updateFeature(feature.id, {
                      geometry: { ...feature.geometry, coordinates: [pos.lng, pos.lat] }
                    });
                  }
                }}
              >
                <Popup minWidth={200}>
                  <div className="flex flex-col gap-2 p-1 relative z-[9999]">
                    {/* Type Selector */}
                    <div className="flex gap-1 flex-wrap" >
                      {['boss', 'item', 'quest', 'exit'].map(t => (
                        <button
                          key={t}
                          onClick={() => updateFeature(feature.id, { subType: t as any })}
                          className={`px-2 py-1 text-[10px] uppercase font-bold rounded border ${feature.subType === t
                            ? (t === 'boss' ? 'bg-red-600 border-red-500'
                              : t === 'quest' ? 'bg-yellow-600 border-yellow-500'
                                : t === 'exit' ? 'bg-green-600 border-green-500'
                                  : 'bg-blue-600 border-blue-500') + ' text-white'
                            : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Creator: <strong>{feature.creator || 'Unknown'}</strong>
                      <br />
                      [{lat.toFixed(0)}, {lng.toFixed(0)}]
                    </div>
                    <input
                      className="text-xs border rounded p-1"
                      placeholder="Add comment..."
                      value={feature.comment || ''}
                      onChange={(e) => updateFeature(feature.id, { comment: e.target.value })}
                    />
                    <button
                      onClick={() => {
                        if (confirm('Delete Marker?')) removeFeature(feature.id);
                      }}
                      className="bg-red-500 text-white text-xs py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          }

          if ((feature.type === 'path' || feature.type === 'danger') && (feature.geometry.type === 'LineString' || feature.geometry.type === 'Polygon')) {
            // For Paths/Polygons, react-leaflet <GeoJSON> is robust
            return (
              <GeoJSON
                key={feature.id}
                data={feature.geometry}
                style={() => ({
                  color: feature.type === 'danger' ? '#f59e0b' : '#fbbf24', // Orange vs Yellow
                  weight: 3,
                  dashArray: feature.type === 'path' ? '10, 10' : undefined,
                  fillOpacity: feature.type === 'danger' ? 0.2 : 0
                })}
              >
                <Popup>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-xs uppercase">{feature.type}</span>
                    {feature.type === 'path' && <span className="text-[10px] text-zinc-500">Route</span>}
                    {feature.type === 'danger' && <span className="text-[10px] text-red-500 font-bold">DANGER ZONE</span>}
                    <button onClick={() => removeFeature(feature.id)} className="text-red-500 text-xs underline">Delete</button>
                  </div>
                </Popup>
              </GeoJSON>
            );
          }

          return null;
        })}

        {/* 4. 인터랙션 & 클릭 핸들러 */}
        <MapInteractionHandler />
        <ClickHandler />

        {/* 5. 시작점 마커 (SVG) */}
        {startPoint && (
          <Marker
            position={[startPoint.y, startPoint.x]}
            icon={spawnIcon}
          >
            <Popup>
              <strong>시작 위치 (Spawn)</strong><br />
              좌표: {startPoint.x.toFixed(0)}, {startPoint.y.toFixed(0)}
            </Popup>
          </Marker>
        )}

        {/* 6. 탈출구 레이어 (Conditional) - Custom Markers handled by mapFeatures */}

        {/* 7. 보스 레이어 (Conditional) - Handled by Custom Markers now */}

      </MapContainer>
    </div>
  );
}