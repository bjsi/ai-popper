import { embedMany } from "modelfusion";
import { ResourceChunk } from "../types";
import { embeddingModel } from "./embeddingModel";
import { addVector } from "../db";

export async function upsertIntoVectorIndex(args: {
  objects: ResourceChunk[];
  getValueToEmbed: (chunk: ResourceChunk) => string;
}) {
  const embeddings = await embedMany(
    embeddingModel,
    args.objects.map(args.getValueToEmbed)
  );
  for (let i = 0; i < args.objects.length; i++) {
    const object = args.objects[i];
    const embedding = embeddings[i];
    await addVector(object, embedding);
  }
}
