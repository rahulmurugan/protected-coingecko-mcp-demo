import express from 'express';
import cors from 'cors';
import { FastMCP } from "fastmcp";
import { z } from "zod";
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Import EVMAuth SDK
import { EVMAuthSDK } from './lib/evmauth/esm/index.js';
import { 
  EVMAUTH_CONFIG, 
  TOKEN_REQUIREMENTS, 
  isMethodProtected, 
  getRequiredTokenId 
} from './evmauth-config.js';

// Load environment variables
dotenv.config();

// Get API key from environment
const API_KEY = process.env.COINGECKO_API_KEY;

// Base URLs for CoinGecko API
const PRO_API_URL = 'https://pro-api.coingecko.com/api/v3';
const FREE_API_URL = 'https://api.coingecko.com/api/v3';

// Function to determine which API to use
function getApiUrl() {
  return API_KEY ? PRO_API_URL : FREE_API_URL;
}

// Initialize EVMAuth SDK
let evmAuthSDK = null;
try {
  evmAuthSDK = new EVMAuthSDK(EVMAUTH_CONFIG);
  console.log('✅ EVMAuth SDK initialized successfully');
  
  if (EVMAUTH_CONFIG.devMode) {
    console.log('🚨 DEVELOPMENT MODE ENABLED - Use only for testing!');
  }
} catch (error) {
  console.error('❌ Failed to initialize EVMAuth SDK:', error.message);
  console.log('⚠️  Server will run WITHOUT token protection');
}

// Create FastMCP server
const mcpServer = new FastMCP({
  name: "Protected CoinGecko MCP Server",
  version: "1.0.0",
  description: "EVMAuth-protected cryptocurrency data access via CoinGecko API"
});

/**
 * Helper function to create EVMAuth-protected tool executor
 */
function createProtectedExecutor(requiredTokenId, executor) {
  // If no protection needed or SDK not available, return original executor
  if (!requiredTokenId || !evmAuthSDK) {
    return executor;
  }

  // Return protected executor
  return async (args, context) => {
    // Extract proof from arguments
    const proof = args._evmauthProof;
    
    // Create a mock MCP request for EVMAuth SDK
    const mcpRequest = {
      params: {
        arguments: args
      }
    };

    // Use EVMAuth SDK's protect method
    const protectedHandler = evmAuthSDK.protect(requiredTokenId, async () => {
      // Call original executor
      const result = await executor(args, context);
      
      // Wrap result for EVMAuth SDK
      return {
        content: [
          {
            type: 'text',
            text: typeof result === 'string' ? result : JSON.stringify(result)
          }
        ]
      };
    });

    try {
      // Execute protected handler
      const response = await protectedHandler(mcpRequest);
      
      // Extract result from EVMAuth response
      if (response.content && response.content[0]) {
        const text = response.content[0].text;
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      }
      
      // Handle error response
      if (response.error) {
        throw new Error(response.error.message || 'Access denied');
      }
      
      throw new Error('Invalid response from EVMAuth SDK');
    } catch (error) {
      // Re-throw with proper error message
      throw new Error(error.message || 'EVMAuth protection check failed');
    }
  };
}

// Add all tools to MCP server
// Tool: Ping (Free)
mcpServer.addTool({
  name: "ping",
  description: "Check API server status",
  parameters: z.object({
    _evmauthProof: z.any().optional()
  }),
  execute: createProtectedExecutor(null, async () => {
    const url = `${getApiUrl()}/ping`;
    const headers = API_KEY ? { 'x-cg-pro-api-key': API_KEY } : {};
    
    const response = await fetch(url, { headers });
    const data = await response.json();
    
    return JSON.stringify(data);
  })
});

// Tool: Get Supported VS Currencies (Free)
mcpServer.addTool({
  name: "getSupportedVsCurrencies",
  description: "Get list of supported vs currencies",
  parameters: z.object({
    _evmauthProof: z.any().optional()
  }),
  execute: createProtectedExecutor(null, async () => {
    const url = `${getApiUrl()}/simple/supported_vs_currencies`;
    const headers = API_KEY ? { 'x-cg-pro-api-key': API_KEY } : {};
    
    const response = await fetch(url, { headers });
    const data = await response.json();
    
    return JSON.stringify(data);
  })
});

// Tool: Get Price (Basic - Token ID 1)
mcpServer.addTool({
  name: "getPrice",
  description: "Get price data for specified cryptocurrencies in various currencies",
  parameters: z.object({
    ids: z.union([z.string(), z.array(z.string())]).describe("ID of coins, comma-separated or array (e.g. bitcoin,ethereum)"),
    vs_currencies: z.union([z.string(), z.array(z.string())]).describe("vs_currency of coins, comma-separated or array (e.g. usd,eur)"),
    include_market_cap: z.boolean().optional().describe("Include market cap data"),
    include_24hr_vol: z.boolean().optional().describe("Include 24hr volume"),
    include_24hr_change: z.boolean().optional().describe("Include 24hr change"),
    include_last_updated_at: z.boolean().optional().describe("Include last updated timestamp"),
    precision: z.string().optional().describe("Decimal precision for price data"),
    _evmauthProof: z.any().optional()
  }),
  execute: createProtectedExecutor(TOKEN_REQUIREMENTS.getPrice, async (args) => {
    const params = new URLSearchParams();
    params.append('ids', Array.isArray(args.ids) ? args.ids.join(',') : args.ids);
    params.append('vs_currencies', Array.isArray(args.vs_currencies) ? args.vs_currencies.join(',') : args.vs_currencies);
    
    if (args.include_market_cap) params.append('include_market_cap', args.include_market_cap);
    if (args.include_24hr_vol) params.append('include_24hr_vol', args.include_24hr_vol);
    if (args.include_24hr_change) params.append('include_24hr_change', args.include_24hr_change);
    if (args.include_last_updated_at) params.append('include_last_updated_at', args.include_last_updated_at);
    if (args.precision) params.append('precision', args.precision);

    const url = `${getApiUrl()}/simple/price?${params.toString()}`;
    const headers = API_KEY ? { 'x-cg-pro-api-key': API_KEY } : {};
    
    const response = await fetch(url, { headers });
    const data = await response.json();
    
    return JSON.stringify(data);
  })
});

