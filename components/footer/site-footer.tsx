import Link from 'next/link'
import { SiteLogo } from '@/components/brand/site-logo'
import { Separator } from '@/components/ui/separator'

export function SiteFooter() {
  return (
    <footer className="site-footer border-t border-border bg-background" role="contentinfo">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <SiteLogo size="md" />
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              AIVS proof bundle verification for AI teams. Cryptographic receipts any third party can verify.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Product</p>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Verifier</Link></li>
              <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Legal</p>
            <ul className="space-y-2">
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li>
                <a
                  href="mailto:security@proofdrop.pro"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Security
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Contact</p>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:hello@proofdrop.pro"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  hello@proofdrop.pro
                </a>
              </li>
              <li>
                <a
                  href="mailto:legal@proofdrop.pro"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Legal inquiries
                </a>
              </li>
              <li>
                <a
                  href="mailto:privacy@proofdrop.pro"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy requests
                </a>
              </li>
            </ul>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ProofDrop. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <a href="mailto:security@proofdrop.pro" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
