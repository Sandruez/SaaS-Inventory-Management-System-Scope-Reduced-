export default function SimplePage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>StockFlow Test Page</h1>
      <p>If you can see this, the basic Next.js setup is working!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  )
}
