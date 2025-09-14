**AI Research Agent API**

A lightweight AI-powered research API built with TypeScript, Express, and OpenAI tool calls.
This project implements an autonomous research agent that plans, searches, ranks, and synthesizes information into a structured response.

**🚀 Features**

Planner – Uses LangChain + OpenAI to break down a user query into 3 focused sub-questions.
Search – Integrates the Tavily API to perform single or batch web searches with result formatting.
Ranker – Uses the OpenAI API to evaluate and rank search results for relevance and reliability.
Writer – Generates polished, natural-language answers using OpenAI completions.
Agent Loop – Iteratively reasons and decides which tools to call until a final answer is ready.
Express API – Exposes a /research endpoint that accepts a query and returns a structured answer.


**🛠️ Tech Stack**

Backend: Node.js, Express, TypeScript
AI: OpenAI API (Chat Completions, Tool Calls), LangChain
Search: Tavily API
Other: Modular tool design for planner, search, ranker, and writer function


**🔧 Usage**

Clone the repo:

git clone https://github.com/Ishy546/Autonomous-Data-Researcher.git
cd Autonomous-Data-Researcher

Install dependencies:
npm install

Add your API keys in .env:
OPENAI_API_KEY=your-key
TAVILY_API_KEY=your-key

Run the server:
npm run dev

Make a request:
curl -X POST http://localhost:8000/research \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the latest advancements in quantum computing?"}'

**📌 Example Query**

Input:
What’s the current weather in my location?

Output (simplified):
{
  "success": true,
  "answer": "It is currently 72°F and sunny in New Brunswick, NJ."
}

Shoutout to the best article on tavily api for js, would not have been able to build this without it: https://medium.com/@abdibrokhim/how-to-give-your-ai-agents-real-time-search-superpowers-with-tavily-c21fd8aa8cb7