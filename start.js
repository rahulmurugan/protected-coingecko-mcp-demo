console.log('=== STARTUP DEBUG ===');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV);
console.log('Railway environment:', process.env.RAILWAY_ENVIRONMENT);
console.log('PORT env var:', process.env.PORT);
console.log('All env vars:', Object.keys(process.env).filter(k => k.includes('PORT') || k.includes('RAILWAY')).sort());
console.log('Working directory:', process.cwd());
console.log('===================');

// Import and start the server
try {
  console.log('Importing server.js...');
  await import('./server.js');
  console.log('Server imported successfully');
} catch (error) {
  console.error('Failed to start server:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}