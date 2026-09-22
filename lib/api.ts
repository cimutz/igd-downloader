/**
 * IGD Backend Adapter
 * 
 * Clean separation between UI and backend data sources.
 * Currently using mock data. Can be replaced with real API calls later.
 * 
 * Future integration points:
 * - /www/cgi-bin/idm-add
 * - /www/cgi-bin/idm-cancel
 * - /www/cgi-bin/idm-dashboard
 * - /www/cgi-bin/idm-delete
 * - /www/cgi-bin/idm-progress-json
 * - /www/cgi-bin/idm-restart
 * - /www/cgi-bin/idm-toggle
 */

export type DownloadStatus = 
  | 'downloading'
  | 'paused'
  | 'queued'
  | 'completed'
  | 'failed'
  | 'retrying'
  | 'cancelled'

export interface Download {
  id: string
  filename: string
  status: DownloadStatus
  progress: number // 0-100
  downloaded: number // bytes
  total: number // bytes
  speed: number // bytes per second
  eta: number // seconds
  googleDriveUrl: string
  destination: string
  startedAt: number // timestamp
  completedAt?: number // timestamp
  error?: string
}

export interface SystemStatus {
  totalSpeed: number // bytes per second
  active: number
  queued: number
  finished: number
  storage: {
    used: number // bytes
    total: number // bytes
    percentage: number // 0-100
  }
  network: 'connected' | 'disconnected'
}

export interface Settings {
  downloadDirectory: string
  maxConcurrentDownloads: number
  retryCount: number
  retryDelay: number // seconds
  globalSpeedLimit: number // bytes per second, 0 = unlimited
  workerStatus: 'running' | 'stopped'
  storageWarningThreshold: number // percentage
}

// Mock data
const mockDownloads: Download[] = [
  {
    id: '1',
    filename: 'Project_Archive_2024.zip',
    status: 'downloading',
    progress: 65,
    downloaded: 650 * 1024 * 1024, // 650 MB
    total: 1000 * 1024 * 1024, // 1 GB
    speed: 14.6 * 1024 * 1024, // 14.6 MB/s
    eta: 24, // seconds
    googleDriveUrl: 'https://drive.google.com/file/d/...',
    destination: '/downloads',
    startedAt: Date.now() - 120000,
  },
  {
    id: '2',
    filename: 'Backup_Database_Q4.sql',
    status: 'downloading',
    progress: 42,
    downloaded: 420 * 1024 * 1024,
    total: 1000 * 1024 * 1024,
    speed: 8.2 * 1024 * 1024,
    eta: 70,
    googleDriveUrl: 'https://drive.google.com/file/d/...',
    destination: '/downloads',
    startedAt: Date.now() - 90000,
  },
  {
    id: '3',
    filename: 'Presentation_Final.pptx',
    status: 'downloading',
    progress: 28,
    downloaded: 140 * 1024 * 1024,
    total: 500 * 1024 * 1024,
    speed: 3.5 * 1024 * 1024,
    eta: 102,
    googleDriveUrl: 'https://drive.google.com/file/d/...',
    destination: '/downloads',
    startedAt: Date.now() - 60000,
  },
  {
    id: '4',
    filename: 'Video_Recording.mp4',
    status: 'paused',
    progress: 15,
    downloaded: 150 * 1024 * 1024,
    total: 1024 * 1024 * 1024,
    speed: 0,
    eta: 0,
    googleDriveUrl: 'https://drive.google.com/file/d/...',
    destination: '/downloads',
    startedAt: Date.now() - 45000,
  },
  {
    id: '5',
    filename: 'Document_Scan.pdf',
    status: 'queued',
    progress: 0,
    downloaded: 0,
    total: 50 * 1024 * 1024,
    speed: 0,
    eta: 0,
    googleDriveUrl: 'https://drive.google.com/file/d/...',
    destination: '/downloads',
    startedAt: Date.now(),
  },
  {
    id: '6',
    filename: 'Report_Analytics.xlsx',
    status: 'queued',
    progress: 0,
    downloaded: 0,
    total: 25 * 1024 * 1024,
    speed: 0,
    eta: 0,
    googleDriveUrl: 'https://drive.google.com/file/d/...',
    destination: '/downloads',
    startedAt: Date.now(),
  },
  {
    id: '7',
    filename: 'Config_Backup.tar.gz',
    status: 'completed',
    progress: 100,
    downloaded: 200 * 1024 * 1024,
    total: 200 * 1024 * 1024,
    speed: 0,
    eta: 0,
    googleDriveUrl: 'https://drive.google.com/file/d/...',
    destination: '/downloads',
    startedAt: Date.now() - 3600000,
    completedAt: Date.now() - 3540000,
  },
  {
    id: '8',
    filename: 'Image_Collection.zip',
    status: 'completed',
    progress: 100,
    downloaded: 512 * 1024 * 1024,
    total: 512 * 1024 * 1024,
    speed: 0,
    eta: 0,
    googleDriveUrl: 'https://drive.google.com/file/d/...',
    destination: '/downloads',
    startedAt: Date.now() - 7200000,
    completedAt: Date.now() - 7140000,
  },
]

