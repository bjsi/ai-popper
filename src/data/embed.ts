import {
  OpenAITextEmbeddingModel,
  splitAtToken,
  splitTextChunks,
} from "modelfusion";
import { MyVectorIndex } from "./myVectorIndex";
import { ResourceChunk } from "../types";
import path from "node:path";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import {
  allProcessdVideosFolder,
  allTranscriptsFolder,
  getEmbeddedVideosFilePath,
  getTranscriptsDownloadedVideosFilePath,
} from "./filesystem";
import { parseSync } from "subtitle";
import dotenv from "dotenv";

dotenv.config();

export const embeddingModel = new OpenAITextEmbeddingModel({
  model: "text-embedding-ada-002",
});

export async function embedText<ChunkType extends ResourceChunk>(
  vectorIndex: MyVectorIndex,
  chunks: ChunkType[],
  allowSplit: boolean
) {
  if (allowSplit) {
    chunks = await splitTextChunks(
      splitAtToken({
        maxTokensPerChunk: 256,
        tokenizer: embeddingModel.tokenizer,
      }),
      chunks
    );
  }

  await vectorIndex.upsertIntoVectorIndex({
    objects: chunks,
    getValueToEmbed: (chunk) => chunk.text,
  });
}

async function main() {
  const vectorIndex = await MyVectorIndex.create();

  // For each channel folder in the transcripts folder, read the transcript and embed
  const channelFolders = readdirSync(allTranscriptsFolder);

  for (const channelFolder of channelFolders) {
    console.log(`Processing ${channelFolder}...`);
    // Reading already processed videos
    const processedFilePath = getEmbeddedVideosFilePath(channelFolder);
    let processedIds: string[] = [];
    if (existsSync(processedFilePath)) {
      const rawData = readFileSync(processedFilePath, "utf-8");
      processedIds = JSON.parse(rawData);
    }
    const channelPath = path.join(allTranscriptsFolder, channelFolder);
    const videoFiles = readdirSync(channelPath).filter((f) =>
      f.endsWith(".vtt")
    );
    for (const file of videoFiles) {
      console.log(`Processing ${file}...`);
      const videoId = path.basename(file, ".en.vtt");
      const filePath = path.join(channelPath, file);
      const rawTranscript = readFileSync(filePath, "utf-8");
      const parsedTranscript = parseSync(rawTranscript);
      if (processedIds.includes(videoId)) {
        continue;
      }

      // Generating chunks to be embedded
      const chunks = parsedTranscript
        .filter((x) => x.type === "cue")
        .map((cue) => ({
          text: (typeof cue.data === "string" ? cue.data : cue.data.text)
            .trim()
            .replace(/\n/g, " ")
            .replace(/\[.*?\]/g, ""),
          type: "youtube",
          url: `https://www.youtube.com/watch?v=${videoId}`,
          start: typeof cue.data === "string" ? 0 : cue.data.start,
          end: typeof cue.data === "string" ? 0 : cue.data.end,
        }))
        .filter((x) => !x.text.includes("<c>")) as ResourceChunk[];
      console.log(chunks);

      // join chunks into 256 token chunks

      let mergedChunks: ResourceChunk[] = [];
      let tempText = "";
      let tempStart = 0;
      let tempEnd = 0;

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const newTokens = (await embeddingModel.tokenizer.tokenize(chunk.text))
          .length;
        const existingTokens = (
          await embeddingModel.tokenizer.tokenize(tempText)
        ).length;

        if (existingTokens + newTokens <= 256) {
          tempText = tempText ? `${tempText} ${chunk.text}` : chunk.text;
          tempEnd = chunk.end;
          if (tempStart === 0) tempStart = chunk.start;
        } else {
          mergedChunks.push({
            text: tempText,
            type: "youtube",
            url: chunk.url,
            start: tempStart,
            end: tempEnd,
          });
          tempText = chunk.text;
          tempStart = chunk.start;
          tempEnd = chunk.end;
        }
      }

      // Add any remaining text
      if (tempText) {
        mergedChunks.push({
          text: tempText,
          type: "youtube",
          url: chunks[chunks.length - 1].url,
          start: tempStart,
          end: tempEnd,
        });
      }

      console.log("chunks to embed");
      console.log(JSON.stringify(mergedChunks, null, 2));
      // embeddings get saved here
      // TODO: all clustered into one file
      await embedText(vectorIndex, chunks, false);

      // Saving processed IDs
      writeFileSync(processedFilePath, JSON.stringify(processedIds));
    }
  }
}
main();
