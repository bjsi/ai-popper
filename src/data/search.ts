import {
  OpenAIChatMessage,
  OpenAIChatModel,
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
  // hypothetical document embeddings:
  const hypotheticalAnswerStream = await streamText(
    // use cheaper model to generate hypothetical answer:
    new OpenAIChatModel({ model: "gpt-3.5-turbo", temperature: 0 }),
    [
      OpenAIChatMessage.system(
        `Answer the following question as ${personality}:`
      ),
      OpenAIChatMessage.user(question),
    ]
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
