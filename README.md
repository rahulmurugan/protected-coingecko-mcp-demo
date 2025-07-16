# Protected CoinGecko MCP Server Demo

A token-gated cryptocurrency data access server built with [EVMAuth MCP SDK](https://github.com/evmauth/evmauth-mcp-sdk). This demo showcases how to protect API endpoints using ERC-1155 tokens on the Radius blockchain.

## 🎯 Overview

This server demonstrates the EVMAuth ecosystem by protecting CoinGecko API endpoints with blockchain token ownership verification. Users must own specific ERC-1155 tokens to access different tiers of cryptocurrency data.

## 🔐 Token Tier System

| Tier | Token ID | Price | Methods | Use Case |
|------|----------|-------|---------|----------|
| **Free** | None | Free | `ping`, `getSupportedVsCurrencies` | Basic connectivity |
| **Basic** | 1 | $0.002 | `getPrice` | Price checking |
| **Premium** | 3 | $0.004 | `getGlobal`, `getCoinMarkets` | Market analysis |
| **Pro** | 5 | $0.006 | `getTrending` | Advanced insights |

## 🏗️ Architecture

This server works in conjunction with the [EVMAuth MCP Server](https://evmauth-mcp-oauth-v2-production.up.railway.app/mcp) to provide complete token-gated access control:

```
Claude.ai Web → EVMAuth MCP Server → Protected CoinGecko MCP Server → CoinGecko API
      ↓                    ↓                        ↓
1. OAuth Connect    2. Create Proof         4. Uses EVMAuth SDK
                    3. Access Tool          5. Check Tokens
                    6. Purchase Token       
                    7. Buy Token → ERC-1155 Contract
                    8. Retry Access
```

## 🔧 Built with FastMCP

This server is built using [FastMCP](https://github.com/punkpeye/fastmcp), a TypeScript framework that provides:

- **Full MCP Protocol Support**: Proper implementation of the Model Context Protocol
- **HTTP Streaming**: Optimized for production deployment and claude.ai integration
- **EVMAuth Integration**: Token-gated access control for different tool tiers
- **Automatic Tool Discovery**: Tools are properly exposed to MCP clients

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- CoinGecko API key (optional, falls back to free tier)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/evmauth/protected-coingecko-mcp-demo.git
   cd protected-coingecko-mcp-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your CoinGecko API key
   ```

4. **Start the server**
   ```bash
   npm start
   ```

The server will run on `http://localhost:3001` by default.

## 🔧 Configuration

### Environment Variables

- `COINGECKO_API_KEY`: Your CoinGecko API key (optional)
- `PORT`: Server port (default: 3001)
- `EVMAUTH_DEV_MODE`: Enable development mode (default: false)
- `TOKEN_REQUIREMENTS`: JSON mapping of methods to required token IDs

### Blockchain Configuration

- **Contract**: `0x9f2B42FB651b75CC3db4ef9FEd913A22BA4629Cf`
- **Chain**: Radius testnet (chainId: 1223954)
- **RPC**: `https://rpc.radiustech.io`
- **Available Tokens**: IDs 0-5 with prices $0.001-$0.006 (30-day TTL)

## 🧪 Testing

### Test Free Methods (No Token Required)
```bash
# Ping test
curl -X POST http://localhost:3001/rpc -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"ping","params":{},"id":1}'

# Get supported currencies
curl -X POST http://localhost:3001/rpc -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"getSupportedVsCurrencies","params":{},"id":2}'
```

### Test Protected Methods (Token Required)
```bash
# This will return EVMAUTH_PROOF_REQUIRED error
curl -X POST http://localhost:3001/rpc -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"getPrice","params":{"ids":"bitcoin","vs_currencies":"usd"},"id":3}'
```

## 🔗 Integration with Claude.ai

To use this server with Claude.ai Web, configure both servers:

1. **EVMAuth MCP Server** (already deployed):
   ```
   https://evmauth-mcp-oauth-v2-production.up.railway.app/mcp
   ```

2. **This Protected Server** (deploy to Railway):
   ```
   https://your-deployment-url.railway.app
   ```

Add both to your Claude.ai MCP configuration.

## 📁 Project Structure

```
protected-coingecko-mcp-demo/
├── server.js              # FastMCP server with EVMAuth protection
├── evmauth-config.js      # Token requirements configuration
├── package.json           # Dependencies and scripts
├── .env.example           # Environment configuration template
├── DEPLOY_RAILWAY.md      # Railway deployment guide
└── README.md             # This file
```

## 🚀 Deployment

### Railway Deployment (Recommended)

See [DEPLOY_RAILWAY.md](./DEPLOY_RAILWAY.md) for detailed deployment instructions.

Quick deploy:
```bash
# Install Railway CLI
curl -fsSL https://railway.app/install.sh | sh

# Login and deploy
railway login
railway init
railway up

# Set environment variables
railway variables set COINGECKO_API_KEY=your_api_key_here

# Generate public URL
railway domain
```

### Other Platforms

This server can be deployed to any Node.js hosting platform:
- Heroku
- Vercel
- AWS Lambda
- Google Cloud Functions

## 🛠️ Development

### Development Mode

Set `EVMAUTH_DEV_MODE=true` to bypass cryptographic validation while still checking token ownership. Useful for testing without generating real proofs.

### Local Testing with EVMAuth

1. Start this server: `npm start`
2. Test with the deployed EVMAuth server at `https://evmauth-mcp-oauth-v2-production.up.railway.app/mcp`
3. Generate proofs using the EVMAuth server's `create_signed_proof` method

## 📚 Related Projects

- **EVMAuth MCP SDK**: [GitHub](https://github.com/evmauth/evmauth-mcp-sdk)
- **EVMAuth MCP Server**: [GitHub](https://github.com/evmauth/mcp-server)
- **Original CoinGecko MCP**: [GitHub](https://github.com/BlindVibeDev/CoinGeckoMCP)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Links

- **Live Demo**: Deploy this repo to see it in action
- **Documentation**: [EVMAuth Docs](https://docs.evmauth.io)
- **Support**: [GitHub Issues](https://github.com/evmauth/protected-coingecko-mcp-demo/issues)

---

*This demo showcases the power of blockchain-based access control for AI tools. Build your own token-gated services with EVMAuth!*