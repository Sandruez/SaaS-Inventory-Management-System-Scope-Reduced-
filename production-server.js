const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
require('dotenv').config({ path: '.env.local' });

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

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Database schemas
const createTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS organizations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
      low_stock_threshold INTEGER DEFAULT 5,
      admin_email VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(organization_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      sku VARCHAR(255) NOT NULL,
      description TEXT,
      quantity_on_hand INTEGER DEFAULT 0,
      cost_price DECIMAL(10,2),
      selling_price DECIMAL(10,2),
      low_stock_threshold INTEGER,
      organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated_by VARCHAR(255),
      UNIQUE(organization_id, sku)
    )
  `);
};

// Validation schemas
const signupSchema = Joi.object({
  orgName: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const productSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  sku: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).optional(),
  quantityOnHand: Joi.number().integer().min(0).required(),
  costPrice: Joi.number().min(0).optional(),
  sellingPrice: Joi.number().min(0).optional(),
  lowStockThreshold: Joi.number().integer().min(0).optional()
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { orgName, email, password } = req.body;

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create organization
    const orgResult = await pool.query(
      'INSERT INTO organizations (name) VALUES ($1) RETURNING id',
      [orgName]
    );

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userResult = await pool.query(
      'INSERT INTO users (email, password_hash, organization_id) VALUES ($1, $2, $3) RETURNING id, email, organization_id',
      [email, passwordHash, orgResult.rows[0].id]
    );

    // Create default settings
    await pool.query(
      'INSERT INTO settings (organization_id, admin_email) VALUES ($1, $2)',
      [orgResult.rows[0].id, email]
    );

    const token = jwt.sign(
      { userId: userResult.rows[0].id, orgId: userResult.rows[0].organization_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: userResult.rows[0].id,
        email: userResult.rows[0].email,
        organizationId: userResult.rows[0].organization_id,
        organizationName: orgName
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = req.body;

    const userResult = await pool.query(`
      SELECT u.id, u.email, u.password_hash, u.organization_id, o.name as org_name 
      FROM users u 
      JOIN organizations o ON u.organization_id = o.id 
      WHERE u.email = $1
    `, [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, orgId: user.organization_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        organizationId: user.organization_id,
        organizationName: user.org_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Product routes
app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE organization_id = $1 ORDER BY created_at DESC',
      [req.user.orgId]
    );
    res.json({ products: result.rows });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const { error } = productSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, sku, description, quantityOnHand, costPrice, sellingPrice, lowStockThreshold } = req.body;

    // Check for unique SKU
    const existingSku = await pool.query(
      'SELECT id FROM products WHERE organization_id = $1 AND sku = $2',
      [req.user.orgId, sku]
    );

    if (existingSku.rows.length > 0) {
      return res.status(400).json({ error: 'SKU must be unique within your organization' });
    }

    const result = await pool.query(`
      INSERT INTO products (
        name, sku, description, quantity_on_hand, cost_price, selling_price, 
        low_stock_threshold, organization_id, last_updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    `, [
      name, sku, description, quantityOnHand, costPrice, sellingPrice,
      lowStockThreshold, req.user.orgId, req.user.userId
    ]);

    res.status(201).json({ product: result.rows[0] });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const { error } = productSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { id } = req.params;
    const { name, sku, description, quantityOnHand, costPrice, sellingPrice, lowStockThreshold } = req.body;

    // Check product ownership
    const productCheck = await pool.query(
      'SELECT id FROM products WHERE id = $1 AND organization_id = $2',
      [id, req.user.orgId]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check for unique SKU (excluding current product)
    const existingSku = await pool.query(
      'SELECT id FROM products WHERE organization_id = $1 AND sku = $2 AND id != $3',
      [req.user.orgId, sku, id]
    );

    if (existingSku.rows.length > 0) {
      return res.status(400).json({ error: 'SKU must be unique within your organization' });
    }

    const result = await pool.query(`
      UPDATE products SET 
        name = $1, sku = $2, description = $3, quantity_on_hand = $4, 
        cost_price = $5, selling_price = $6, low_stock_threshold = $7,
        updated_at = CURRENT_TIMESTAMP, last_updated_by = $8
      WHERE id = $9 AND organization_id = $10 RETURNING *
    `, [
      name, sku, description, quantityOnHand, costPrice, sellingPrice,
      lowStockThreshold, req.user.userId, id, req.user.orgId
    ]);

    res.json({ product: result.rows[0] });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const productCheck = await pool.query(
      'SELECT id FROM products WHERE id = $1 AND organization_id = $2',
      [id, req.user.orgId]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await pool.query('DELETE FROM products WHERE id = $1 AND organization_id = $2', [id, req.user.orgId]);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard route
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    // Get organization settings
    const settingsResult = await pool.query(
      'SELECT low_stock_threshold FROM settings WHERE organization_id = $1',
      [req.user.orgId]
    );

    const lowStockThreshold = settingsResult.rows[0]?.low_stock_threshold || 5;

    // Get product summary
    const summaryResult = await pool.query(`
      SELECT 
        COUNT(*) as total_products,
        COALESCE(SUM(quantity_on_hand), 0) as total_quantity
      FROM products WHERE organization_id = $1
    `, [req.user.orgId]);

    // Get low stock products
    const lowStockResult = await pool.query(`
      SELECT name, sku, quantity_on_hand, low_stock_threshold
      FROM products 
      WHERE organization_id = $1 AND quantity_on_hand <= COALESCE(low_stock_threshold, $2)
      ORDER BY quantity_on_hand ASC
    `, [req.user.orgId, lowStockThreshold]);

    res.json({
      summary: {
        totalProducts: parseInt(summaryResult.rows[0].total_products),
        totalQuantity: parseInt(summaryResult.rows[0].total_quantity),
        lowStockItems: lowStockResult.rows.length
      },
      lowStockProducts: lowStockResult.rows.map(p => ({
        name: p.name,
        sku: p.sku,
        quantityOnHand: p.quantity_on_hand,
        lowStockThreshold: p.low_stock_threshold || lowStockThreshold
      }))
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Settings route
app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, o.name as organization_name 
      FROM settings s 
      JOIN organizations o ON s.organization_id = o.id 
      WHERE s.organization_id = $1
    `, [req.user.orgId]);

    if (result.rows.length === 0) {
      // Create default settings
      await pool.query(
        'INSERT INTO settings (organization_id, low_stock_threshold) VALUES ($1, 5)',
        [req.user.orgId]
      );
      
      const newResult = await pool.query(
        'SELECT * FROM settings WHERE organization_id = $1',
        [req.user.orgId]
      );
      res.json({ settings: newResult.rows[0] });
    } else {
      res.json({ settings: result.rows[0] });
    }
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/settings', authenticateToken, async (req, res) => {
  try {
    const { lowStockThreshold, adminEmail } = req.body;

    await pool.query(`
      UPDATE settings SET 
        low_stock_threshold = $1,
        admin_email = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE organization_id = $3
    `, [lowStockThreshold, adminEmail, req.user.orgId]);

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await createTables();
    console.log('Database tables created/verified');
    
    app.listen(PORT, () => {
      console.log(`🚀 StockFlow MVP running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Database: PostgreSQL`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
