# Dual Tilemap Autotiling Demo

This project is a **tilemap autotiling demo** built with [Excalibur.js](https://excaliburjs.com/) and
[Peasy-UI](https://github.com/peasy-lib/peasy-ui).  
It demonstrates how to use **two overlapping tilemaps**—a _world map_ and a _mesh map_—to implement autotiling behavior for terrain (in
this case, soil and grass).

The key idea is:

- The **world map** stores the base tile states (`soil` or `grass`).
- The **mesh map** overlays and automatically updates based on the surrounding tiles, applying the correct transition tiles and
  rotations.

---

## 🎮 Controls

- **Left Mouse Button** → Paint grass tiles
- **Right Mouse Button** → Clear grass tiles (return to soil)
- Click and **drag** to draw continuously

---

## 🖼️ Features

- Dual-tilemap system: one for state, one for visual mesh
- Autotiling based on neighbor states
- Smooth drag-painting with left/right mouse
- Pixel-art friendly rendering
- Camera centered on the map with slight zoom

---

## 🛠️ Tech Stack

- [Excalibur.js](https://excaliburjs.com/) – 2D HTML5 game engine
- [Peasy-UI](https://github.com/peasy-lib/peasy-lib/blob/main/packages/peasy-ui/README.md) – UI binding library
- TypeScript

---

## 🚀 Getting Started

### 1. Clone the repo

```sh
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```
