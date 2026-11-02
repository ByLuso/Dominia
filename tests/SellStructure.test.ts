import {
  PlayerInfo,
  PlayerType,
  UnitType,
} from "@openfront/engine-api/game/GameTypes";
import { DeleteUnitExecution } from "@openfront/engine/execution/DeleteUnitExecution";
import { SpawnExecution } from "@openfront/engine/execution/SpawnExecution";
import { Game, Player } from "@openfront/engine/game/Game";
import { setup } from "./util/Setup";
import { executeTicks } from "./util/utils";

// Selling a structure (the delete action) pays back 60% of its value. Cities
// cost 125k, 250k, 500k, then 1M each as the player holds more, so a city is
// valued at the price of the player's latest buy, not the next one.

describe("selling a structure", () => {
  let game: Game;
  let player: Player;

  beforeEach(async () => {
    game = await setup("plains", { instantBuild: true, infiniteTroops: true });
    const info = new PlayerInfo("Seller", PlayerType.Human, null, "Seller");
    game.addPlayer(info);
    game.addExecution(
      new SpawnExecution(
        "game_id",
        game.player(info.id).info(),
        game.ref(0, 10),
      ),
    );
    executeTicks(game, game.config().deleteUnitCooldown() + 1);
    player = game.player(info.id);
    player.addGold(10_000_000n);
    game.config().deletionMarkDuration = () => 10;
  });

  function buildCities(n: number) {
    const tiles = Array.from(player.tiles());
    return Array.from({ length: n }, (_, i) =>
      player.buildUnit(UnitType.City, tiles[i * 3], {}),
    );
  }

  it("values a city at the player's latest city price", () => {
    const [, , third] = buildCities(3); // paid 125k + 250k + 500k
    executeTicks(game, 1);
    expect(player.structureSellRefund(third)).toBe(300_000n); // 60% of 500k
  });

  it("values every level of an upgraded structure", () => {
    const [first] = buildCities(2); // 125k + 250k
    executeTicks(game, 1);
    player.upgradeUnit(first); // level 2 for 500k
    // Its two levels are the latest two buys: 500k + 250k.
    expect(player.structureSellRefund(first)).toBe(450_000n);
  });

  it("never pays more than buying it back costs", () => {
    const [, , third] = buildCities(3);
    executeTicks(game, 1);
    const refund = player.structureSellRefund(third);
    const rebuy = game.config().unitInfo(UnitType.City).cost(game, player, -1);
    expect(refund < rebuy).toBe(true);
  });

  it("pays the refund once the sale completes, not when it starts", () => {
    const [, , third] = buildCities(3);
    executeTicks(game, 1);
    // Cities also earn a little gold every tick; the refund dwarfs it.
    const before = player.gold();

    game.addExecution(new DeleteUnitExecution(player, third.id()));
    executeTicks(game, 2);
    expect(third.isMarkedForDeletion()).toBe(true);
    expect(player.gold() - before < 100_000n).toBe(true);

    executeTicks(game, 20);
    expect(third.isActive()).toBe(false);
    expect(player.gold() - before >= 300_000n).toBe(true);
  });

  it("pays nothing for a structure still under construction", () => {
    const [city] = buildCities(1);
    city.setUnderConstruction(true);
    expect(player.structureSellRefund(city)).toBe(0n);
  });
});
