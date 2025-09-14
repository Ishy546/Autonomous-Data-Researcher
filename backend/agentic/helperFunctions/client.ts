import OpenAI from "openai";
import { ChatOpenAI } from "@langchain/openai";
import { OPENAI_API_KEY } from "../../env";

export const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export const llm = new ChatOpenAI({
  apiKey: OPENAI_API_KEY,
  model: "gpt-5-nano",
});