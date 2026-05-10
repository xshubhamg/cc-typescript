import OpenAI from "openai";
import fs from "fs"

import { exec } from "child_process";
import util from "util";


const execAsync = util.promisify(exec);

const tools = [
  {
    type: "function",
    function: {
      name: "Read",
      description: "Read and return the contents of a file",
      parameters: {
        type: "object",
        properties: {
          file_path: {
            type: "string",
            description: "The path to the file to read"
          }
        },
        required: ["file_path"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "Write",
      description:
        "Write content to a file. Creates the file if it does not exist and overwrites it if it does exist.",
      parameters: {
        type: "object",
        properties: {
          file_path: {
            type: "string",
            description:
              "Path to the file to write"
          },
          content: {
            type: "string",
            description:
              "Content to write into the file"
          }
        },
        required: ["file_path", "content"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "Bash",
      description: "Execute a shell command",
      parameters: {
        type: "object",
        required: ["command"],
        properties: {
          command: {
            type: "string",
            description: "The command to execute"
          }
        }
      }
    }
  }
]

async function executeTool(name: string, args: any): Promise<string> {
  switch (name) {
    case "Read": {
      const content = fs.readFileSync(args.file_path, "utf-8")

      return content;
    }

    case "Write": {
      fs.writeFileSync(args.file_path, args.content, "utf-8")
      return `Successfully wrote to ${args.file_path}`;
    }

    case "Bash": {
      try {
        const result = await execAsync(args.command)
        return `
STDOUT:
${result.stdout}

STDERR:
${result.stderr}
`;
      } catch (error: any) {

        return `
Command failed.

STDOUT:
${error.stdout}

STDERR:
${error.stderr}

ERROR:
${error.message}
`;
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}


async function main() {
  const [, , flag, prompt] = process.argv;
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseURL =
    process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  if (flag !== "-p" || !prompt) {
    throw new Error("error: -p flag is required");
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
  });

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "user", content: prompt }
  ]

  while (true) {
    const response = await client.chat.completions.create({
      model: "anthropic/claude-haiku-4.5",
      messages,
      tools
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error("no choices in response");
    }

    const message = response.choices[0].message;
    messages.push(message);

    if (!message.tool_calls || message.tool_calls.length === 0) {
      console.log(message.content);
      break;
    }

    for (const toolCall of message.tool_calls) {
      const toolName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments)

      const result = await executeTool(toolName, args);

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: result
      })
    }
  }
}

main();
