import OpenAI from "openai";

/** JSON / multi-field insight generation (dashboard + demo seed batches) */
export const OPENAI_MODEL_STRUCTURED = "gpt-4o-mini";

/** Single short line (campaign quick insight / list refresh) */
export const OPENAI_MODEL_QUICK = "gpt-4o-mini";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
