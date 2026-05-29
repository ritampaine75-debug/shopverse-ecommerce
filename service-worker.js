const CACHE_NAME = 'shopverse-v1';
const urlsToCache = [
  'index.html',
  'products.html',
  'product.html',
  'cart.html',
  'checkout.html',
  'wishlist.html',
  'search.html',
  'categories.html',
  'orders.html',
  'profile.html',
  'login.html',
  'register.html',
  'order-confirmation.html',
  'contact.html',
  'about.html',
  'faq.html',
  'privacy.html',
  'terms.html',
  'return-policy.html',
  'css/style.css',
  'css/responsive.css',
  'css/darkmode.css',
  'css/auth.css',
  'css/admin.css',
  'css/cart.css',
  'css/checkout.css',
  'js/config.js',
  'js/app.js',
  'js/auth.js',
  'js/products.js',
  'js/cart.js',
  'js/wishlist.js',
  'js/checkout.js',
  'js/orders.js',
  'js/profile.js',
  'js/search.js',
  'js/admin.js',
  'manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-storage.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => Promise.all(
      names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
    ))
  );
});
