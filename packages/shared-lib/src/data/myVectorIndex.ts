import { MemoryVectorIndex, upsertIntoVectorIndex } from "modelfusion";
import * as fs from "node:fs/promises";
import { ResourceChunk, YouTubeChunkSchema } from "../types";
import { vectorDataFile } from "./filesystem";
import { existsSync } from "node:fs";
import { embeddingModel } from "./embeddingModel";
import { ZodSchema } from "./ZodSchema";

type VectorIndex = MemoryVectorIndex<ResourceChunk>;

export class MyVectorIndex {
  vectorIndex: VectorIndex;

  private constructor(vectorIndex: VectorIndex) {
    this.vectorIndex = vectorIndex;
  }

  static async create() {
    if (!existsSync(vectorDataFile)) {
      console.log("No vector data found, creating new vector index.");
      return new MyVectorIndex(new MemoryVectorIndex<ResourceChunk>());
    }
    console.log("Loading vectors from", vectorDataFile, "...");
    const vectorData = await fs.readFile(vectorDataFile, "utf-8");
    const vectorIndex = await MemoryVectorIndex.deserialize<ResourceChunk>({
      serializedData: vectorData,
      schema: new ZodSchema(YouTubeChunkSchema),
    });
    return new MyVectorIndex(vectorIndex);
  }

  async upsertIntoVectorIndex(args: {
    objects: ResourceChunk[];
    getValueToEmbed: (chunk: ResourceChunk) => string;
  }) {
    await upsertIntoVectorIndex({
      vectorIndex: this.vectorIndex,
      embeddingModel,
      objects: args.objects,
      getValueToEmbed: args.getValueToEmbed,
    });
    const serializedData = this.vectorIndex.serialize();
    await fs.writeFile(vectorDataFile, serializedData);
  }
}
