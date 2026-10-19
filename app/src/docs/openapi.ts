export const openapi = {
  openapi: "3.0.3",
  info: {
    title: "APP",
    version: "1.0.0",
    description: "API REST TP DevOps",
  },
  paths: {
    "/api/health": {
      get: {
        summary: "Estado de la API",
        tags: ["Health"],
        responses: {
          "200": {
            description: "La API está operativa",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { status: { type: "string", example: "ok" } },
                },
              },
            },
          },
        },
      },
    },
    "/api/items": {
      get: {
        summary: "Listar items",
        tags: ["Items"],
        responses: {
          "200": {
            description: "Lista de items",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Item" } },
              },
            },
          },
        },
      },
      post: {
        summary: "Crear un item",
        tags: ["Items"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: { name: { type: "string", example: "Primer item" } },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Item creado",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Item" } },
            },
          },
          "400": { $ref: "#/components/responses/Error" },
        },
      },
    },
    "/api/items/{id}": {
      get: {
        summary: "Obtener un item por id",
        tags: ["Items"],
        parameters: [{ $ref: "#/components/parameters/ItemId" }],
        responses: {
          "200": {
            description: "Item encontrado",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Item" } },
            },
          },
          "404": { $ref: "#/components/responses/Error" },
        },
      },
      delete: {
        summary: "Eliminar un item",
        tags: ["Items"],
        parameters: [{ $ref: "#/components/parameters/ItemId" }],
        responses: {
          "204": { description: "Item eliminado" },
          "404": { $ref: "#/components/responses/Error" },
        },
      },
    },
  },
  components: {
    schemas: {
      Item: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "primer item" },
        },
      },
    },
    parameters: {
      ItemId: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "integer" },
      },
    },
    responses: {
      Error: {
        description: "Error",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: { error: { type: "string" } },
            },
          },
        },
      },
    },
  },
};