import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { createSupervisor } from "@langchain/langgraph-supervisor";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import * as dotenv from "dotenv";
import { apiTools } from "./tools.js";

dotenv.config();

const chatModel = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  temperature: 0,
});

// Define the tools
const supervisorTools = [];
const modifyPriceTools: any = [apiTools.updatePrice];
const newProductVersionTools: any = [apiTools.createNewProductVersion];

const modifyPrice = createReactAgent({
  llm: chatModel,
  tools: modifyPriceTools,
  name: "modifyPrice",
  prompt:
    "You are a agent tasked with modifying the price of a product. " +
    "First, ask the user if they have an associated project; if not, continue without it. " +
    "Then, prompt the user to select a product and display the current prices. " +
    "Finally, ask for the new price to update the selected product's price. " +
    "Keep the conversation clear and user-friendly.",
});

const newProductVersion = createReactAgent({
  llm: chatModel,
  tools: newProductVersionTools,
  name: "newProductVersion",
  prompt:
    "You are a agent responsible for creating a new product version. " +
    "Begin by asking if the user has an associated project; if not, proceed without it. " +
    "Next, have the user select a product, then prompt for a new rollout date for the version. " +
    "Conclude by creating a new version of the selected product. " +
    "Maintain clarity and simplicity in your instructions.",
});

const workflow = createSupervisor({
  agents: [modifyPrice, newProductVersion],
  llm: chatModel,
  prompt:
    "You are a supervisor routing user requests based on their intent. " +
    "Review the user's message and determine if they want to modify a product price or " +
    "create a new product version. If the intent is to modify a price, respond with 'modifyPrice'. " +
    "If the intent is to create a new version, respond with 'newProductVersion'. " +
    "If the intent is unclear, ask for further clarification.",
  outputMode: "last_message",
});

const checkpointer = new MemorySaver();
export const app = workflow.compile({ checkpointer });
