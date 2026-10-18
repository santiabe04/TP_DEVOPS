import express, { NextFunction, Request, Response } from "express";

interface Item {
  id: number;
  name: string;
}

let items: Item[] = [];
let nextId = 1;

const app = express();
app.use(express.json());


// API ROUTES AND METHODS

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

// 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// ERROR HANDLER
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.message);
  res.status(500).json({ error: "Error interno del servidor" });
});

export default app;