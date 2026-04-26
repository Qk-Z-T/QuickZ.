// public/sw.js
// সার্ভিস ওয়ার্কার – v2 (মডুলার স্ট্রাকচার সাপোর্ট)

const CACHE_STATIC = 'quickz-static-v2';
const CACHE_DYNAMIC = 'quickz-dynamic-v2';
const OFFLINE_PAGE = './offline.html';

// যে ফাইলগুলো অবশ্যই প্রি-ক্যাশ করতে হবে
const STATIC_ASSETS = [
  './',
  './index.html',
  './offline.html',
  './public/manifest.json',
  './public/icons/icon-192.png',
  './public/icons/icon-512.png',
  './src/shared/styles/base.css',
  './src/shared/styles/teacher.css',
  './src/shared/styles/student.css'
];

// ইনস্টল ইভেন্ট – স্ট্যাটিক ফাইল প্রি-ক্যাশ
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => {
        console.log('📦 Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS).catch(err => {
          console.warn('⚠️ Pre-cache কিছু ফাইলের জন্য ব্যর্থ (স্বাভাবিক):', err);
        });
      })
  );
});

// অ্যাক্টিভেট ইভেন্ট – পুরনো ক্যাশ পরিষ্কার
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_STATIC && key !== CACHE_DYNAMIC)
          .map(key => caches.delete(key))
    ))
  );
  return self.clients.claim();
});

// ফেচ ইভেন্ট – ক্যাশ স্ট্র্যাটেজি
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // শুধুমাত্র GET রিকোয়েস্ট প্রক্রিয়া করা হবে
  if (event.request.method !== 'GET') return;

  // নেভিগেশন রিকোয়েস্ট (HTML পেজ)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // সফল হলে ডায়নামিক ক্যাশে রাখা
          const cloned = response.clone();
          caches.open(CACHE_DYNAMIC).then(cache => cache.put(event.request, cloned));
          return response;
        })
        .catch(() => {
          // নেটওয়ার্ক ব্যর্থ হলে ক্যাশ থেকে ফেরত
          return caches.match(event.request).then(cached => {
            if (cached) return cached;
            // সবশেষে অফলাইন পেজ
            return caches.match(OFFLINE_PAGE);
          });
        })
    );
    return;
  }

  // অন্যান্য রিকোয়েস্ট – ক্যাশ ফার্স্ট, নেটওয়ার্ক ফলব্যাক
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      // নেটওয়ার্ক থেকে আনার চেষ্টা
      return fetch(event.request).then(response => {
        // শুধু ২০০ স্ট্যাটাসের রেসপন্স ক্যাশে রাখব
        if (response && response.status === 200) {
          const cloned = response.clone();
          caches.open(CACHE_DYNAMIC).then(cache => cache.put(event.request, cloned));
        }
        return response;
      }).catch(() => {
        // জাভাস্ক্রিপ্ট ফাইলের জন্য ক্যাশে না পেলে কিছু করবে না (৪০৪)
        // অথবা অফলাইন পেজ ফেরত
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match(OFFLINE_PAGE);
        }
      });
    })
  );
});
