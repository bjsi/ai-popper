import * as readline from "node:readline/promises";
import { OpenAIChatMessage, OpenAIChatModel, streamText } from "modelfusion";
import { MyVectorIndex } from "../data/myVectorIndex";
import { searchAs } from "../data/search";

async function main() {
  // load the vector index:
  const vectorIndex = await MyVectorIndex.create();

  // chat loop:
  const chat = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (true) {
    const question = await chat.question("You: ");
    const answer = await searchAs(vectorIndex, question, "David Deutsch");

    // answer the user's question using the retrieved information:
    const textStream = await streamText(
      // use stronger model to answer the question:
      new OpenAIChatModel({ model: "gpt-4", temperature: 0 }),
      [
        OpenAIChatMessage.system(
          // Instruct the model on how to answer:
          `Answer the user's question in the style of David Deutsch using only the provided information.\n` +
            // Provide some context:
            `Include footnotes with sources to the information that you are using.\n` +
            // To reduce hallucination, it is important to give the model an answer
            // that it can use when the information is not sufficient:
            `If the user's question cannot be answered using the provided information, ` +
            `respond with "I don't know".`
        ),
        OpenAIChatMessage.user(question),
        OpenAIChatMessage.functionResult(
          "getInformation",
          JSON.stringify(answer)
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
