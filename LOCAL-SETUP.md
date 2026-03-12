# 🚀 LOCAL SETUP GUIDE FOR STOCKFLOW

## 📋 **Prerequisites**

1. **Install PostgreSQL** on your machine
2. **Create database** for local testing
3. **Run the server** with proper environment

## 🗄️ **Step 1: Install PostgreSQL**

### **Windows (Chocolatey)**
```bash
choco install postgresql
```

### **Windows (Manual Download)**
1. Download from: https://www.postgresql.org/download/windows/
2. Install PostgreSQL 15+
3. Note the installation path

### **macOS (Homebrew)**
```bash
brew install postgresql
brew services start postgresql
```

### **Linux (Ubuntu/Debian)**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## 🗄️ **Step 2: Create Database**

### **Open PostgreSQL Terminal**
```bash
# Windows
psql -U postgres

# macOS/Linux  
sudo -u postgres psql
```

### **Create Database**
```sql
CREATE DATABASE stockflow_db;
CREATE USER stockflow_user WITH PASSWORD 'stockflow123';
GRANT ALL PRIVILEGES ON DATABASE stockflow_db TO stockflow_user;
\q
```

## 🗄️ **Step 3: Update Environment**

Your `.env.local` is already configured correctly:
```env
DATABASE_URL=postgresql://localhost:5432/stockflow_db
JWT_SECRET=local-super-secret-jwt-key-for-development
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
```

## 🗄️ **Step 4: Run Server**

```bash
cd "c:\Users\Chandraprakash\Desktop\6Hour Ass\SaaS-Inventory-Management-System-Scope-Reduced-"
npm start
```

## 🧪 **Step 5: Initialize Database**

Once server is running, open new terminal:
```bash
cd "c:\Users\Chandraprakash\Desktop\6Hour Ass\SaaS-Inventory-Management-System-Scope-Reduced-"
npm run migrate
```

### **Optional: Add Sample Data**
```bash
npm run seed
```

## 🌐 **Access Your Local App**

1. **Main Application**: http://localhost:3000
2. **Backend Test**: http://localhost:3000/test-backend.html
3. **Health Check**: http://localhost:3000/health

## 🔧 **Troubleshooting**

### **Server Won't Start**
- Check if PostgreSQL is running
- Verify database exists
- Check port 3000 is not in use

### **Database Connection Failed**
- Verify PostgreSQL service is running
- Check database name and credentials
- Ensure user has privileges

### **CSS Not Loading**
- Check browser console for errors
- Verify Tailwind CDN is accessible
- Try hard-refresh (Ctrl+F5)

## 🎯 **Expected Results**

When everything works:
- ✅ Server starts without errors
- ✅ Database tables created
- ✅ App loads with full CSS styling
- ✅ All pages work (signup, login, dashboard, products)
- ✅ API endpoints respond correctly

## 🚀 **Ready for Development**

Once local setup is complete:
1. **Test all features** locally
2. **Make changes** to code
3. **Push to GitHub** for Railway deployment
4. **Railway will auto-deploy** with your changes

**Your local StockFlow MVP will be fully functional!**
