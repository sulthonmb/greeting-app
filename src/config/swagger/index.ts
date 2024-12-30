export default {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Docs API with Swagger",
      version: process.env.APP_VERSION || "1.0.0",
      description:
        "This is a simple CRUD API application made with Express and documented with Swagger",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "Developer",
        url: process.env.APP_URL || "http://localhost:8080",
        email: "developer@sulthon.id",
      },
    },
    servers: [
      {
        url: process.env.APP_URL || "http://localhost:8080",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          in: "header",
          scheme: "bearer",
          name: "Authorization",
          description: "JWT token from login",
        },
      }, // arbitrary name for the security scheme
    },
    security: [
      {
        apiKeyAuth: [],
        bearerAuth: [],
      },
    ],
  },
  apis: ["*/docs/*.yaml", "docs/*.yaml"],
};
