const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

// === Serve React static files ===
app.use(express.static(path.join(__dirname, 'build')));

// === Proxy rules ===

app.use('/data_manager', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  pathRewrite: {
    '^/data_manager': '', // strips the prefix when forwarding
  },
}));

app.use('/model_trainer', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/model_trainer': '',
  },
}));

app.use('/predictors', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/predictors': '',
  },
}));

app.use('/users', createProxyMiddleware({
    target: 'http://localhost:3004',
    changeOrigin: true,
    pathRewrite: {
      '^/users': '',
    },
  }));

// === Fallback for SPA routing ===
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// === Start the server ===
app.listen(443, () => {
  console.log('Server running on http://localhost:443');
});
