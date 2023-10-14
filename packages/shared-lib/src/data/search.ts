import {
  OpenAIChatMessage,
  OpenAIChatModel,
  OpenAITextGenerationModel,
  VectorIndexRetriever,
  retrieve,
  streamText,
} from "modelfusion";
import { embeddingModel } from "./embeddingModel";
import * as dotenv from "dotenv";
import { getVectorIndex } from "./myVectorIndex";

dotenv.config();

export async function search(args: { query: string; signal?: AbortSignal }) {
  const { query, signal } = args;
  const vectorIndex = await getVectorIndex();
  const information = await retrieve(
    new VectorIndexRetriever({
      vectorIndex: vectorIndex.vectorIndex,
      embeddingModel,
      maxResults: 5,
      similarityThreshold: 0.75,
    }),
    query,
    {
      run: {
        abortSignal: signal,
      },
    }
  );
  return information;
}

export async function searchAs(args: {
  question: string;
  personality: "David Deutsch" | "Karl Popper";
  signal?: AbortSignal;
}) {
  const { question: query, personality, signal } = args;
  console.log("Searching for: " + query);
  console.log("As: " + personality);
  const hypotheticalAnswer = await answerAs({
    ...args,
  }); // search for text chunks that are similar to the hypothetical answer:
  return await search({ query: hypotheticalAnswer, signal });
}

export async function answerAs(args: {
  question: string;
  personality: "David Deutsch" | "Karl Popper";
  signal?: AbortSignal;
}) {
  const { question, personality, signal } = args;
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
Question: ${question}${question.endsWith("?") ? "" : "?"}`.trim(),
    {
      run: { abortSignal: signal },
    }
  );

  console.log("Hypothetical answer: ");
  let hypotheticalAnswer: string = "";
  for await (const textFragment of hypotheticalAnswerStream) {
    process.stdout.write(textFragment);
    hypotheticalAnswer += textFragment;
  }

  return hypotheticalAnswer;
}

export const chatAs = async (args: {
  messages: OpenAIChatMessage[];
  personality: "David Deutsch" | "Karl Popper";
  signal?: AbortSignal;
}) => {
  const { messages, personality, signal } = args;
  const question = messages[messages.length - 1].content!;
  const answer = await searchAs({
    question,
    personality,
    signal,
  });
  // answer the user's question using the retrieved information:
  const textStream = await streamText(
    // use stronger model to answer the question:
    new OpenAIChatModel({ model: "gpt-4", temperature: 0 }),
    [
      OpenAIChatMessage.system(
        // Instruct the model on how to answer:
        `Answer the user's question in the style of ${personality} using only the provided information.\n` +
          // Provide some context:
          `Include footnotes with sources to the information that you are using. Use this kind of markdown footnote syntax: [^1]\n` +
          // To reduce hallucination, it is important to give the model an answer
          // that it can use when the information is not sufficient:
          `If the user's question cannot be answered using the provided information, ` +
          `respond with "I don't know".`
      ),
      // to reduce token usage
      ...messages.filter((x) => x.role !== "function"),
      OpenAIChatMessage.user(question),
      OpenAIChatMessage.functionResult(
        "getInformation",
        JSON.stringify(answer)
      ),
    ]
  );
  return textStream;
};
