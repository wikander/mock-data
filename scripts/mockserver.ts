import {
  Application,
  Router,
  helpers,
} from "https://deno.land/x/oak@v9.0.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import * as path from "https://deno.land/std@0.100.0/path/mod.ts";
import {
  randomBelow,
  randomPick,
} from "https://deno.land/x/vegas@v1.2.1/mod.ts";

const app = new Application();
const router = new Router();

app.use(oakCors({ origin: "*" }));

app.use(async (ctx, next) => {
  const requestUrl = ctx.request.url;
  console.info(`---------------------------`);
  console.info(`Request to: ${requestUrl}`);
  console.info(`---------------------------`);
  await next();
  ctx.response.headers.set("content-type", "application/json");
});

router
  .get("/info", (ctx) => {
    ctx.response.body = JSON.stringify("ok");
  })
  .get("/generate-mock", async (ctx) => {
    const queryParams = helpers.getQuery(ctx);
    let mockPath = queryParams.path;

    if (mockPath.endsWith(".json")) {
      mockPath = mockPath.substring(0, mockPath.length - 5);
    }

    const blueprintFilePath = path.join(
      "../",
      `${mockPath}.blueprint.stdout.json`
    );
    ctx.response.body = await mockResponse(
      await generateMock(blueprintFilePath),
      queryParams.delay
    );
  })
  .get("/mock", async (ctx) => {
    const queryParams = helpers.getQuery(ctx);
    let mockPath = queryParams.path;

    if (!mockPath.endsWith(".json")) {
      mockPath = mockPath + ".json";
    }
    const mockFilePath = path.join("../", `${mockPath}`);

    console.info(`Querying mock with path ${mockPath}`);

    try {
      const mockContent = await Deno.readTextFile(mockFilePath);
      ctx.response.body = await mockResponse(mockContent, queryParams.delay);
    } catch (e) {
      ctx.response.status = e.status || 404;
      ctx.response.body = JSON.stringify(
        e.msg || `No mock found for path ${mockPath}`
      );
    }
  })
  .get("/:rest*", (ctx) => {
    const body = `Your user-agent is:\n\n${
      ctx.request.headers.get("user-agent") ?? "Unknown"
    }`;
    ctx.response.body = body;
  });

app.use(router.routes());
app.use(router.allowedMethods());

console.log(`Mock server is running. Access it at: http://localhost:9999/`);
await app.listen({ port: 9999 });

async function generateMock(blueprintPath: string): Promise<string> {
  const process = Deno.run({
    cmd: [
      "deno",
      "run",
      "--allow-read",
      "--allow-write",
      "./generate/index.ts",
      blueprintPath,
    ],
    stdout: "piped",
    stderr: "piped",
  });

  const output = await process.output();
  const outStr = new TextDecoder().decode(output);

  const error = await process.stderrOutput();
  const errorStr = new TextDecoder().decode(error);
  console.error(errorStr);

  process.close();

  return outStr;
}

async function mockResponse(
  mockContent: string,
  delay: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (randomBelow(4) === 0) {
      reject({
        status: randomPick([500, 401]),
        msg: "Evil error",
      });
    }

    const delayNum = Number.parseInt(delay);

    if (!Number.isNaN(delayNum)) {
      setTimeout(() => {
        resolve(JSON.stringify(JSON.parse(mockContent)));
      }, delayNum);
    } else if (delay === undefined) {
      resolve(JSON.stringify(JSON.parse(mockContent)));
    } else {
      reject({
        status: 500,
        msg: "Could not parse delay as a positive number.",
      });
    }
  });
}
