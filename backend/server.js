const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const si = require('systeminformation');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 5002;

// Middleware
app.use(cors());
app.use(express.json());

// Store connected clients
let connectedClients = new Set();

// PM2 Process Management Functions
const getPM2List = () => {
  return new Promise((resolve, reject) => {
    exec('pm2 jlist', (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      try {
        const processes = JSON.parse(stdout);
        resolve(processes);
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
};

const restartPM2Process = (processName) => {
  return new Promise((resolve, reject) => {
    exec(`pm2 restart ${processName}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
};

const stopPM2Process = (processName) => {
  return new Promise((resolve, reject) => {
    exec(`pm2 stop ${processName}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
};

const deletePM2Process = (processName) => {
  return new Promise((resolve, reject) => {
    exec(`pm2 delete ${processName}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
};

const getPM2Logs = (processName = '') => {
  return new Promise((resolve, reject) => {
    const command = processName ? `pm2 logs ${processName} --lines 50 --nostream` : 'pm2 logs --lines 50 --nostream';
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
};

// System Monitoring Functions
const getSystemStats = async () => {
  try {
    const [cpu, mem, fsSize, osInfo, load, processes] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.osInfo(),
      si.currentLoad(),
      si.processes()
    ]);

    return {
      cpu: {
        usage: Math.round(cpu.currentLoad),
        cores: cpu.cpus.length,
        details: cpu.cpus.map(core => ({
          load: Math.round(core.load),
          loadUser: Math.round(core.loadUser),
          loadSystem: Math.round(core.loadSystem)
        }))
      },
      memory: {
        total: Math.round(mem.total / 1024 / 1024 / 1024 * 100) / 100, // GB
        used: Math.round(mem.used / 1024 / 1024 / 1024 * 100) / 100, // GB
        free: Math.round(mem.free / 1024 / 1024 / 1024 * 100) / 100, // GB
        usage: Math.round((mem.used / mem.total) * 100),
        available: Math.round(mem.available / 1024 / 1024 / 1024 * 100) / 100 // GB
      },
      disk: fsSize.map(disk => ({
        fs: disk.fs,
        type: disk.type,
        size: Math.round(disk.size / 1024 / 1024 / 1024 * 100) / 100, // GB
        used: Math.round(disk.used / 1024 / 1024 / 1024 * 100) / 100, // GB
        available: Math.round(disk.available / 1024 / 1024 / 1024 * 100) / 100, // GB
        usage: Math.round(disk.use)
      })),
      system: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        hostname: osInfo.hostname,
        uptime: Math.round(osInfo.uptime / 3600 * 100) / 100 // hours
      },
      load: {
        avg1: load.avgLoad,
        avg5: load.avgLoad,
        avg15: load.avgLoad
      },
      processes: {
        total: processes.all,
        running: processes.running,
        blocked: processes.blocked,
        sleeping: processes.sleeping
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting system stats:', error);
    return null;
  }
};

// Alert System
const checkAlerts = (stats) => {
  const alerts = [];
  
  if (stats.cpu.usage > 90) {
    alerts.push({
      type: 'warning',
      title: 'High CPU Usage',
      message: `CPU usage is at ${stats.cpu.usage}%`,
      timestamp: new Date().toISOString()
    });
  }
  
  if (stats.memory.usage > 90) {
    alerts.push({
      type: 'warning', 
      title: 'High Memory Usage',
      message: `Memory usage is at ${stats.memory.usage}%`,
      timestamp: new Date().toISOString()
    });
  }

  stats.disk.forEach(disk => {
    if (disk.usage > 90) {
      alerts.push({
        type: 'warning',
        title: 'High Disk Usage',
        message: `Disk ${disk.fs} usage is at ${disk.usage}%`,
        timestamp: new Date().toISOString()
      });
    }
  });

  return alerts;
};

// API Routes
app.get('/api/system-stats', async (req, res) => {
  try {
    const stats = await getSystemStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/pm2-processes', async (req, res) => {
  try {
    const processes = await getPM2List();
    res.json(processes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pm2-restart/:name', async (req, res) => {
  try {
    const result = await restartPM2Process(req.params.name);
    res.json({ success: true, message: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pm2-stop/:name', async (req, res) => {
  try {
    const result = await stopPM2Process(req.params.name);
    res.json({ success: true, message: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pm2-delete/:name', async (req, res) => {
  try {
    const result = await deletePM2Process(req.params.name);
    res.json({ success: true, message: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/pm2-logs/:name?', async (req, res) => {
  try {
    const logs = await getPM2Logs(req.params.name);
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  connectedClients.add(socket.id);

  // Send initial data
  socket.emit('connected', { message: 'Connected to server mapper' });

  // Handle PM2 operations
  socket.on('pm2-restart', async (data) => {
    try {
      await restartPM2Process(data.name);
      socket.emit('pm2-operation-result', { 
        success: true, 
        operation: 'restart',
        process: data.name,
        message: `Successfully restarted ${data.name}`
      });
    } catch (error) {
      socket.emit('pm2-operation-result', { 
        success: false, 
        operation: 'restart',
        process: data.name,
        error: error.message 
      });
    }
  });

  socket.on('pm2-stop', async (data) => {
    try {
      await stopPM2Process(data.name);
      socket.emit('pm2-operation-result', { 
        success: true, 
        operation: 'stop',
        process: data.name,
        message: `Successfully stopped ${data.name}`
      });
    } catch (error) {
      socket.emit('pm2-operation-result', { 
        success: false, 
        operation: 'stop',
        process: data.name,
        error: error.message 
      });
    }
  });

  socket.on('pm2-delete', async (data) => {
    try {
      await deletePM2Process(data.name);
      socket.emit('pm2-operation-result', { 
        success: true, 
        operation: 'delete',
        process: data.name,
        message: `Successfully deleted ${data.name}`
      });
    } catch (error) {
      socket.emit('pm2-operation-result', { 
        success: false, 
        operation: 'delete',
        process: data.name,
        error: error.message 
      });
    }
  });

  socket.on('get-logs', async (data) => {
    try {
      const logs = await getPM2Logs(data.processName);
      socket.emit('logs-data', { processName: data.processName, logs });
    } catch (error) {
      socket.emit('logs-error', { error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    connectedClients.delete(socket.id);
  });
});

// Real-time data broadcasting
const broadcastSystemData = async () => {
  if (connectedClients.size === 0) return;

  try {
    const [systemStats, pm2Processes] = await Promise.all([
      getSystemStats(),
      getPM2List()
    ]);

    if (systemStats) {
      const alerts = checkAlerts(systemStats);
      
      io.emit('system-stats', systemStats);
      io.emit('pm2-processes', pm2Processes);
      
      if (alerts.length > 0) {
        io.emit('system-alerts', alerts);
      }
    }
  } catch (error) {
    console.error('Error broadcasting system data:', error);
  }
};

// Start real-time monitoring
setInterval(broadcastSystemData, 2000); // Update every 2 seconds

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    connectedClients: connectedClients.size
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server Mapper Backend running on port ${PORT}`);
  console.log(`📊 Real-time monitoring active`);
  console.log(`🔗 WebSocket server ready for connections`);
  console.log(`💻 VPS IP: https://72.60.193.120:${PORT}`);
});