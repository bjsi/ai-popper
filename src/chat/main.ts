import * as readline from "node:readline/promises";
import { answerAs } from "./generateHypotheticalAnswer";
import {
  OpenAIChatMessage,
  OpenAIChatModel,
  OpenAITextEmbeddingModel,
  VectorIndexRetriever,
  retrieve,
  streamText,
} from "modelfusion";
import { MyVectorIndex } from "../data/myVectorIndex";

async function main() {
  // load the vector index:
  const vectorIndex = (await MyVectorIndex.create()).vectorIndex;

  // chat loop:
  const chat = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const embeddingModel = new OpenAITextEmbeddingModel({
    model: "text-embedding-ada-002",
  });

  while (true) {
    const question = await chat.question("You: ");

    // hypothetical document embeddings:
    const hypotheticalAnswer = await answerAs(question, "David Deutsch"); // search for text chunks that are similar to the hypothetical answer:
    const information = await retrieve(
      new VectorIndexRetriever({
        vectorIndex,
        embeddingModel,
        maxResults: 5,
        similarityThreshold: 0.75,
      }),
      hypotheticalAnswer
    );

    // answer the user's question using the retrieved information:
    const textStream = await streamText(
      // use stronger model to answer the question:
      new OpenAIChatModel({ model: "gpt-4", temperature: 0 }),
      [
        OpenAIChatMessage.system(
          // Instruct the model on how to answer:
          `Answer the user's question using only the provided information.\n` +
            // Provide some context:
            `Include the page number of the information that you are using.\n` +
            // To reduce hallucination, it is important to give the model an answer
            // that it can use when the information is not sufficient:
            `If the user's question cannot be answered using the provided information, ` +
            `respond with "I don't know".`
        ),
        OpenAIChatMessage.user(question),
        OpenAIChatMessage.functionResult(
          "getInformation",
          JSON.stringify(information)
        ),
      ]
    );

    // stream the answer to the terminal:
    process.stdout.write("\nAI : ");
    for await (const textFragment of textStream) {
      process.stdout.write(textFragment);
    }
    process.stdout.write("\n\n");
  }
}

main();
