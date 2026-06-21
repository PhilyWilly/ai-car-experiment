import { AssetTile } from "../bin/AssetTile.js";
import { TileType } from "../bin/TileType.js";

const assetTiles = () => [
    new AssetTile("tileGrass1.png", TileType.Grass, TileType.Grass, TileType.Grass, TileType.Grass),
    new AssetTile("tileGrass2.png", TileType.Grass, TileType.Grass, TileType.Grass, TileType.Grass),
    new AssetTile("tileGrass_roadCornerLL.png", TileType.Grass, TileType.Grass, TileType.Road, TileType.Road),
    new AssetTile("tileGrass_roadCornerLR.png", TileType.Grass, TileType.Road, TileType.Road, TileType.Grass),
    new AssetTile("tileGrass_roadCornerUL.png", TileType.Road, TileType.Grass, TileType.Grass, TileType.Road),
    new AssetTile("tileGrass_roadCornerUR.png", TileType.Road, TileType.Road, TileType.Grass, TileType.Grass),
]

export { assetTiles };