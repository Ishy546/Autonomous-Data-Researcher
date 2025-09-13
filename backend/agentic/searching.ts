import { TavilyService } from "./helperFunctions/SearchClass.js";
import type { TavilySearchOptions } from "@tavily/core";
const tavilyService = new TavilyService();

export default async function handleSearchFunction(args: TavilySearchOptions |  {queries: string[]}) {// object with at least query string
  try {
    if ("queries" in args && Array.isArray(args.queries)) {
      // Batch mode
      const batchResults = await tavilyService.batchSearch(args.queries, {
        search_depth: "basic",
        max_results: 5,
        include_answer: true
      });

      return {
        success: true,
        batch: true,
        results: batchResults.map((res, i) => ({
          query: args.queries[i],
          ...res,
          formatted_results: "results" in res ? tavilyService.formatSearchResults(res) : res.error
        }))
      };
    }

    // Single query mode
    if (!("query" in args) || typeof args.query !== "string") {
      throw new Error("Query parameter is required and must be a string");
    }

    const searchResponse = await tavilyService.search({// calls tavily with options
      query: args.query,
      search_depth: "basic",
      max_results: 5,
      include_answer: args.include_answer !== false,
    });

    return {
      success: true,
      ...searchResponse,
      formatted_results: tavilyService.formatSearchResults(searchResponse),
    };
  } catch (error) {
    console.error("Search function error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown search error",
    };
  }
}