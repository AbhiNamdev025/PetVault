self.addEventListener("push", function (event) {
  if (event.data) {
    const payload = event.data.json();
    const options = {
      body: payload.body,
      icon: payload.icon || "/pwa-192x192.png",
      badge: "/badge.png", // specific badge icon if available
      vibrate: [100, 50, 100],
      data: payload.data || { url: "/" },
      actions: [
        {
          action: "open-url",
          title: "View",
        },
      ],
    };
    event.waitUntil(self.registration.showNotification(payload.title, options));
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === event.notification.data.url && "focus" in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    }),
  );
});
