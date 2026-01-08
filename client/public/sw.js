self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const level = data.level || 1;
  const levelNames = { 1: "IMMEDIATE", 2: "URGENT", 3: "SEMI-URGENT" };
  const title = `ResQ - ${levelNames[level]} HELP!`;
  
  const options = {
    body: data.body || "Someone needs your help nearby!",
    icon: "/favicon.png",
    badge: "/favicon.png",
    vibrate: level === 1 ? [500, 100, 500, 100, 500] : [200, 100, 200],
    data: {
      url: data.url || "/"
    },
    tag: 'emergency-alert',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
