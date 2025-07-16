const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function testEndpoint(method, params = {}) {
  const payload = {
    jsonrpc: '2.0',
    method,
    params,
    id: Math.floor(Math.random() * 1000)
  };

  try {
    const response = await fetch(`${BASE_URL}/rpc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Testing Protected CoinGecko MCP Server\n');

  // Test 1: Free method (should work)
  console.log('1. Testing ping (free method)...');
  const pingResult = await testEndpoint('ping');
  console.log('✅ Result:', pingResult.result ? 'SUCCESS' : 'FAILED');
  console.log('   Response:', JSON.stringify(pingResult, null, 2));

  console.log('\n2. Testing getSupportedVsCurrencies (free method)...');
  const currenciesResult = await testEndpoint('getSupportedVsCurrencies');
  console.log('✅ Result:', currenciesResult.result ? 'SUCCESS' : 'FAILED');
  console.log('   Currencies count:', currenciesResult.result ? currenciesResult.result.length : 'N/A');

  // Test 2: Protected method (should fail without proof)
  console.log('\n3. Testing getPrice (protected method, no proof)...');
  const priceResult = await testEndpoint('getPrice', {
    ids: 'bitcoin',
    vs_currencies: 'usd'
  });
  console.log('✅ Result:', priceResult.error && priceResult.error.code === 'EVMAUTH_PROOF_REQUIRED' ? 'EXPECTED FAILURE' : 'UNEXPECTED');
  console.log('   Error:', priceResult.error ? priceResult.error.message : 'No error');

  console.log('\n4. Testing getCoinMarkets (protected method, no proof)...');
  const marketsResult = await testEndpoint('getCoinMarkets', {
    vs_currency: 'usd',
    per_page: 10
  });
  console.log('✅ Result:', marketsResult.error && marketsResult.error.code === 'EVMAUTH_PROOF_REQUIRED' ? 'EXPECTED FAILURE' : 'UNEXPECTED');
  console.log('   Error:', marketsResult.error ? marketsResult.error.message : 'No error');

  console.log('\n🎯 Test Summary:');
  console.log('   - Free methods should work without authentication');
  console.log('   - Protected methods should return EVMAUTH_PROOF_REQUIRED error');
  console.log('   - To test with tokens, use the EVMAuth MCP Server to generate proofs');
  console.log('   - EVMAuth Server: https://evmauth-mcp-oauth-v2-production.up.railway.app/mcp');
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testEndpoint, runTests };