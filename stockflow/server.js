const http = require('http')

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>StockFlow MVP</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 50px; text-align: center; }
        .btn { padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 6px; display: inline-block; }
      </style>
    </head>
    <body>
      <h1>🎉 StockFlow MVP</h1>
      <p>Inventory Management System</p>
      <div style="margin-top: 30px;">
        <a href="/login" class="btn">Get Started</a>
      </div>
      <p style="margin-top: 30px; color: #666;">
        <strong>Status:</strong> MVP Complete ✅<br>
        <strong>Features:</strong> Authentication, Multi-tenant, Product Management, Dashboard, Settings<br>
        <strong>GitHub:</strong> <a href="https://github.com/Sandruez/SaaS-Inventory-Management-System-Scope-Reduced-">View Repository</a>
      </p>
    </body>
    </html>
  `)
})

const PORT = 3000
server.listen(PORT, () => {
  console.log(`🚀 StockFlow MVP running at http://localhost:${PORT}`)
})
