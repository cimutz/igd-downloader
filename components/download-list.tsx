'use client'

import { useState } from 'react'
import {
  Download,
  Pause,
  Play,
  X,
  ChevronDown,
  FileIcon,
  Trash2,
  MoreVertical,
} from 'lucide-react'
import { Download as DownloadType, DownloadStatus } from '@/lib/api'
import { formatBytes, formatSpeed, formatTime } from '@/lib/utils-download'
import { Button } from '@/components/ui/button'

interface DownloadListProps {
  downloads: DownloadType[]
  onPause: (id: string) => void
  onResume: (id: string) => void
  onCancel: (id: string) => void
  onDelete: (id: string) => void
  onSelect: (id: string) => void
  selectedId?: string
}

const statusConfig: Record<
  DownloadStatus,
  { color: string; label: string; icon?: React.ReactNode }
> = {
  downloading: {
    color: 'text-cyan-400',
    label: 'Downloading',
  },
  paused: {
    color: 'text-amber-400',
    label: 'Paused',
  },
  queued: {
    color: 'text-blue-400',
    label: 'Queued',
  },
  completed: {
    color: 'text-emerald-400',
    label: 'Completed',
  },
  failed: {
    color: 'text-destructive',
    label: 'Failed',
  },
  retrying: {
    color: 'text-orange-400',
    label: 'Retrying',
  },
  cancelled: {
    color: 'text-muted-foreground',
    label: 'Cancelled',
  },
}

function getStatusBadgeClass(status: DownloadStatus): string {
  const config = statusConfig[status]
  return `text-xs font-semibold px-2 py-1 rounded border ${config.color} border-current/30 bg-current/5`
}

function SpeedGraph() {
  return (
    <div className="flex h-6 items-end gap-0.5">
      {[60, 55, 65, 48, 72, 58, 64].map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-cyan-500/40"
          style={{
            height: `${(v / 72) * 100}%`,
            transition: 'height 150ms ease-out',
          }}
        />
      ))}
    </div>
  )
}

