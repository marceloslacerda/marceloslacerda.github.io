self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('fox-store').then((cache) => cache.addAll([
      '/lazy-task-manager/',
      '/lazy-task-manager/lazy_task_manager.html',
      '/lazy-task-manager/task_manager.js',
      '/lazy-task-manager/lazy_task_manager.css',
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  console.log(e.request.url);
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});