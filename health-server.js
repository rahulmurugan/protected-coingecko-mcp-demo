import http from 'http';

// Simple health check server for Railway
const port = parseInt(process.env.PORT) || 3001;

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'running',
      server: 'protected-coingecko-mcp-demo',
      port: port,
      environment: process.env.RAILWAY_ENVIRONMENT || 'development'
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Health check server running on http://0.0.0.0:${port}`);
});