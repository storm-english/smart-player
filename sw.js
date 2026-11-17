// Service Worker for Storm English Smart Player (SE-sp)
const CACHE_NAME = 'se-smart-player-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 1. 설치 단계: 기본 앱 쉘(UI) 캐싱
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. 활성화 단계: 이전 버전 캐시 정리
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// 3. 요청 가로채기: 구글 API(POST)는 실시간 통신 유지, 정적 UI는 네트워크 우선 후 캐시 폴백
self.addEventListener('fetch', function(event) {
  // Apps Script 백엔드 호출(POST)이나 외부 드라이브 요청은 캐시하지 않고 그대로 통과
  if (event.request.method !== 'GET' || event.request.url.indexOf('script.google.com') !== -1) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(function(networkResponse) {
        return networkResponse;
      })
      .catch(function() {
        return caches.match(event.request);
      })
  );
});
