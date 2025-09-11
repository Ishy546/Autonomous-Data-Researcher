import { openai } from "../agent";

export default async function rankResults(
  query: string,
  results: { title: string; content: string; url?: string }[],
  topN: number = 5
): Promise<typeof results> {
  const systemPrompt = `
You are a ranking engine. 
Given a user query and a list of search results, rank the results from most relevant to least relevant.
Return ONLY valid JSON in this format:
[{ "title": string, "content": string, "url": string }]
Keep at most ${topN} results.
`;

  const userPrompt = `
Query: ${query}

Results:
${results
  .map(
    (r, i) =>
      `${i + 1}. Title: ${r.title}\n   Content: ${r.content}\n   URL: ${r.url ?? "N/A"}`
  )
  .join("\n\n")}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-5-nano",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const text = response.choices[0].message?.content ?? "[]";

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Ranker JSON parse error:", err);
    return results.slice(0, topN); // fallback: just take first N
  }
}