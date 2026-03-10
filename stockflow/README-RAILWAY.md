# StockFlow MVP - Railway Deployment Guide

## 🚀 Production-Ready SaaS Inventory Management

This guide will help you deploy StockFlow MVP on Railway with PostgreSQL database.

## 📋 Prerequisites

- Railway account
- GitHub repository
- Node.js 18+ (for local development)

## 🛠️ Railway Setup

### 1. Create Railway Project

1. Log into [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your StockFlow repository

### 2. Add PostgreSQL Database

1. In your Railway project, click "New Service"
2. Select "PostgreSQL" from the database options
3. Railway will automatically create and configure the database

### 3. Configure Environment Variables

In your Railway project settings, add these environment variables:

```bash
# Database (auto-filled by Railway)
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server Configuration
PORT=3000
NODE_ENV=production

# CORS (update with your Railway domain)
ALLOWED_ORIGINS=https://your-app-name.railway.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12
```

### 4. Update package.json Scripts

Ensure your `package.json` has these scripts:

```json
{
  "scripts": {
    "start": "node production-server.js",
    "migrate": "node scripts/migrate.js",
    "seed": "node scripts/seed.js"
  }
}
```

### 5. Database Migration

1. Once deployed, go to your service logs in Railway
2. Click on the service and open the console
3. Run: `npm run migrate`
4. (Optional) Run: `npm run seed` for demo data

## 🏗️ Project Structure

```
stockflow/
├── production-server.js     # Production Express server
├── public/
│   └── index.html         # Frontend application
├── scripts/
│   ├── migrate.js         # Database migration
│   └── seed.js           # Sample data seeding
├── package.json           # Dependencies and scripts
├── railway.json          # Railway configuration
├── .env.example         # Environment variables template
└── README-RAILWAY.md    # This file
```

## 🔧 Key Features

### ✅ Production Ready
- **Express.js server** with security middleware
- **PostgreSQL database** with proper schemas
- **JWT authentication** with bcrypt password hashing
- **Rate limiting** and CORS protection
- **Input validation** with Joi
- **Error handling** and logging

### ✅ Railway Optimized
- **Automatic database connection** via Railway's DATABASE_URL
- **Environment-based configuration**
- **Health check endpoint** at `/health`
- **Graceful error handling**
- **Production logging**

### ✅ All PRD Features
- Multi-tenant data isolation
- Complete product CRUD
- Dashboard with low stock alerts
- Settings management
- Search functionality
- Professional UI/UX

## 🚀 Deployment Steps

### Automatic Deployment (Recommended)

1. Push your code to GitHub
2. Connect repository to Railway
3. Railway will automatically detect and deploy
4. Add PostgreSQL service
5. Configure environment variables
6. Run database migration via Railway console

### Manual Deployment

1. Clone repository locally
2. Install dependencies: `npm install`
3. Set environment variables
4. Run migration: `npm run migrate`
5. Deploy to Railway

## 🧪 Testing the Deployment

### Health Check
Access: `https://your-app-name.railway.app/health`
Should return: `{"status":"OK","timestamp":"..."}`

### Main Application
Access: `https://your-app-name.railway.app`

### Demo Account (if seeded)
- Email: `demo@stockflow.com`
- Password: `demo123`

## 🔒 Security Considerations

### ✅ Implemented
- JWT token authentication
- bcrypt password hashing (12 rounds)
- Rate limiting (100 requests/15min)
- CORS protection
- Input validation
- SQL injection prevention (parameterized queries)
- Helmet.js security headers

### 📋 Additional Recommendations
- Use strong JWT secrets in production
- Enable Railway's automatic backups
- Monitor logs regularly
- Set up alerts for errors
- Consider adding email verification

## 📊 Monitoring

### Railway Dashboard
- Monitor service health
- View application logs
- Track database usage
- Check resource consumption

### Application Logs
- All errors logged to console
- API request/response logging
- Database connection status
- Authentication events

## 🔄 Updates and Maintenance

### Database Updates
1. Update `scripts/migrate.js` with new schema
2. Run `npm run migrate` in Railway console

### Application Updates
1. Push changes to GitHub
2. Railway auto-deploys new version
3. Monitor deployment logs

## 🎯 Success Criteria

✅ **Deployed on Railway**  
✅ **PostgreSQL database connected**  
✅ **All PRD features working**  
✅ **Multi-tenant data isolation**  
✅ **Production security measures**  
✅ **Health monitoring enabled**  

## 🆘 Troubleshooting

### Common Issues

**Database Connection Failed**
- Verify DATABASE_URL is correct
- Check PostgreSQL service is running
- Ensure SSL settings match environment

**Authentication Not Working**
- Verify JWT_SECRET is set
- Check token expiration
- Verify CORS settings

**Deployment Fails**
- Check package.json scripts
- Verify Node.js version compatibility
- Review deployment logs

**Frontend Not Loading**
- Verify static file serving
- Check public/index.html exists
- Confirm API endpoints accessible

### Getting Help

1. Check Railway service logs
2. Verify environment variables
3. Test database connection
4. Review deployment errors
5. Check network connectivity

## 🎉 Ready for Production!

Your StockFlow MVP is now production-ready on Railway with:

- ✅ **Scalable architecture**
- ✅ **Secure authentication**
- ✅ **Reliable database**
- ✅ **Professional UI/UX**
- ✅ **All PRD requirements**
- ✅ **Monitoring and logging**

**Deploy now and start managing your inventory like a pro!** 🚀
