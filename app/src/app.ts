import express, { NextFunction, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { openapi } from "./docs/openapi";
import pinoHttp from "pino-http";
import { logger } from "./logger";
import { httpMetrics } from "./metrics";

interface Item {
  id: number;
  name: string;
}

let items: Item[] = [];
let nextId = 1;

const app = express();
app.use(express.json());

// METRICS
app.use(httpMetrics);

// LOGGER
app.use(
  pinoHttp({
    logger,
    serializers: {
      req: () => undefined,
      res: () => undefined,
    },
    customSuccessObject: (req, res, val) => ({
      ...val,
      method: req.method,
      path: (req as Request).originalUrl.split("?")[0],
      status_code: res.statusCode,
    }),
    customErrorObject: (req, res, _err, val) => ({
      ...val,
      method: req.method,
      path: (req as Request).originalUrl.split("?")[0],
      status_code: res.statusCode,
    }),
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
    customSuccessMessage: () => "Request completed",
    customErrorMessage: () => "Request failed",
  })
);


// API ENDPOINTS

// HEALTH (GET)
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// ITEMS (GET)
app.get("/api/items", (_req: Request, res: Response) => {
  res.json(items);
});

// ITEMS (GET) - by id
app.get("/api/items/:id", (req: Request, res: Response) => {
  const item = items.find((i) => i.id === Number(req.params.id));
  if (!item) {
    res.status(404).json({ error: "Item no encontrado" });
    return;
  }
  res.json(item);
});

// ITEMS (POST)
app.post("/api/items", (req: Request, res: Response) => {
  const { name } = req.body ?? {};
  if (typeof name !== "string" || name.trim() === "") {
    res.status(400).json({ error: "El campo 'name' es obligatorio" });
    return;
  }
  const item: Item = { id: nextId++, name: name.trim() };
  items.push(item);
  res.status(201).json(item);
});

// ITEMS (DELETE)
app.delete("/api/items/:id", (req: Request, res: Response) => {
  const before = items.length;
  items = items.filter((i) => i.id !== Number(req.params.id));
  if (items.length === before) {
    res.status(404).json({ error: "Item no encontrado" });
    return;
  }
  res.status(204).send();
});


// DOCS

app.get("/api/docs.json", (_req: Request, res: Response) => {
  res.json(openapi);
});
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapi));

// ERROR (GET) -- Error on purpose
app.get("/api/error", (_req: Request, res: Response) => {
  res.status(500).json({ error: "El error está errando" });
});


// 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// ERROR HANDLER
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  req.log.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Error interno del servidor" });
});

export default app;