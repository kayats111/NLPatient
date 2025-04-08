import express from 'express';
import httpProxy from 'http-proxy';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const proxy = httpProxy.createProxyServer();

// Load SSL certificate and key
const privateKey = fs.readFileSync(path.join(__dirname, 'private.key'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'cert.crt'), 'utf8');
const credentials = { key: privateKey, cert: certificate };

// === Serve React static files ===
app.use(express.static(path.join(__dirname, 'build')));

// === Proxy rules ===

app.use('/data_manager', (req, res) => {
  proxy.web(req, res, {
    target: 'http://localhost:3000',
    changeOrigin: true,
    pathRewrite: {
      '^/data_manager': '', // strips the prefix when forwarding
    },
  });
});

app.use('/model_trainer', (req, res) => {
  proxy.web(req, res, {
    target: 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: {
      '^/model_trainer': '', // strips the prefix when forwarding
    },
  });
});

app.use('/predictors', (req, res) => {
  proxy.web(req, res, {
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: {
      '^/predictors': '', // strips the prefix when forwarding
    },
  });
});

app.use('/users', (req, res) => {
  proxy.web(req, res, {
    target: 'http://localhost:3004',
    changeOrigin: true,
    pathRewrite: {
      '^/users': '', // strips the prefix when forwarding
    },
  });
});

// === Fallback for SPA routing ===
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// === Start the server ===
https.createServer(credentials, app).listen(443, () => {
  console.log('Server running on https://localhost:443');
});
