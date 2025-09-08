import { ChatOpenAI } from "@langchain/openai";
import { BaseMessage } from "@langchain/core/messages";

const llm = new ChatOpenAI({
  model: "gpt-5-nano",
})

export async function planner(userQuestion: string): Promise<string[]> {
  const currentDate = new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric"
  });

  const systemPrompt = `You are a research planning expert.
Current date: ${currentDate}

Decompose this research question into 3 focused sub-questions 
that together comprehensively answer the main question. 
Return ONLY a valid JSON array of strings.`;

  const response: BaseMessage = await llm.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: userQuestion },
  ]);

  const text = typeof response.content === "string" ? response.content : JSON.stringify(response.text)
  let subQuestions: string[];
  try {
    subQuestions = JSON.parse(text);
  } catch (err) {
    subQuestions = text.split("\n").filter(Boolean);
  }

  return subQuestions;
}