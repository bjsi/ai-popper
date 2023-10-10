import path from "path";

export const vectorDataFile = path.join(__dirname, "vectorData.json");

export const allTranscriptsFolder = path.join(__dirname, "youtube/transcripts");
export const allProcessdVideosFolder = path.join(
  __dirname,
  "youtube/downloadedTranscripts"
);
export const sourcesFile = path.join(__dirname, "sources.json");
export const embeddedVideosFolder = path.join(
  __dirname,
  "youtube/embeddedVideos"
);

/**
 * Contains transcripts of the form: <channelName>/<videoId>.en.vtt
 */
export const getTranscriptsFolderPath = (channelName: string) =>
  path.join(allTranscriptsFolder, channelName);

export const getTranscriptsDownloadedVideosFilePath = (channelName: string) =>
  path.join(allProcessdVideosFolder, `${channelName}.json`);

export const getEmbeddedVideosFilePath = (channelName: string) =>
  path.join(embeddedVideosFolder, `${channelName}.json`);
