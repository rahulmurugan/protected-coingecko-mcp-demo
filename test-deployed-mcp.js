const fetch = require('node-fetch');

// Replace with your deployed Railway URL
const DEPLOYED_URL = process.argv[2];

if (!DEPLOYED_URL) {
  console.error('Please provide your deployed URL as argument');
  console.error('Usage: node test-deployed-mcp.js https://your-app.up.railway.app');
  process.exit(1);
}

async function testDeployedMCP() {
  console.log('🧪 Testing Deployed MCP Server:', DEPLOYED_URL);
  console.log('');

  // Test 1: GET /mcp - Get capabilities
  console.log('1. Testing GET /mcp (capabilities)...');
  try {
    const response = await fetch(`${DEPLOYED_URL}/mcp`);
    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('📋 Response:', JSON.stringify(data, null, 2));
    console.log('');
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('');
  }

  // Test 2: POST /mcp - Initialize
  console.log('2. Testing POST /mcp (initialize)...');
  try {
    const response = await fetch(`${DEPLOYED_URL}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {}
        },
        id: 1
      })
    });
    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('📋 Response:', JSON.stringify(data, null, 2));
    
    // Check if tools are present
    if (data.result && data.result.capabilities && data.result.capabilities.tools) {
      const toolCount = Object.keys(data.result.capabilities.tools).length;
      console.log(`\n🔧 Found ${toolCount} tools in capabilities`);
    }
    console.log('');
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('');
  }

  // Test 3: POST /mcp - List tools
  console.log('3. Testing POST /mcp (tools/list)...');
  try {
    const response = await fetch(`${DEPLOYED_URL}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/list',
        params: {},
        id: 2
      })
    });
    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('📋 Response:', JSON.stringify(data, null, 2));
    
    // List tool names
    if (data.result && data.result.tools) {
      console.log(`\n🔧 Available tools (${data.result.tools.length}):`);
      data.result.tools.forEach(tool => {
        console.log(`   - ${tool.name}: ${tool.description}`);
      });
    }
    console.log('');
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('');
  }

  // Test 4: Check schemas endpoint
  console.log('4. Testing GET /mcp/schema...');
  try {
    const response = await fetch(`${DEPLOYED_URL}/mcp/schema`);
    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('📋 Schema has properties:', Object.keys(data.schema?.properties || {}).join(', '));
    console.log('');
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('');
  }
}

// Run tests
testDeployedMCP().catch(console.error);