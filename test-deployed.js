import fetch from 'node-fetch';

// Replace this with your actual deployed URL
const DEPLOYED_URL = process.argv[2] || 'https://your-app.up.railway.app';

console.log(`Testing deployed MCP server at: ${DEPLOYED_URL}\n`);

// Test 1: Health check
console.log('1. Testing health endpoint...');
try {
  const res = await fetch(`${DEPLOYED_URL}/health`);
  console.log(`   Status: ${res.status}`);
  console.log(`   Headers:`, Object.fromEntries(res.headers));
  if (res.ok) {
    const data = await res.text();
    console.log(`   Response: ${data}`);
  }
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Test 2: Root endpoint
console.log('\n2. Testing root endpoint...');
try {
  const res = await fetch(DEPLOYED_URL);
  console.log(`   Status: ${res.status}`);
  const data = await res.text();
  console.log(`   Response preview: ${data.substring(0, 200)}...`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Test 3: MCP endpoint (GET)
console.log('\n3. Testing MCP endpoint (GET)...');
try {
  const res = await fetch(`${DEPLOYED_URL}/mcp`);
  console.log(`   Status: ${res.status}`);
  console.log(`   Content-Type: ${res.headers.get('content-type')}`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Test 4: MCP initialize
console.log('\n4. Testing MCP initialize request...');
try {
  const res = await fetch(`${DEPLOYED_URL}/mcp`, {
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
  
  console.log(`   Status: ${res.status}`);
  console.log(`   Content-Type: ${res.headers.get('content-type')}`);
  
  if (res.ok) {
    const data = await res.json();
    console.log(`   Response:`, JSON.stringify(data, null, 2));
  } else {
    const text = await res.text();
    console.log(`   Error response: ${text}`);
  }
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Test 5: List tools
console.log('\n5. Testing tools/list request...');
try {
  const res = await fetch(`${DEPLOYED_URL}/mcp`, {
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
  
  console.log(`   Status: ${res.status}`);
  
  if (res.ok) {
    const data = await res.json();
    if (data.result?.tools) {
      console.log(`   Found ${data.result.tools.length} tools:`);
      data.result.tools.forEach(tool => {
        console.log(`     - ${tool.name}: ${tool.description}`);
      });
    } else {
      console.log(`   Response:`, JSON.stringify(data, null, 2));
    }
  }
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

console.log('\n✅ Testing complete');
console.log('\nIf tools are not showing in claude.ai, check:');
console.log('1. The MCP endpoint returns proper JSON-RPC responses');
console.log('2. CORS headers are present and allow claude.ai');
console.log('3. The server stays running (no SIGTERM issues)');
console.log('4. The URL format in claude.ai is correct');