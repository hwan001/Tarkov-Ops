# ❖ Tarkov Operating System
### Web-Based Tactical Command Interface // Ver. 0.1.0-alpha

![Status](https://img.shields.io/badge/STATUS-ONLINE-success?style=for-the-badge)
![Environment](https://img.shields.io/badge/ENV-WEB%20BROWSER-orange?style=for-the-badge)
![License](https://img.shields.io/badge/LICENSE-AGPL%20v3-blue?style=for-the-badge)

<br/>

> **SYSTEM ALERT:**
> You are accessing the **TerraGroup Remote Terminal**.
> This interface simulates a tactical desktop environment directly in your browser.

---

## ⚖️ License & Intellectual Property

### Source Code: GNU AGPL v3
The source code of this project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.
- You are free to copy, distribute, and modify the code.
- If you run this software on a standard network (e.g., as a website), you **must** disclose the source code to the users.
- **Commercial use is permitted**, provided you comply with the AGPL's open-source requirements.
- See [LICENSE](./LICENSE) for full details.

### ⚠️ Intellectual Property Disclaimer (Assets)
This project is a fan-made application and is **not** affiliated with Battlestate Games.

- **Game Assets**: All game images, maps, icons, and lore (e.g., "TerraGroup", "Tarkov", map images) are the intellectual property of **Battlestate Games Limited**.
- **Fair Use**: These assets are used for non-commercial, educational, and fan community purposes under the principles of Fair Use and [Battlestate Games Fan Content Policy](https://www.escapefromtarkov.com/).
- **Non-Commercial Restriction**: You may **NOT** use the game maps or copyrighted assets from this project for commercial purposes (e.g., selling access, placing ads on maps) without explicit permission from Battlestate Games.

---

## 📂 Overview

**Tarkov Operating System (TOS)** is a web-based **Desktop Environment Simulation** built for Escape form Tarkov players. It consolidates mapping, mission planning, and tactical tools into a window-based interface that feels like a real OS.

Instead of Alt-Tabbing between static web pages, use TOS as your second monitor "Battle Station".

---

## ⚡ Key Features

### 🖥️ Desktop Environment
- **Window Management**: Draggable, resizable, and minimizable windows (`react-draggable`).
- **App Launcher**: Desktop icons for quick access to tools.
- **Taskbar & Tray**: (Coming Soon) System status indicators.
- **Wallpaper Engine**: Immersive tactical backgrounds.

### 🗺️ Tactical Map Viewer (`MapViewer`)
- **Multi-Map Support**:
  - **Game Maps**: High-res images of Tarkov locations (Customs, Woods, etc.).
  - **Real World Maps**: OpenStreetMap (OSM) tile support for real-world ops.
- **Full Screen Mode**: Immersive full-screen map experience with floating overlays.
- **Vector Drawing Tools**: Draw walls, loot paths, and danger zones directly on the map.
- **Persistence**: Your drawings and settings are saved automatically.

### 🎮 Ops Controller (`OpsController`)
- **Mission Planning**:
  - Set **Spawn Points** and **Extract Goals**.
  - Visualize routes and objectives.
- **Layer Management**: Toggle visibility of Extracts, Bosses, and Coordinate Grids.
- **Independent Floating Panel**: Can be moved independently of the map window.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | **Next.js 16** (App Router) |
| **UI Engine** | **React 19** + **Tailwind CSS v4** |
| **State Management** | **Zustand** (Global Store) |
| **Mapping Engine** | **React-Leaflet** + **Leaflet-Geoman** |
| **Window System** | **React-Draggable** |
| **Icons** | **Lucide-React** |

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* npm / yarn / pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hwan001/Tarkov-Ops.git
   cd tarkov-ops
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

4. **Access the Terminal:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```bash
tarkov-ops/
├── app/
│   └── page.tsx           # Desktop Entry Point (Wallpaper, Icons)
├── components/
│   ├── MapViewer.tsx      # Window Container for Map
│   ├── TarkovMap.tsx      # Leaflet Map Engine Wrapper
│   ├── OpsController.tsx  # Floating Mission Control Panel
│   ├── MapEditor.tsx      # Drawing Logic (Geoman)
│   └── AppIcon.tsx        # Desktop Launcher Icons
├── store/
│   └── useMapStore.ts     # Global State (Zustand)
└── public/
    ├── maps/              # Game Map Images
    └── marker/            # Tactical SVG Markers
```

---

<div align="center">
  <i>"Knowledge is the key to survival."</i> - TerraGroup
</div>