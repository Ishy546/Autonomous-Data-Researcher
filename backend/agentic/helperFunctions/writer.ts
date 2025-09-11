import { openai } from "../agent";

export default async function writer(
  query: string,
  rankedResults: { title: string; content: string; url?: string }[],
  style: "concise" | "detailed" = "concise"
): Promise<string> {
  const systemPrompt = `
You are a research assistant. 
Your job is to write a clear, factual, and well-structured answer to the user's question 
using ONLY the provided ranked search results. 
Cite sources inline using [title] or [url] when relevant. 
If the answer cannot be fully determined, explain the uncertainty.

Answer style: ${style}.
`;

  const userPrompt = `
User Query: ${query}

Ranked Results:
${rankedResults
  .map(
    (r, i) =>
      `${i + 1}. Title: ${r.title}\n   Content: ${r.content}\n   URL: ${
        r.url ?? "N/A"
      }`
  )
  .join("\n\n")}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.5, // some creativity but still grounded
  });

  return response.choices[0].message?.content?.trim() ?? "No answer generated.";
}
