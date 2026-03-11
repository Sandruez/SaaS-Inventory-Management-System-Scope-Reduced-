'use client'

import { useState } from 'react'

export default function DashboardPage() {
  const [products] = useState([
    { id: '1', name: 'Sample Product', sku: 'SP001', quantity: 10, status: 'In Stock' },
    { id: '2', name: 'Another Product', sku: 'SP002', quantity: 3, status: 'Low Stock' },
  ])

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>StockFlow Dashboard</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a href="/products" style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
            Products
          </a>
          <a href="/settings" style={{ padding: '8px 16px', background: '#6b7280', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
            Settings
          </a>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', background: '#f3f4f6', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#6b7280' }}>Total Products</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>{products.length}</p>
        </div>
        <div style={{ padding: '20px', background: '#fef3c7', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#92400e' }}>Low Stock Items</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>1</p>
        </div>
        <div style={{ padding: '20px', background: '#dcfce7', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#166534' }}>Total Quantity</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>13</p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px' }}>
        <h2 style={{ marginTop: '0', marginBottom: '20px' }}>Low Stock Alerts</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Product Name</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>SKU</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Current Quantity</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.filter(p => p.quantity <= 5).map(product => (
              <tr key={product.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px' }}>{product.name}</td>
                <td style={{ padding: '12px' }}>{product.sku}</td>
                <td style={{ padding: '12px' }}>{product.quantity}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px',
                    background: product.quantity === 0 ? '#fee2e2' : '#fef3c7',
                    color: product.quantity === 0 ? '#991b1b' : '#92400e'
                  }}>
                    {product.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