const mockSystemStatus: SystemStatus = {
  totalSpeed: 26.3 * 1024 * 1024, // 26.3 MB/s
  active: 4,
  queued: 7,
  finished: 12,
  storage: {
    used: 780 * 1024 * 1024 * 1024, // 780 GB
    total: 1000 * 1024 * 1024 * 1024, // 1 TB
    percentage: 78,
  },
  network: 'connected',
}

const mockSettings: Settings = {
  downloadDirectory: '/mnt/storage/downloads',
  maxConcurrentDownloads: 4,
  retryCount: 3,
  retryDelay: 30,
  globalSpeedLimit: 0,
  workerStatus: 'running',
  storageWarningThreshold: 80,
}

// API functions
export async function getDashboard(): Promise<{
  downloads: Download[]
  system: SystemStatus
}> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100))
  return {
    downloads: mockDownloads,
    system: mockSystemStatus,
  }
}

export async function getDownloads(): Promise<Download[]> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return mockDownloads
}

export async function getSystemStatus(): Promise<SystemStatus> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return mockSystemStatus
}

export async function getSettings(): Promise<Settings> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return mockSettings
}

export async function updateSettings(updates: Partial<Settings>): Promise<Settings> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return { ...mockSettings, ...updates }
}

export async function addDownload(url: string, destination?: string, filename?: string): Promise<Download> {
  await new Promise(resolve => setTimeout(resolve, 200))
  const newDownload: Download = {
    id: String(Date.now()),
    filename: filename || 'download',
    status: 'queued',
    progress: 0,
    downloaded: 0,
    total: 0,
    speed: 0,
    eta: 0,
    googleDriveUrl: url,
    destination: destination || '/downloads',
    startedAt: Date.now(),
  }
  mockDownloads.unshift(newDownload)
  return newDownload
}

export async function pauseDownload(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100))
  const download = mockDownloads.find(d => d.id === id)
  if (download && download.status === 'downloading') {
    download.status = 'paused'
  }
}

export async function resumeDownload(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100))
  const download = mockDownloads.find(d => d.id === id)
  if (download && download.status === 'paused') {
    download.status = 'downloading'
  }
}

export async function cancelDownload(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100))
  const download = mockDownloads.find(d => d.id === id)
  if (download) {
    download.status = 'cancelled'
  }
}

export async function deleteDownload(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100))
  const index = mockDownloads.findIndex(d => d.id === id)
  if (index > -1) {
    mockDownloads.splice(index, 1)
  }
}

export async function getHistory(): Promise<Download[]> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return mockDownloads.filter(d => d.status === 'completed' || d.status === 'failed' || d.status === 'cancelled')
}
