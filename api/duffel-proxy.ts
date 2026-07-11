import type { VercelRequest, VercelResponse } from '@vercel/node'

const ALLOWED_PREFIXES = ['air/offer_requests', 'air/offers', 'places/suggestions']

const DUFFEL_API_BASE_URL = process.env.DUFFEL_API_BASE_URL || 'https://api.duffel.com'
const DUFFEL_VERSION = process.env.DUFFEL_VERSION || 'v2'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!process.env.DUFFEL_API_TOKEN) {
    res.status(500).json({ errors: [{ message: 'Server misconfiguration: DUFFEL_API_TOKEN is not set.' }] })
    return
  }

  const segments = req.query.path
  const path = Array.isArray(segments) ? segments.join('/') : (segments ?? '')

  if (!ALLOWED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    res.status(404).json({ errors: [{ message: 'Not found' }] })
    return
  }

  const url = new URL(`${DUFFEL_API_BASE_URL}/${path}`)
  const originalUrl = req.url ?? ''
  const queryIndex = originalUrl.indexOf('?')
  if (queryIndex !== -1) {
    url.search = originalUrl.slice(queryIndex)
  }
  url.searchParams.delete('path')

  const headers: Record<string, string> = {
    Authorization: `Bearer ${process.env.DUFFEL_API_TOKEN}`,
    'Duffel-Version': DUFFEL_VERSION,
    Accept: 'application/json',
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    headers['Content-Type'] = 'application/json'
  }

  const duffelRes = await fetch(url, {
    method: req.method,
    headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
  })

  const body = await duffelRes.text()
  res.status(duffelRes.status)
  res.setHeader('Content-Type', duffelRes.headers.get('content-type') ?? 'application/json')
  res.send(body)
}
