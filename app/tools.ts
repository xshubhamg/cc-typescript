import fs from "fs";
import { exec } from "child_process";
import util from "util";
import type OpenAI from "openai";

const execAsync = util.promisify(exec);

export const tools: OpenAI.Chat.ChatCompletionTool[] = [
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
];

export async function executeTool(name: string, args: any): Promise<string> {
  switch (name) {
    case "Read": {
      const content = fs.readFileSync(args.file_path, "utf-8");
      return content;
    }

    case "Write": {
      fs.writeFileSync(args.file_path, args.content, "utf-8");
      return `Successfully wrote to ${args.file_path}`;
    }

    case "Bash": {
      try {
        const result = await execAsync(args.command);
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
      throw new Error(`Unknown tool: ${name}`);
  }
}
