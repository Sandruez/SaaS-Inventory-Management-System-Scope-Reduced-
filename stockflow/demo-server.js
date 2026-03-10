const http = require('http')
const fs = require('fs')
const path = require('path')

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.url === '/' || req.url === '/demo') {
    // Serve the demo HTML file
    const filePath = path.join(__dirname, 'demo.html')
    const stat = fs.statSync(filePath)
    
    res.writeHead(200, { 
      'Content-Type': 'text/html',
      'Content-Length': stat.size
    })
    
    const readStream = fs.createReadStream(filePath)
    readStream.pipe(res)
  } else {
    // API endpoints (mock)
    if (req.url.startsWith('/api/')) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      
      if (req.url === '/api/products') {
        res.end(JSON.stringify({
          success: true,
          products: [
            { id: 'LP001', name: 'Laptop Pro', sku: 'LP001', quantity: 3, price: 999.99 },
            { id: 'WM002', name: 'Wireless Mouse', sku: 'WM002', quantity: 2, price: 29.99 },
            { id: 'UH003', name: 'USB-C Hub', sku: 'UH003', quantity: 15, price: 49.99 }
          ]
        }))
      } else {
        res.end(JSON.stringify({ success: true, message: 'API endpoint working' }))
      }
    } else {
      // 404
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('404 Not Found')
    }
  }
})

const PORT = 3000
server.listen(PORT, () => {
  console.log(`🚀 StockFlow MVP Demo running at http://localhost:${PORT}`)
  console.log(`📱 Full-featured demo with all MVP features`)
  console.log(`🎯 Dashboard, Products, Settings, CRUD operations`)
})
