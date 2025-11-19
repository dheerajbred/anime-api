# Netlify Functions Setup and Troubleshooting (Anizzz API)

## Summary
- Fixes serverless crashes caused by module format and missing web APIs.
- Uses `esbuild` bundler with ESM function entry and a global `File` polyfill.
- Ensures controllers are ESM-compatible and endpoints behave as expected.

## Netlify Configuration
Create or update `netlify.toml`:

```toml
[build]
  command = "npm install && npm --prefix netlify/functions install"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"

[functions]
  node_bundler = "esbuild"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/api"
  to = "/.netlify/functions/api"
  status = 200
```

## Function Entry
- File: `netlify/functions/api.js`
- Use ESM imports and export an ESM handler.
- Import the `File` polyfill before any other imports.

```js
import "./polyfills/file.js";
import * as homeInfoController from "../../src/controllers/homeInfo.controller.js";
import * as categoryController from "../../src/controllers/category.controller.js";
import * as topTenController from "../../src/controllers/topten.controller.js";
import * as animeInfoController from "../../src/controllers/animeInfo.controller.js";
import * as streamController from "../../src/controllers/streamInfo.controller.js";
import * as searchController from "../../src/controllers/search.controller.js";
import * as episodeListController from "../../src/controllers/episodeList.controller.js";
import * as scheduleController from "../../src/controllers/schedule.controller.js";
import * as serversController from "../../src/controllers/servers.controller.js";
import * as randomController from "../../src/controllers/random.controller.js";
import * as qtipController from "../../src/controllers/qtip.controller.js";
import * as randomIdController from "../../src/controllers/randomId.controller.js";
import * as producerController from "../../src/controllers/producer.controller.js";
import * as characterListController from "../../src/controllers/voiceactor.controller.js";
import getVoiceActors from "../../src/controllers/actors.controller.js";
import getTopSearch from "../../src/controllers/topsearch.controller.js";
import getCharacter from "../../src/controllers/characters.controller.js";
import { routeTypes } from "../../src/routes/category.route.js";

function ok(results) { return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ success: true, results }) }; }
function err(message) { return { statusCode: 500, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ success: false, error: message }) }; }
function makeReq(event, params = {}) { return { method: event.httpMethod, path: event.path, query: event.queryStringParameters || {}, params }; }

export async function handler(event) {
  try {
    const path = event.path;
    const method = event.httpMethod;
    if (method !== "GET") return err("Only GET supported");

    if (path === "/api" || path === "/api/") return ok(await homeInfoController.getHomeInfo(makeReq(event), {}));
    if (path === "/api/top-ten") return ok(await topTenController.getTopTen(makeReq(event), {}));
    if (path === "/api/top-search") return ok(await getTopSearch(makeReq(event), {}));
    if (path === "/api/info") return ok(await animeInfoController.getAnimeInfo(makeReq(event), {}));

    if (path.startsWith("/api/episodes/")) {
      const id = decodeURIComponent(path.replace("/api/episodes/", ""));
      return ok(await episodeListController.getEpisodes(makeReq(event, { id }), {}));
    }

    if (path.startsWith("/api/servers/")) {
      const ep = decodeURIComponent(path.replace("/api/servers/", ""));
      const req = makeReq(event);
      req.query = { ...(req.query || {}), ep };
      return ok(await serversController.getServers(req, {}));
    }

    if (path === "/api/stream") return ok(await streamController.getStreamInfo(makeReq(event), {}, false));
    if (path === "/api/stream/fallback") return ok(await streamController.getStreamInfo(makeReq(event), {}, true));
    if (path === "/api/search") return ok(await searchController.search(makeReq(event), {}));
    if (path === "/api/filter") return ok(await filterController.filter(makeReq(event), {}));
    if (path === "/api/schedule") return ok(await scheduleController.getSchedule(makeReq(event), {}));
    if (path === "/api/random") return ok(await randomController.getRandom(makeReq(event), {}));
    if (path === "/api/random/id") return ok(await randomIdController.getRandomId(makeReq(event), {}));

    if (path.startsWith("/api/qtip/")) {
      const id = decodeURIComponent(path.replace("/api/qtip/", ""));
      return ok(await qtipController.getQtip(makeReq(event, { id }), {}));
    }
    if (path.startsWith("/api/producer/")) {
      const id = decodeURIComponent(path.replace("/api/producer/", ""));
      return ok(await producerController.getProducer(makeReq(event, { id }), {}));
    }
    if (path.startsWith("/api/character/list/")) {
      const id = decodeURIComponent(path.replace("/api/character/list/", ""));
      return ok(await characterListController.getVoiceActors(makeReq(event, { id }), {}));
    }
    if (path.startsWith("/api/actors/")) {
      const id = decodeURIComponent(path.replace("/api/actors/", ""));
      return ok(await getVoiceActors(makeReq(event, { id }), {}));
    }
    if (path.startsWith("/api/character/")) {
      const id = decodeURIComponent(path.replace("/api/character/", ""));
      return ok(await getCharacter(makeReq(event, { id }), {}));
    }

    for (const rt of routeTypes) {
      const routePath = `/api/${rt}`;
      if (path === routePath) return ok(await categoryController.getCategory(makeReq(event), {}, rt));
    }

    if (path.startsWith("/api/genre/")) {
      const rt = path.replace("/api/", "");
      return ok(await categoryController.getCategory(makeReq(event), {}, rt));
    }

    return { statusCode: 404, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ success: false, error: "Not Found" }) };
  } catch (e) {
    return err(e.message || "Internal error");
  }
}
```

