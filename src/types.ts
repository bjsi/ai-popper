import { TextChunk } from "modelfusion";

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

export interface YouTubeChunk extends TextChunk {
  type: "youtube";
  url: string;
  // seconds
  start: number;
  // seconds
  end: number;
}

export type ResourceChunk = YouTubeChunk;
