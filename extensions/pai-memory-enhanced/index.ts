/**
 * @clawxai/pai-memory-enhanced
 *
 * Enhanced memory system inspired by PAI
 * Long-term memory, knowledge graph, and learning engine
 */

import type { OpenClawPlugin } from "openclaw/plugin-sdk";
import { LongTermMemory, longTermMemory } from "./src/long-term-memory.js";

export default {
  name: "@clawxai/pai-memory-enhanced",
  version: "1.0.0",
  description: "Enhanced memory with knowledge graph and learning",

  async init(ctx) {
    console.log("[PAI Memory] Initializing...");

    if (ctx.dashboard) {
      ctx.dashboard.registerPage("/memory", "./assets/memory-dashboard.html", {
        title: "Memory Dashboard",
        icon: "brain",
      });
    }

    if (ctx.api) {
      ctx.api.register("/memory/store", { POST: storeMemory });
      ctx.api.register("/memory/retrieve", { GET: retrieveMemory });
      ctx.api.register("/memory/stats", { GET: getMemoryStats });
    }

    console.log("[PAI Memory] Initialized");
  },

  async shutdown() {
    console.log("[PAI Memory] Shutdown complete");
  },

  metadata: {
    author: "ClawXAI Team",
    license: "MIT",
    capabilities: ["dashboard", "api"],
  },
} satisfies OpenClawPlugin;

async function storeMemory(request: Request) {
  try {
    const body = await request.json();
    const { content, type, metadata, importance } = body;
    const memory = await longTermMemory.store(content, type, metadata, importance);
    return { success: true, data: memory };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown" };
  }
}

async function retrieveMemory(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("query") || "";
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const memories = await longTermMemory.retrieve(query, { limit });
    return { success: true, data: memories };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown" };
  }
}

async function getMemoryStats() {
  const stats = longTermMemory.getStats();
  return { success: true, data: stats };
}
