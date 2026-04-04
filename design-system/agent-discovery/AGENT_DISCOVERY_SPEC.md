# Agent Discovery - Implementation Guide
**Site:** ProofDrop (`proofdrop`)
**Domain:** https://proofdrop.pro
**Generated:** 2026-04-01T12:28:59.343536+00:00

---

## Overview

This guide documents the 7 agent-discovery artifacts generated for `proofdrop` and
provides step-by-step instructions for Phase 3 construction to integrate them
into the Next.js site.

---

## 1. Files in This Directory

| File | Purpose | Deploy Target |
|------|---------|---------------|
| `robots.txt` | Allow all agents, reference sitemap | `/public/robots.txt` |
| `sitemap.xml` | Route discovery | `/public/sitemap.xml` |
| `schema_org.json` | Organization + SoftwareApplication JSON-LD | Embedded in `app/layout.tsx` |
| `og_twitter_tags.json` | OpenGraph + Twitter Card definitions (per-page) | `app/layout.tsx` and page metadata |
| `voix_tools_template.json` | VOIX tool declarations (Jules curates) | JSX components in relevant pages |
| `ai.txt` | Capabilities manifest | `/public/.well-known/ai.txt` |
| `AGENT_DISCOVERY_SPEC.md` | This file | Reference only |

---

## 2. Phase 3 Construction - Files to Copy to `public/`

```bash
cp sites/proofdrop/design-system/agent-discovery/robots.txt   sites/proofdrop/public/robots.txt
cp sites/proofdrop/design-system/agent-discovery/sitemap.xml  sites/proofdrop/public/sitemap.xml
mkdir -p sites/proofdrop/public/.well-known
cp sites/proofdrop/design-system/agent-discovery/ai.txt       sites/proofdrop/public/.well-known/ai.txt
```

> sitemap.xml should be regenerated at build time for dynamic routes.
> Use app/sitemap.ts with the Next.js App Router.

---

## 3. Schema.org JSON-LD - app/layout.tsx

```tsx
// app/layout.tsx
import schemaOrg from '@/design-system/agent-discovery/schema_org.json';

export const metadata: Metadata = {
  title: 'ProofDrop',
  description: 'Turn any AIVS proof bundle into a shareable receipt in seconds',
  openGraph: {
    title: 'ProofDrop',
    description: 'Turn any AIVS proof bundle into a shareable receipt in seconds',
    url: 'https://proofdrop.pro',
    siteName: 'ProofDrop',
    images: [{ url: 'https://proofdrop.pro/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProofDrop',
    description: 'Turn any AIVS proof bundle into a shareable receipt in seconds',
    images: ['https://proofdrop.pro/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 4. VOIX Tool Declarations - JSX Integration

### 4.1 hooks/useVoixTools.ts

```typescript
// hooks/useVoixTools.ts
'use client';
import { useEffect } from 'react';
type VoixTool = { name: string; handler: (props: Record<string, string>) => void | Promise<void>; };
export function useVoixTools(tools: VoixTool[]) {
  useEffect(() => {
    const listeners: Array<[string, EventListener]> = [];
    for (const tool of tools) {
      const listener: EventListener = (e) => {
        const detail = (e as CustomEvent).detail ?? {};
        tool.handler(detail);
      };
      document.addEventListener(`voix:${tool.name}`, listener);
      listeners.push([`voix:${tool.name}`, listener]);
    }
    return () => { for (const [ev, fn] of listeners) document.removeEventListener(ev, fn); };
  }, [tools]);
}
```

### 4.2 components/AgentTools.tsx

```tsx
// components/AgentTools.tsx
'use client';
import { useVoixTools } from '@/hooks/useVoixTools';
import { useRouter } from 'next/navigation';
export function AgentTools() {
  const router = useRouter();
  useVoixTools([
    {
      name: "aivs_proof_bundle_verification",
      handler: (props) => {
        console.log("VOIX tool triggered: aivs_proof_bundle_verification", props);
      },
    },
    {
      name: "permanent_tamper_evident_receipt",
      handler: (props) => {
        console.log("VOIX tool triggered: permanent_tamper_evident_receipt", props);
      },
    },
    {
      name: "public_read_only_receipt_page___receipt_",
      handler: (props) => {
        console.log("VOIX tool triggered: public_read_only_receipt_page___receipt_", props);
      },
    },
    { name: 'get_pricing', handler: () => router.push('/pricing') },
    { name: 'start_trial', handler: (p) => router.push('/signup' + (p.plan ? '?plan=' + p.plan : '')) },
    { name: 'get_help', handler: () => router.push('/docs') },
  ]);
  return (
    <div style={{ display: 'none' }} aria-hidden='true'>
      <tool name="aivs_proof_bundle_verification">
        <prop name="id" type="string">Record ID (optional)</prop>
      </tool>
      <tool name="permanent_tamper_evident_receipt">
        <prop name="id" type="string">Record ID (optional)</prop>
      </tool>
      <tool name="public_read_only_receipt_page___receipt_">
        <prop name="id" type="string">Record ID (optional)</prop>
      </tool>
      <tool name='get_pricing'><prop name='plan' type='string'>Plan tier</prop></tool>
      <tool name='start_trial'><prop name='plan' type='string'>Pre-select plan</prop></tool>
      <tool name='get_help'><prop name='topic' type='string'>Help topic</prop></tool>
    </div>
  );
}
```

Mount `<AgentTools />` in `app/layout.tsx` for site-wide tool availability.

---

## 5. Dynamic Sitemap - app/sitemap.ts

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://proofdrop.pro';
  const d = new Date();
  return [
    { url: base, lastModified: d, changeFrequency: 'daily', priority: 1 },
    { url: base + '/pricing', lastModified: d, changeFrequency: 'weekly', priority: 0.9 },
    { url: base + '/features', lastModified: d, changeFrequency: 'weekly', priority: 0.9 },
    { url: base + '/dashboard', lastModified: d, changeFrequency: 'daily', priority: 0.7 },
    { url: base + '/signup', lastModified: d, changeFrequency: 'monthly', priority: 0.8 },
    { url: base + '/blog', lastModified: d, changeFrequency: 'weekly', priority: 0.6 },
    { url: base + '/privacy', lastModified: d, changeFrequency: 'yearly', priority: 0.3 },
    { url: base + '/terms', lastModified: d, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
```

