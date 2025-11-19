async function importController(p) { return await import(p); }

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

exports.handler = async function(event) {
  try {
    const path = event.path;
    const method = event.httpMethod;

    if (method !== "GET") {
      return err("Only GET supported");
    }

    if (path === "/api" || path === "/api/") {
      const homeInfoController = await importController("../../src/controllers/homeInfo.controller.js");
      const data = await homeInfoController.getHomeInfo(makeReq(event), {});
      return ok(data);
    }

    if (path === "/api/top-ten") {
      const topTenController = await importController("../../src/controllers/topten.controller.js");
      const data = await topTenController.getTopTen(makeReq(event), {});
      return ok(data);
    }

    if (path === "/api/top-search") {
      const { default: getTopSearch } = await importController("../../src/controllers/topsearch.controller.js");
      const data = await getTopSearch(makeReq(event), {});
      return ok(data);
    }

    if (path === "/api/info") {
      const animeInfoController = await importController("../../src/controllers/animeInfo.controller.js");
      const data = await animeInfoController.getAnimeInfo(makeReq(event), {});
      return ok(data);
    }

    if (path.startsWith("/api/episodes/")) {
      const id = decodeURIComponent(path.replace("/api/episodes/", ""));
      const req = makeReq(event, { id });
      const episodeListController = await importController("../../src/controllers/episodeList.controller.js");
      const data = await episodeListController.getEpisodes(req, {});
      return ok(data);
    }

    if (path.startsWith("/api/servers/")) {
      const req = makeReq(event);
      const serversController = await importController("../../src/controllers/servers.controller.js");
      const data = await serversController.getServers(req, {});
      return ok(data);
    }

    if (path === "/api/stream") {
      if (typeof globalThis.File === "undefined") {
        class File extends Blob { constructor(bits, name, options = {}) { super(bits, options); this.name = name; this.lastModified = options.lastModified || Date.now(); } }
        globalThis.File = File;
      }
      const streamController = await importController("../../src/controllers/streamInfo.controller.js");
      const data = await streamController.getStreamInfo(makeReq(event), {}, false);
      return ok(data);
    }

    if (path === "/api/stream/fallback") {
      if (typeof globalThis.File === "undefined") {
        class File extends Blob { constructor(bits, name, options = {}) { super(bits, options); this.name = name; this.lastModified = options.lastModified || Date.now(); } }
        globalThis.File = File;
      }
      const streamController = await importController("../../src/controllers/streamInfo.controller.js");
      const data = await streamController.getStreamInfo(makeReq(event), {}, true);
      return ok(data);
    }

    if (path === "/api/search") {
      const searchController = await importController("../../src/controllers/search.controller.js");
      const data = await searchController.search(makeReq(event), {});
      return ok(data);
    }

    if (path === "/api/filter") {
      const filterController = await importController("../../src/controllers/filter.controller.js");
      const data = await filterController.filter(makeReq(event), {});
      return ok(data);
    }

    if (path === "/api/schedule") {
      const scheduleController = await importController("../../src/controllers/schedule.controller.js");
      const data = await scheduleController.getSchedule(makeReq(event), {});
      return ok(data);
    }

    if (path === "/api/random") {
      const randomController = await importController("../../src/controllers/random.controller.js");
      const data = await randomController.getRandom(makeReq(event), {});
      return ok(data);
    }

    if (path === "/api/random/id") {
      const randomIdController = await importController("../../src/controllers/randomId.controller.js");
      const data = await randomIdController.getRandomId(makeReq(event), {});
      return ok(data);
    }

    if (path.startsWith("/api/qtip/")) {
      const id = decodeURIComponent(path.replace("/api/qtip/", ""));
      const req = makeReq(event, { id });
      const qtipController = await importController("../../src/controllers/qtip.controller.js");
      const data = await qtipController.getQtip(req, {});
      return ok(data);
    }

    if (path.startsWith("/api/producer/")) {
      const id = decodeURIComponent(path.replace("/api/producer/", ""));
      const req = makeReq(event, { id });
      const producerController = await importController("../../src/controllers/producer.controller.js");
      const data = await producerController.getProducer(req, {});
      return ok(data);
    }

    if (path.startsWith("/api/character/list/")) {
      const id = decodeURIComponent(path.replace("/api/character/list/", ""));
      const req = makeReq(event, { id });
      const characterListController = await importController("../../src/controllers/voiceactor.controller.js");
      const data = await characterListController.getVoiceActors(req, {});
      return ok(data);
    }

    if (path.startsWith("/api/actors/")) {
      const id = decodeURIComponent(path.replace("/api/actors/", ""));
      const req = makeReq(event, { id });
      const { default: getVoiceActors } = await importController("../../src/controllers/actors.controller.js");
      const data = await getVoiceActors(req, {});
      return ok(data);
    }

    if (path.startsWith("/api/character/")) {
      const id = decodeURIComponent(path.replace("/api/character/", ""));
      const req = makeReq(event, { id });
      const { default: getCharacter } = await importController("../../src/controllers/characters.controller.js");
      const data = await getCharacter(req, {});
      return ok(data);
    }

    {
      const { routeTypes } = await importController("../../src/routes/category.route.js");
      for (const rt of routeTypes) {
        const routePath = `/api/${rt}`;
        if (path === routePath) {
          const categoryController = await importController("../../src/controllers/category.controller.js");
          const data = await categoryController.getCategory(makeReq(event), {}, rt);
          return ok(data);
        }
      }
    }

    if (path.startsWith("/api/genre/")) {
      const categoryController = await importController("../../src/controllers/category.controller.js");
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