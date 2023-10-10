import { OpenAITextEmbeddingModel } from "modelfusion";

export const embeddingModel = new OpenAITextEmbeddingModel({
  model: "text-embedding-ada-002",
});
