const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const seedData = async () => {
  console.log('Seeding database with sample data...');

  try {
    // Create sample organization
    const orgResult = await pool.query(
      'INSERT INTO organizations (name) VALUES ($1) RETURNING id',
      ['Demo Organization']
    );
    const orgId = orgResult.rows[0].id;
    console.log('✅ Created demo organization');

    // Create sample user
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash('demo123', saltRounds);
    
    const userResult = await pool.query(
      'INSERT INTO users (email, password_hash, organization_id) VALUES ($1, $2, $3) RETURNING id',
      ['demo@stockflow.com', passwordHash, orgId]
    );
    console.log('✅ Created demo user (demo@stockflow.com / demo123)');

    // Create settings
    await pool.query(
      'INSERT INTO settings (organization_id, low_stock_threshold, admin_email) VALUES ($1, $2, $3)',
      [orgId, 5, 'demo@stockflow.com']
    );
    console.log('✅ Created default settings');

    // Create sample products
    const products = [
      {
        name: 'Laptop Pro',
        sku: 'LP001',
        description: 'High-performance laptop for professionals',
        quantity_on_hand: 3,
        cost_price: 899.99,
        selling_price: 1299.99,
        low_stock_threshold: 5,
        last_updated_by: 'demo@stockflow.com'
      },
      {
        name: 'Wireless Mouse',
        sku: 'WM002',
        description: 'Ergonomic wireless mouse',
        quantity_on_hand: 2,
        cost_price: 15.99,
        selling_price: 29.99,
        low_stock_threshold: 10,
        last_updated_by: 'demo@stockflow.com'
      },
      {
        name: 'USB-C Hub',
        sku: 'UH003',
        description: '7-in-1 USB-C hub with HDMI',
        quantity_on_hand: 15,
        cost_price: 25.99,
        selling_price: 49.99,
        low_stock_threshold: 5,
        last_updated_by: 'demo@stockflow.com'
      },
      {
        name: 'Mechanical Keyboard',
        sku: 'KB004',
        description: 'RGB mechanical keyboard',
        quantity_on_hand: 8,
        cost_price: 79.99,
        selling_price: 129.99,
        low_stock_threshold: 3,
        last_updated_by: 'demo@stockflow.com'
      },
      {
        name: 'Monitor Stand',
        sku: 'MM005',
        description: 'Adjustable monitor stand',
        quantity_on_hand: 19,
        cost_price: 19.99,
        selling_price: 39.99,
        low_stock_threshold: 5,
        last_updated_by: 'demo@stockflow.com'
      }
    ];

    for (const product of products) {
      await pool.query(
        `INSERT INTO products (
          name, sku, description, quantity_on_hand, cost_price, 
          selling_price, low_stock_threshold, organization_id, last_updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          product.name, product.sku, product.description, product.quantity_on_hand,
          product.cost_price, product.selling_price, product.low_stock_threshold,
          orgId, product.last_updated_by
        ]
      );
    }
    console.log('✅ Created sample products');

    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📋 Demo Credentials:');
    console.log('   Email: demo@stockflow.com');
    console.log('   Password: demo123');
    console.log('');
    console.log('📊 Sample Data:');
    console.log('   - 5 products with various stock levels');
    console.log('   - 2 products in low stock (Laptop Pro, Wireless Mouse)');
    console.log('   - Default low stock threshold: 5');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

seedData();
