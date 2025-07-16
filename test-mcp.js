const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function testMCPEndpoint() {
  console.log('🧪 Testing MCP Endpoint\n');

  // Test 1: GET /mcp - Get capabilities
  console.log('1. Testing GET /mcp (capabilities)...');
  try {
    const response = await fetch(`${BASE_URL}/mcp`);
    const data = await response.json();
    console.log('✅ Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 2: POST /mcp - Initialize
  console.log('\n2. Testing POST /mcp (initialize)...');
  try {
    const response = await fetch(`${BASE_URL}/mcp`, {
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
    console.log('✅ Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 3: POST /mcp - List tools
  console.log('\n3. Testing POST /mcp (tools/list)...');
  try {
    const response = await fetch(`${BASE_URL}/mcp`, {
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
    console.log('✅ Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 4: POST /mcp - Call free tool (ping)
  console.log('\n4. Testing POST /mcp (tools/call - ping)...');
  try {
    const response = await fetch(`${BASE_URL}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'ping',
          arguments: {}
        },
        id: 3
      })
    });
    const data = await response.json();
    console.log('✅ Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 5: POST /mcp - Call protected tool without proof (should fail)
  console.log('\n5. Testing POST /mcp (tools/call - getPrice without proof)...');
  try {
    const response = await fetch(`${BASE_URL}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'getPrice',
          arguments: {
            ids: 'bitcoin',
            vs_currencies: 'usd'
          }
        },
        id: 4
      })
    });
    const data = await response.json();
    console.log('✅ Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 6: Test SSE endpoint
  console.log('\n6. Testing GET /mcp with SSE headers...');
  try {
    const response = await fetch(`${BASE_URL}/mcp`, {
      headers: { 'Accept': 'text/event-stream' }
    });
    console.log('✅ SSE Connection Status:', response.status);
    console.log('✅ Content-Type:', response.headers.get('content-type'));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Run tests
if (require.main === module) {
  testMCPEndpoint().catch(console.error);
}

module.exports = { testMCPEndpoint };