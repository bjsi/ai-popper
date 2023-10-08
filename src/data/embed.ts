import {
  OpenAITextEmbeddingModel,
  splitAtToken,
  splitTextChunks,
} from "modelfusion";
import { MyVectorIndex } from "./myVectorIndex";
import { ResourceChunk } from "../types";
import path from "node:path";
import webvtt from "node-webvtt";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";

export const embeddingModel = new OpenAITextEmbeddingModel({
  model: "text-embedding-ada-002",
});

export async function embedText<ChunkType extends ResourceChunk>(
  vectorIndex: MyVectorIndex,
  pages: ChunkType[]
) {
  const chunks = await splitTextChunks(
    splitAtToken({
      maxTokensPerChunk: 256,
      tokenizer: embeddingModel.tokenizer,
    }),
    pages
  );

  await vectorIndex.upsertIntoVectorIndex({
    objects: chunks,
    getValueToEmbed: (chunk) => chunk.text,
  });
}

const embeddingsFolder = path.join(__dirname, "embeddings");
const embeddedVideosFolder = path.join(__dirname, "youtube/embeddedVideos");

async function main() {
  const vectorIndex = (await MyVectorIndex.create()).vectorIndex;

  // Reading already processed videos
  const processedFilePath = path.join(
    allProcessdVideosFolder,
    "processedVideos.json"
  );
  let processedIds: string[] = [];
  if (existsSync(processedFilePath)) {
    const rawData = readFileSync(processedFilePath, "utf-8");
    processedIds = JSON.parse(rawData);
  }

  // Reading and processing new transcripts
  const transcriptFiles = readdirSync(allTranscriptsFolder).filter((f) =>
    f.endsWith(".vtt")
  );
  for (const file of transcriptFiles) {
    const videoId = path.basename(file, ".vtt");

    if (processedIds.includes(videoId)) {
      continue;
    }

    const filePath = path.join(allTranscriptsFolder, file);
    const rawTranscript = readFileSync(filePath, "utf-8");
    const parsedTranscript = webvtt.parse(rawTranscript);

    // Generating chunks to be embedded
    const chunks: ResourceChunk[] = parsedTranscript.cues.map((cue) => ({
      text: cue.text,
    }));
    await embedText(vectorIndex, chunks);

    // Update processed IDs
    processedIds.push(videoId);
  }

  // Saving processed IDs
  writeFileSync(processedFilePath, JSON.stringify(processedIds));
}
