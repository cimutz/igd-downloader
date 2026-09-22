'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Download as DownloadIcon,
  FolderOpen,
  Gauge,
  HardDrive,
  History,
  LayoutDashboard,
  Menu,
  Network,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Settings,
  SlidersHorizontal,
  TerminalSquare,
  Trash2,
  X,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DownloadList } from '@/components/download-list'
import { IGDHeader } from '@/components/igd-header'
import { StatusPanel } from '@/components/status-panel'
import {
  addDownload,
  cancelDownload,
  deleteDownload,
  getDashboard,
  getHistory,
  pauseDownload,
  resumeDownload,
  type Download,
  type Settings as SettingsType,
  type SystemStatus,
} from '@/lib/api'
import { formatBytes, formatSpeed, formatTime } from '@/lib/utils-download'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'history', label: 'History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function MiniSparkline() {
  return (
    <div className="flex h-10 items-end gap-1" aria-label="Transfer activity graph">
      {[30, 42, 36, 60, 48, 72, 58, 90, 78, 86, 68, 92].map((height, index) => (
        <div key={index} className="flex-1 rounded-t-sm bg-cyan-400/60" style={{ height: `${height}%` }} />
      ))}
    </div>
  )
}

function AddDownloadModal({ onClose, onAdd }: { onClose: () => void; onAdd: (download: Download) => void }) {
  const [url, setUrl] = useState('')
  const [destination, setDestination] = useState('/mnt/storage/downloads')
  const [filename, setFilename] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!url.trim()) return
    setIsAdding(true)
    const download = await addDownload(url, destination, filename || undefined)
    onAdd(download)
    setIsAdding(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="add-download-title">
      <div className="igd-panel w-full max-w-lg border-cyan-400/40 bg-[#0c141c] p-5 shadow-2xl shadow-cyan-950/40">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="section-kicker">Queue input</div>
            <h2 id="add-download-title" className="mt-1 text-xl font-semibold text-foreground">Add Download</h2>
            <p className="mt-1 text-sm text-muted-foreground">Paste a Google Drive file URL to queue a transfer.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close dialog"><X /></Button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="field-label" htmlFor="drive-url">Google Drive URL<input id="drive-url" autoFocus required value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://drive.google.com/file/d/..." /></label>
          <label className="field-label" htmlFor="destination">Destination<input id="destination" value={destination} onChange={(event) => setDestination(event.target.value)} /></label>
          <label className="field-label" htmlFor="filename">Optional filename<span className="ml-1 font-normal normal-case tracking-normal text-muted-foreground">(auto-detected if blank)</span><input id="filename" value={filename} onChange={(event) => setFilename(event.target.value)} placeholder="Project_Archive_2024.zip" /></label>
          <div className="mt-2 flex justify-end gap-2 border-t border-border/50 pt-4"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={isAdding} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">{isAdding ? 'Adding...' : 'Start Download'}</Button></div>
        </form>
      </div>
    </div>
  )
}

function HistoryView({ history }: { history: Download[] }) {
  return <section className="igd-panel overflow-hidden"><div className="border-b border-border/50 px-4 py-4"><div className="section-kicker">Transfer archive</div><h2 className="mt-1 text-lg font-semibold">Download History</h2></div><div className="divide-y divide-border/30">{history.map((item) => <div key={item.id} className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1fr)_120px_100px_150px_100px_80px] md:items-center"><div className="min-w-0"><div className="truncate text-sm font-medium">{item.filename}</div><div className="mt-1 text-xs text-muted-foreground">{item.destination}</div></div><div className={item.status === 'completed' ? 'text-xs text-emerald-400' : 'text-xs text-destructive'}>{item.status === 'completed' ? 'Completed' : item.status}</div><div className="font-mono text-xs text-muted-foreground">{formatBytes(item.total)}</div><div className="text-xs text-muted-foreground">{item.completedAt ? new Date(item.completedAt).toLocaleString() : '—'}</div><div className="font-mono text-xs text-muted-foreground">{formatTime(Math.max(0, ((item.completedAt || Date.now()) - item.startedAt) / 1000))}</div><Button variant="ghost" size="icon" aria-label={`Delete ${item.filename}`}><Trash2 /></Button></div>)}</div></section>
}

