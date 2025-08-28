
// Some MCP Clients (mainly the MCP inspector) will ignore the WWW-Auth header and
// pick a default location for the protected resource metadata. For example, if
// your MCP URL is `https://example.com/mcp` they will look for the metadata at
// .well-known/oauth-protected-resource/mcp
// To handle this, we re-export the same route handler here as well
export { GET } from "../route";