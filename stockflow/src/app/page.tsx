export default function HomePage() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>🎉 StockFlow MVP</h1>
      <p>Inventory Management System</p>
      <div style={{ marginTop: '30px' }}>
        <a href="/login" style={{ 
          padding: '12px 24px', 
          background: '#4f46e5', 
          color: 'white', 
          textDecoration: 'none',
          borderRadius: '6px'
        }}>
          Get Started
        </a>
      </div>
    </div>
  )
}
