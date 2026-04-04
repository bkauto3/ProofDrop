import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: '400',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ProofDrop — AIVS Proof Bundle Verification',
    template: '%s | ProofDrop',
  },
  description: 'Turn any AIVS proof bundle into a permanent, tamper-evident receipt URL in seconds.',
  keywords: ['AIVS', 'proof bundle', 'verification', 'receipt', 'AI work verification'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://proofdrop.pro',
    siteName: 'ProofDrop',
    title: 'ProofDrop — AIVS Proof Bundle Verification',
    description: 'Turn any AIVS proof bundle into a permanent, tamper-evident receipt URL in seconds.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProofDrop — AIVS Proof Bundle Verification',
    description: 'Turn any AIVS proof bundle into a permanent, tamper-evident receipt URL in seconds.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
