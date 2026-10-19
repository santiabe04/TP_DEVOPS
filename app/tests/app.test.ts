import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app";

describe("GET /health", () => {
  it("responde 200 con status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("/api/items", () => {
  it("POST crea un item y devuelve 201", async () => {
    const res = await request(app).post("/api/items").send({ name: "item de prueba" });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: "item de prueba" });
    expect(typeof res.body.id).toBe("number");
  });

  it("POST sin name devuelve 400", async () => {
    const res = await request(app).post("/api/items").send({});
    expect(res.status).toBe(400);
  });

  it("GET lista los items creados", async () => {
    await request(app).post("/api/items").send({ name: "otro item" });
    const res = await request(app).get("/api/items");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("GET /items/:id devuelve el item", async () => {
    const created = await request(app).post("/api/items").send({ name: "buscado" });
    const res = await request(app).get(`/api/items/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("buscado");
  });

  it("GET /items/:id inexistente devuelve 404", async () => {
    const res = await request(app).get("/api/items/99999");
    expect(res.status).toBe(404);
  });

  it("DELETE elimina el item y devuelve 204", async () => {
    const created = await request(app).post("/api/items").send({ name: "borrable" });
    const res = await request(app).delete(`/api/items/${created.body.id}`);
    expect(res.status).toBe(204);
    const after = await request(app).get(`/api/items/${created.body.id}`);
    expect(after.status).toBe(404);
  });
});

describe("rutas incorrectas", () => {
  it("ruta inexistente devuelve 404", async () => {
    const res = await request(app).get("/api/no-existe");
    expect(res.status).toBe(404);
  });
});

describe("documentación", () => {
  it("GET /docs.json expone la especificación OpenAPI", async () => {
    const res = await request(app).get("/api/docs.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe("3.0.3");
    expect(res.body.paths["/api/items"]).toBeDefined();
  });

  it("GET /docs/ sirve la interfaz Swagger UI", async () => {
    const res = await request(app).get("/api/docs/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("swagger-ui");
  });
});