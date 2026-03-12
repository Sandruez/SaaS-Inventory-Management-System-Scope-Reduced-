const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Simple middleware - NO CSP, NO HELMET
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://saas-inventory-management-system-scope-reduced-env.up.railway.app'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'StockFlow DEBUG server is running'
  });
});

// Serve main HTML file
app.get('/', (req, res) => {
  console.log('📱 Serving index.html');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Debug endpoint to check files
app.get('/debug/files', (req, res) => {
  const files = {
    'index.html': fs.existsSync(path.join(__dirname, 'public', 'index.html')),
    'output.css': fs.existsSync(path.join(__dirname, 'public', 'output.css')),
    'axios.min.js': fs.existsSync(path.join(__dirname, 'public', 'axios.min.js')),
    'app-debug.js': fs.existsSync(path.join(__dirname, 'public', 'app-debug.js'))
  };
  res.json(files);
});

// Mock authentication endpoints
app.post('/api/auth/signup', (req, res) => {
  console.log('📝 Signup request:', req.body);
  const { orgName, email, password } = req.body;
  
  if (!orgName || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  const mockUser = {
    id: Date.now(),
    email: email,
    name: email.split('@')[0],
    organization: {
      id: Date.now(),
      name: orgName
    }
  };
  
  const mockToken = 'debug-jwt-token-' + Date.now();
  
  console.log('✅ Signup success:', mockUser);
  res.json({
    token: mockToken,
    user: mockUser,
    message: 'Account created successfully!'
  });
});

app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login request:', req.body);
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  const mockUser = {
    id: Date.now(),
    email: email,
    name: email.split('@')[0],
    organization: {
      id: Date.now(),
      name: 'Demo Organization'
    }
  };
  
  const mockToken = 'debug-jwt-token-' + Date.now();
  
  console.log('✅ Login success:', mockUser);
  res.json({
    token: mockToken,
    user: mockUser,
    message: 'Login successful!'
  });
});

// Mock dashboard endpoint
app.get('/api/dashboard', (req, res) => {
  console.log('📊 Dashboard request');
  const data = {
    summary: {
      totalProducts: 12,
      lowStockItems: 3,
      totalQuantity: 245
    },
    lowStockProducts: [
      { id: 1, name: 'Laptop', sku: 'LAP001', quantity: 3, threshold: 5 },
      { id: 2, name: 'Mouse', sku: 'MOU001', quantity: 2, threshold: 10 },
      { id: 3, name: 'Keyboard', sku: 'KEY001', quantity: 4, threshold: 8 }
    ]
  };
  console.log('✅ Dashboard data sent');
  res.json(data);
});

// Mock products endpoint
app.get('/api/products', (req, res) => {
  console.log('📦 Products request');
  const products = [
    {
      id: 1,
      name: 'Laptop',
      sku: 'LAP001',
      description: 'High-performance laptop',
      quantity_on_hand: 15,
      low_stock_threshold: 5,
      cost_price: 800,
      selling_price: 1200
    },
    {
      id: 2,
      name: 'Mouse',
      sku: 'MOU001',
      description: 'Wireless mouse',
      quantity_on_hand: 25,
      low_stock_threshold: 10,
      cost_price: 15,
      selling_price: 25
    },
    {
      id: 3,
      name: 'Keyboard',
      sku: 'KEY001',
      description: 'Mechanical keyboard',
      quantity_on_hand: 8,
      low_stock_threshold: 5,
      cost_price: 75,
      selling_price: 120
    }
  ];
  console.log('✅ Products data sent:', products.length);
  res.json(products);
});

app.post('/api/products', (req, res) => {
  console.log('➕ Add product request:', req.body);
  const { name, sku, description, quantityOnHand, lowStockThreshold, costPrice, sellingPrice } = req.body;
  
  if (!name || !sku) {
    return res.status(400).json({ error: 'Name and SKU are required' });
  }
  
  const newProduct = {
    id: Date.now(),
    name,
    sku,
    description: description || '',
    quantity_on_hand: quantityOnHand || 0,
    low_stock_threshold: lowStockThreshold || 5,
    cost_price: costPrice || 0,
    selling_price: sellingPrice || 0,
    created_at: new Date().toISOString()
  };
  
  console.log('✅ Product added:', newProduct);
  res.json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  console.log('✏️ Update product request:', req.params.id, req.body);
  const { name, sku, description, quantityOnHand, lowStockThreshold, costPrice, sellingPrice } = req.body;
  
  if (!name || !sku) {
    return res.status(400).json({ error: 'Name and SKU are required' });
  }
  
  const updatedProduct = {
    id: parseInt(req.params.id),
    name,
    sku,
    description: description || '',
    quantity_on_hand: quantityOnHand || 0,
    low_stock_threshold: lowStockThreshold || 5,
    cost_price: costPrice || 0,
    selling_price: sellingPrice || 0,
    updated_at: new Date().toISOString()
  };
  
  console.log('✅ Product updated:', updatedProduct);
  res.json(updatedProduct);
});

app.delete('/api/products/:id', (req, res) => {
  console.log('🗑️ Delete product request:', req.params.id);
  console.log('✅ Product deleted');
  res.json({ message: 'Product deleted successfully' });
});

// Mock settings endpoint
app.get('/api/settings', (req, res) => {
  console.log('⚙️ Settings request');
  const settings = {
    lowStockThreshold: 5,
    currency: 'USD',
    timezone: 'UTC',
    emailNotifications: true,
    lowStockAlerts: true
  };
  console.log('✅ Settings data sent');
  res.json(settings);
});

app.put('/api/settings', (req, res) => {
  console.log('💾 Save settings request:', req.body);
  const { lowStockThreshold, currency, timezone, emailNotifications, lowStockAlerts } = req.body;
  
  const updatedSettings = {
    lowStockThreshold: lowStockThreshold || 5,
    currency: currency || 'USD',
    timezone: timezone || 'UTC',
    emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
    lowStockAlerts: lowStockAlerts !== undefined ? lowStockAlerts : true,
    updated_at: new Date().toISOString()
  };
  
  console.log('✅ Settings saved:', updatedSettings);
  res.json(updatedSettings);
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'StockFlow DEBUG API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Handle 404
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.url);
  res.status(404).json({ error: 'Endpoint not found' });
});

// Handle errors
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 StockFlow DEBUG Server running on port', PORT);
  console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
  console.log('🔗 URL:', process.env.RAILWAY_PUBLIC_URL || `http://localhost:${PORT}`);
  console.log('🔍 Health check:', `${process.env.RAILWAY_PUBLIC_URL || `http://localhost:${PORT}`}/health`);
  console.log('🐛 Debug files:', `${process.env.RAILWAY_PUBLIC_URL || `http://localhost:${PORT}`}/debug/files`);
  console.log('🛡️ CSP: DISABLED');
  console.log('🔧 CORS: ENABLED for Railway domain');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down StockFlow DEBUG server...');
  process.exit(0);
});

module.exports = app;
