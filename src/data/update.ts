import { readFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { z } from "zod";
import path from "path";
import {
  allProcessdVideosFolder,
  allTranscriptsFolder,
  getTranscriptsDownloadedVideosFilePath,
  getTranscriptsFolderPath,
  sourcesFile,
} from "./filesystem";

const sourceDataSchema = z.object({
  sources: z
    .object({
      name: z.string(),
      source: z.string().url(),
    })
    .array(),
});

async function main() {
  const data = readFileSync(sourcesFile, "utf-8");
  const maybeDataSources = sourceDataSchema.safeParse(JSON.parse(data));
  if (!maybeDataSources.success) {
    console.error(maybeDataSources.error);
    return;
  }
  const dataSources = maybeDataSources.data;

  if (!existsSync(allTranscriptsFolder)) {
    mkdirSync(allTranscriptsFolder);
  }

  if (!existsSync(allProcessdVideosFolder)) {
    mkdirSync(allProcessdVideosFolder);
  }

  dataSources.sources.forEach((source) => {
    console.log(`Processing ${source.name}...`);
    const channelName = source.name.replace(/\s+/g, "_");
    const channelURL = source.source;

    const transcriptDir = getTranscriptsFolderPath(channelName);
    const processedFile = getTranscriptsDownloadedVideosFilePath(channelName);

    if (!existsSync(transcriptDir)) {
      mkdirSync(transcriptDir);
    }

    let processedIds: string[] = [];
    if (existsSync(processedFile)) {
      const rawData = readFileSync(processedFile, "utf-8");
      processedIds = JSON.parse(rawData);
    }

    // Fetch all video IDs from the channel
    console.log(`Fetching all video IDs for ${channelName} (can be slow)...`);
    const videoIdCommand = `yt-dlp --get-id -i "${channelURL}"`;
    const videoIdsRaw = execSync(videoIdCommand).toString().trim();
    const videoIds = videoIdsRaw.split("\n");
    console.log(`Found ${videoIds.length} total video IDs for ${channelName}.`);

    // Filter out already processed IDs
    const newVideoIds = videoIds.filter((id) => !processedIds.includes(id));
    console.log(
      `Found ${newVideoIds.length} new video IDs for ${channelName}.`
    );

    newVideoIds.forEach((id, idx) => {
      const command = `yt-dlp --write-sub --write-auto-sub --sub-lang en --sub-format vtt --skip-download -o "${transcriptDir}/${id}.%(ext)s" "https://www.youtube.com/watch?v=${id}"`;
      console.log(
        `Downloading transcript for video ${idx + 1} of ${
          newVideoIds.length
        }...`
      );

      try {
        execSync(command);
        processedIds.push(id);
        writeFileSync(processedFile, JSON.stringify(processedIds));
      } catch (error) {
        console.error(
          `Failed to download transcript for video ID ${id}: ${error}`
        );
      }
    });
  });
}

main();
