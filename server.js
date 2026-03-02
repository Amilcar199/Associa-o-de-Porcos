// Custom Next.js server for cPanel Node.js App
// Uses process.env.PORT provided by the platform

// Load local env file in production (cPanel) without panel variables
try { require('dotenv').config({ path: '.env.local' }); } catch {}
const http = require('http');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
    console.log(`Next.js server listening on port ${port}`);
  });
}).catch((err) => {
  console.error('Error during server prepare:', err);
  process.exit(1);
});
