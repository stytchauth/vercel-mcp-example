import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const projectID = process.env.STYTCH_PROJECT_ID;
  if (!projectID) {
    throw Error("STYTCH_PROJECT_ID is not set.");
  }

  const getEndpoint = (endpoint: string) => {
    const baseURL = projectID.includes("test")
      ? "https://test.stytch.com/v1/public"
      : "https://api.stytch.com/v1/public";

    return `${baseURL}/${projectID}/${endpoint}`;
  };

  const response =  NextResponse.json({
    issuer: process.env.STYTCH_PROJECT_ID,
    authorization_endpoint: `${url.origin}/oauth/authorize`,
    token_endpoint: getEndpoint("oauth2/token"),
    registration_endpoint: getEndpoint("oauth2/register"),
    scopes_supported: ["openid", "profile", "email", "offline_access"],
    response_types_supported: ["code"],
    response_modes_supported: ["query"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    token_endpoint_auth_methods_supported: ["none"],
    code_challenge_methods_supported: ["S256"],
  });

  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}
