import { GameEnv } from "@openfront/shared/configuration/Env";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  MOBILE_APP_ORIGIN,
  applyGameApiCorsHeaders,
} from "../../src/server/GameApiCors";
import { verifyClientToken } from "../../src/server/jwt";
import { ServerEnv } from "../../src/server/ServerEnv";

// Dominia's own server (SELF_HOSTED=true) runs in prod with no OpenFront API:
// players are guests identified by their persistent ID, and the Android app
// reaches it cross-origin from Capacitor's https://localhost.

const PERSISTENT_ID = "cf7a21a5-b3a1-44ed-b08e-ae033e1ce681";

function allowedOrigin(origin: string): string | undefined {
  const headers = new Map<string, string>();
  applyGameApiCorsHeaders(origin, (name, value) => headers.set(name, value));
  return headers.get("Access-Control-Allow-Origin");
}

describe("self-hosted server", () => {
  beforeEach(() => {
    vi.spyOn(ServerEnv, "env").mockReturnValue(GameEnv.Prod);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  test("admits a guest by persistent ID in prod", async () => {
    vi.stubEnv("SELF_HOSTED", "true");
    expect(await verifyClientToken(PERSISTENT_ID)).toEqual({
      type: "success",
      persistentId: PERSISTENT_ID,
      claims: null,
    });
  });

  test("an OpenFront prod server still refuses a bare persistent ID", async () => {
    vi.stubEnv("SELF_HOSTED", "");
    expect((await verifyClientToken(PERSISTENT_ID)).type).toBe("error");
  });

  test("grants the Android app origin only when self-hosted", () => {
    vi.stubEnv("SELF_HOSTED", "true");
    expect(allowedOrigin(MOBILE_APP_ORIGIN)).toBe(MOBILE_APP_ORIGIN);
    vi.stubEnv("SELF_HOSTED", "");
    expect(allowedOrigin(MOBILE_APP_ORIGIN)).toBeUndefined();
  });
});
