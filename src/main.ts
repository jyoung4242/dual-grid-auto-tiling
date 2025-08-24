// main.ts
import "./style.css";

import { UI } from "@peasy-lib/peasy-ui";
import { Engine, DisplayMode, TileMap, vec, toRadians, Tile, Vector, PointerButton, Buttons } from "excalibur";
import { model, template } from "./UI/UI";
import { loader, tileSS } from "./resources";

await UI.create(document.body, model, template).attached;

/******************************
 * Initializations and Types
 *******************************/
//#region initializations

type TileList = {
  TL: Tile | undefined;
  TR: Tile | undefined;
  BL: Tile | undefined;
  BR: Tile | undefined;
};

const TileState = {
  soil: "soil",
  grass: "grass",
} as const;

const game = new Engine({
  width: 800, // the width of the canvas
  height: 600, // the height of the canvas
  canvasElementId: "cnv", // the DOM canvas element ID, if you are providing your own
  displayMode: DisplayMode.Fixed, // the display mode
  pixelArt: true,
});

const worldMap = new TileMap({
  columns: 25,
  rows: 25,
  tileWidth: 16,
  tileHeight: 16,
});
const meshMap = new TileMap({
  columns: 26,
  rows: 26,
  tileWidth: 16,
  tileHeight: 16,
});

worldMap.pos = vec(0, 0);
worldMap.z = 0;
meshMap.pos = vec(-8, -8);
meshMap.z = 1;

await game.start(loader);
game.add(worldMap);
game.add(meshMap);

game.currentScene.camera.pos = vec(16 * 12.5, 16 * 12.5);
game.currentScene.camera.zoom = 1.2;
let isDragging = false;
let lastTile: Tile | null = null;
let activeButton: PointerButton | null = null;
//#endregion initializations

/********************************
 * Mouse Events and Controls
 *******************************/

//#region mouseEvents
game.input.pointers.primary.on("down", e => {
  if (e.button !== PointerButton.Left && e.button !== PointerButton.Right) return; // ignore other buttons
  activeButton = e.button;
  isDragging = true;
  lastTile = null; // reset so first tile definitely triggers
  setTileState(game.input.pointers.primary.lastWorldPos, activeButton);
});

game.input.pointers.primary.on("up", e => {
  isDragging = false;
  lastTile = null;
  activeButton = null;
});

game.input.pointers.primary.on("move", e => {
  if (isDragging && activeButton) {
    setTileState(game.input.pointers.primary.lastWorldPos, activeButton);
  }
});

//#endregion mouseEvents

/********************************
 * Utility Tile Functions
 *******************************/

//#region tile functions
const setTileState = (pPos: Vector, buttonState: PointerButton) => {
  const tx = Math.floor(pPos.x / worldMap.tileWidth);
  const ty = Math.floor(pPos.y / worldMap.tileHeight);
  if (tx >= 0 && tx < worldMap.columns && ty >= 0 && ty < worldMap.rows) {
    if (lastTile !== worldMap.getTile(tx, ty)) {
      const state = buttonState === PointerButton.Left ? TileState.grass : TileState.soil;
      worldMap.getTile(tx, ty)!.data.set("state", state);
      lastTile = worldMap.getTile(tx, ty);
    }
  }

  updateMeshMap();
  redrawMeshTileMap();
};

const updateMeshMap = () => {
  for (const tile of meshMap.tiles) {
    const worldNeighbors = tile.data.get("worldNeighbors");
    const { spriteIndex, rotation } = calculateMeshSprite(worldNeighbors);
    if (spriteIndex === null || rotation === null) {
      tile.data.delete("meshTile");
      tile.data.delete("rotation");
      continue;
    }
    tile.data.set("meshTile", spriteIndex);
    tile.data.set("rotation", toRadians(rotation));
  }
};

const redrawMeshTileMap = () => {
  let tileindex = 0;
  for (const tile of meshMap.tiles) {
    tile.clearGraphics();
    //grab sprite index and rotation
    const spriteIndex = tile.data.get("meshTile");
    const rotation = tile.data.get("rotation");
    tileindex++;
    if (!spriteIndex) continue;
    let sprite = tileSS.getSprite(spriteIndex, 0);
    let spritecopy = sprite.clone();
    spritecopy.rotation = rotation;
    tile.addGraphic(spritecopy);
  }
};

