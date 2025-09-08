import { TavilyService } from "./helperFunctions/SearchClass";
import { TavilySearchOptions } from "@tavily/core";
const tavilyService = new TavilyService();

async function handleSearchFunction(args: TavilySearchOptions) {// object with at least query string
  try {
    // Validate inputs
    if (!args.query || typeof args.query !== "string") {
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