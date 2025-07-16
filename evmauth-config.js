const { config } = require('dotenv');
config(); // Load environment variables

/**
 * EVMAuth Configuration for CoinGecko MCP Server
 * All values are configurable via environment variables
 */

// EVMAuth SDK Configuration
const EVMAUTH_CONFIG = {
  // Blockchain Configuration
  contractAddress: process.env.EVMAUTH_CONTRACT_ADDRESS || '0x9f2B42FB651b75CC3db4ef9FEd913A22BA4629Cf',
  chainId: parseInt(process.env.EVMAUTH_CHAIN_ID) || 1223954, // Radius testnet
  rpcUrl: process.env.EVMAUTH_RPC_URL || 'https://rpc.radiustech.io',
  
  // JWT Configuration
  jwtSecret: process.env.EVMAUTH_JWT_SECRET || 'evmauth-alpha-7f8a9b2c3d4e5f6a',
  jwtIssuer: process.env.EVMAUTH_JWT_ISSUER || undefined,
  expectedAudience: process.env.EVMAUTH_EXPECTED_AUDIENCE || undefined,
  
  // Cache Configuration
  cache: {
    ttl: parseInt(process.env.EVMAUTH_CACHE_TTL) || 300, // 5 minutes default
    maxSize: parseInt(process.env.EVMAUTH_CACHE_MAX_SIZE) || 1000,
    disabled: process.env.EVMAUTH_CACHE_DISABLED === 'true' || false
  },
  
  // Development Configuration
  devMode: process.env.EVMAUTH_DEV_MODE === 'true' || false,
  debug: process.env.EVMAUTH_DEBUG === 'true' || false
};

// Token Requirements Configuration
// Maps MCP method names to required token IDs (null = free access)
const TOKEN_REQUIREMENTS = {
  // Free Tier - No token required
  ping: null,
  getSupportedVsCurrencies: null,
  
  // Basic Tier - Token ID 1 ($0.002)
  getPrice: parseInt(process.env.EVMAUTH_BASIC_TOKEN_ID) || 1,
  
  // Premium Tier - Token ID 3 ($0.004)
  getGlobal: parseInt(process.env.EVMAUTH_PREMIUM_TOKEN_ID) || 3,
  getCoinMarkets: parseInt(process.env.EVMAUTH_PREMIUM_TOKEN_ID) || 3,
  
  // Pro Tier - Token ID 5 ($0.006)
  getTrending: parseInt(process.env.EVMAUTH_PRO_TOKEN_ID) || 5
};

// Method Categories for Easy Management
const METHOD_CATEGORIES = {
  FREE: ['ping', 'getSupportedVsCurrencies'],
  BASIC: ['getPrice'],
  PREMIUM: ['getGlobal', 'getCoinMarkets'],
  PRO: ['getTrending']
};

// Export configuration
module.exports = {
  EVMAUTH_CONFIG,
  TOKEN_REQUIREMENTS,
  METHOD_CATEGORIES,
  
  // Helper functions
  isMethodProtected: (methodName) => TOKEN_REQUIREMENTS[methodName] !== null,
  getRequiredTokenId: (methodName) => TOKEN_REQUIREMENTS[methodName],
  getMethodCategory: (methodName) => {
    for (const [category, methods] of Object.entries(METHOD_CATEGORIES)) {
      if (methods.includes(methodName)) {
        return category;
      }
    }
    return 'UNKNOWN';
  }
};