/**
 * SSRF guard for user-controlled webhook URLs.
 * Blocks plain HTTP, private IP ranges, loopback, link-local, and bogon addresses.
 */

// Covers: loopback, private RFC-1918, link-local (169.254.*), and IPv6 equivalents.
const BLOCKED_HOSTS =
  /^(localhost|127\.|0\.0\.0\.0|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|::1|fc00:|fd[0-9a-f]{2}:)/i

/**
 * Returns true if the URL must be blocked (plain HTTP, private/loopback host,
 * or unparseable). Call this before saving or fetching any user-supplied URL.
 */
export function isBlockedWebhookUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr)
    if (url.protocol !== 'https:') return true // block plain http and non-http schemes
    const hostname = url.hostname.replace(/^\[|\]$/g, '') // strip IPv6 brackets
    return BLOCKED_HOSTS.test(hostname)
  } catch {
    return true // unparseable URL is always blocked
  }
}
