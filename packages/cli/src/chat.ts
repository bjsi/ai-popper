import * as readline from "node:readline/promises";
import { OpenAIChatMessage } from "modelfusion";
import { chatAs } from "shared-lib";

async function main() {
  // chat loop:
  const chat = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const messages: OpenAIChatMessage[] = [];
  while (true) {
    const question = await chat.question("You: ");
    const textStream = await chatAs({
      personality: "David Deutsch",
      messages: [
        ...messages,
        {
          role: "user",
          content: question,
        },
      ],
    });

    // stream the answer to the terminal:
    process.stdout.write("\nAI : ");
    let answer: string = "";
    for await (const textFragment of textStream) {
      process.stdout.write(textFragment);
      answer += textFragment;
    }
    messages.push({ role: "user", content: question });
    messages.push({ role: "assistant", content: answer });
    process.stdout.write("\n\n");
  }
}

main();
