import { createServer } from 'http';

const port = parseInt(process.env.PORT) || 3001;

const server = createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  res.writeHead(200, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  
  res.end(JSON.stringify({
    status: 'ok',
    message: 'Minimal server running',
    port: port,
    url: req.url,
    method: req.method
  }));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Minimal test server running on http://0.0.0.0:${port}`);
});