export function DownloadList({
  downloads,
  onPause,
  onResume,
  onCancel,
  onDelete,
  onSelect,
  selectedId,
}: DownloadListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const activeDownloads = downloads.filter(
    d => d.status === 'downloading' || d.status === 'paused' || d.status === 'retrying'
  )
  const queuedDownloads = downloads.filter(d => d.status === 'queued')
  const completedDownloads = downloads.filter(d => d.status === 'completed')

  const renderDownloadRow = (d: DownloadType) => {
    const isExpanded = expandedId === d.id
    const sizeStr = `${formatBytes(d.downloaded)} / ${formatBytes(d.total)}`

    return (
      <div key={d.id} className="border-b border-border/30">
        <div
          className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-card/50 transition-colors"
          onClick={() => {
            setExpandedId(isExpanded ? null : d.id)
            onSelect(d.id)
          }}
        >
          {/* Icon and Filename */}
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="mt-1 flex-shrink-0">
              <FileIcon className="size-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-foreground">
                {d.filename}
              </div>
              <div className="text-xs text-muted-foreground">
                {d.googleDriveUrl === 'https://drive.google.com/file/d/...'
                  ? 'Google Drive'
                  : 'External URL'}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className={getStatusBadgeClass(d.status)}>
            {statusConfig[d.status].label}
          </div>

          {/* Progress % */}
          <div className="w-12 text-right">
            <div className="text-sm font-semibold text-foreground">
              {d.progress}%
            </div>
          </div>

          {/* Speed */}
          <div className="hidden w-20 text-right md:block">
            <div className="text-xs font-mono text-cyan-400">
              {formatSpeed(d.speed)}
            </div>
          </div>

          {/* ETA */}
          <div className="hidden w-16 text-right lg:block">
            <div className="text-xs text-muted-foreground">
              {d.eta > 0 ? formatTime(d.eta) : '—'}
            </div>
          </div>

          {/* Expand Icon */}
          <ChevronDown
            className={`size-4 flex-shrink-0 text-muted-foreground transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>

        {/* Progress Bar and Controls */}
        <div className="px-4 pb-3">
          <div className="flex flex-col gap-2">
            {/* Progress Bar */}
            <div className="h-1.5 rounded-full bg-border">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  d.status === 'completed'
                    ? 'bg-emerald-500'
                    : d.status === 'failed'
                      ? 'bg-destructive'
                      : d.status === 'paused'
                        ? 'bg-amber-500'
                        : 'bg-cyan-500'
                }`}
                style={{ width: `${d.progress}%` }}
              />
            </div>

            {/* Size and Speed on Compact View */}
            <div className="flex text-xs text-muted-foreground justify-between">
              <span>{sizeStr}</span>
              <span className="text-cyan-400 font-mono">
                {formatSpeed(d.speed)}
              </span>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-border/30 bg-card/30 px-4 py-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={statusConfig[d.status].color}>
                    {statusConfig[d.status].label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Downloaded:</span>
                  <span className="text-foreground font-mono">
                    {formatBytes(d.downloaded)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Size:</span>
                  <span className="text-foreground font-mono">
                    {formatBytes(d.total)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Speed:</span>
                  <span className="text-cyan-400 font-mono">
                    {formatSpeed(d.speed)}
                  </span>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ETA:</span>
                  <span className="text-foreground font-mono">
                    {d.eta > 0 ? formatTime(d.eta) : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Destination:</span>
                  <span className="text-foreground font-mono text-right truncate max-w-xs">
                    {d.destination}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Progress:</span>
                  <span className="text-foreground font-mono">
                    {d.progress}%
                  </span>
                </div>
              </div>

              {/* Speed Graph */}
              <div className="md:col-span-2">
                <div className="text-xs text-muted-foreground mb-1">
                  Speed History
                </div>
                <SpeedGraph />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-3 flex flex-wrap gap-2">
              {d.status === 'downloading' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onPause(d.id)}
                  className="gap-1"
                >
                  <Pause className="size-3" />
                  Pause
                </Button>
              )}
              {d.status === 'paused' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onResume(d.id)}
                  className="gap-1"
                >
                  <Play className="size-3" />
                  Resume
                </Button>
              )}
              {(d.status === 'downloading' || d.status === 'paused' || d.status === 'queued') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCancel(d.id)}
                  className="gap-1 text-destructive hover:text-destructive"
                >
                  <X className="size-3" />
                  Cancel
                </Button>
              )}
              {(d.status === 'completed' || d.status === 'failed' || d.status === 'cancelled') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(d.id)}
                  className="gap-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-3" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Active Downloads */}
      {activeDownloads.length > 0 && (
        <div>
          <div className="mb-2 px-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Active
          </div>
          <div className="rounded-md border border-border/50 bg-card/30 overflow-hidden backdrop-blur-sm">
            {activeDownloads.map(renderDownloadRow)}
          </div>
        </div>
      )}

      {/* Queued Downloads */}
      {queuedDownloads.length > 0 && (
        <div>
          <div className="mb-2 px-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Queued ({queuedDownloads.length})
          </div>
          <div className="rounded-md border border-border/50 bg-card/20 overflow-hidden backdrop-blur-sm">
            {queuedDownloads.map(renderDownloadRow)}
          </div>
        </div>
      )}

      {/* Completed Downloads */}
      {completedDownloads.length > 0 && (
        <div>
          <div className="mb-2 px-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Completed ({completedDownloads.length})
          </div>
          <div className="rounded-md border border-border/50 bg-card/20 overflow-hidden backdrop-blur-sm">
            {completedDownloads.map(renderDownloadRow)}
          </div>
        </div>
      )}

      {downloads.length === 0 && (
        <div className="rounded-md border border-border/30 bg-card/20 p-8 text-center">
          <Download className="mx-auto size-10 text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">
            No downloads yet. Add your first download to get started.
          </p>
        </div>
      )}
    </div>
  )
}
