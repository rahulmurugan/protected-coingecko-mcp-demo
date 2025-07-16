import { FastMCP } from "fastmcp";
import { z } from "zod";

// Create a minimal FastMCP server for testing
const server = new FastMCP({
  name: "Test MCP Server",
  version: "1.0.0",
  description: "Minimal test server"
});

// Add a simple test tool
server.addTool({
  name: "hello",
  description: "Say hello",
  parameters: z.object({
    name: z.string().optional().describe("Name to greet")
  }),
  execute: async (args) => {
    return `Hello, ${args.name || 'world'}!`;
  }
});

// Add another simple tool
server.addTool({
  name: "add",
  description: "Add two numbers",
  parameters: z.object({
    a: z.number().describe("First number"),
    b: z.number().describe("Second number")
  }),
  execute: async (args) => {
    return `${args.a} + ${args.b} = ${args.a + args.b}`;
  }
});

// Start server based on environment
const transportType = process.env.RAILWAY_ENVIRONMENT ? 'httpStream' : 'stdio';
const port = parseInt(process.env.PORT) || 3002;

if (transportType === 'httpStream') {
  server.start({
    transportType: "httpStream",
    httpStream: {
      port: port,
      endpoint: "/mcp"
    }
  });
  console.log(`🚀 Test FastMCP server running on port ${port}`);
  console.log(`📍 MCP endpoint: http://localhost:${port}/mcp`);
  console.log(`🔧 Tools: hello, add`);
} else {
  server.start({
    transportType: "stdio"
  });
}