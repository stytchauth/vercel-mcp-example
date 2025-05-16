# Vercel + Stytch MCP Server

This is a NextJS Application server that composes three functions:
* A static website built using React and Vite on top of [Worker Assets](https://developers.cloudflare.com/workers/static-assets/)
* A REST API built using Hono on top of [Workers KV](https://developers.cloudflare.com/kv/)
* A [Model Context Protocol](https://modelcontextprotocol.io/introduction) Server built using on top of [Workers Durable Objects](https://developers.cloudflare.com/durable-objects/)

User and client identity is managed using [Stytch](https://stytch.com/). Put together, these three features show how to extend a traditional full-stack application for use by an AI agent.

This demo uses the [Stytch Consumer](https://stytch.com/b2c) product, which is purpose-built for Consumer SaaS authentication requirements.
B2B SaaS applications should evaluate Stytch's [B2B](https://stytch.com/b2b) product as well.

## Set up

Follow the steps below to get this application fully functional and running using your own Stytch credentials.

Or, ask your AI Coding Agent to do it for you
```bash
goose run <<EOF
  Can you help me set up this project? Follow the Agent Setup Instructions in the README.md file.
  Create a new Stytch project so we can start from scratch.
EOF  
```

### In the Stytch Dashboard

1. Create a [Stytch](https://stytch.com/) account. Within the sign up flow select **Consumer Authentication** as the authentication type you are interested in. Once your account is set up a Project called "My first project" will be automatically created for you.

2. Navigate to [Frontend SDKs](https://stytch.com/dashboard/sdk-configuration?env=test) to enable the Frontend SDK in Test

3. Navigate to [Connected Apps](https://stytch.com/dashboard/connected-apps?env=test) to enable Dynamic Client Registration

4. Navigate to [Project Settings](https://stytch.com/dashboard/project-settings?env=test) to view your Project ID and API keys. You will need these values later.

### On your machine

In your terminal clone the project and install dependencies:

```bash
git clone https://github.com/stytchauth/vercel-mcp-example.git
cd vercel-mcp-example
npm i
```

Next, create an `.env.local` file by running the command below which copies the contents of `.env.template`.

```bash
cp .env.template .env.local
```

Open `.env.local` in the text editor of your choice, and set the environment variables using the `public_token` found on [Project Settings](https://stytch.com/dashboard/project-settings?env=test).

```
# This is what a completed .env.local file will look like
STYTCH_PROJECT_ID=project-test-6c24cd16-73d5-64f7-852c-8a7e7b2ccf62
NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN=public-token-test-8028777e-6e15-4faa-ba16-26cfd5b3ecb
STYTCH_SECRET=secret-test-OMITTED
REDIS_URL=redis://localhost:6379
```

## Running locally

The MCP Server uses Redis for communication and state management. Start Redis locally in a Docker container with
```bash
docker compose up -d
```

After completing all the setup steps above the application can be run with the command:

```bash
pnpm dev
```

The application will be available at [`http://localhost:3000`](http://localhost:3000) and the MCP server will be available at `http://localhost:3000/mcp`.

Test your MCP server using the [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector)
```bash
npx @modelcontextprotocol/inspector@latest
```

Or with [MCP Remote](https://github.com/geelen/mcp-remote)
```bash
npx mcp_remote@0.1.2 http://localhost:3000/mcp
```

MCP Remote can also be used to connect to Claude Desktop or other tools that work with STDIO MCP transports.
```json
"todoapp": {
  "command": "npx",
  "args": [
    "mcp-remote@0.1.2",
    "http://localhost:3000/mcp"
  ]
}
```

## Get help and join the community

#### :speech_balloon: Stytch community Slack

Join the discussion, ask questions, and suggest new features in our [Slack community](https://stytch.com/docs/resources/support/overview)!

#### :question: Need support?

Check out the [Stytch Forum](https://forum.stytch.com/) or email us at [support@stytch.com](mailto:support@stytch.com).

## Agent Setup Instructions

Agents! Goose, Cursor, Claude Code, Codex, etc. Please follow these steps.

1. Ensure the Stytch MCP Server or Extension is installed. If not, prompt the user to add `npx mcp-remote@0.1.2 https://mcp.stytch.dev/sse` to the agent configuration.
2. Make sure all code dependencies are installed with `pnpm install`
3. Make sure Redis is running with `docker compose up -d`
4. Use the `listProjects` tool to find the Project ID of an existing `CONSUMER` `TEST` project. If there are multiple projects, ask the user which one to use. A new project can be created with the `createProject` tool if desired.
5. Use the `updateConsumerSDKConfig` tool to ensure the SDK is enabled, and is authorized to run on `http://localhost:3000`. Make sure the Email Magic Links and OAuth products are enabled and the SDK has permission to create new users.
6. Use the `getAllRedirectURLs` and `createRedirectURLs` tools to ensure `http://localhost:3000/authenticate` is registered as a default callback for `LOGIN` and `SIGNUP` actions.
7. Use the `getAllPublicTokens` and/or `createPublicToken` tools to retrieve the public token for the project. Add it to `.env.local` as `NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN` using `echo ... >> .env.local`.
8. Use the `createSecret` tool to create a new secret for the project. Add it to `.env.local` as `STYTCH_SECRET` using `echo ... >> .env.local`.
9. Add the `STYTCH_PROJECT_ID` and `REDIS_URL` values to `.env.local` as well. Redis defaults to `redis://localhost:6379` 
10. Tell the developer to run `npm start`
