import Link from 'next/link'

interface SiteLogoProps {
  size?: 'sm' | 'md' | 'lg'
  wordmark?: boolean
  className?: string
}

export function SiteLogo({ size = 'md', wordmark = true, className }: SiteLogoProps) {
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 32 : 24
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-lg'

  return (
    <Link
      href="/"
      className={`flex items-center gap-2 hover:opacity-90 transition-opacity ${className ?? ''}`}
      aria-label="ProofDrop home"
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6L12 2z"
          fill="#2563EB"
        />
        <path
          d="M8.5 12l2.5 2.5 4.5-4.5"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {wordmark && (
        <span className={`font-sans ${textSize} leading-none select-none`}>
          <span className="font-bold text-primary">Proof</span>
          <span className="font-normal text-foreground">Drop</span>
        </span>
      )}
    </Link>
  )
}
