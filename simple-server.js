import { FastMCP } from "fastmcp";
import { z } from "zod";

console.log('Starting simple MCP server...');

const server = new FastMCP({
  name: "Simple Test Server",
  version: "1.0.0"
});

server.addTool({
  name: "ping",
  description: "Simple ping test",
  execute: async () => "pong"
});

const port = parseInt(process.env.PORT) || 3001;

try {
  await server.start({
    transportType: "httpStream",
    httpStream: {
      port: port,
      endpoint: "/mcp"
    }
  });
  console.log(`Server running on port ${port}`);
} catch (error) {
  console.error('Failed to start:', error);
  process.exit(1);
}