// Tool: Get Coin Markets (Premium - Token ID 3)
mcpServer.addTool({
  name: "getCoinMarkets",
  description: "Get market data for coins",
  parameters: z.object({
    vs_currency: z.string().describe("The target currency of market data (usd, eur, jpy, etc.)"),
    ids: z.string().optional().describe("The ids of the coins, comma separated (e.g. bitcoin,ethereum)"),
    category: z.string().optional().describe("Filter by coin category"),
    order: z.enum(["market_cap_desc", "market_cap_asc", "volume_desc", "volume_asc", "id_desc", "id_asc"]).optional().describe("Sort results by field"),
    per_page: z.number().optional().describe("Total results per page (1-250)"),
    page: z.number().optional().describe("Page number"),
    sparkline: z.boolean().optional().describe("Include sparkline 7 days data"),
    price_change_percentage: z.string().optional().describe("Include price change percentage in 1h, 24h, 7d, 14d, 30d, 200d, 1y"),
    _evmauthProof: z.any().optional()
  }),
  execute: createProtectedExecutor(TOKEN_REQUIREMENTS.getCoinMarkets, async (args) => {
    const params = new URLSearchParams();
    params.append('vs_currency', args.vs_currency);
    
    if (args.ids) params.append('ids', args.ids);
    if (args.category) params.append('category', args.category);
    if (args.order) params.append('order', args.order);
    if (args.per_page) params.append('per_page', args.per_page);
    if (args.page) params.append('page', args.page);
    if (args.sparkline) params.append('sparkline', args.sparkline);
    if (args.price_change_percentage) params.append('price_change_percentage', args.price_change_percentage);

    const url = `${getApiUrl()}/coins/markets?${params.toString()}`;
    const headers = API_KEY ? { 'x-cg-pro-api-key': API_KEY } : {};
    
    const response = await fetch(url, { headers });
    const data = await response.json();
    
    return JSON.stringify(data);
  })
});

// Tool: Get Global (Premium - Token ID 3)
mcpServer.addTool({
  name: "getGlobal",
  description: "Get global cryptocurrency data",
  parameters: z.object({
    _evmauthProof: z.any().optional()
  }),
  execute: createProtectedExecutor(TOKEN_REQUIREMENTS.getGlobal, async () => {
    const url = `${getApiUrl()}/global`;
    const headers = API_KEY ? { 'x-cg-pro-api-key': API_KEY } : {};
    
    const response = await fetch(url, { headers });
    const data = await response.json();
    
    return JSON.stringify(data);
  })
});

// Tool: Get Trending (Pro - Token ID 5)
mcpServer.addTool({
  name: "getTrending",
  description: "Get trending coins",
  parameters: z.object({
    _evmauthProof: z.any().optional()
  }),
  execute: createProtectedExecutor(TOKEN_REQUIREMENTS.getTrending, async () => {
    const url = `${getApiUrl()}/search/trending`;
    const headers = API_KEY ? { 'x-cg-pro-api-key': API_KEY } : {};
    
    const response = await fetch(url, { headers });
    const data = await response.json();
    
    return JSON.stringify(data);
  })
});

// Log protection status
console.log('\n🔐 EVMAuth Protection Status:');
Object.keys(TOKEN_REQUIREMENTS).forEach(methodName => {
  const isProtected = isMethodProtected(methodName);
  const tokenId = getRequiredTokenId(methodName);
  const status = isProtected ? `Protected (Token ${tokenId})` : 'Free Access';
  console.log(`  ${methodName}: ${status}`);
});
console.log('');

// Create Express app for HTTP endpoints
const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    server: 'protected-coingecko-mcp-demo',
    mcp_endpoint: '/mcp',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    name: 'Protected CoinGecko MCP Server',
    version: '1.0.0',
    description: 'EVMAuth-protected cryptocurrency data access via CoinGecko API',
    endpoints: {
      health: '/health',
      mcp: '/mcp'
    }
  });
});

// Start server based on environment
const isProduction = process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production';
const port = parseInt(process.env.PORT) || 3001;

console.log('🚀 Starting hybrid server...');
console.log(`📊 Environment: ${isProduction ? 'Production' : 'Development'}`);
console.log(`🔧 Port: ${port}`);

if (isProduction) {
  // For Railway/production deployment
  try {
    // Get the MCP transport handler
    const mcpHandler = mcpServer.createHttpHandler();
    
    // Mount MCP handler at /mcp
    app.post('/mcp', mcpHandler);
    app.get('/mcp', mcpHandler);
    
    // Start Express server
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`✅ Hybrid server running on http://0.0.0.0:${port}`);
      console.log(`📍 Health endpoint: http://0.0.0.0:${port}/health`);
      console.log(`📍 MCP endpoint: http://0.0.0.0:${port}/mcp`);
      console.log(`🔐 EVMAuth protection: ${evmAuthSDK ? 'Enabled' : 'Disabled'}`);
      console.log(`🌐 Ready to accept connections`);
    });
    
    // Keep process alive
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
} else {
  // For local development
  mcpServer.start({
    transportType: "stdio"
  });
}