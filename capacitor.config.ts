import type { CapacitorConfig } from "@capacitor/cli";

// The Dominia mobile app: the solo web build (scripts/build-app.ts) wrapped
// in a native WebView.
const config: CapacitorConfig = {
  appId: "io.github.byluso.dominia",
  appName: "Dominia",
  webDir: "app-www",
  backgroundColor: "#0E1A2E",
  android: {
    // Game assets are fetched by absolute path ("/maps/...").
    allowMixedContent: false,
  },
};

export default config;
