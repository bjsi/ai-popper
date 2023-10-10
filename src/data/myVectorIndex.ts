import {
  MemoryVectorIndex,
  TextChunk,
  upsertIntoVectorIndex,
} from "modelfusion";
import * as fs from "node:fs/promises";
import { ResourceChunk } from "../types";
import { vectorDataFile } from "./filesystem";
import { existsSync } from "node:fs";
import { embeddingModel } from "./embeddingModel";

type VectorIndex = MemoryVectorIndex<ResourceChunk>;

export class MyVectorIndex {
  vectorIndex: VectorIndex;

  private constructor(vectorIndex: VectorIndex) {
    this.vectorIndex = vectorIndex;
  }

  static async create() {
    if (!existsSync(vectorDataFile)) {
      return new MyVectorIndex(new MemoryVectorIndex<ResourceChunk>());
    }
    const vectorData = await fs.readFile(vectorDataFile, "utf-8");
    const vectorIndex = await MemoryVectorIndex.deserialize<ResourceChunk>({
      serializedData: vectorData,
    });
    return new MyVectorIndex(vectorIndex);
  }

  async upsertIntoVectorIndex(args: {
    objects: TextChunk[];
    getValueToEmbed: (chunk: TextChunk) => string;
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