---

## 6. Phase 3 Construction Checklist

- [ ] `robots.txt` copied to `public/robots.txt`
- [ ] `sitemap.xml` copied to `public/sitemap.xml` (or replaced by `app/sitemap.ts`)
- [ ] `ai.txt` copied to `public/.well-known/ai.txt`
- [ ] `schema_org.json` embedded in `app/layout.tsx` via script tag
- [ ] OpenGraph + Twitter Card tags added to `app/layout.tsx` via Metadata export
- [ ] `hooks/useVoixTools.ts` created
- [ ] `components/AgentTools.tsx` created with tools from `voix_tools_template.json`
- [ ] `<AgentTools />` mounted in `app/layout.tsx`
- [ ] Jules agent has curated `voix_tools_template.json` before implementation

---

## 7. Phase 5 E2E Testing Checklist (Agent Discovery)

- [ ] GET /robots.txt returns 200 and body contains Sitemap:
- [ ] GET /sitemap.xml returns 200 and is valid XML with urlset element
- [ ] GET /.well-known/ai.txt returns 200 and body contains VOIX
- [ ] Home page head contains application/ld+json script tag
- [ ] Home page head contains og:title meta tag
- [ ] Home page head contains twitter:card meta tag
- [ ] AgentTools div is present in DOM with at least one tool child
- [ ] VOIX tool event fires when dispatched via document.dispatchEvent
- [ ] Schema.org JSON-LD parses without errors (JSON.parse)
- [ ] sitemap.xml contains at least 6 url entries

---

## 8. References

- VOIX Framework: https://github.com/svenschultze/VOIX
- VOIX Chrome Extension: https://chromewebstore.google.com/detail/voix/agmhpolimgfdfnlgciajhbkdapkophie
- Schema.org: https://schema.org/
- robots.txt Spec: https://www.robotstxt.org/
- OpenGraph Protocol: https://ogp.me/
- Next.js Metadata API: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- Next.js Sitemap: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap

---

**Status:** Artifacts generated - Jules agent curation pending for voix_tools_template.json
**Next Step:** Phase 3 construction integrates all files above into the Next.js site
**Validation:** Phase 5 E2E tests verify agent-readiness (checklist in section 7)