function SettingsView() {
  const [settings, setSettings] = useState<SettingsType>({ downloadDirectory: '/mnt/storage/downloads', maxConcurrentDownloads: 4, retryCount: 3, retryDelay: 30, globalSpeedLimit: 0, workerStatus: 'running', storageWarningThreshold: 80 })
  return <section className="igd-panel max-w-3xl"><div className="border-b border-border/50 px-4 py-4"><div className="section-kicker">Appliance configuration</div><h2 className="mt-1 text-lg font-semibold">Settings</h2></div><div className="grid gap-5 p-4 md:grid-cols-2"><label className="field-label md:col-span-2">Download directory<input value={settings.downloadDirectory} onChange={(e) => setSettings({ ...settings, downloadDirectory: e.target.value })} /></label><label className="field-label">Maximum concurrent downloads<input type="number" value={settings.maxConcurrentDownloads} onChange={(e) => setSettings({ ...settings, maxConcurrentDownloads: Number(e.target.value) })} /></label><label className="field-label">Retry count<input type="number" value={settings.retryCount} onChange={(e) => setSettings({ ...settings, retryCount: Number(e.target.value) })} /></label><label className="field-label">Retry delay (seconds)<input type="number" value={settings.retryDelay} onChange={(e) => setSettings({ ...settings, retryDelay: Number(e.target.value) })} /></label><label className="field-label">Global speed limit<input placeholder="Unlimited" /></label><label className="field-label">Storage warning threshold<input type="number" value={settings.storageWarningThreshold} onChange={(e) => setSettings({ ...settings, storageWarningThreshold: Number(e.target.value) })} /></label><div className="flex items-center justify-between rounded border border-border/50 bg-background/40 p-3 md:col-span-2"><div><div className="text-sm font-medium">Worker status</div><div className="mt-1 text-xs text-muted-foreground">Control the background transfer service.</div></div><button type="button" onClick={() => setSettings({ ...settings, workerStatus: settings.workerStatus === 'running' ? 'stopped' : 'running' })} className={`status-toggle ${settings.workerStatus === 'running' ? 'is-on' : ''}`}><span />{settings.workerStatus === 'running' ? 'Running' : 'Stopped'}</button></div><div className="md:col-span-2 flex justify-end"><Button className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">Save Settings</Button></div></div></section>
}

