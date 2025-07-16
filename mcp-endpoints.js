/**
 * MCP Protocol Endpoints
 * Essential endpoints for Claude.ai MCP server discovery
 */

// MCP Server Discovery - This is what Claude.ai looks for
function mcpServerInfo(req, res) {
  res.json({
    name: "protected-coingecko-mcp",
    version: "1.0.0",
    description: "EVMAuth-protected CoinGecko MCP Server",
    capabilities: {
      tools: true
    },
    endpoints: {
      tools: "/mcp/tools"
    }
  });
}

// MCP Tools List
function mcpToolsList(req, res) {
  res.json({
    tools: [
      {
        name: "ping",
        description: "Check API status",
        inputSchema: { type: "object", properties: {}, required: [] }
      },
      {
        name: "getSupportedVsCurrencies",
        description: "Get supported currencies",
        inputSchema: { type: "object", properties: {}, required: [] }
      },
      {
        name: "getPrice",
        description: "Get crypto prices (Token ID 1 required - $0.002)",
        inputSchema: {
          type: "object",
          properties: {
            ids: { type: "string", description: "Coin IDs" },
            vs_currencies: { type: "string", description: "Currencies" }
          },
          required: ["ids", "vs_currencies"]
        }
      },
      {
        name: "getGlobal",
        description: "Get global market data (Token ID 3 required - $0.004)",
        inputSchema: { type: "object", properties: {}, required: [] }
      },
      {
        name: "getCoinMarkets",
        description: "Get market data (Token ID 3 required - $0.004)",
        inputSchema: {
          type: "object",
          properties: {
            vs_currency: { type: "string", description: "Target currency" }
          },
          required: ["vs_currency"]
        }
      },
      {
        name: "getTrending",
        description: "Get trending coins (Token ID 5 required - $0.006)",
        inputSchema: { type: "object", properties: {}, required: [] }
      }
    ]
  });
}

module.exports = {
  mcpServerInfo,
  mcpToolsList
};