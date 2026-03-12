const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function resetDatabase() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/stockflow_db'
    });

    try {
        console.log('🧹 Starting database reset...');
        
        // Delete all data in correct order (respecting foreign keys)
        await pool.query('DELETE FROM products');
        console.log('✅ Deleted all products');
        
        await pool.query('DELETE FROM settings');
        console.log('✅ Deleted all settings');
        
        await pool.query('DELETE FROM users');
        console.log('✅ Deleted all users');
        
        await pool.query('DELETE FROM organizations');
        console.log('✅ Deleted all organizations');
        
        // Reset auto-increment sequences
        await pool.query('ALTER SEQUENCE organizations_id_seq RESTART WITH 1');
        await pool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
        await pool.query('ALTER SEQUENCE settings_id_seq RESTART WITH 1');
        await pool.query('ALTER SEQUENCE products_id_seq RESTART WITH 1');
        console.log('✅ Reset all auto-increment sequences');
        
        console.log('🎉 Database reset completed successfully!');
        console.log('📊 Database is now empty and ready for fresh signups');
        
    } catch (error) {
        console.error('❌ Error resetting database:', error);
    } finally {
        await pool.end();
    }
}

// Run the reset
resetDatabase();
