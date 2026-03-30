import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface ProofSealProps {
  status: 'PASS' | 'FAIL' | 'ERROR'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ProofSeal({ status, size = 'md', className }: ProofSealProps) {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  }

  const iconSizeMap = {
    sm: 20,
    md: 28,
    lg: 36,
  }

  const iconSize = iconSizeMap[size]

  if (status === 'PASS') {
    return (
      <div
        className={cn('proof-seal', sizeMap[size], className)}
        role="img"
        aria-label="Verification passed"
      >
        <CheckCircle2 size={iconSize} strokeWidth={2} />
      </div>
    )
  }

  if (status === 'FAIL') {
    return (
      <div
        className={cn('proof-seal proof-seal--fail', sizeMap[size], className)}
        role="img"
        aria-label="Verification failed"
      >
        <XCircle size={iconSize} strokeWidth={2} />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'proof-seal',
        'bg-warning/10 text-warning border-warning',
        sizeMap[size],
        className
      )}
      role="img"
      aria-label="Verification error"
    >
      <AlertCircle size={iconSize} strokeWidth={2} />
    </div>
  )
}
