import { TavilySearchOptions, TavilySearchResponse } from "@tavily/core";

export class TavilyService {
  private apiKey = process.env.TAVILY_API_KEY

  async search(options: TavilySearchOptions) {// options at minimum looks like this: { query: string }
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`);
    }

    return response.json();
  }

  async batchSearch(queries: string[], options?: Omit<TavilySearchOptions, "query">) {
    return Promise.all(
      queries.map(async (query) => {
        try {
          return await this.search({ ...options, query });
        } catch (err) {
          return { query, error: err instanceof Error ? err.message : "Unknown error" };
        }
      })
    );
  }

  formatSearchResults(searchResponse: TavilySearchResponse): string {
    let formatted = `Search Query: "${searchResponse.query}"\n\n`;
    if (searchResponse.answer) formatted += `Answer: ${searchResponse.answer}\n\n`;

    searchResponse.results.forEach((result, index) => {
      formatted += `${index + 1}. ${result.title}\n`;
      formatted += `   ${result.content}\n\n`;
    });

    return formatted;
  }
}