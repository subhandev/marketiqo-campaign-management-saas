import OpenAI from "openai";
import Groq from "groq-sdk";

export type AiProvider = "openai" | "groq";

// Minimal surface used by the app: `client.chat.completions.create(...)`.
export type ChatClient = {
  chat: {
    completions: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: (args: any) => Promise<any>;
    };
  };
};

const DEFAULT_CHAT_MODEL: Record<AiProvider, string> = {
  openai: "gpt-4o-mini",
  groq: "llama-3.1-8b-instant",
};

function normalizeProvider(raw: string | undefined): AiProvider {
  const p = (raw ?? "groq").toLowerCase().trim();
  if (p === "openai") return "openai";
  return "groq";
}

export function resolveAiProvider(): AiProvider {
  return normalizeProvider(process.env.AI_PROVIDER);
}

/** Cheap default per provider unless `AI_CHAT_MODEL` overrides (all insight call sites). */
export function chatModel(): string {
  const override = process.env.AI_CHAT_MODEL?.trim();
  if (override) return override;
  return DEFAULT_CHAT_MODEL[resolveAiProvider()];
}

let chatClientSingleton: ChatClient | null = null;

/**
 * OpenAI SDK client: native OpenAI or Groq (OpenAI-compatible Chat Completions).
 * Throws with a clear message if the active provider’s API key is missing.
 */
export function getChatClient(): ChatClient {
  if (chatClientSingleton) return chatClientSingleton;

  const provider = resolveAiProvider();
  if (provider === "groq") {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("LLM: set GROQ_API_KEY when AI_PROVIDER=groq (default)");
    }
    // Use Groq's official SDK (same shape as OpenAI's `chat.completions.create`).
    chatClientSingleton = new Groq({ apiKey }) as unknown as ChatClient;
  } else {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("LLM: set OPENAI_API_KEY when AI_PROVIDER=openai");
    }
    chatClientSingleton = new OpenAI({ apiKey }) as unknown as ChatClient;
  }

  return chatClientSingleton!;
}
