import type { ChatCompletionContentPart, ChatCompletionContentPartRefusal, ChatCompletionContentPartText, ChatCompletionFunctionTool, ChatCompletionMessageParam } from "openai/resources/index.mjs"
import planner from "./helperFunctions/Planning"
import handleSearchFunction from "./searching"
import rankResults from "./helperFunctions/ranker"
import writer from "./helperFunctions/writer"

import { openai } from "./helperFunctions/client"

const availableFunctions: Record<string, (args: any) => Promise<any>> = {
    planner,
    handleSearchFunction, 
    rankResults: async (args: {
    query: string;
    results: { title: string; content: string; url?: string }[];
    topN?: number;
  }) => {
    return rankResults(args.query, args.results, args.topN);
  },
  writer: async (args) =>
    writer(args.query, args.rankedResults, args.style)

}

const tools: ChatCompletionFunctionTool[] = [
   {
    type: "function",
    function: {
      name: "planner",
      description:
        "Break down a broad research question into 3 focused sub-questions that together comprehensively answer the main question.",
      parameters: {
        type: "object",
        properties: {
          userQuestion: {
            type: "string",
            description: "The main research question to decompose."
          }
        },
        required: ["userQuestion"]
      }
    }
  },
  {
  type: "function",
  function: {
    name: "handleSearchFunction",
    description: "Perform a Tavily search. Accepts either a single query string or an array of queries for batch search. Returns results with optional summarized answers.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "A single search query to look up. Use this OR 'queries'."
        },
        queries: {
          type: "array",
          description: "An array of queries to run in batch mode. Use this OR 'query'.",
          items: {
            type: "string"
          }
        },
        include_answer: {
          type: "boolean",
          description: "Whether to include a summarized answer in the response (default: true)."
        }
      },
      // Only "required" if you truly want at least one,
      // but you cannot enforce mutual exclusivity in OpenAI’s schema
      required: []
    }
  }
}, {
  type: "function",
  function: {
    name: "rankResults",
    description: "Rank search results by relevance to a user query, keeping only the top N results.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The user query to rank results against."
        },
        results: {
          type: "array",
          description: "An array of search result objects to rank.",
          items: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "The title of the search result."
              },
              content: {
                type: "string",
                description: "The content or snippet of the search result."
              },
              url: {
                type: "string",
                description: "The optional URL of the search result."
              }
            },
            required: ["title", "content"]
          }
        },
        topN: {
          type: "integer",
          description: "The maximum number of top results to return (default: 5).",
          default: 5
        }
      },
      required: ["query", "results"]
    }
  }
}, {
  type: "function",
  function: {
    name: "writer",
    description: "Generate a clear, factual, and well-structured answer to the user query using only the ranked search results. Supports concise or detailed styles.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The original user query to answer."
        },
        rankedResults: {
          type: "array",
          description: "An array of ranked search results to base the answer on.",
          items: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "The title of the search result."
              },
              content: {
                type: "string",
                description: "The content or snippet of the search result."
              },
              url: {
                type: "string",
                description: "The optional URL of the search result."
              }
            },
            required: ["title", "content"]
          }
        },
        style: {
          type: "string",
          description: "The style of the answer, either concise or detailed (default: concise).",
          enum: ["concise", "detailed"],
          default: "concise"
        }
      },
      required: ["query", "rankedResults"]
    }
  }
}
];


function normalizeContent(
  content: string | ChatCompletionContentPart[] | (ChatCompletionContentPartText | ChatCompletionContentPartRefusal)[]
): string {
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if ("text" in part) return part.text;
        if ("refusal" in part) return `[Refusal]: ${part.refusal}`;
        return "";
      })
      .join(" ");
  }
  return "";
}



export async function agent(query: string): Promise<string> {
  if (typeof query !== "string" || !query) {
    throw new Error("invalid query");
  }

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are a helpful AI agent. Give highly specific answers based on the information you're provided. Prefer to gather information with the tools provided to you rather than giving basic, generic answers.",
    },
    { role: "user", content: query },
  ];

  const MAX_ITERATIONS = 5;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    console.log(`Iteration #${i + 1}`);

    const response = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages,
      tools,
    });

    const choice = response.choices[0];
    if (!choice) {
      console.error("No choice returned");
      break;
    }

    const finishReason = choice.finish_reason;
    const message = choice.message;
    const toolCalls = message.tool_calls;

    messages.push(message);

    if (finishReason === "stop") {
      console.log("AGENT ENDING");
      return message.content ?? ""; // <-- Return the string here
    } else if (finishReason === "tool_calls") {
      for (const toolCall of toolCalls ?? []) {
        if (toolCall.type === "function") {
          const functionName = toolCall.function.name;
          const functionToCall = availableFunctions[functionName];

          if (!functionToCall) {
            console.error(`No function found for: ${functionName}`);
            continue;
          }

          const functionArgs = JSON.parse(toolCall.function.arguments);
          const functionResponse = await functionToCall(functionArgs);

          console.log(functionResponse);

          messages.push({
            tool_call_id: toolCall.id,
            role: "tool",
            content: functionResponse,
          });
        }
      }
    }
  }

  // If agent finishes all iterations without a stop reason
  const lastMessage = messages[messages.length - 1];
  return normalizeContent(lastMessage?.content ?? "");
}

// await agent("What's the current weather in my current location?")