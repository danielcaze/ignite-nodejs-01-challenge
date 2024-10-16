import http from "node:http";
import { json } from "./middlewares/json.js";
import { routes } from "./routes.js";

const server = http.createServer(async function (req, res) {
  await json(req, res);
  const { method, url } = req;

  const route = routes.find(
    (route) => route.method === method && route.path.test(url)
  );

  if (route) {
    const routeParams = req.url.match(route.path);

    const { query, ...params } = routeParams.groups;

    req.params = params;

    req.query = query ? extractQueryParams(query) : {};

    return route.handler(req, res);
  }

  return res
    .writeHead(404)
    .end(JSON.stringify({ error: "Not Found" }, null, 2));
});

server.listen(3333);
