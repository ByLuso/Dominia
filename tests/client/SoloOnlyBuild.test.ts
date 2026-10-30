import { afterEach, describe, expect, it, vi } from "vitest";
import { getApiBase } from "../../src/client/ApiBase";
import { ClientEnv } from "../../src/client/ClientEnv";

// Overrides the ONLINE_FEATURES: true mock in tests/setup.ts: this file is the
// solo-only build Dominia ships.
vi.mock("../../src/client/Features", () => ({ ONLINE_FEATURES: false }));

describe("solo-only build", () => {
  afterEach(() => {
    ClientEnv.reset();
    delete (window as any).BOOTSTRAP_CONFIG;
  });

  it("never points API traffic at a real host", () => {
    ClientEnv.reset();
    (window as any).BOOTSTRAP_CONFIG = {
      gameEnv: "prod",
      turnstileSiteKey: "site-key",
      jwtAudience: "openfront.io",
      gitCommit: "app",
    };
    expect(getApiBase()).toBe("https://api.invalid");
    expect(ClientEnv.jwtIssuer()).toBe("https://api.invalid");
  });
});
