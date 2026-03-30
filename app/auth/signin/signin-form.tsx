'use client'

import * as React from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function SignInForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'
  const [googleLoading, setGoogleLoading] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [emailLoading, setEmailLoading] = React.useState(false)
  const [emailSent, setEmailSent] = React.useState(false)
  const [emailError, setEmailError] = React.useState('')

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    try {
      await signIn('google', { callbackUrl })
    } catch {
      setGoogleLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setEmailError('')
    setEmailLoading(true)
    try {
      const result = await signIn('email', {
        email: trimmed,
        callbackUrl,
        redirect: false,
      })
      if (result?.error) {
        setEmailError('Could not send magic link. Please try again.')
        setEmailLoading(false)
      } else {
        setEmailSent(true)
      }
    } catch {
      setEmailError('Could not send magic link. Please try again.')
      setEmailLoading(false)
    }
  }

  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      {/* Google OAuth */}
      <Button
        onClick={() => void handleGoogleSignIn()}
        disabled={googleLoading || emailLoading}
        className="w-full"
        size="lg"
        variant="outline"
      >
        {googleLoading ? (
          'Redirecting...'
        ) : (
          <span className="flex items-center gap-2">
            <GoogleIcon />
            Continue with Google
          </span>
        )}
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>

      {/* Magic Link */}
      {emailSent ? (
        <div className="rounded-md bg-muted p-4 text-center text-sm text-foreground">
          Check your inbox — a sign-in link has been sent to{' '}
          <strong>{email.trim()}</strong>.
        </div>
      ) : (
        <form onSubmit={(e) => void handleEmailSignIn(e)} className="space-y-3">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={emailLoading}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {emailError && (
            <p className="text-xs text-destructive">{emailError}</p>
          )}
          <Button
            type="submit"
            disabled={emailLoading || googleLoading || !email.trim()}
            className="w-full"
            size="lg"
          >
            {emailLoading ? 'Sending link...' : 'Continue with Email'}
          </Button>
        </form>
      )}

      {/* Legal */}
      <p className="text-center text-xs text-muted-foreground pt-1">
        By signing in, you agree to our{' '}
        <a href="/terms" className="text-primary hover:underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