const calculateMeshSprite = (neighbors: TileList): { spriteIndex: number | null; rotation: number | null } => {
  //you find the sprite Index by counting grass tiles around current tile.
  //loop through neighbors and count grass tiles

  let grassCount = 0;
  if (!neighbors) return { spriteIndex: null, rotation: null };
  Object.values(neighbors).forEach(tile => {
    if (!tile) return;
    if (tile.data.get("state") === TileState.grass) {
      grassCount++;
    }
  });

  // empty tile
  let spriteIndex = 0;
  let rotation = 0;
  let isTLGrass = neighbors.TL?.data.get("state") === TileState.grass;
  let isTRGrass = neighbors.TR?.data.get("state") === TileState.grass;
  let isBLGrass = neighbors.BL?.data.get("state") === TileState.grass;
  let isBRGrass = neighbors.BR?.data.get("state") === TileState.grass;

  if (grassCount === 0) return { spriteIndex: null, rotation: null };
  else if (grassCount === 1) {
    spriteIndex = 1;

    if (isTLGrass) {
      rotation = 180;
    } else if (isTRGrass) {
      rotation = -90;
    } else if (isBLGrass) {
      rotation = 90;
    } else if (isBRGrass) {
      rotation = 0;
    }
  } else if (grassCount === 2) {
    // are they next to each other or cattycorner?
    // get index of neighbors

    if (isTLGrass && isTRGrass) {
      spriteIndex = 2;
      rotation = -90;
    } else if (isTLGrass && isBLGrass) {
      spriteIndex = 2;
      rotation = 180;
    } else if (isTRGrass && isBRGrass) {
      spriteIndex = 2;
      rotation = 0;
    } else if (isBLGrass && isBRGrass) {
      spriteIndex = 2;
      rotation = 90;
    } else if (isTLGrass && isBRGrass) {
      spriteIndex = 3;
      rotation = 90;
    } else if (isTRGrass && isBLGrass) {
      spriteIndex = 3;
      rotation = 0;
    }
  } else if (grassCount === 3) {
    spriteIndex = 4;

    if (!isTLGrass) {
      rotation = 0;
    } else if (!isTRGrass) {
      rotation = 90;
    } else if (!isBLGrass) {
      rotation = -90;
    } else if (!isBRGrass) {
      rotation = 180;
    }
  } else if (grassCount === 4) spriteIndex = 5;

  return { spriteIndex, rotation };
};

const getWorldNeighbors = (currentMeshTile: Tile): TileList => {
  let TL: Tile | undefined = undefined;
  let TR: Tile | undefined = undefined;
  let BL: Tile | undefined = undefined;
  let BR: Tile | undefined = undefined;

  // get positions of four corners
  const topLefMeshTile = currentMeshTile.pos.clone();
  const topRightMeshTile = currentMeshTile.pos.clone().add(vec(16, 0));
  const bottomLeftMeshTile = currentMeshTile.pos.clone().add(vec(0, 16));
  const bottomRightMeshTile = currentMeshTile.pos.clone().add(vec(16, 16));

  // for each direction, find mesh tile that has that contains that position
  TL = worldMap.tiles.find(tile => topLefMeshTile.equals(tile.center));
  TR = worldMap.tiles.find(tile => topRightMeshTile.equals(tile.center));
  BL = worldMap.tiles.find(tile => bottomLeftMeshTile.equals(tile.center));
  BR = worldMap.tiles.find(tile => bottomRightMeshTile.equals(tile.center));
  return { TL, TR, BL, BR };
};

//#endregion tile functions

/********************************
 * Wait one frame to initialize
 *******************************/
setTimeout(() => {
  for (const tile of worldMap.tiles) {
    tile.addGraphic(tileSS.getSprite(0, 0));
    tile.data.set("state", TileState.soil);
  }
  for (const tile of meshMap.tiles) {
    tile.data.set("worldNeighbors", getWorldNeighbors(tile));
    tile.data.set("meshTile", null);
    tile.data.set("rotation", 0);
  }
  // initialize
  updateMeshMap();
  redrawMeshTileMap();
}, 20);
