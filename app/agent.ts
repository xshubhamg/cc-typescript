import OpenAI from "openai";
import { tools, executeTool } from "./tools.ts";

export interface AgentOptions {
  apiKey: string;
  baseURL: string;
  model: string;
}

export class Agent {
  private client: OpenAI;
  private model: string;

  constructor(options: AgentOptions) {
    this.client = new OpenAI({
      apiKey: options.apiKey,
      baseURL: options.baseURL,
    });
    this.model = options.model;
  }

  async run(prompt: string): Promise<string | null> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "user", content: prompt }
    ];

    while (true) {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        tools
      });

      if (!response.choices || response.choices.length === 0) {
        throw new Error("no choices in response");
      }

      const message = response.choices[0].message;
      messages.push(message);

      if (!message.tool_calls || message.tool_calls.length === 0) {
        return message.content;
      }

      for (const toolCall of message.tool_calls) {
        if (toolCall.type !== "function") {
          continue;
        }
        const toolName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);

        const result = await executeTool(toolName, args);

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result
        });
      }
    }
  }
}
