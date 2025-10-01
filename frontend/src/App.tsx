import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';

// Types
interface SystemStats {
  cpu: {
    usage: number;
    cores: number;
    details: Array<{
      load: number;
      loadUser: number;
      loadSystem: number;
    }>;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
    available: number;
  };
  disk: Array<{
    fs: string;
    type: string;
    size: number;
    used: number;
    available: number;
    usage: number;
  }>;
  system: {
    platform: string;
    distro: string;
    release: string;
    hostname: string;
    uptime: number;
  };
  load: {
    avg1: number;
    avg5: number;
    avg15: number;
  };
  processes: {
    total: number;
    running: number;
    blocked: number;
    sleeping: number;
  };
  timestamp: string;
}

interface PM2Process {
  pid: number;
  name: string;
  pm_id: number;
  status: string;
  cpu: number;
  memory: number;
  pm2_env: {
    status: string;
    restart_time: number;
    unstable_restarts: number;
    created_at: number;
    pm_uptime: number;
  };
}

interface Alert {
  type: string;
  title: string;
  message: string;
  timestamp: string;
}

const SERVER_URL = 'https://72.60.193.120:5002';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [pm2Processes, setPm2Processes] = useState<PM2Process[]>([]);
  const [logs, setLogs] = useState<string>('');
  const [selectedProcess, setSelectedProcess] = useState<string>('all');
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnected(true);
      toast.success('Connected to Server Mapper');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      toast.error('Disconnected from Server Mapper');
    });

    newSocket.on('system-stats', (data: SystemStats) => {
      setSystemStats(data);
    });

    newSocket.on('pm2-processes', (data: PM2Process[]) => {
      setPm2Processes(data);
    });

    newSocket.on('system-alerts', (data: Alert[]) => {
      setAlerts(prev => [...prev.slice(-10), ...data]);
      data.forEach(alert => {
        if (alert.type === 'warning') {
          toast.error(alert.message);
        }
      });
    });

    newSocket.on('logs-data', (data: { processName: string; logs: string }) => {
      setLogs(data.logs);
    });

    newSocket.on('pm2-operation-result', (data: any) => {
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.error);
      }
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handlePM2Action = (action: string, processName: string) => {
    if (socket) {
      socket.emit(`pm2-${action}`, { name: processName });
    }
  };

  const handleLogsRequest = (processName: string) => {
    if (socket) {
      setSelectedProcess(processName);
      socket.emit('get-logs', { processName: processName === 'all' ? '' : processName });
    }
  };

  const formatBytes = (bytes: number) => {
    return `${bytes.toFixed(2)} GB`;
  };

  const formatUptime = (hours: number) => {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    return `${days}d ${remainingHours}h`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online': return 'status-online';
      case 'stopped': return 'status-stopped';
      default: return 'status-warning';
    }
  };

  return (
    <div className="App">
      <Toaster position="top-right" />
      
      <header className="header">
        <div className="header-content">
          <h1 className="header-title">🖥️ VPS Server Mapper</h1>
          <div className="connection-status">
            <div className={`connection-dot ${connected ? '' : 'disconnected'}`}></div>
            <span>{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </header>

      <div className="container">
        {/* System Overview */}
        <div className="grid grid-4">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">CPU Usage</h3>
            </div>
            <div className="stat-value">{systemStats?.cpu.usage || 0}%</div>
            <div className="stat-label">{systemStats?.cpu.cores || 0} cores</div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Memory Usage</h3>
            </div>
            <div className="stat-value">{systemStats?.memory.usage || 0}%</div>
            <div className="stat-label">
              {formatBytes(systemStats?.memory.used || 0)} / {formatBytes(systemStats?.memory.total || 0)}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">System Load</h3>
            </div>
            <div className="stat-value">{systemStats?.load.avg1?.toFixed(2) || '0.00'}</div>
            <div className="stat-label">1min average</div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Uptime</h3>
            </div>
            <div className="stat-value">{formatUptime(systemStats?.system.uptime || 0)}</div>
            <div className="stat-label">{systemStats?.system.hostname || 'Unknown'}</div>
          </div>
        </div>

        {/* Disk Usage */}
        {systemStats?.disk && systemStats.disk.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">💾 Disk Usage</h3>
            </div>
            <div className="grid grid-3">
              {systemStats.disk.map((disk, index) => (
                <div key={index} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '4px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px' }}>{disk.fs}</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: disk.usage > 90 ? 'var(--error)' : 'var(--text-primary)' }}>
                    {disk.usage}%
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {formatBytes(disk.used)} / {formatBytes(disk.size)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-2">
          {/* PM2 Processes */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">⚙️ PM2 Processes</h3>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {pm2Processes.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No PM2 processes found</p>
              ) : (
                pm2Processes.map((process) => (
                  <div key={process.pm_id} className="process-item">
                    <div className="process-info">
                      <div className="process-name">{process.name}</div>
                      <div className="process-details">
                        <span className={getStatusColor(process.pm2_env.status)}>
                          ● {process.pm2_env.status}
                        </span>
                        {' | '}
                        CPU: {process.cpu}% | 
                        Memory: {(process.memory / 1024 / 1024).toFixed(0)}MB |
                        Restarts: {process.pm2_env.restart_time}
                      </div>
                    </div>
                    <div className="process-actions">
                      <button 
                        className="success"
                        onClick={() => handlePM2Action('restart', process.name)}
                      >
                        Restart
                      </button>
                      <button 
                        className="warning"
                        onClick={() => handlePM2Action('stop', process.name)}
                      >
                        Stop
                      </button>
                      <button 
                        className="error"
                        onClick={() => handlePM2Action('delete', process.name)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Logs Viewer */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📋 Server Logs</h3>
              <select 
                className="select"
                value={selectedProcess}
                onChange={(e) => handleLogsRequest(e.target.value)}
              >
                <option value="all">All Servers</option>
                {pm2Processes.map((process) => (
                  <option key={process.pm_id} value={process.name}>
                    {process.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="logs-container">
              {logs || 'Select a process to view logs...'}
            </div>
            <button 
              style={{ marginTop: '12px' }}
              onClick={() => handleLogsRequest(selectedProcess)}
            >
              Refresh Logs
            </button>
          </div>
        </div>

        {/* System Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📊 System Information</h3>
          </div>
          <div className="grid grid-4">
            <div>
              <div className="stat-label">Platform</div>
              <div style={{ fontSize: '16px', fontWeight: 600, marginTop: '4px' }}>
                {systemStats?.system.platform || 'Unknown'}
              </div>
            </div>
            <div>
              <div className="stat-label">Distribution</div>
              <div style={{ fontSize: '16px', fontWeight: 600, marginTop: '4px' }}>
                {systemStats?.system.distro || 'Unknown'}
              </div>
            </div>
            <div>
              <div className="stat-label">Total Processes</div>
              <div style={{ fontSize: '16px', fontWeight: 600, marginTop: '4px' }}>
                {systemStats?.processes.total || 0}
              </div>
            </div>
            <div>
              <div className="stat-label">Running Processes</div>
              <div style={{ fontSize: '16px', fontWeight: 600, marginTop: '4px' }}>
                {systemStats?.processes.running || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        {alerts.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">⚠️ Recent Alerts</h3>
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {alerts.slice(-5).reverse().map((alert, index) => (
                <div 
                  key={index}
                  style={{ 
                    padding: '8px 12px', 
                    marginBottom: '8px', 
                    border: '1px solid var(--warning)', 
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255, 136, 0, 0.1)'
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--warning)' }}>{alert.title}</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{alert.message}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
