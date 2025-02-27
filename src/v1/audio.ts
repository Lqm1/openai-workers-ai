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
					"text/plain": {
						schema: z.string(),
					},
					"text/vtt": {
						schema: z.string(),
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
						return c.text(response.text);
					case "srt":
						throw new HTTPException(500, {
							message: "Not implemented",
						});
					case "verbose_json":
						throw new HTTPException(500, {
							message: "Not implemented",
						});
					case "vtt":
						return c.text(response.vtt ?? "WEBVTT\n\n", 200, {
							"Content-Type": "text/vtt",
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
						return c.text(response.text);
					case "srt":
						throw new HTTPException(500, {
							message: "Not implemented",
						});
					case "verbose_json":
						throw new HTTPException(500, {
							message: "Not implemented",
						});
					case "vtt":
						return c.text(response.vtt ?? "WEBVTT\n\n", 200, {
							"Content-Type": "text/vtt",
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
						return c.text(response.text);
					case "srt":
						throw new HTTPException(500, {
							message: "Not implemented",
						});
					case "verbose_json": {
						if (
							response.transcription_info === undefined ||
							response.transcription_info === null ||
							response.transcription_info.language === undefined ||
							response.transcription_info.language === null ||
							response.transcription_info.duration === undefined ||
							response.transcription_info.duration === null
						) {
							throw new HTTPException(500, {
								message: "Transcription info not found",
							});
						}
						const rawSegments = (response.segments ?? []) as Exclude<
							Ai_Cf_Openai_Whisper_Large_V3_Turbo_Output["segments"],
							undefined
						>[];
						const words = [];
						const segments = [];
						for (const rawSegment of rawSegments) {
							if (
								!(
									rawSegment.start === undefined || rawSegment.start === null
								) &&
								!(rawSegment.end === undefined || rawSegment.end === null) &&
								!(rawSegment.text === undefined || rawSegment.text === null) &&
								!(
									rawSegment.temperature === undefined ||
									rawSegment.temperature === null
								) &&
								!(
									rawSegment.avg_logprob === undefined ||
									rawSegment.avg_logprob === null
								) &&
								!(
									rawSegment.compression_ratio === undefined ||
									rawSegment.compression_ratio === null
								) &&
								!(
									rawSegment.no_speech_prob === undefined ||
									rawSegment.no_speech_prob === null
								)
							) {
								segments.push({
									id: 0,
									seek: 0,
									start: rawSegment.start,
									end: rawSegment.end,
									text: rawSegment.text,
									tokens: [],
									temperature: rawSegment.temperature,
									avg_logprob: rawSegment.avg_logprob,
									compression_ratio: rawSegment.compression_ratio,
									no_speech_prob: rawSegment.no_speech_prob,
								});
							}
							if (rawSegment.words) {
								for (const rawWord of rawSegment.words) {
									if (rawWord.start && rawWord.end && rawWord.word) {
										words.push({
											word: rawWord.word,
											start: rawWord.start,
											end: rawWord.end,
										});
									}
								}
							}
						}
						return c.json({
							language: response.transcription_info.language,
							duration: response.transcription_info.duration,
							text: response.text,
							words: timestamp_granularities.includes("word")
								? words
								: undefined,
							segments: timestamp_granularities.includes("segment")
								? segments
								: undefined,
						});
					}
					case "vtt":
						return c.text(response.vtt ?? "WEBVTT\n\n", 200, {
							"Content-Type": "text/vtt",
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
