
import blessed from 'blessed';
import os from 'node:os';
import si from 'systeminformation';

const screen = blessed.screen({
  smartCSR: true,
  title: 'FreznelAI System Monitor',
  fullUnicode: true
});

screen.key(['C-c', 'q'], () => {
  screen.destroy();
  process.exit(0);
});

const header = blessed.box({
  top: 0,
  left: 0,
  width: '100%',
  height: 3,
  content: '  FREZNEL AI  |  SYSTEM MONITOR',
  style: {
    fg: 'white',
    bg: 'blue',
    bold: true
  },
  padding: { left: 1, top: 1 }
});

const menu = blessed.list({
  top: 3,
  left: 0,
  width: '23%',
  bottom: 1,
  label: ' NAVIGATION ',
  keys: true,
  vi: true,
  mouse: true,
  border: { type: 'line' },
  items: [
    'Overview',
    'Processes',
    'Storage',
    'Network'
  ],
  style: {
    border: { fg: 'cyan' },
    selected: { fg: 'black', bg: 'cyan', bold: true },
    item: { fg: 'white' },
    focus: { border: { fg: 'cyan' } }
  },
  scrollbar: {
    ch: ' ',
    track: { bg: 'black' },
    style: { bg: 'cyan' }
  }
});

const content = blessed.box({
  top: 3,
  left: '23%',
  width: '77%',
  bottom: 1,
  label: ' SYSTEM INFORMATION ',
  border: { type: 'line' },
  padding: { left: 1, right: 1, top: 1 },
  scrollable: true,
  alwaysScroll: true,
  keys: true,
  vi: true,
  mouse: true,
  tags: false,
  style: {
    fg: 'white',
    border: { fg: 'cyan' }
  }
});

const footer = blessed.box({
  bottom: 0,
  left: 0,
  width: '100%',
  height: 1,
  content: ' ↑/↓ Navigate  |  Enter Select  |  Tab Switch Focus  |  Q Exit ',
  style: { fg: 'black', bg: 'cyan' }
});

screen.append(header);
screen.append(menu);
screen.append(content);
screen.append(footer);

let snapshot = null;
let currentView = 'Overview';
let refreshing = false;

function bytes(value) {
  const n = Number(value) || 0;
  if (n < 1024) return `${n.toFixed(0)} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}

function percent(value) {
  return `${(Number(value) || 0).toFixed(1)}%`;
}

function bar(value, width = 24) {
  const amount = Math.max(0, Math.min(100, Number(value) || 0));
  const filled = Math.round((amount / 100) * width);
  return `[${'#'.repeat(filled)}${'-'.repeat(width - filled)}] ${percent(amount)}`;
}

function renderOverview(data) {
  return [
    'OVERVIEW',
    '',
    `Hostname     : ${data.hostname}`,
    `Operating OS : ${data.platform}`,
    `Uptime       : ${(data.uptime / 3600).toFixed(1)} hours`,
    '',
    'CPU',
    `Model        : ${data.cpu.brand || 'Unknown'}`,
    `Logical cores: ${data.cpu.cores}`,
    `Speed        : ${data.cpu.speed || 0} GHz`,
    `Usage        : ${bar(data.cpu.usage)}`,
    '',
    'MEMORY',
    `Total        : ${bytes(data.memory.total)}`,
    `Used         : ${bytes(data.memory.used)}`,
    `Available    : ${bytes(data.memory.free)}`,
    `Usage        : ${bar(data.memory.active)}`,
    '',
    'SYSTEM LOAD',
    `1 minute     : ${(data.loadAverage[0] || 0).toFixed(2)}`,
    `5 minutes    : ${(data.loadAverage[1] || 0).toFixed(2)}`,
    `15 minutes   : ${(data.loadAverage[2] || 0).toFixed(2)}`,
    '',
    `Processes    : ${data.processCount}`,
    '',
    'Data refreshes automatically every 2 seconds.'
  ].join('\n');
}

function renderProcesses(data) {
  const rows = [...data.processes]
    .sort((a, b) => (b.cpu || 0) - (a.cpu || 0));

  return [
    'RUNNING PROCESSES — sorted by CPU usage',
    '',
    'PID       CPU %     MEMORY       THREADS   PROCESS',
    '-'.repeat(72),
    ...rows.map(p =>
      `${String(p.pid).padEnd(10)}` +
      `${percent(p.cpu).padEnd(10)}` +
      `${bytes(p.memory).padEnd(13)}` +
      `${String(p.threads || 0).padEnd(10)}` +
      `${p.name || p.command || 'Unknown'}`
    ),
    '',
    `Showing ${rows.length} processes. Total reported: ${data.processCount}.`
  ].join('\n');
}

function renderStorage(data) {
  return [
    'STORAGE / FILE SYSTEMS',
    '',
    ...data.disks.flatMap(d => [
      `Mount        : ${d.mount}`,
      `File system  : ${d.fs || 'Unknown'}`,
      `Total        : ${bytes(d.size)}`,
      `Used         : ${bytes(d.used)}`,
      `Available    : ${bytes(d.available)}`,
      `Usage        : ${bar(d.usage)}`,
      '',
    ]),
    data.disks.length ? '' : 'No storage information is available.'
  ].join('\n');
}

function renderNetwork(data) {
  return [
    'NETWORK INTERFACES',
    '',
    ...data.network.flatMap(n => [
      `Interface    : ${n.iface}`,
      `Download rate: ${bytes(n.rx_sec)}/s`,
      `Upload rate  : ${bytes(n.tx_sec)}/s`,
      `Received     : ${bytes(n.rx_bytes)}`,
      `Transmitted  : ${bytes(n.tx_bytes)}`,
      '',
    ]),
    data.network.length ? '' : 'No network information is available.',
    '',
    'Rates depend on the interface and platform support.'
  ].join('\n');
}

function render() {
  if (!snapshot) {
    content.setContent('Reading system information...');
    screen.render();
    return;
  }

  const views = {
    Overview: renderOverview,
    Processes: renderProcesses,
    Storage: renderStorage,
    Network: renderNetwork
  };

  content.setContent(views[currentView](snapshot));
  screen.render();
}

menu.on('select', (item, index) => {
  currentView = ['Overview', 'Processes', 'Storage', 'Network'][index];
  render();
});

screen.key(['tab'], () => screen.focusNext());
screen.key(['S-tab'], () => screen.focusPrevious());

async function refresh() {
  if (refreshing) return;
  refreshing = true;

  try {
    const [cpu, load, mem, disks, network, processes] =
      await Promise.all([
        si.cpu(),
        si.currentLoad(),
        si.mem(),
        si.fsSize(),
        si.networkStats(),
        si.processes()
      ]);

    snapshot = {
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
      processes: processes.list.map(p => ({
        pid: p.pid,
        name: p.name || p.command,
        command: p.command || p.name,
        cpu: p.cpu || 0,
        memory: p.memRss || 0,
        threads: p.threads || 0
      })),
      processCount: processes.all,
      loadAverage: os.loadavg()
    };

    render();
  } catch (error) {
    content.setContent(`Unable to read system information.\n\n${error.message}`);
    screen.render();
  } finally {
    refreshing = false;
  }
}

menu.focus();
render();
refresh();

const refreshTimer = setInterval(refresh, 2000);

screen.on('destroy', () => clearInterval(refreshTimer));
