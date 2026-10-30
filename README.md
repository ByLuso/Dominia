<p align="center">
  <img src="resources/images/DominiaLockup.svg" alt="Dominia" width="420">
</p>

# Dominia

**Expande. Alíate. Domina.**

Dominia is a mobile-first territorial strategy game based on
[OpenFront](https://github.com/openfrontio/OpenFrontIO). It is not affiliated
with or endorsed by OpenFront.

Solo play against bots works offline. Multiplayer is private lobbies on
Dominia's own server: a host creates a lobby and shares its code or link.

- Multiplayer through OpenFront's closed-source API (public lobbies, ranked,
  accounts, the shop, news) is turned off (`ONLINE_FEATURES` in
  `src/client/Features.ts`).
- OpenFront's proprietary assets (`proprietary/`), ads and analytics are
  removed. Music is not included yet.

### Android app

`npm run build-app` builds the app bundle into `app-www/`; the Android
workflow (`.github/workflows/android.yml`) wraps it with Capacitor and
publishes a debug APK as a build artifact.

Set the repository variable `DOMINIA_SERVER` (for example
`play.example.com`) to build an app with Create/Join lobby against that
server; leave it unset for a solo-only app. A server only admits clients
built from its own commit, so deploy the server from the commit the APK was
built from.

### Running a Dominia server

Build the image from the commit the app was built from:

```sh
docker build --build-arg GIT_COMMIT=$(git rev-parse HEAD) -t dominia-server .
```

Run it behind HTTPS (the app connects with `wss://`), with `<host>` the
public hostname:

```sh
docker run -p 80:80 \
  -e GAME_ENV=prod -e SELF_HOSTED=true \
  -e DOMAIN=<host> -e GAME_HOST=<host> -e SITE_HOST=<host> \
  -e NUM_WORKERS=2 -e INSTANCE_LETTER=a \
  -e TURNSTILE_SITE_KEY=none -e API_KEY=none -e ADMIN_BOT_API_KEY=none \
  dominia-server
```

`SELF_HOSTED=true` admits guests by their persistent ID, skips every
OpenFront API call (Turnstile, archives, ranked, cosmetics, check-in) and
schedules no public lobbies. `NUM_WORKERS` must match the app's
`DOMINIA_SERVER_WORKERS` (default 2). The server also serves the web
version, so friends without the app can join from a browser.

The rest of this README is OpenFront's own.

---

[OpenFront.io](https://openfront.io/) is an online real-time strategy game focused on territorial control and alliance building. Players compete to expand their territory, build structures, and form strategic alliances in various maps based on real-world geography.

This is a fork/rewrite of WarFront.io. Credit to https://github.com/WarFrontIO.

![CI](https://github.com/openfrontio/OpenFrontIO/actions/workflows/ci.yml/badge.svg)
[![Crowdin](https://badges.crowdin.net/openfront-mls/localized.svg)](https://crowdin.com/project/openfront-mls)
[![CLA assistant](https://cla-assistant.io/readme/badge/openfrontio/OpenFrontIO)](https://cla-assistant.io/openfrontio/OpenFrontIO)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Assets: CC BY-SA 4.0](https://img.shields.io/badge/Assets-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

## License

OpenFront source code is licensed under the **GNU Affero General Public License v3.0**

Current copyright notices appear in:

- Footer: "© OpenFront and Contributors"
- Loading screen: "© OpenFront and Contributors"

Modified versions must preserve these notices in reasonably visible locations.

See the [LICENSE](LICENSE) for complete requirements.

For asset licensing, see [LICENSE-ASSETS](LICENSE-ASSETS).  
For license history, see [LICENSING.md](LICENSING.md).

## 🌟 Features

- **Real-time Strategy Gameplay**: Expand your territory and engage in strategic battles
- **Alliance System**: Form alliances with other players for mutual defense
- **Multiple Maps**: Play across various geographical regions including Europe, Asia, Africa, and more
- **Resource Management**: Balance your expansion with defensive capabilities
- **Cross-platform**: Play in any modern web browser

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) v24.15.0 or newer in the Node 24 release line
- [npm](https://www.npmjs.com/) v12.1.0 or newer in the npm 12 release line
- A modern web browser (Chrome, Firefox, Edge, etc.)

Node.js may bundle an older npm version. Upgrade it before installing project dependencies:

```bash
npm install --global --ignore-scripts npm@12.1.0
```

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/openfrontio/OpenFrontIO.git
   cd OpenFrontIO
   ```

2. **Install dependencies**

   ```bash
   npm run inst
   ```

   Do NOT use `npm install` nor `npm i` for project dependencies. Use `npm run inst`; it runs the safer `npm ci --ignore-scripts` to install exactly the versions in `package-lock.json` without running lifecycle scripts.

   The repository also rejects dependency releases less than seven days old and dependencies sourced from Git, remote URLs, local tarballs, or directories. Wait until a new release passes the seven-day window before updating it; security exceptions require explicit maintainer review.

## 🎮 Running the Game

### Development Mode

Run both the client and server in development mode with live reloading:

```bash
npm run dev
```

This will:

- Start the webpack dev server for the client
- Launch the game server with development settings
- Open the game in your default browser (to disable this behavior, set `SKIP_BROWSER_OPEN=true` in your environment)

### Client Only

To run just the client with hot reloading:

```bash
npm run start:client
```

### Server Only

To run just the server with development settings:

```bash
npm run start:server-dev
```

### Connecting to staging or production backends

Sometimes it's useful to connect to production servers when replaying a game, testing user profiles, purchases, or login flow.

> To replay a production game, make sure you're on the same commit that the game you want to replay was executed on, you can find the `gitCommit` value via `https://api.openfront.io/game/[gameId]`.
> Unfinished games cannot be replayed on localhost.

To connect to staging api servers:

```bash
npm run dev:staging
```

To connect to production api servers:

```bash
npm run dev:prod
```

## 🛠️ Development Tools

- **Format code**:

  ```bash
  npm run format
  ```

- **Lint code with Oxlint**:

  ```bash
  npm run lint
  ```

- **Lint and fix code with Oxlint**:

  ```bash
  npm run lint:fix
  ```

- **Testing**
  ```bash
  npm test
  ```

## 🏗️ Project Structure

- `/src/client` - Frontend game client
- `/src/server` - Backend game server
- `/packages/engine` - Deterministic game simulation (`@openfront/engine`)
- `/packages/engine-api` - The engine's contract: types, schemas, game updates and the worker protocol (`@openfront/engine-api`)
- `/packages/engine-lib` - Engine code also used outside the engine: map grid, rules, helpers (`@openfront/engine-lib`)
- `/packages/shared` - Code shared by client and server: wire schemas, env, asset URLs (`@openfront/shared`)
- `/packages/zbin` - Compact binary wire format for zod schemas (self-contained, zod-only)
- `/resources` - Static assets (images, maps, etc.)

## 🤝 Contributing

Contributions and translations are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow, the approved-issue process, project governance, and translation info.
