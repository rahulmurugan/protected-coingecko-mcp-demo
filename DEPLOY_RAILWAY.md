# Railway Deployment Guide

This guide will walk you through deploying the Protected CoinGecko MCP Server to Railway.

## Prerequisites

- A [Railway](https://railway.app) account
- Git installed locally
- Railway CLI (optional, but recommended)

## Option 1: Deploy via GitHub (Recommended)

### Step 1: Push to GitHub

1. Create a new repository on GitHub
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit: Protected CoinGecko MCP Server"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Deploy on Railway

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account if not already connected
5. Select your repository
6. Railway will automatically detect the Node.js app and start deployment

### Step 3: Configure Environment Variables

1. In your Railway project, go to the "Variables" tab
2. Add the following environment variables:

```bash
# Required
COINGECKO_API_KEY=your_coingecko_api_key_here

# Optional (defaults shown)
EVMAUTH_CONTRACT_ADDRESS=0x9f2B42FB651b75CC3db4ef9FEd913A22BA4629Cf
EVMAUTH_CHAIN_ID=1223954
EVMAUTH_RPC_URL=https://rpc.radiustech.io
EVMAUTH_JWT_SECRET=evmauth-alpha-7f8a9b2c3d4e5f6a
EVMAUTH_JWT_ISSUER=https://evmauth-mcp-oauth-v2-production.up.railway.app
EVMAUTH_EXPECTED_AUDIENCE=
EVMAUTH_CACHE_TTL=300
EVMAUTH_CACHE_MAX_SIZE=1000
EVMAUTH_CACHE_DISABLED=false
EVMAUTH_DEV_MODE=false
EVMAUTH_DEBUG=false
EVMAUTH_BASIC_TOKEN_ID=1
EVMAUTH_PREMIUM_TOKEN_ID=3
EVMAUTH_PRO_TOKEN_ID=5
```

**Note**: Railway will automatically set the `PORT` environment variable.

### Step 4: Generate Domain

1. Go to the "Settings" tab in your Railway project
2. Under "Domains", click "Generate Domain"
3. Railway will provide you with a URL like: `https://your-app-name.up.railway.app`

## Option 2: Deploy via Railway CLI

### Step 1: Install Railway CLI

```bash
# macOS/Linux
curl -fsSL https://railway.app/install.sh | sh

# Windows (PowerShell)
iwr -useb https://railway.app/install.ps1 | iex
```

### Step 2: Login and Initialize

```bash
# Login to Railway
railway login

# Initialize new project
railway init
```

### Step 3: Deploy

```bash
# Deploy the application
railway up

# Open the deployment logs
railway logs
```

### Step 4: Configure Environment Variables

```bash
# Set environment variables
railway variables set COINGECKO_API_KEY=your_api_key_here
railway variables set EVMAUTH_DEV_MODE=false

# Or import from .env file
railway variables set $(cat .env)
```

### Step 5: Generate Domain

```bash
# Generate a public URL
railway domain
```

## Post-Deployment

### Verify Deployment

Once deployed, test your endpoints:

1. **Health Check**:
   ```bash
   curl https://your-app.up.railway.app/
   ```

2. **MCP Capabilities**:
   ```bash
   curl https://your-app.up.railway.app/mcp
   ```

3. **Test Free Method**:
   ```bash
   curl -X POST https://your-app.up.railway.app/mcp \
     -H "Content-Type: application/json" \
     -d '{
       "jsonrpc": "2.0",
       "method": "tools/call",
       "params": {
         "name": "ping",
         "arguments": {}
       },
       "id": 1
     }'
   ```

### Configure Claude.ai

Add your deployed server to Claude.ai:

1. Go to Claude.ai settings
2. Add MCP Server
3. Enter your Railway URL: `https://your-app.up.railway.app/mcp`
4. Select transport type: SSE or HTTP
5. Save configuration

### Monitor Your App

- **Logs**: View real-time logs in Railway dashboard
- **Metrics**: Monitor CPU, Memory, and Network usage
- **Deployments**: Track deployment history and rollback if needed

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   - Check logs for startup errors
   - Ensure all dependencies are in package.json
   - Verify environment variables are set correctly

2. **CORS Errors**
   - The server includes CORS headers, but verify they're working
   - Check browser console for specific CORS error messages

3. **EVMAuth Errors**
   - Ensure EVMAuth contract address and chain ID are correct
   - Check RPC URL is accessible
   - For testing, you can temporarily set `EVMAUTH_DEV_MODE=true`

### Useful Commands

```bash
# View logs
railway logs

# Open dashboard
railway open

# Restart deployment
railway restart

# Remove deployment
railway down
```

## Cost Considerations

Railway offers:
- $5 free credit per month
- Pay-as-you-go pricing after that
- This server should run well within the free tier for moderate usage

## Security Notes

1. **Never commit `.env` files** with real API keys
2. **Use Railway's environment variables** for sensitive data
3. **Keep `EVMAUTH_DEV_MODE=false`** in production
4. **Regularly update dependencies** for security patches

## Support

- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Issues with this server: https://github.com/evmauth/protected-coingecko-mcp-demo/issues