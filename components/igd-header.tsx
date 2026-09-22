'use client'

import { Wifi, Signal } from 'lucide-react'
import { SystemStatus } from '@/lib/api'

interface IGDHeaderProps {
  system: SystemStatus
}

export function IGDHeader({ system }: IGDHeaderProps) {
  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              IGD
            </h1>
            <p className="text-sm text-muted-foreground">
              Internet GDrive Downloader
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              {system.network === 'connected' ? (
                <>
                  <Signal className="size-4 text-emerald-500" />
                  <span className="text-sm text-muted-foreground">
                    Connected
                  </span>
                </>
              ) : (
                <>
                  <Wifi className="size-4 text-destructive" />
                  <span className="text-sm text-destructive">
                    Disconnected
                  </span>
                </>
              )}
            </div>

            <div className="h-6 w-px bg-border" />

            <div className="text-right text-sm">
              <div className="font-mono font-semibold text-cyan-400">
                {(system.totalSpeed / (1024 * 1024)).toFixed(1)} MB/s
              </div>
              <div className="text-xs text-muted-foreground">
                Current Speed
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
