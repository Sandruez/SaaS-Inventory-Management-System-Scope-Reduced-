const http = require('http')
const fs = require('fs')
const path = require('path')

console.log('🚀 Starting StockFlow MVP Server...')

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  console.log(`${req.method} ${req.url}`)

  if (req.url === '/' || req.url === '/demo') {
    // Serve fixed MVP HTML file with working authentication
    try {
      const filePath = path.join(__dirname, 'fixed-mvp.html')
      const html = fs.readFileSync(filePath, 'utf8')
      
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(html)
    } catch (error) {
      console.error('Error serving fixed-mvp.html:', error)
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('Internal Server Error')
    }
  } else if (req.url.startsWith('/api/')) {
    // Mock API endpoints
    res.writeHead(200, { 'Content-Type': 'application/json' })
    
    if (req.url === '/api/products') {
      res.end(JSON.stringify({
        success: true,
        products: [
          { id: '1', name: 'Laptop Pro', sku: 'LP001', quantity: 3, price: 999.99, status: 'Low Stock' },
          { id: '2', name: 'Wireless Mouse', sku: 'WM002', quantity: 2, price: 29.99, status: 'Critical' },
          { id: '3', name: 'USB-C Hub', sku: 'UH003', quantity: 15, price: 49.99, status: 'In Stock' },
          { id: '4', name: 'Mechanical Keyboard', sku: 'KB004', quantity: 8, price: 129.99, status: 'In Stock' },
          { id: '5', name: 'Monitor Stand', sku: 'MM005', quantity: 19, price: 39.99, status: 'In Stock' }
        ]
      }))
    } else if (req.url === '/api/dashboard') {
      res.end(JSON.stringify({
        success: true,
        summary: {
          totalProducts: 5,
          lowStockItems: 2,
          totalQuantity: 47
        },
        lowStockProducts: [
          { name: 'Laptop Pro', sku: 'LP001', quantity: 3, status: 'Low Stock' },
          { name: 'Wireless Mouse', sku: 'WM002', quantity: 2, status: 'Critical' }
        ]
      }))
    } else {
      res.end(JSON.stringify({ success: true, message: 'API endpoint working' }))
    }
  } else {
    // 404 for other routes
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('404 Not Found')
  }
})

const PORT = 3000
server.listen(PORT, () => {
  console.log(`🎯 StockFlow MVP is now LIVE!`)
  console.log(`🌐 Server running at: http://localhost:${PORT}`)
  console.log(`📱 Full-featured demo with all MVP features`)
  console.log(`✨ Features: Dashboard, Products, Settings, CRUD operations`)
  console.log(`🔧 Ready for testing and demonstration`)
})
