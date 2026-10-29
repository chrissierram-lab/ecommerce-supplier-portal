const CACHE_NAME = 'gapsi-shell-v3'
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/gapsi-logo.jpg',
  '/assets/candidate.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      await cache.addAll(CORE_ASSETS)

      const index = await cache.match('/index.html')
      if (index) {
        const html = await index.text()
        const buildAssets = [...html.matchAll(/(?:src|href)=["'](\/assets\/[^"']+\.(?:js|css))["']/g)]
          .map((match) => match[1])
        await cache.addAll(buildAssets)
      }

      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((key) => key.startsWith('gapsi-shell-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      )
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  const staticDestinations = ['document', 'script', 'style', 'image', 'font', 'manifest']

  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/') ||
    url.pathname === '/graphql' ||
    !staticDestinations.includes(request.destination)
  ) {
    return
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      try {
        const response = await fetch(request)
        if (response.ok && response.type === 'basic') {
          await cache.put(request, response.clone())
        }
        return response
      } catch (error) {
        const cached =
          (await cache.match(request)) ||
          (request.mode === 'navigate' ? await cache.match('/index.html') : undefined)
        if (cached) return cached
        throw error
      }
    })(),
  )
})
