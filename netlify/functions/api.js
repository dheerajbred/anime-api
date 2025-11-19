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

function ok(results) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ success: true, results }),
  };
}

function err(message) {
  return {
    statusCode: 500,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ success: false, error: message }),
  };
}

function makeReq(event, params = {}) {
  return {
    method: event.httpMethod,
    path: event.path,
    query: event.queryStringParameters || {},
    params,
  };
}

export async function handler(event) {
  try {
    const path = event.path;
    const method = event.httpMethod;

    if (method !== "GET") {
      return err("Only GET supported");
    }

    if (path === "/api" || path === "/api/") {
      const data = await homeInfoController.getHomeInfo(makeReq(event), {});
      return ok(data);
    }

    if (path === "/api/top-ten") {
      const data = await topTenController.getTopTen(makeReq(event), {});
      return ok(data);
    }

    if (path === "/api/top-search") {
      const data = await getTopSearch(makeReq(event), {});
      return ok(data);
    }

    if (path === "/api/info") {
      const data = await animeInfoController.getAnimeInfo(makeReq(event), {});
      return ok(data);
    }

    if (path.startsWith("/api/episodes/")) {
      const id = decodeURIComponent(path.replace("/api/episodes/", ""));
      const req = makeReq(event, { id });
      const data = await episodeListController.getEpisodes(req, {});
      return ok(data);
    }

    if (path.startsWith("/api/servers/")) {
      const req = makeReq(event);
      const data = await serversController.getServers(req, {});
      return ok(data);
    }

    if (path === "/api/stream") {
      if (typeof globalThis.File === "undefined") {
        class File extends Blob { constructor(bits, name, options = {}) { super(bits, options); this.name = name; this.lastModified = options.lastModified || Date.now(); } }
        globalThis.File = File;
      }
      const data = await streamController.getStreamInfo(makeReq(event), {}, false);
      return ok(data);
    }

    if (path === "/api/stream/fallback") {
      if (typeof globalThis.File === "undefined") {
        class File extends Blob { constructor(bits, name, options = {}) { super(bits, options); this.name = name; this.lastModified = options.lastModified || Date.now(); } }
        globalThis.File = File;
      }
      const data = await streamController.getStreamInfo(makeReq(event), {}, true);
      return ok(data);
    }

    if (path === "/api/search") {
      const data = await searchController.search(makeReq(event), {});
      return ok(data);
    }

    if (path === "/api/filter") {
      const data = await filterController.filter(makeReq(event), {});
      return ok(data);
    }

    if (path === "/api/schedule") {
      const data = await scheduleController.getSchedule(makeReq(event), {});
      return ok(data);
    }

    if (path === "/api/random") {
      const data = await randomController.getRandom(makeReq(event), {});
      return ok(data);
    }

    if (path === "/api/random/id") {
      const data = await randomIdController.getRandomId(makeReq(event), {});
      return ok(data);
    }

    if (path.startsWith("/api/qtip/")) {
      const id = decodeURIComponent(path.replace("/api/qtip/", ""));
      const req = makeReq(event, { id });
      const data = await qtipController.getQtip(req, {});
      return ok(data);
    }

    if (path.startsWith("/api/producer/")) {
      const id = decodeURIComponent(path.replace("/api/producer/", ""));
      const req = makeReq(event, { id });
      const data = await producerController.getProducer(req, {});
      return ok(data);
    }

    if (path.startsWith("/api/character/list/")) {
      const id = decodeURIComponent(path.replace("/api/character/list/", ""));
      const req = makeReq(event, { id });
      const data = await characterListController.getVoiceActors(req, {});
      return ok(data);
    }

    if (path.startsWith("/api/actors/")) {
      const id = decodeURIComponent(path.replace("/api/actors/", ""));
      const req = makeReq(event, { id });
      const data = await getVoiceActors(req, {});
      return ok(data);
    }

    if (path.startsWith("/api/character/")) {
      const id = decodeURIComponent(path.replace("/api/character/", ""));
      const req = makeReq(event, { id });
      const data = await getCharacter(req, {});
      return ok(data);
    }

    for (const rt of routeTypes) {
      const routePath = `/api/${rt}`;
      if (path === routePath) {
        const data = await categoryController.getCategory(makeReq(event), {}, rt);
        return ok(data);
      }
    }

    if (path.startsWith("/api/genre/")) {
      const rt = path.replace("/api/", "");
      const data = await categoryController.getCategory(makeReq(event), {}, rt);
      return ok(data);
    }

    return {
      statusCode: 404,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: "Not Found" }),
    };
  } catch (e) {
    return err(e.message || "Internal error");
  }
}