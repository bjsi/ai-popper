import { z } from "zod";

export type ResourceType = "youtube" | "pdf" | "website";
export interface YouTubeResource {
  type: "youtube";
  url: string;
}
export interface PdfResource {
  type: "pdf";
  path: string;
}
export interface WebsiteResource {
  type: "website";
  url: string;
}

export const YouTubeChunkSchema = z.object({
  type: z.literal("youtube"),
  url: z.string(),
  start: z.number(),
  end: z.number(),
  text: z.string(),
  title: z.string(),
});

export type YouTubeChunk = z.infer<typeof YouTubeChunkSchema>;

export type ResourceChunk = YouTubeChunk;
