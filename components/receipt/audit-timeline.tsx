import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'

interface AuditEvent {
  label: string
  timestamp: string
  status: 'pass' | 'fail' | 'info'
  detail?: string
}

interface AuditTimelineProps {
  events: AuditEvent[]
  className?: string
}

export function AuditTimeline({ events, className }: AuditTimelineProps) {
  return (
    <div className={cn('audit-trail', className)} role="list" aria-label="Audit timeline">
      {events.map((event, index) => (
        <div key={index} className="audit-trail-item" role="listitem">
          <div className="shrink-0 mt-0.5">
            {event.status === 'pass' && (
              <CheckCircle2
                size={15}
                className="text-success"
                aria-hidden="true"
              />
            )}
            {event.status === 'fail' && (
              <XCircle
                size={15}
                className="text-destructive"
                aria-hidden="true"
              />
            )}
            {event.status === 'info' && (
              <Clock
                size={15}
                className="text-muted-foreground"
                aria-hidden="true"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{event.label}</p>
            {event.detail && (
              <p className="text-xs text-muted-foreground mt-0.5">{event.detail}</p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(event.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
