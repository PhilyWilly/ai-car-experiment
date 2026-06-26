import { AssetTile } from "../bin/AssetTile.js";
import { TileType } from "../bin/TileType.js";

const assetTiles = [
    new AssetTile("tileGrass1.png", TileType.Grass, TileType.Grass, TileType.Grass, TileType.Grass, 200),
    new AssetTile("tileGrass2.png", TileType.Grass, TileType.Grass, TileType.Grass, TileType.Grass, 200),
    new AssetTile("tileGrass_roadCornerLL.png", TileType.Grass, TileType.Grass, TileType.Road, TileType.Road, 8),
    new AssetTile("tileGrass_roadCornerLR.png", TileType.Grass, TileType.Road, TileType.Road, TileType.Grass, 8),
    new AssetTile("tileGrass_roadCornerUL.png", TileType.Road, TileType.Grass, TileType.Grass, TileType.Road, 8),
    new AssetTile("tileGrass_roadCornerUR.png", TileType.Road, TileType.Road, TileType.Grass, TileType.Grass, 8),
    new AssetTile("tileGrass_roadCrossing.png", TileType.Road, TileType.Road, TileType.Road, TileType.Road),
    new AssetTile("tileGrass_roadCrossingRound.png", TileType.Road, TileType.Road, TileType.Road, TileType.Road),
    new AssetTile("tileGrass_roadEast.png", TileType.Grass, TileType.Road, TileType.Grass, TileType.Road, 20),
    new AssetTile("tileGrass_roadNorth.png", TileType.Road, TileType.Grass, TileType.Road, TileType.Grass, 20),
    new AssetTile("tileGrass_roadSplitE.png", TileType.Road, TileType.Road, TileType.Road, TileType.Grass, 2),
    new AssetTile("tileGrass_roadSplitN.png", TileType.Road, TileType.Road, TileType.Grass, TileType.Road, 2),
    new AssetTile("tileGrass_roadSplitS.png", TileType.Grass, TileType.Road, TileType.Road, TileType.Road, 2),
    new AssetTile("tileGrass_roadSplitW.png", TileType.Road, TileType.Grass, TileType.Road, TileType.Road, 2),
]

function getRandomAssetTile(u: TileType | null, r: TileType | null, d: TileType | null, l: TileType | null): AssetTile {
    const eligibleTiles = assetTiles.filter(tile => {
        return (u === null || tile.up === u) &&
            (r === null || tile.right === r) &&
            (d === null || tile.down === d) &&
            (l === null || tile.left === l);
    });

    if (eligibleTiles.length === 0) {
        throw new RangeError(`No eligible tiles found for the given constraints: up=${u}, right=${r}, down=${d}, left=${l}`);
    }
    if (eligibleTiles.length === 1) {
        return eligibleTiles[0]!;
    }

    const probabilities = eligibleTiles.map(tile => tile.probability);
    const randomIndex = Math.floor(Math.random() * probabilities.reduce((a, b) => a + b, 0));
    let cumulativeProbability = 0;
    for (let i = 0; i < eligibleTiles.length; i++) {
        cumulativeProbability += probabilities[i]!
        if (randomIndex < cumulativeProbability) {
            return eligibleTiles[i]!;
        }
    }
    throw new Error("Should never reach here");
}

export { assetTiles, getRandomAssetTile };