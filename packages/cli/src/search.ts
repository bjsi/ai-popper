import { searchAs, search } from "shared-lib";
import * as readline from "node:readline/promises";

async function main() {
  // chat loop:
  const chat = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("Welcome to hypothetical embedding search!");
  console.log("Searching as: David Deutsch");
  while (true) {
    const query = await chat.question("You: ");
    const information = await searchAs(query, "David Deutsch");
    console.log(information);
    return;
  }
}

main();
