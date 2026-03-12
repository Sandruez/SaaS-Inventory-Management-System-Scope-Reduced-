const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'Simple server is running'
    });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Auth test endpoint
app.get('/test-auth', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-auth.html'));
});

// Reset endpoint (clear local storage guide)
app.get('/reset', (req, res) => {
    res.sendFile(path.join(__dirname, 'reset-simple.html'));
});

// Mock authentication endpoints
app.post('/api/auth/signup', (req, res) => {
    const { orgName, email, password } = req.body;
    
    // Mock user creation
    const mockUser = {
        id: 1,
        email: email,
        name: email.split('@')[0],
        organization: {
            id: 1,
            name: orgName
        }
    };
    
    // Mock JWT token
    const mockToken = 'mock-jwt-token-' + Date.now();
    
    res.json({
        token: mockToken,
        user: mockUser,
        message: 'Account created successfully!'
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    // Mock login validation
    if (email && password) {
        const mockUser = {
            id: 1,
            email: email,
            name: email.split('@')[0],
            organization: {
                id: 1,
                name: 'Demo Organization'
            }
        };
        
        const mockToken = 'mock-jwt-token-' + Date.now();
        
        res.json({
            token: mockToken,
            user: mockUser,
            message: 'Login successful!'
        });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Mock dashboard endpoint
app.get('/api/dashboard', (req, res) => {
    res.json({
        summary: {
            totalProducts: 5,
            lowStockItems: 2,
            totalQuantity: 150
        },
        lowStockProducts: [
            { id: 1, name: 'Product A', sku: 'SKU001', quantity: 3, threshold: 5 },
            { id: 2, name: 'Product B', sku: 'SKU002', quantity: 2, threshold: 10 }
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
            quantity_on_hand: 10,
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
        }
    ]);
});

app.post('/api/products', (req, res) => {
    const newProduct = {
        id: Date.now(),
        ...req.body,
        created_at: new Date().toISOString()
    };
    res.json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
    res.json({
        id: req.params.id,
        ...req.body,
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
        timezone: 'UTC'
    });
});

app.put('/api/settings', (req, res) => {
    res.json({
        ...req.body,
        updated_at: new Date().toISOString()
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        message: 'Backend is working!',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Simple StockFlow Server running on http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${path.join(__dirname, 'public')}`);
    console.log(`🔍 Health check: http://localhost:${PORT}/health`);
    console.log(`🧪 Backend test: http://localhost:${PORT}/test-backend.html`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    process.exit(0);
});
