# cc-typescript

A minimal terminal coding agent built with TypeScript and Bun.

`cc-typescript` sends a prompt to an LLM through the OpenRouter-compatible API, lets the model call local tools (`Read`, `Write`, `Bash`), and continues the loop until the model returns a final answer.

## Features

- TypeScript + Bun runtime
- Tool-calling agent loop
- Built-in local tools:
  - `Read`: read file contents
  - `Write`: write/overwrite files
  - `Bash`: run shell commands
- OpenRouter-compatible configuration via environment variables

## Project Structure

```text
.
├── app/
│   └── main.ts        # agent entrypoint and tool loop
├── package.json       # scripts and dependencies
├── tsconfig.json      # TypeScript configuration
└── README.md
```

## Requirements

- [Bun](https://bun.sh/) 1.x+
- OpenRouter API key (or any compatible base URL + key)

## Installation

```bash
bun install
```

## Configuration

Set environment variables before running:

```bash
export OPENROUTER_API_KEY="your_api_key"
# Optional (defaults to https://openrouter.ai/api/v1)
export OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
```

## Usage

Run the agent with the `-p` prompt flag:

```bash
bun run dev -- -p "Create a hello world file and show it"
```

Current script:

```json
{
  "scripts": {
    "dev": "bun run app/main.ts"
  }
}
```

## How It Works

1. Reads CLI input from `-p`.
2. Sends the prompt and tool definitions to the model.
3. Executes requested tool calls locally.
4. Sends tool results back to the model.
5. Repeats until the model returns a normal response.

## Security Notes

This project executes model-requested local operations, including shell commands and file writes.

- Do not run with sensitive credentials loaded in your shell unless required.
- Prefer running inside a sandboxed or disposable environment.
- Review and harden tool permissions before production use.

## Limitations (Current State)

- No tool allowlist/denylist
- No command sandboxing
- No conversation persistence
- No retries/backoff or robust error classification

## Roadmap Ideas

- Add tool permission prompts and policy checks
- Add safer command execution constraints
- Add streaming output and better UX
- Add test coverage for tool execution + loop behavior
- Add model/provider selection through CLI flags

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
