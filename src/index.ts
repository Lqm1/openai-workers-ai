import { logger } from "hono/logger";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import v1Audio from "./v1/audio";

const app = new OpenAPIHono<{ Bindings: CloudflareBindings }>();

app.use(logger());

app.doc("openapi.json", {
	openapi: "3.0.0",
	info: {
		title: "OpenAI Workers AI",
		version: "1.0.0",
	},
});

app.get("/docs", swaggerUI({ url: "/openapi.json" }));

app.get("/", (c) => {
	c.executionCtx;
	return c.text("Hello Hono!");
});

app.route("/v1/audio", v1Audio);

export default app;
