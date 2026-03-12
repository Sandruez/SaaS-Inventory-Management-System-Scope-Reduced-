const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting middleware
app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({ error: 'Too many requests' });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'StockFlow Railway server is running'
  });
});

// Serve main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Mock authentication endpoints (Railway compatible)
app.post('/api/auth/signup', (req, res) => {
  const { orgName, email, password } = req.body;
  
  // Validate input
  if (!orgName || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  // Mock user creation
  const mockUser = {
    id: Date.now(),
    email: email,
    name: email.split('@')[0],
    organization: {
      id: Date.now(),
      name: orgName
    }
  };
  
  // Mock JWT token
  const mockToken = 'railway-jwt-token-' + Date.now();
  
  res.json({
    token: mockToken,
    user: mockUser,
    message: 'Account created successfully!'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  // Mock login validation (accept any email/password for demo)
  const mockUser = {
    id: Date.now(),
    email: email,
    name: email.split('@')[0],
    organization: {
      id: Date.now(),
      name: 'Demo Organization'
    }
  };
  
  const mockToken = 'railway-jwt-token-' + Date.now();
  
  res.json({
    token: mockToken,
    user: mockUser,
    message: 'Login successful!'
  });
});

// Mock dashboard endpoint
app.get('/api/dashboard', (req, res) => {
  res.json({
    summary: {
      totalProducts: 12,
      lowStockItems: 3,
      totalQuantity: 245
    },
    lowStockProducts: [
      { id: 1, name: 'Product A', sku: 'SKU001', quantity: 3, threshold: 5 },
      { id: 2, name: 'Product B', sku: 'SKU002', quantity: 2, threshold: 10 },
      { id: 3, name: 'Product C', sku: 'SKU003', quantity: 4, threshold: 8 }
    ]
  });
});

// Mock products endpoint
app.get('/api/products', (req, res) => {
  res.json([
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
  ]);
});

app.post('/api/products', (req, res) => {
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
  
  res.json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const { name, sku, description, quantityOnHand, lowStockThreshold, costPrice, sellingPrice } = req.body;
  
  if (!name || !sku) {
    return res.status(400).json({ error: 'Name and SKU are required' });
  }
  
  res.json({
    id: parseInt(req.params.id),
    name,
    sku,
    description: description || '',
    quantity_on_hand: quantityOnHand || 0,
    low_stock_threshold: lowStockThreshold || 5,
    cost_price: costPrice || 0,
    selling_price: sellingPrice || 0,
    updated_at: new Date().toISOString()
  });
});

app.delete('/api/products/:id', (req, res) => {
  res.json({ message: 'Product deleted successfully' });
});

// Mock settings endpoint
app.get('/api/settings', (req, res) => {
  res.json({
    lowStockThreshold: 5,
    currency: 'USD',
    timezone: 'UTC',
    emailNotifications: true,
    lowStockAlerts: true
  });
});

app.put('/api/settings', (req, res) => {
  const { lowStockThreshold, currency, timezone, emailNotifications, lowStockAlerts } = req.body;
  
  res.json({
    lowStockThreshold: lowStockThreshold || 5,
    currency: currency || 'USD',
    timezone: timezone || 'UTC',
    emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
    lowStockAlerts: lowStockAlerts !== undefined ? lowStockAlerts : true,
    updated_at: new Date().toISOString()
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'StockFlow Railway API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 StockFlow Railway Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: ${process.env.RAILWAY_PUBLIC_URL || `http://localhost:${PORT}`}`);
  console.log(`🔍 Health check: ${process.env.RAILWAY_PUBLIC_URL || `http://localhost:${PORT}`}/health`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down StockFlow Railway server...');
  process.exit(0);
});

module.exports = app;
