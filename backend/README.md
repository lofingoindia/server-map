# Server Mapper Backend

Real-time VPS server monitoring and PM2 process management system.

## Features

- Real-time system monitoring (CPU, RAM, Disk usage)
- PM2 process management (restart, stop, delete)
- Live log streaming
- WebSocket-based real-time updates
- Alert system for high resource usage
- Clean REST API endpoints

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

## API Endpoints

- `GET /api/system-stats` - Get current system statistics
- `GET /api/pm2-processes` - Get PM2 process list
- `POST /api/pm2-restart/:name` - Restart PM2 process
- `POST /api/pm2-stop/:name` - Stop PM2 process
- `POST /api/pm2-delete/:name` - Delete PM2 process
- `GET /api/pm2-logs/:name?` - Get PM2 logs
- `GET /health` - Health check

## WebSocket Events

### Client to Server
- `pm2-restart` - Restart PM2 process
- `pm2-stop` - Stop PM2 process
- `pm2-delete` - Delete PM2 process
- `get-logs` - Request logs for specific process

### Server to Client
- `system-stats` - Real-time system statistics
- `pm2-processes` - PM2 process updates
- `system-alerts` - System alerts and warnings
- `logs-data` - Log data stream
- `pm2-operation-result` - PM2 operation results

## Configuration

Server runs on port 5002 and accepts connections from any origin.