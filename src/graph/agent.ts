import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import * as dotenv from "dotenv";
import { apiTools } from "./tools.js";

dotenv.config();

const chatModel = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  temperature: 0,
});

export const tools = [apiTools.updatePrice, apiTools.createNewProductVersion];

export const agent = createReactAgent({
  llm: chatModel,
  tools: tools,
  name: "productAgent",
  prompt: `You are a AI agent helping users with product-related tasks.
Your task is to determine if the user wants to modify a product price or create a new product version.
Ask if the user has a project associated with the product. 
If the intent is unclear, ask for further clarification.

Notes: 
1. Let the user know about the child agents messages.
2. Do not mention agent names.
3. Ensure a seamless transition between the supervisor and child agents.
`,
});
