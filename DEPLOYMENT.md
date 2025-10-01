# 🚀 VPS Deployment Guide

Complete guide to deploy the Server Mapper on your AlmaLinux VPS with CyberPanel.

## 📋 Prerequisites

- AlmaLinux VPS server
- CyberPanel installed
- LiteSpeed Web Server
- Node.js and npm installed
- PM2 installed globally
- Git installed

## 🔧 Server Setup Commands

### 1. Install Node.js (if not already installed)
```bash
# Install Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Install PM2 globally
```bash
sudo npm install -g pm2
```

### 3. Install Git (if not already installed)
```bash
sudo dnf install -y git
```

## 📥 Deployment Steps

### Step 1: Clone the Repository
```bash
# Navigate to your server directory
cd /home/server.kolsheh.com/public_html/

# Clone the repository
git clone https://github.com/lofingoindia/lofingo_server_mapper.git

# Move files to correct locations
mv lofingo_server_mapper/frontend/* ./
mv lofingo_server_mapper/backend /home/server.kolsheh.com/
```

### Step 2: Setup Backend (Node.js API)
```bash
# Navigate to backend directory
cd /home/server.kolsheh.com/backend

# Install dependencies
npm install

# Test the server (optional)
npm start

# Stop the test server (Ctrl+C) and start with PM2
pm2 start server.js --name "server-mapper-api"

# Save PM2 configuration
pm2 save
pm2 startup

# Check status
pm2 status
```

### Step 3: Setup Frontend (React Dashboard)
```bash
# Navigate to frontend directory
cd /home/server.kolsheh.com/public_html/

# Install dependencies
npm install

# Build for production
npm run build

# Copy built files to web directory
cp -r dist/* ./
rm -rf dist src node_modules package.json package-lock.json

# Alternative: Keep source and build when needed
# npm run build
# The built files will be in the 'dist' folder
```

## 🌐 Domain Configuration

### Configure server.kolshes.com to serve the frontend:

1. **In CyberPanel:**
   - Make sure server.kolshes.com points to `/home/server.kolsheh.com/public_html/`
   - Frontend will be accessible at: `https://server.kolshes.com`

2. **Backend API will run on:**
   - VPS IP: `https://72.60.193.120:5002`
   - PM2 process name: `server-mapper-api`

## 🔥 Firewall Configuration

```bash
# Open port 5002 for the backend API
sudo firewall-cmd --permanent --add-port=5002/tcp
sudo firewall-cmd --reload

# Check if port is open
sudo firewall-cmd --list-ports
```

## 📝 Useful Commands

### PM2 Commands for Backend Management
```bash
# Start the backend
pm2 start /home/server.kolsheh.com/backend/server.js --name "server-mapper-api"

# Restart the backend
pm2 restart server-mapper-api

# Stop the backend  
pm2 stop server-mapper-api

# View logs
pm2 logs server-mapper-api

# View real-time logs
pm2 logs server-mapper-api --lines 50

# Check status
pm2 status

# Monitor processes
pm2 monit

# Delete process
pm2 delete server-mapper-api
```

### Frontend Update Commands
```bash
# When you update the frontend code
cd /home/server.kolsheh.com/public_html/
git pull origin main
npm install
npm run build
cp -r dist/* ./
```

### Backend Update Commands
```bash
# When you update the backend code
cd /home/server.kolsheh.com/backend/
git pull origin main
npm install
pm2 restart server-mapper-api
```

## 🔍 Testing & Verification

### Test Backend API
```bash
# Test if backend is running
curl http://localhost:5002/health

# Test system stats endpoint
curl http://localhost:5002/api/system-stats

# Check if PM2 process is running
pm2 status
```

### Test Frontend
```bash
# Check if files are in the right place
ls -la /home/server.kolsheh.com/public_html/

# Test frontend access
curl -I https://server.kolshes.com
```

## 🚨 Troubleshooting

### Backend Issues
```bash
# Check backend logs
pm2 logs server-mapper-api

# Check if port 5002 is in use
netstat -tulpn | grep :5002

# Restart backend service
pm2 restart server-mapper-api

# Check system resources
htop
```

### Frontend Issues
```bash
# Check CyberPanel logs
tail -f /usr/local/lsws/logs/error.log

# Rebuild frontend
cd /home/server.kolsheh.com/public_html/
npm run build
cp -r dist/* ./
```

### Permission Issues
```bash
# Fix ownership
sudo chown -R cyberpanel:cyberpanel /home/server.kolsheh.com/

# Fix permissions
sudo chmod -R 755 /home/server.kolsheh.com/public_html/
sudo chmod -R 644 /home/server.kolsheh.com/public_html/*
```

## 📊 Final URLs

- **Frontend Dashboard:** `https://server.kolshes.com`
- **Backend API:** `https://72.60.193.120:5002`
- **Health Check:** `https://72.60.193.120:5002/health`

## 🔄 Auto-Start Configuration

To ensure your backend starts automatically after server reboot:

```bash
# Save current PM2 processes
pm2 save

# Generate startup script
pm2 startup

# Follow the instructions provided by PM2 startup command
```

## 📱 Monitoring

You can monitor your server mapper from anywhere by visiting:
`https://server.kolshes.com`

The dashboard will show:
- ✅ Real-time CPU, RAM, disk usage
- ✅ PM2 processes with controls
- ✅ Live server logs
- ✅ System alerts and notifications

---

**🎉 Your VPS Server Mapper is now live and ready to monitor your entire server!**