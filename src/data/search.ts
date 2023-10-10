import {
  OpenAITextGenerationModel,
  VectorIndexRetriever,
  retrieve,
  streamText,
} from "modelfusion";
import { MyVectorIndex } from "./myVectorIndex";
import { embeddingModel } from "./embeddingModel";
import dotenv from "dotenv";

dotenv.config();

export async function search(vectorIndex: MyVectorIndex, query: string) {
  const information = await retrieve(
    new VectorIndexRetriever({
      vectorIndex: vectorIndex.vectorIndex,
      embeddingModel,
      maxResults: 5,
      similarityThreshold: 0.75,
    }),
    query
  );
  return information;
}

export async function searchAs(
  vectorIndex: MyVectorIndex,
  query: string,
  personality: "David Deutsch" | "Karl Popper"
) {
  console.log("Searching for: " + query);
  console.log("As: " + personality);
  const hypotheticalAnswer = await answerAs(query, personality); // search for text chunks that are similar to the hypothetical answer:
  return await search(vectorIndex, hypotheticalAnswer);
}

export async function answerAs(
  question: string,
  personality: "David Deutsch" | "Karl Popper"
) {
  const bios = {
    "David Deutsch":
      "author of The Fabric of Reality and The Beginning of Infinity.",
    "Karl Popper": "author of The Logic of Scientific Discovery.",
  };
  // hypothetical document embeddings:
  const hypotheticalAnswerStream = await streamText(
    // use cheap, fast model to generate hypothetical answer:
    new OpenAITextGenerationModel({
      model: "gpt-3.5-turbo-instruct",
      temperature: 0,
      maxCompletionTokens: 200,
    }),
    `
Reply to the following question in the style of ${personality}, ${
      bios[personality]
    }
Question: ${question}${question.endsWith("?") ? "" : "?"}`.trim()
  );

  console.log("Hypothetical answer: ");
  let hypotheticalAnswer: string = "";
  for await (const textFragment of hypotheticalAnswerStream) {
    process.stdout.write(textFragment);
    hypotheticalAnswer += textFragment;
  }

  return hypotheticalAnswer;
}

async function main() {
  if (process.argv.length < 3) {
    console.log("Please provide a query");
    return;
  }

  const query = process.argv[2];
  const personality = process.argv[3];

  const vectorIndex = await MyVectorIndex.create();
  if (personality) {
    const information = await searchAs(
      vectorIndex,
      query,
      personality as "David Deutsch"
    );
    console.log(information);
    return;
  } else {
    const information = await search(vectorIndex, query);
    console.log(information);
    return;
  }
}

main();