export default function Page() {
  const [activeView, setActiveView] = useState('dashboard')
  const [downloads, setDownloads] = useState<Download[]>([])
  const [system, setSystem] = useState<SystemStatus>({ totalSpeed: 0, active: 0, queued: 0, finished: 0, storage: { used: 0, total: 0, percentage: 0 }, network: 'connected' })
  const [history, setHistory] = useState<Download[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [selectedId, setSelectedId] = useState<string>()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => { getDashboard().then(({ downloads: nextDownloads, system: nextSystem }) => { setDownloads(nextDownloads); setSystem(nextSystem) }); getHistory().then(setHistory) }, [])
  const activeDownload = useMemo(() => downloads.find((download) => download.id === selectedId), [downloads, selectedId])
  const mutate = async (action: (id: string) => Promise<void>, id: string) => { await action(id); const { downloads: nextDownloads, system: nextSystem } = await getDashboard(); setDownloads(nextDownloads); setSystem(nextSystem); setHistory(await getHistory()) }

  return <main className="igd-app min-h-screen"><IGDHeader system={system} /><div className="flex"><aside className={`igd-sidebar ${mobileNavOpen ? 'is-open' : ''}`}><div className="sidebar-top"><div className="sidebar-label">Control plane</div>{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${activeView === id ? 'is-active' : ''}`} onClick={() => { setActiveView(id); setMobileNavOpen(false) }}><Icon />{label}<ChevronRight className="nav-chevron" /></button>)}<div className="mt-5 sidebar-label">Operations</div><button className="nav-item" onClick={() => setShowAdd(true)}><Plus />Add Download</button><button className="nav-item"><SlidersHorizontal />Limits</button></div><div className="sidebar-footer"><div className="flex items-center gap-2 text-xs text-emerald-400"><span className="status-dot" />Worker online</div><div className="mt-2 text-[11px] text-muted-foreground">IGD v0.1.0 · OpenWrt x86_64</div></div></aside><div className="min-w-0 flex-1"><div className="mobile-toolbar"><Button variant="outline" size="icon" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Open navigation"><Menu /></Button><span>IGD CONTROL</span></div><div className="mx-auto max-w-[1600px] p-4 md:p-6"><div className="mb-5 flex items-end justify-between gap-4"><div><div className="section-kicker">System monitor / {activeView}</div><h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{activeView === 'dashboard' ? 'Download Queue' : activeView === 'history' ? 'Transfer History' : 'System Settings'}</h2></div>{activeView === 'dashboard' && <Button onClick={() => setShowAdd(true)} className="shrink-0 bg-cyan-400 text-slate-950 hover:bg-cyan-300"><Plus data-icon="inline-start" />Add Download</Button>}</div>{activeView === 'dashboard' && <><StatusPanel system={system} /><div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]"><div><div className="mb-2 flex items-center justify-between px-4"><div className="section-kicker">Live transfers</div><div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="status-dot" />Auto-refresh 5s</div></div><DownloadList downloads={downloads} onPause={(id) => mutate(pauseDownload, id)} onResume={(id) => mutate(resumeDownload, id)} onCancel={(id) => mutate(cancelDownload, id)} onDelete={(id) => mutate(deleteDownload, id)} onSelect={setSelectedId} selectedId={selectedId} /></div><aside className="flex flex-col gap-4"><div className="igd-panel p-4"><div className="flex items-center justify-between"><div className="section-kicker">Throughput</div><Activity className="size-4 text-cyan-400" /></div><div className="mt-3 font-mono text-2xl text-cyan-300">{formatSpeed(system.totalSpeed)}</div><div className="mt-3"><MiniSparkline /></div><div className="mt-2 flex justify-between text-[11px] text-muted-foreground"><span>−5m</span><span>now</span></div></div><div className="igd-panel p-4"><div className="section-kicker">Selected task</div>{activeDownload ? <><div className="mt-3 truncate text-sm font-medium">{activeDownload.filename}</div><div className="mt-3 grid grid-cols-2 gap-3 text-xs"><div><div className="text-muted-foreground">Status</div><div className="mt-1 capitalize text-cyan-300">{activeDownload.status}</div></div><div><div className="text-muted-foreground">Progress</div><div className="mt-1 font-mono">{activeDownload.progress}%</div></div><div><div className="text-muted-foreground">Size</div><div className="mt-1 font-mono">{formatBytes(activeDownload.total)}</div></div><div><div className="text-muted-foreground">ETA</div><div className="mt-1 font-mono">{activeDownload.eta ? formatTime(activeDownload.eta) : '—'}</div></div></div></> : <div className="mt-3 text-sm text-muted-foreground">Select a queue item to inspect its transfer details.</div>}</div><div className="igd-panel p-4"><div className="section-kicker">Node health</div><div className="mt-3 flex items-center justify-between text-sm"><span className="text-muted-foreground">Network</span><span className="text-emerald-400">Connected</span></div><div className="mt-2 flex items-center justify-between text-sm"><span className="text-muted-foreground">Storage</span><span className="text-amber-400">{system.storage.percentage}% used</span></div><div className="mt-2 flex items-center justify-between text-sm"><span className="text-muted-foreground">Workers</span><span className="text-cyan-300">4 / 4 active</span></div></div></aside></div></>}{activeView === 'history' && <HistoryView history={history} />}{activeView === 'settings' && <SettingsView />}</div></div></div>{showAdd && <AddDownloadModal onClose={() => setShowAdd(false)} onAdd={(download) => { setDownloads((current) => [download, ...current]); setSelectedId(download.id) }} />}</main>
}

export { CircleHelp, DownloadIcon, FolderOpen, Gauge, HardDrive, Network, Pause, Play, RotateCcw, TerminalSquare, Zap }

