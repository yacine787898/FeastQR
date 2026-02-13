const http = require('http');
const next = require('next');

try {
  require('dotenv').config();
} catch (_error) {
  // dotenv is optional in cPanel when environment variables are set in the UI.
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST ?? '0.0.0.0';
const port = Number.parseInt(process.env.PORT ?? '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    http
      .createServer((req, res) => {
        if (!req.url) {
          res.statusCode = 400;
          res.end('Bad request');
          return;
        }

        handle(req, res);
      })
      .listen(port, hostname, () => {
        console.log(
          `[FeastQR] Server started on http://${hostname}:${port} (NODE_ENV=${process.env.NODE_ENV ?? 'development'})`,
        );
      });
  })
  .catch((error) => {
    console.error('[FeastQR] Failed to start server', error);
    process.exit(1);
  });
