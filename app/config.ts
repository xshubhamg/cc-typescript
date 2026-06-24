export interface Config {
  apiKey: string;
  baseURL: string;
  model: string;
  prompt: string;
}

export function getConfig(): Config {
  const [, , flag, prompt] = process.argv;
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseURL =
    process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
  const model = process.env.AGENT_MODEL ?? "cohere/north-mini-code:free";

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  if (flag !== "-p" || !prompt) {
    throw new Error("error: -p flag is required");
  }

  return {
    apiKey,
    baseURL,
    model,
    prompt,
  };
}
