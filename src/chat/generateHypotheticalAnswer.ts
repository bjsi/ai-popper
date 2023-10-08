import { OpenAIChatMessage, OpenAIChatModel, generateText } from "modelfusion";

export async function answerAs(
  question: string,
  personality: "David Deutsch" | "Karl Popper"
) {
  // hypothetical document embeddings:
  const hypotheticalAnswer = await generateText(
    // use cheaper model to generate hypothetical answer:
    new OpenAIChatModel({ model: "gpt-3.5-turbo", temperature: 0 }),
    [
      OpenAIChatMessage.system(
        `Answer the following question as ${personality}:`
      ),
      OpenAIChatMessage.user(question),
    ]
  );
  return hypotheticalAnswer;
}
