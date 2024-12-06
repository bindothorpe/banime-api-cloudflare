import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { HiAnimeError } from "aniwatch";
import { hianimeRouter } from "./routes/hianime";

const BASE_PATH = "/api/v2" as const;

const app = new Hono();

app.use(logger());

app.get("/", (c) => c.text("Hello world!", { status: 200 }));

app.use("/api/*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
}));

app.get("/health", (c) => c.text("OK", { status: 200 }));

app.basePath(BASE_PATH).route("/hianime", hianimeRouter);
app.notFound((c) =>
  c.json({ status: 404, message: "Resource Not Found" }, 404)
);

app.onError((err, c) => {
  console.error(err);
  const res = { status: 500, message: "Internal Server Error" };

  if (err instanceof HiAnimeError) {
    res.status = err.status;
    res.message = err.message;
  }

  return c.json(res, { status: res.status });
});

export default {
  fetch: app.fetch.bind(app)
}