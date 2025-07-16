import fetch from 'node-fetch';

const DEPLOYED_URL = process.argv[2];

if (!DEPLOYED_URL) {
  console.error('Please provide your deployed URL as argument');
  console.error('Usage: node diagnose-mcp.js https://your-app.up.railway.app');
  process.exit(1);
}

async function diagnoseMCP() {
  console.log('🔍 Diagnosing MCP Server:', DEPLOYED_URL);
  console.log('');

  // Test 1: Basic connectivity
  console.log('1. Testing basic connectivity...');
  try {
    const response = await fetch(DEPLOYED_URL);
    console.log('✅ Server is reachable');
    console.log('   Status:', response.status);
    console.log('   Headers:', Object.fromEntries(response.headers));
  } catch (error) {
    console.log('❌ Cannot reach server:', error.message);
    return;
  }

  // Test 2: MCP endpoint
  console.log('\n2. Testing MCP endpoint...');
  try {
    const response = await fetch(`${DEPLOYED_URL}/mcp`);
    console.log('✅ MCP endpoint exists');
    console.log('   Status:', response.status);
    console.log('   Content-Type:', response.headers.get('content-type'));
    
    if (response.headers.get('content-type')?.includes('json')) {
      const data = await response.json();
      console.log('   Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('❌ MCP endpoint error:', error.message);
  }

  // Test 3: Initialize request
  console.log('\n3. Testing MCP initialize...');
  try {
    const response = await fetch(`${DEPLOYED_URL}/mcp`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
            prompts: {},
            resources: {}
          },
          clientInfo: {
            name: 'test-client',
            version: '1.0.0'
          }
        },
        id: 1
      })
    });
    
    const data = await response.json();
    console.log('✅ Initialize response received');
    console.log('   Response:', JSON.stringify(data, null, 2));
    
    if (data.result?.capabilities?.tools) {
      const tools = Object.keys(data.result.capabilities.tools);
      console.log(`\n🔧 Found ${tools.length} tools:`, tools);
    }
  } catch (error) {
    console.log('❌ Initialize error:', error.message);
  }

  // Test 4: List tools
  console.log('\n4. Testing tools/list...');
  try {
    const response = await fetch(`${DEPLOYED_URL}/mcp`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/list',
        params: {},
        id: 2
      })
    });
    
    const data = await response.json();
    console.log('✅ Tools list response received');
    console.log('   Response:', JSON.stringify(data, null, 2));
    
    if (data.result?.tools) {
      console.log(`\n🔧 Available tools (${data.result.tools.length}):`);
      data.result.tools.forEach(tool => {
        console.log(`   - ${tool.name}: ${tool.description}`);
      });
    }
  } catch (error) {
    console.log('❌ Tools list error:', error.message);
  }

  // Test 5: Check SSE support
  console.log('\n5. Testing SSE endpoint...');
  try {
    const response = await fetch(`${DEPLOYED_URL}/sse`, {
      headers: { 'Accept': 'text/event-stream' }
    });
    console.log('   SSE endpoint status:', response.status);
    console.log('   SSE Content-Type:', response.headers.get('content-type'));
  } catch (error) {
    console.log('   SSE endpoint not available (this is normal for HTTP streaming)');
  }

  console.log('\n📋 Summary:');
  console.log('   - If tools are listed above, the server is working correctly');
  console.log('   - If not, check the server logs for errors');
  console.log('   - Make sure you\'re using the correct URL in claude.ai');
}

// Run diagnostics
diagnoseMCP().catch(console.error);