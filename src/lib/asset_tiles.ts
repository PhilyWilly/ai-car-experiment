import { AssetTile } from "../bin/AssetTile.js";

const assetTiles = [
    new AssetTile("tileGrass1.png", false, false, false, false, 200),
    new AssetTile("tileGrass2.png", false, false, false, false, 200),
    new AssetTile("tileGrass_roadCornerLL.png", false, false, true, true, 8),
    new AssetTile("tileGrass_roadCornerLR.png", false, true, true, false, 8),
    new AssetTile("tileGrass_roadCornerUL.png", true, false, false, true, 8),
    new AssetTile("tileGrass_roadCornerUR.png", true, true, false, false, 8),
    new AssetTile("tileGrass_roadCrossing.png", true, true, true, true),
    new AssetTile("tileGrass_roadCrossingRound.png", true, true, true, true),
    new AssetTile("tileGrass_roadEast.png", false, true, false, true, 20),
    new AssetTile("tileGrass_roadNorth.png", true, false, true, false, 20),
    new AssetTile("tileGrass_roadSplitE.png", true, true, true, false, 2),
    new AssetTile("tileGrass_roadSplitN.png", true, true, false, true, 2),
    new AssetTile("tileGrass_roadSplitS.png", false, true, true, true, 2),
    new AssetTile("tileGrass_roadSplitW.png", true, false, true, true, 2),
]

function getRandomAssetTile(u: boolean | null, r: boolean | null, d: boolean | null, l: boolean | null): AssetTile {
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