# 🖥️ VPS Server Mapper

A real-time server monitoring and PM2 process management system for your VPS. Monitor CPU, RAM, disk usage, and manage your PM2 processes with a clean, modern dashboard.

## 📋 Features

### 🔍 **Real-time System Monitoring**
- CPU usage and per-core statistics
- Memory/RAM usage with detailed breakdown
- Disk space monitoring for all drives
- System load averages
- Server uptime tracking

### ⚙️ **PM2 Process Management**
- View all PM2 processes with real-time status
- One-click restart, stop, delete operations
- Process statistics (CPU, memory, restart count)
- Real-time process health monitoring

### 📊 **Live Log Streaming**
- View logs from all servers or specific processes
- Dropdown selection for individual process logs
- Real-time log updates via WebSocket
- Auto-refresh functionality

### ⚠️ **Intelligent Alert System**
- Toast notifications for high resource usage (90%+)
- System alerts for CPU, memory, and disk usage warnings
- Recent alerts history
- Real-time notification delivery

### 🎨 **Clean Design**
- No gradients, hover effects, or box shadows (as requested)
- Dark theme optimized for monitoring
- Responsive grid layout
- Clean, aesthetic design focused on functionality

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **Socket.IO** for real-time communication
- **systeminformation** for system metrics
- **PM2** integration for process management
- **CORS** enabled for cross-origin requests

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Socket.IO Client** for real-time updates
- **React Hot Toast** for notifications
- **Axios** for HTTP requests

## 🚀 Quick Setup

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```
The backend will run on **port 5002** (configured for your VPS IP: `https://72.60.193.120:5002`)

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on **port 3000** and connect to your VPS backend.

## 📁 Project Structure

```
lofingo-server-mapper/
├── backend/                 # Node.js API server
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── README.md           # Backend documentation
├── frontend/               # React dashboard
│   ├── src/
│   │   ├── App.tsx         # Main dashboard component
│   │   ├── App.css         # Component styles
│   │   ├── index.css       # Global styles & design system
│   │   └── main.tsx        # App entry point
│   ├── package.json        # Frontend dependencies
│   └── README.md           # Frontend documentation
└── README.md               # This file
```

## 🔧 Configuration

### Backend Configuration
- **Port**: 5002 (configured for your VPS)
- **CORS**: Enabled for all origins
- **WebSocket**: Real-time communication enabled
- **Monitoring Interval**: 2 seconds

### Frontend Configuration
- **Server URL**: `https://72.60.193.120:5002`
- **Development Port**: 3000
- **WebSocket**: Auto-reconnection enabled

## 📡 API Endpoints

### REST API
- `GET /api/system-stats` - Current system statistics
- `GET /api/pm2-processes` - PM2 process list
- `POST /api/pm2-restart/:name` - Restart PM2 process
- `POST /api/pm2-stop/:name` - Stop PM2 process
- `POST /api/pm2-delete/:name` - Delete PM2 process
- `GET /api/pm2-logs/:name?` - Get PM2 logs
- `GET /health` - Health check

### WebSocket Events
- `system-stats` - Real-time system statistics
- `pm2-processes` - PM2 process updates
- `system-alerts` - System alerts and warnings
- `logs-data` - Log data stream
- `pm2-operation-result` - PM2 operation results

## 🚨 Alert Thresholds

The system will automatically alert you when:
- **CPU usage** exceeds 90%
- **Memory usage** exceeds 90%
- **Disk usage** exceeds 90% (any drive)
- **PM2 processes** go down or restart

## 💡 Usage Tips

1. **Monitor in Real-time**: The dashboard updates every 2 seconds automatically
2. **Process Management**: Use the buttons to quickly restart/stop/delete PM2 processes
3. **Log Monitoring**: Select "All Servers" or specific processes from the dropdown
4. **Responsive Design**: Works on desktop, tablet, and mobile devices
5. **Always Connected**: WebSocket auto-reconnection ensures continuous monitoring

## 🔐 VPS Setup

To deploy on your AlmaLinux VPS with CyberPanel and LiteSpeed:

1. Upload the project to your VPS
2. Install Node.js and npm
3. Install PM2 globally: `npm install -g pm2`
4. Run the backend: `cd backend && npm install && npm start`
5. Set up the frontend for production: `cd frontend && npm install && npm run build`
6. Configure your web server to serve the built frontend files

## 🤝 Support

This server mapper is designed specifically for your VPS setup with:
- AlmaLinux operating system
- CyberPanel control panel
- LiteSpeed web server
- PM2 process management

## 📄 License

MIT License - feel free to modify and use as needed.

---

**Built for efficient VPS monitoring and PM2 process management** 🚀