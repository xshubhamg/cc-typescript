import { getConfig } from "./config.ts";
import { Agent } from "./agent.ts";

async function main() {
  const config = getConfig();
  const agent = new Agent({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    model: config.model,
  });

  const response = await agent.run(config.prompt);
  if (response !== null) {
    console.log(response);
  }
}

main();
