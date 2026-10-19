import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity, Cpu, HardDrive, MemoryStick, Network, Search, Settings2, ShieldCheck,
  Terminal, Zap, RefreshCw, UserRound, ChevronDown, CircleHelp, Gauge, Monitor,
  Keyboard, LogOut, Mail, LockKeyhole, Eye, EyeOff, X, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, firebaseConfigured } from './firebase.js';

const fmtBytes = (n = 0) => {
  if (!Number.isFinite(Number(n)) || Number(n) < 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB', 'TB']; let i = 0; let v = Number(n);
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(i > 1 ? 1 : 0)} ${units[i]}`;
};
const fmtRate = n => `${fmtBytes(n)}/s`;
const fmtDuration = seconds => {
  const s = Math.max(0, Math.floor(seconds || 0)), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
  return d ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`;
};
const pct = n => `${Math.max(0, Math.min(100, Number(n) || 0)).toFixed(0)}%`;

function Ring({ value = 0, label, color = 'cyan', size = 100 }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return <div className={`ring ring-${color}`} style={{ '--value': `${v * 3.6}deg`, width: size, height: size }}>
    <div className="ring-inner"><strong>{Math.round(v)}<small>%</small></strong><span>{label}</span></div>
  </div>;
}
function Sparkline({ data = [], color = 'cyan' }) {
  const points = data.length ? data : [0, 0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(100, ...points), coords = points.map((v, i) => `${(i / Math.max(1, points.length - 1)) * 100},${34 - (v / max) * 30}`).join(' ');
  return <svg className={`spark spark-${color}`} viewBox="0 0 100 36" preserveAspectRatio="none" aria-hidden="true"><polyline points={coords} /></svg>;
}
function MetricCard({ icon: Icon, title, value, sub, color, children }) {
  return <section className={`panel metric metric-${color}`}><div className="metric-top"><span className="icon-box"><Icon size={16} /></span><span className="eyebrow">{title}</span><span className="live-dot" /></div><div className="metric-value">{value}</div><div className="metric-sub">{sub}</div>{children}</section>;
}
function AuthScreen({ onDone }) {
  const [mode, setMode] = useState('signup'), [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const [name, setName] = useState(''), [show, setShow] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const submit = async e => {
    e.preventDefault(); setError('');
    if (!firebaseConfigured) { setError('Firebase is not configured. Add your Firebase web app values to .env.local and enable Email/Password sign-in.'); return; }
    setBusy(true);
    try {
      const result = mode === 'signup' ? await createUserWithEmailAndPassword(auth, email, password) : await signInWithEmailAndPassword(auth, email, password);
      onDone(result.user);
    } catch (err) { setError(err.message || 'Authentication failed.'); } finally { setBusy(false); }
  };
  return <main className="auth-shell"><div className="auth-art"><div className="brand"><span className="brand-mark"><Activity size={21}/></span> FREZNEL<span className="brand-ai">AI</span></div><div className="auth-copy"><span className="overline">SYSTEM OBSERVATORY / 01</span><h1>Know your machine.<br/><em>Own your workflow.</em></h1><p>A real-time view into the processes, resources, and signals powering your system.</p><div className="auth-orbit"><div className="orbit orbit-a"/><div className="orbit orbit-b"/><div className="orbit-core"><Cpu size={28}/></div><span className="orbit-tag tag-a">CPU / LIVE</span><span className="orbit-tag tag-b">MEM / 16 GB</span></div></div><div className="auth-foot">LOCAL SYSTEM TELEMETRY <span>•</span> BUILT FOR FOCUS</div></div>
    <section className="auth-form-wrap"><div className="auth-form"><div className="form-icon"><ShieldCheck size={22}/></div><span className="overline">{mode === 'signup' ? 'CREATE YOUR ACCESS' : 'WELCOME BACK'}</span><h2>{mode === 'signup' ? 'Create account' : 'Sign in'}</h2><p className="muted">{mode === 'signup' ? 'One account. A clearer view of your system.' : 'Sign in to continue to your dashboard.'}</p>
      <form onSubmit={submit}>{mode === 'signup' && <label>Display name<div className="input-wrap"><UserRound size={16}/><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" autoComplete="name"/></div></label>}
        <label>Email address<div className="input-wrap"><Mail size={16}/><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"/></div></label>
        <label>Password<div className="input-wrap"><LockKeyhole size={16}/><input type={show?'text':'password'} required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete={mode==='signup'?'new-password':'current-password'}/><button className="icon-button" type="button" aria-label="Toggle password visibility" onClick={()=>setShow(!show)}>{show?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></label>
        {error && <div className="form-error"><AlertTriangle size={15}/>{error}</div>}
        {!firebaseConfigured && <div className="setup-note"><AlertTriangle size={15}/> Demo preview is available without sign-in. Configure Firebase to use real authentication.</div>}
        <button className="primary-button full" disabled={busy}>{busy?'Please wait…':mode==='signup'?'Create account':'Sign in'} <span>↗</span></button>
      </form><div className="auth-switch">{mode==='signup'?'Already registered?':'New to Freznel?'} <button onClick={()=>{setMode(mode==='signup'?'signin':'signup');setError('')}}>{mode==='signup'?'Sign in':'Create account'}</button></div>
      <button className="demo-link" onClick={()=>onDone({displayName:'Local operator',email:'local@localhost',isDemo:true})}>Continue in local demo mode <span>→</span></button>
      <div className="auth-security"><ShieldCheck size={14}/> Credentials handled by Firebase Authentication when configured.</div>
    </div></section></main>;
}
function App() {
  const [system, setSystem] = useState(null), [history, setHistory] = useState({cpu:[],mem:[],net:[]}), [error, setError] = useState('');
  const [selected, setSelected] = useState('Overview'), [query, setQuery] = useState(''), [sort, setSort] = useState('cpu'), [paused, setPaused] = useState(false);
  const [user, setUser] = useState(null), [authReady, setAuthReady] = useState(!firebaseConfigured), [time, setTime] = useState(new Date());
  const [processSearch, setProcessSearch] = useState(''), [showHelp, setShowHelp] = useState(false), [notice, setNotice] = useState('');
  const nav = [{label:'Overview',icon:Gauge},{label:'Processes',icon:Terminal},{label:'Performance',icon:Activity},{label:'Storage',icon:HardDrive},{label:'Network',icon:Network}];
  const refresh = useCallback(async () => {
    try { const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const r = await fetch(`${API_BASE_URL}/api/system`); if (!r.ok) throw new Error(`System API returned ${r.status}`); const d = await r.json(); setSystem(d); setError('');
      setHistory(h => ({cpu:[...h.cpu.slice(-39), d.cpu.usage],mem:[...h.mem.slice(-39), d.memory.active],net:[...h.net.slice(-39), d.network.reduce((s,n)=>s+n.rx_sec+n.tx_sec,0)]}));
    } catch (e) { setError('System API unavailable. Start the Node.js server with npm run server.'); }
  }, []);
  useEffect(() => { if (firebaseConfigured) { const unsub=onAuthStateChanged(auth,u=>{setUser(u);setAuthReady(true)}); return unsub; } }, []);
  useEffect(() => { refresh(); const id=setInterval(()=>{setTime(new Date());if(!paused)refresh()},2000); return ()=>clearInterval(id); }, [refresh,paused]);
  const processes = useMemo(() => (system?.processes || []).filter(p => `${p.name} ${p.command} ${p.pid}`.toLowerCase().includes(processSearch.toLowerCase())).sort((a,b)=>(b[sort]||0)-(a[sort]||0)), [system,processSearch,sort]);
  useEffect(() => {
    const handler=e=>{
      if (['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) { if(e.key==='Escape')document.activeElement.blur(); return; }
      if (e.key==='ArrowDown'||e.key==='ArrowUp') { e.preventDefault();setSelected(cur=>{const i=nav.findIndex(n=>n.label===cur);return nav[(i+(e.key==='ArrowDown'?1:-1)+nav.length)%nav.length].label}); }
      if (e.key==='r'||e.key==='R') refresh();
      if (e.key===' ') {e.preventDefault();setPaused(v=>!v);}
      if (e.key==='?')setShowHelp(v=>!v);
      if (e.key==='Escape')setShowHelp(false);
      if (e.key==='1'||e.key==='2'||e.key==='3'||e.key==='4'||e.key==='5')setSelected(nav[Number(e.key)-1].label);
    };
    window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);
  },[refresh]);
  const choose = label => {setSelected(label);setNotice('');};
  if (!authReady) return <div className="loading-screen">CONNECTING TO FIREBASE AUTH<span className="loader"/></div>;
  if (!user) return <AuthScreen onDone={setUser} />;
  const memory = system?.memory, cpu=system?.cpu, totalNet=(system?.network||[]).reduce((s,n)=>s+n.rx_sec+n.tx_sec,0);
  return <div className="app-shell"><aside className="sidebar"><div className="brand"><span className="brand-mark"><Activity size={21}/></span><span>FREZNEL<span className="brand-ai">AI</span></span><span className="brand-version">v1.0</span></div>
    <div className="workspace-label">WORKSPACE <button title="Workspace settings" onClick={()=>setShowHelp(true)}><Settings2 size={14}/></button></div><div className="workspace-card"><span className="workspace-avatar"><Monitor size={16}/></span><div><strong>{system?.hostname||'Local machine'}</strong><small>{system?.platform||'Connecting to Node…'}</small></div><ChevronDown size={14}/></div>
    <div className="nav-label">OBSERVABILITY</div><nav className="main-nav">{nav.map((n,i)=><button key={n.label} className={`nav-item ${selected===n.label?'active':''}`} onClick={()=>choose(n.label)}><n.icon size={17}/><span>{n.label}</span><kbd>{i+1}</kbd></button>)}</nav>
    <div className="sidebar-bottom"><div className="connection"><span className="live-dot"/><div><strong>{system?'SYSTEM ONLINE':'CONNECTING'}</strong><small>Node.js telemetry bridge</small></div></div><button className="nav-item" onClick={()=>setShowHelp(true)}><CircleHelp size={17}/>Keyboard shortcuts <kbd>?</kbd></button><div className="user-card"><div className="user-avatar"><UserRound size={17}/></div><div className="user-meta"><strong>{user?.displayName||'Local operator'}</strong><small>{user?.email||'Demo session'}</small></div>{firebaseConfigured&&<button className="icon-button" title="Sign out" onClick={()=>signOut(auth)}><LogOut size={15}/></button>}</div></div>
  </aside>
  <main className="main-area"><header className="topbar"><div className="breadcrumbs"><span>Workspace</span><span className="slash">/</span><strong>{selected}</strong></div><div className="top-actions"><span className="clock">{time.toLocaleTimeString('en-GB')}</span><span className={`status-pill ${paused?'paused':''}`}><i/>{paused?'PAUSED':'LIVE TELEMETRY'}</span><button className="square-button" title="Refresh now (R)" onClick={refresh}><RefreshCw size={16}/></button><button className="square-button" title="Keyboard shortcuts" onClick={()=>setShowHelp(true)}><Keyboard size={16}/></button></div></header>
    <div className="content"><div className="page-heading"><div><div className="overline">SYSTEM / REAL-TIME TELEMETRY</div><h1>{selected==='Overview'?'System overview':selected}</h1><p>{selected==='Overview'?'A live pulse check of your machine. Every signal, in one place.':`Inspect ${selected.toLowerCase()} telemetry and system activity.`}</p></div><div className="heading-actions"><span className="updated"><span className="live-dot"/>{system?`Updated ${time.toLocaleTimeString('en-GB')}`:'Waiting for data'}</span><button className="outline-button" onClick={()=>setPaused(!paused)}>{paused?'Resume updates':'Pause updates'}</button></div></div>
    {error&&<div className="alert"><AlertTriangle size={16}/>{error}<button onClick={refresh}>Retry</button></div>}
    {notice&&<div className="alert"><CheckCircle2 size={16}/>{notice}<button onClick={()=>setNotice('')}><X size={14}/></button></div>}
    <div className="metrics-grid"><MetricCard icon={Cpu} title="CPU UTILIZATION" value={pct(cpu?.usage)} sub={`${cpu?.cores||'—'} logical cores · ${cpu?.speed?cpu.speed.toFixed(1)+' GHz':'clock unavailable'}`} color="cyan"><Sparkline data={history.cpu}/></MetricCard><MetricCard icon={MemoryStick} title="MEMORY USAGE" value={pct(memory?.active)} sub={`${fmtBytes(memory?.used)} of ${fmtBytes(memory?.total)}`} color="violet"><Sparkline data={history.mem} color="violet"/></MetricCard><MetricCard icon={Network} title="NETWORK I/O" value={fmtRate(totalNet)} sub={`${(system?.network||[]).length} interface(s) detected`} color="green"><Sparkline data={history.net} color="green"/></MetricCard><MetricCard icon={HardDrive} title="SYSTEM UPTIME" value={fmtDuration(system?.uptime)} sub={`${system?.processCount??'—'} processes running`} color="amber"><div className="metric-footer"><span className="footer-dot"/>PROCESS TELEMETRY ACTIVE</div></MetricCard></div>
    {selected==='Overview'&&<div className="overview-grid"><section className="panel resource-panel"><div className="panel-heading"><div><span className="overline">RESOURCE ALLOCATION</span><h3>Live resource map</h3></div><span className="panel-tag"><span className="live-dot"/> AUTO REFRESH</span></div><div className="resource-row"><Ring value={cpu?.usage} label="CPU" color="cyan"/><div className="resource-info"><div className="resource-title">Processor <span>{pct(cpu?.usage)}</span></div><p>{cpu?.brand||'Detecting processor…'}</p><div className="progress-track"><i className="fill-cyan" style={{width:pct(cpu?.usage)}}/></div><div className="resource-meta"><span>{cpu?.cores||'—'} cores available</span><span>{cpu?.temperature?`${cpu.temperature}°C`:'Temp unavailable'}</span></div></div></div><div className="resource-row"><Ring value={memory?.active} label="RAM" color="violet"/><div className="resource-info"><div className="resource-title">Memory <span>{pct(memory?.active)}</span></div><p>{fmtBytes(memory?.used)} in use of {fmtBytes(memory?.total)}</p><div className="progress-track"><i className="fill-violet" style={{width:pct(memory?.active)}}/></div><div className="resource-meta"><span>{fmtBytes(memory?.free)} available</span><span>{fmtBytes(memory?.swapTotal)} swap</span></div></div></div><div className="resource-row"><Ring value={system?.disks?.[0]?.usage} label="DISK" color="amber"/><div className="resource-info"><div className="resource-title">Primary volume <span>{pct(system?.disks?.[0]?.usage)}</span></div><p>{system?.disks?.[0]?.mount||'No volume detected'}</p><div className="progress-track"><i className="fill-amber" style={{width:pct(system?.disks?.[0]?.usage)}}/></div><div className="resource-meta"><span>{fmtBytes(system?.disks?.[0]?.used)} used</span><span>{fmtBytes(system?.disks?.[0]?.available)} free</span></div></div></div></section>
      <section className="panel process-panel"><div className="panel-heading"><div><span className="overline">PROCESS CONTROL</span><h3>Top processes</h3></div><button className="text-button" onClick={()=>choose('Processes')}>View all ↗</button></div><div className="mini-table"><div className="mini-row mini-head"><span>PROCESS</span><span>CPU</span><span>MEMORY</span></div>{(system?.processes||[]).slice(0,7).map(p=><div className="mini-row" key={`${p.pid}-${p.name}`}><span className="process-name"><span className="process-icon"><Terminal size={13}/></span><span><strong>{p.name}</strong><small>PID {p.pid}</small></span></span><span className="mono">{p.cpu.toFixed(1)}%</span><span className="mono">{fmtBytes(p.memory)}</span></div>)}{!system&&<div className="empty-row">Waiting for process data…</div>}</div></section></div>}
    {selected==='Processes'&&<section className="panel full-panel"><div className="panel-heading"><div><span className="overline">PROCESS EXPLORER</span><h3>{system?.processCount??0} detected processes</h3></div><div className="table-tools"><div className="search-box"><Search size={15}/><input value={processSearch} onChange={e=>setProcessSearch(e.target.value)} placeholder="Filter processes…"/></div><select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort processes"><option value="cpu">Sort: CPU</option><option value="memory">Sort: Memory</option><option value="pid">Sort: PID</option></select></div></div><div className="table-scroll"><table><thead><tr><th>PID</th><th>PROCESS / COMMAND</th><th>CPU %</th><th>MEMORY</th><th>THREADS</th><th>USER</th></tr></thead><tbody>{processes.map(p=><tr key={`${p.pid}-${p.name}`}><td className="mono">{p.pid}</td><td><strong>{p.name}</strong><small className="command">{p.command}</small></td><td><span className="cpu-chip">{p.cpu.toFixed(1)}%</span></td><td className="mono">{fmtBytes(p.memory)}</td><td className="mono">{p.threads||'—'}</td><td>{p.user}</td></tr>)}</tbody></table>{processes.length===0&&<div className="empty-row">No matching processes.</div>}</div><p className="table-note">Read-only process inspection. Termination is intentionally disabled.</p></section>}
    {selected==='Performance'&&<div className="performance-grid"><section className="panel performance-card"><div className="panel-heading"><div><span className="overline">PROCESSOR</span><h3>CPU performance</h3></div><Cpu size={19}/></div><Ring value={cpu?.usage} label="CPU" size={132}/><h2>{pct(cpu?.usage)}</h2><p>{cpu?.brand}</p><div className="large-spark"><Sparkline data={history.cpu}/></div><div className="resource-meta"><span>{cpu?.cores} logical cores</span><span>{cpu?.speed} GHz</span></div></section><section className="panel performance-card"><div className="panel-heading"><div><span className="overline">MEMORY</span><h3>Memory pressure</h3></div><MemoryStick size={19}/></div><Ring value={memory?.active} label="RAM" color="violet" size={132}/><h2>{fmtBytes(memory?.used)}</h2><p>of {fmtBytes(memory?.total)} total memory</p><div className="large-spark"><Sparkline data={history.mem} color="violet"/></div><div className="resource-meta"><span>{fmtBytes(memory?.free)} free</span><span>{fmtBytes(memory?.swapUsed)} swap used</span></div></section><section className="panel performance-card"><div className="panel-heading"><div><span className="overline">SYSTEM LOAD</span><h3>Load average</h3></div><Zap size={19}/></div><div className="load-list">{(system?.loadAverage||[0,0,0]).map((n,i)=><div key={i}><span>{['1 MIN','5 MIN','15 MIN'][i]}</span><strong>{n.toFixed(2)}</strong><div className="progress-track"><i className="fill-cyan" style={{width:`${Math.min(100,n*10)}%`}}/></div></div>)}</div><p className="muted">Load average is platform-dependent; Windows may report zeros.</p></section></div>}
    {selected==='Storage'&&<section className="panel full-panel"><div className="panel-heading"><div><span className="overline">VOLUME INSPECTOR</span><h3>Mounted filesystems</h3></div><HardDrive size={18}/></div><div className="disk-grid">{(system?.disks||[]).map((d,i)=><div className="disk-card" key={`${d.fs}-${d.mount}-${i}`}><div className="disk-icon"><HardDrive size={20}/></div><div className="disk-name"><strong>{d.mount}</strong><small>{d.fs} · {d.type||'filesystem'}</small></div><span className="disk-pct">{pct(d.usage)}</span><div className="progress-track"><i className="fill-cyan" style={{width:pct(d.usage)}}/></div><div className="disk-details"><span>Used <b>{fmtBytes(d.used)}</b></span><span>Free <b>{fmtBytes(d.available)}</b></span><span>Total <b>{fmtBytes(d.size)}</b></span></div></div>)}{!system?.disks?.length&&<div className="empty-row">No filesystem data available.</div>}</div></section>}
    {selected==='Network'&&<section className="panel full-panel"><div className="panel-heading"><div><span className="overline">INTERFACE MONITOR</span><h3>Network throughput</h3></div><Network size={18}/></div><div className="network-summary"><div><span>AGGREGATE RECEIVE</span><strong>{fmtRate((system?.network||[]).reduce((s,n)=>s+n.rx_sec,0))}</strong></div><div><span>AGGREGATE TRANSMIT</span><strong>{fmtRate((system?.network||[]).reduce((s,n)=>s+n.tx_sec,0))}</strong></div></div><div className="table-scroll"><table><thead><tr><th>INTERFACE</th><th>RECEIVE / SEC</th><th>TRANSMIT / SEC</th><th>TOTAL RECEIVED</th><th>TOTAL SENT</th></tr></thead><tbody>{(system?.network||[]).map((n,i)=><tr key={`${n.iface}-${i}`}><td><span className="network-name"><Network size={15}/>{n.iface}</span></td><td className="mono">{fmtRate(n.rx_sec)}</td><td className="mono">{fmtRate(n.tx_sec)}</td><td className="mono">{fmtBytes(n.rx_bytes)}</td><td className="mono">{fmtBytes(n.tx_bytes)}</td></tr>)}</tbody></table>{!system?.network?.length&&<div className="empty-row">No network interfaces detected.</div>}</div></section>}
    <footer className="footer"><span>FREZNEL AI <span className="footer-sep">/</span> SYSTEM OBSERVATORY</span><span>{system?.platform||'Awaiting system data'} <span className="footer-sep">·</span> {system?.arch||'—'}</span><span className="footer-keys"><kbd>↑↓</kbd> Navigate <kbd>R</kbd> Refresh <kbd>Space</kbd> Pause</span></footer>
    </div></main>
    {showHelp&&<div className="modal-backdrop" onClick={()=>setShowHelp(false)}><section className="shortcut-modal" onClick={e=>e.stopPropagation()}><div className="panel-heading"><div><span className="overline">QUICK REFERENCE</span><h3>Keyboard shortcuts</h3></div><button className="square-button" onClick={()=>setShowHelp(false)}><X size={16}/></button></div>{[['1–5','Jump to a section'],['↑ / ↓','Move between sections'],['R','Refresh system telemetry'],['Space','Pause / resume updates'],['?','Open this shortcut panel'],['Esc','Close panel / exit input']].map(([k,d])=><div className="shortcut-row" key={k}><span>{d}</span><kbd>{k}</kbd></div>)}<p className="muted">Shortcuts are disabled while typing in an input field.</p></section></div>}
  </div>;
}
export default App;