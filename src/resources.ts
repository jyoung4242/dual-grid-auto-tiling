// resources.ts
import { ImageSource, Loader, Sprite, SpriteSheet } from "excalibur";
import tileset from "./Assets/tileset.png"; // replace this

export const Resources = {
  tileset: new ImageSource(tileset),
};

export const loader = new Loader();

for (let res of Object.values(Resources)) {
  loader.addResource(res);
}

export const tileSS = SpriteSheet.fromImageSource({
  image: Resources.tileset,
  grid: {
    rows: 1,
    columns: 7,
    spriteWidth: 16,
    spriteHeight: 16,
  },
});
