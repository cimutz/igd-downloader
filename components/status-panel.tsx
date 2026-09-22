'use client'

import { Download, HardDrive, Zap } from 'lucide-react'
import { SystemStatus } from '@/lib/api'

interface StatusPanelProps {
  system: SystemStatus
}

export function StatusPanel({ system }: StatusPanelProps) {
  const storagePercent = system.storage.percentage

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
      {/* Active */}
      <div className="rounded-md border border-cyan-500/30 bg-cyan-500/5 p-3 backdrop-blur-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Active
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <div className="text-2xl font-bold text-foreground">
            {system.active}
          </div>
        </div>
      </div>

      {/* Queued */}
      <div className="rounded-md border border-blue-500/30 bg-blue-500/5 p-3 backdrop-blur-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Queued
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <div className="text-2xl font-bold text-foreground">
            {system.queued}
          </div>
        </div>
      </div>

      {/* Finished */}
      <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 backdrop-blur-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Finished
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <div className="text-2xl font-bold text-foreground">
            {system.finished}
          </div>
        </div>
      </div>

      {/* Storage */}
      <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Storage
          </div>
          <HardDrive className="size-3 text-amber-500/70" />
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <div className="text-lg font-bold text-foreground">
            {storagePercent}%
          </div>
          <span className="text-xs text-muted-foreground">
            used
          </span>
        </div>
        <div className="mt-2 h-1 w-full rounded-full bg-border">
          <div
            className={`h-1 rounded-full transition-all ${
              storagePercent > 90
                ? 'bg-destructive'
                : storagePercent > 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
            }`}
            style={{ width: `${storagePercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
