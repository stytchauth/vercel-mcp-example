import { NextRequest, NextResponse } from "next/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpHandler } from "@vercel/mcp-adapter";
import { z } from "zod";
import * as stytch from "stytch";

type OAuthClaims = Awaited<ReturnType<typeof client.idp.introspectTokenLocal>>;

const initializeMCPServerWithClaims =
  (claims: OAuthClaims, accessToken: string) => (server: McpServer) => {
    server.tool(
      "echo",
      "Echo a message",
      { message: z.string() },
      async ({ message }) => ({
        content: [{ type: "text", text: `Tool echo: ${message}` }],
      }),
    );
    server.tool("whoami", "Who am i anyway", async () => ({
      content: [
        {
          type: "text",
          text: `Tool echo: ${JSON.stringify(claims, null, 2)}\n ${accessToken}`,
        },
      ],
    }));
  };

const client = new stytch.Client({
  project_id: process.env.STYTCH_PROJECT_ID as string,
  secret: process.env.STYTCH_SECRET as string,
});

const authenticatedHandler = async (req: NextRequest) => {
  // Get the authorization header
  const authHeader = req.headers.get("authorization");

  // Check if auth header exists and starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log('NO AUTH HEADER')
    return NextResponse.json(
      { error: "Missing or invalid authorization header" },
      { status: 401 },
    );
  }

  // Extract the token
  const token = authHeader.split(" ")[1];

  let claims: Awaited<ReturnType<typeof client.idp.introspectTokenLocal>>;
  try {
    claims = await client.idp.introspectTokenLocal(token);
  } catch (err) {
    console.error("Unable to validate Stytch Access Token:", err);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 },
    );
  }

  console.log('Auth valid! creating MCP server....')

  // If token is valid, proceed with the actual handler logic
  const handler = createMcpHandler(
    initializeMCPServerWithClaims(claims, token),
    {
      capabilities: {
        tools: {
          echo: {
            description: "Echo a message",
          },
        },
      },
    },
    {
      redisUrl: process.env.REDIS_URL,
      sseEndpoint: "/sse",
      sseMessageEndpoint: "/message",
      streamableHttpEndpoint: "/mcp",
      verboseLogs: true,
      maxDuration: 60,
    },
  );

  return handler(req);
};

export {
  authenticatedHandler as GET,
  authenticatedHandler as POST,
  authenticatedHandler as DELETE,
};
