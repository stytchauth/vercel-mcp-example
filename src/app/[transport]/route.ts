import { type NextRequest, NextResponse } from "next/server";
import { createMcpHandler } from "@vercel/mcp-adapter";
import * as stytch from "stytch";
import { initializeMCPServer } from "@/src/services/TodoMCP";
import { IntrospectTokenClaims } from "stytch/types/lib/b2c/idp";

const client = new stytch.Client({
  project_id: process.env.STYTCH_PROJECT_ID as string,
  secret: process.env.STYTCH_SECRET as string,
});

type validateResult =
  | { valid: false; reason: string }
  | { valid: true; claims: IntrospectTokenClaims };
const validateRequestWithStytch = async (
  req: NextRequest,
): Promise<validateResult> => {
  // Get the authorization header
  const authHeader = req.headers.get("authorization");

  // Check if auth header exists and starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("NO AUTH HEADER");
    return { valid: false, reason: "Missing or invalid authorization header" };
  }

  // Extract the token
  const token = authHeader.split(" ")[1];

  try {
    const claims = await client.idp.introspectTokenLocal(token);
    return { valid: true, claims };
  } catch (err) {
    console.error("Unable to validate Stytch Access Token:", err);
    return { valid: false, reason: "Invalid or expired token" };
  }
};

const authenticatedHandler = async (req: NextRequest) => {
  const validationResult = await validateRequestWithStytch(req);
  if (!validationResult.valid) {
    return NextResponse.json(
      { error: validationResult.reason },
      { status: 401 },
    );
  }

  console.log(
    `Auth valid! creating MCP server for user ${validationResult.claims.subject}....`,
  );

  // If token is valid, proceed with the actual handler logic
  const handler = createMcpHandler(
    initializeMCPServer(validationResult.claims),
    {},
    {
      // redisUrl: process.env.REDIS_URL,
      basePath: "",
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
