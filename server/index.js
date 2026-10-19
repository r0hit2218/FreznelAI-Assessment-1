
import http from 'node:http';
import os from 'node:os';
import si from 'systeminformation';

const PORT = 4174;

class SystemMonitor {
  async getSnapshot() {
    const [cpu, load, mem, disks, network, processes] =
      await Promise.all([
        si.cpu(),
        si.currentLoad(),
        si.mem(),
        si.fsSize(),
        si.networkStats(),
        si.processes()
      ]);

    return {
      hostname: os.hostname(),
      platform: `${os.type()} ${os.release()}`,
      uptime: os.uptime(),
      cpu: {
        brand: cpu.brand,
        cores: cpu.cores,
        speed: cpu.speed,
        usage: load.currentLoad
      },
      memory: {
        total: mem.total,
        used: mem.active,
        free: mem.available,
        active: (mem.active / mem.total) * 100
      },
      disks: disks.map(d => ({
        mount: d.mount,
        fs: d.fs,
        size: d.size,
        used: d.used,
        available: d.available,
        usage: d.use
      })),
      network: network.map(n => ({
        iface: n.iface,
        rx_sec: n.rx_sec || 0,
        tx_sec: n.tx_sec || 0,
        rx_bytes: n.rx_bytes || 0,
        tx_bytes: n.tx_bytes || 0
      })),
      processes: processes.list
        .sort((a, b) => (b.cpu || 0) - (a.cpu || 0))
        .slice(0, 18)
        .map(p => ({
          pid: p.pid,
          name: p.name || p.command,
          command: p.command || p.name,
          cpu: p.cpu || 0,
          memory: p.memRss || 0,
          threads: p.threads || 0,
          user: p.user || '—'
        })),
      processCount: processes.all,
      loadAverage: os.loadavg()
    };
  }
}

const monitor = new SystemMonitor();

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.url === '/api/health') {
    res.writeHead(200);
    return res.end(JSON.stringify({ ok: true }));
  }

  if (req.url === '/api/system') {
    try {
      const data = await monitor.getSnapshot();
      res.writeHead(200);
      return res.end(JSON.stringify(data));
    } catch (error) {
      console.error('System monitoring error:', error);
      res.writeHead(500);
      return res.end(JSON.stringify({
        error: 'Failed to read system information'
      }));
    }
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Freznel system API listening at http://127.0.0.1:${PORT}`);
});