## Global `File` Polyfill
- File: `netlify/functions/polyfills/file.js`

```js
if (typeof globalThis.File === "undefined") {
  class File extends Blob {
    constructor(bits, name, options = {}) {
      super(bits, options);
      this.name = name;
      this.lastModified = options.lastModified || Date.now();
    }
  }
  globalThis.File = File;
}
```

## Dependencies
Install both root and functions dependencies in the build step:

```sh
npm install
npm --prefix netlify/functions install
```

Ensure root `package.json` has:

```json
{
  "type": "module"
}
```

Ensure functions `package.json` has required libraries:

```json
{
  "name": "anime-api-functions",
  "private": true,
  "type": "module",
  "dependencies": {
    "axios": "^1.11.0",
    "cheerio": "^1.0.0-rc.12",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "crypto-js": "^4.2.0",
    "dotenv": "^17.2.0",
    "image-pixels": "^2.2.2",
    "jsonwebtoken": "^9.0.2"
  }
}
```

## Common Errors and Resolutions
- SyntaxError: Cannot use import statement outside a module
  - Use `esbuild` bundler and ESM entry (`api.js` with `export async function handler`).
- ReferenceError: File is not defined
  - Add the global `File` polyfill (imported before any other module).

## Update Process (after source changes)
1. Make code changes under `src/**` as usual.
2. Ensure `netlify/functions/api.js` has the side‑effect import to `polyfills/file.js` and static ESM imports.
3. Validate locally by importing the function module:
   ```sh
   node -e "import('./netlify/functions/api.js').then(m=>console.log(typeof m.handler))"
   ```
4. Commit and push to GitHub `main`.
5. Wait 2–3 minutes for Netlify to auto‑deploy.
6. Re‑test endpoints.

## Test Checklist (curl)
Use the base: `https://zzzanime-api.netlify.app`

```sh
# Info
curl -sS "$BASE/api/info?id=wind-driver-in-tang-dynasty-19936" | jq .success

# Episodes (use same id)
curl -sS "$BASE/api/episodes/wind-driver-in-tang-dynasty-19936" | jq .success

# Extract first episode id for servers
epid=$(curl -sS "$BASE/api/episodes/wind-driver-in-tang-dynasty-19936" | jq -r '.results.episodes[0].id')

# Servers (path style supported)
curl -sS "$BASE/api/servers/$epid" | jq .success

# Stream (provide any string containing ep=<id>)
curl -sS "$BASE/api/stream?id=https://dummy?ep=$epid" | jq .success

# Recently updated
curl -sS "$BASE/api/recently-updated" | jq .success

# Most popular
curl -sS "$BASE/api/most-popular?page=1" | jq .success

# Genre
curl -sS "$BASE/api/genre/action?page=1" | jq .success

# Search
curl -sS "$BASE/api/search?keyword=one%20piece" | jq .success

# Schedule (today)
date=$(date +%F)
curl -sS "$BASE/api/schedule?date=$date" | jq .success
```

## Endpoint Map (Flutter references)
- `/episodes/{id}` — `lib/colors.dart:811`
- `/recently-updated` — `lib/colors.dart:1534`
- `/info?id={id}` — `lib/imagecollections.dart:611`
- `/servers/{episodeId}` — `lib/allin1videopage1.dart:358` (path style supported; also `?ep=` query style)
- `/api/stream` — `lib/allin1videopage1.dart:1649` (pass `id` containing `ep=<id>`)
- `/schedule?date={YYYY-MM-DD}` — `lib/apischedule.dart:76`
- `/anime/{id}` (non-API page; derived from base host) — `lib/apischedule.dart:516`
- `/most-popular?page=1` — `lib/customdrawer.dart:246`
- `/genre/{endpoint}?page=1` — `lib/genrepage.dart:380`
- `/search?keyword={query}` — `lib/search.dart:88`

## Final Notes
- Keep Node at 18 in Netlify environment.
- Always import the polyfill first in `api.js`.
- Prefer static ESM imports for controllers to avoid bundling pitfalls.