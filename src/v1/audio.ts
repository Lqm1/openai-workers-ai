// v1/audio.ts
import { z } from "zod";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { Buffer } from "node:buffer";

const app = new OpenAPIHono<{ Bindings: CloudflareBindings }>();

app.openapi(
	createRoute({
		method: "post",
		path: "/transcriptions",
		tags: ["v1"],
		request: {
			body: {
				content: {
					"multipart/form-data": {
						schema: z.object({
							file: z.custom<File>(),
							model: z.union([
								z.literal("@cf/openai/whisper"),
								z.literal("@cf/openai/whisper-tiny-en"),
								z.literal("@cf/openai/whisper-large-v3-turbo"),
							]),
							language: z.string().optional(),
							prompt: z.string().optional(),
							response_format: z
								.union([
									z.literal("json"),
									z.literal("text"),
									z.literal("srt"),
									z.literal("verbose_json"),
									z.literal("vtt"),
								])
								.optional()
								.default("json"),
							temperature: z.number().min(0).max(1).optional().default(0),
							"timestamp_granularities[]": z
								.array(z.enum(["word", "segment"]))
								.optional()
								.default(["segment"]),
						}),
					},
				},
			},
		},
		responses: {
			200: {
				content: {
					"application/json": {
						schema: z.union([
							z.object({
								text: z.string(),
							}),
							z.object({
								task: z.string(),
								language: z.string(),
								duration: z.number(),
								text: z.string(),
								segments: z.array(
									z.object({
										id: z.number(),
										seek: z.number(),
										start: z.number(),
										end: z.number(),
										text: z.string(),
										tokens: z.array(z.number()),
										temperature: z.number(),
										avg_logprob: z.number(),
										compression_ratio: z.number(),
										no_speech_prob: z.number(),
									}),
								),
							}),
							z.object({
								task: z.string(),
								language: z.string(),
								duration: z.number(),
								text: z.string(),
								words: z.array(
									z.object({
										word: z.string(),
										start: z.number(),
										end: z.number(),
									}),
								),
							}),
						]),
					},
				},
				description: "Retrieve the user",
			},
		},
	}),
	async (c) => {
		const {
			file,
			model,
			language,
			prompt,
			response_format,
			temperature,
			"timestamp_granularities[]": timestamp_granularities,
		} = c.req.valid("form");
		const arrayBuffer = await file.arrayBuffer();
		switch (model) {
			case "@cf/openai/whisper": {
				const response = await c.env.AI.run(model, {
					audio: [...new Uint8Array(arrayBuffer)],
				});
				switch (response_format) {
					case "json":
						return c.json({
							text: response.text,
						});
					case "text":
						throw new HTTPException(500, {
							message: "Not implemented",
						});
					case "srt":
						throw new HTTPException(500, {
							message: "Not implemented",
						});
					case "verbose_json":
						throw new HTTPException(500, {
							message: "Not implemented",
						});
					case "vtt":
						throw new HTTPException(500, {
							message: "Not implemented",
						});
					default:
						throw new HTTPException(500, {
							message: "Invalid response_format",
						});
				}
			}
			case "@cf/openai/whisper-tiny-en": {
				const response = await c.env.AI.run(model, {
					audio: [...new Uint8Array(arrayBuffer)],
				});
				switch (response_format) {
					case "json":
						return c.json({
							text: response.text,
						});
					case "text":
						throw new HTTPException(500, {
							message: "Not implemented",
						});
					case "srt":
						throw new HTTPException(500, {
							message: "Not implemented",
						});
					case "verbose_json":
						throw new HTTPException(500, {
							message: "Not implemented",
						});
					case "vtt":
						throw new HTTPException(500, {
							message: "Not implemented",
						});
					default:
						throw new HTTPException(500, {
							message: "Invalid response_format",
						});
				}
			}
			case "@cf/openai/whisper-large-v3-turbo": {
				const response = await c.env.AI.run(model, {
					audio: Buffer.from(arrayBuffer).toString("base64"),
					task: "transcribe",
					language: language,
					initial_prompt: prompt,
				});
				switch (response_format) {
					case "json":
						return c.json({
							text: response.text,
						});
					case "text":
						throw new HTTPException(500, {
							message: "Not implemented",
						});
					case "srt":
						throw new HTTPException(500, {
							message: "Not implemented",
						});
					case "verbose_json":
						throw new HTTPException(500, {
							message: "Not implemented",
						});
					case "vtt":
						throw new HTTPException(500, {
							message: "Not implemented",
						});
					default:
						throw new HTTPException(500, {
							message: "Invalid response_format",
						});
				}
			}
		}
	},
);

export default app;
