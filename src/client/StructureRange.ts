import { UnitType } from "@openfront/engine-api/game/GameTypes";
import type { Config } from "@openfront/engine-lib/configuration/Config";

/**
 * How far a structure reaches, in tiles, or 0 for one with no range: a SAM's
 * interception radius (it grows with level), a factory's rail reach and a
 * defense post's protection. Drawn for a structure being placed and for one
 * the radial menu is open on.
 */
export function structureRangeRadius(
  game: { config(): Config },
  type: UnitType,
  level: number,
): number {
  switch (type) {
    case UnitType.SAMLauncher:
      return game.config().samRange(level);
    case UnitType.Factory:
      return game.config().trainStationMaxRange();
    case UnitType.DefensePost:
      return game.config().defensePostRange();
    default:
      return 0;
  }
}
