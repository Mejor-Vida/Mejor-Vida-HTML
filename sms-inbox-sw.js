/* Staff SMS inbox service worker — push + open thread */
self.addEventListener("install", function (event) {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", function (event) {
  var data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { body: event.data ? event.data.text() : "New text message" };
  }
  var title = data.title || "Mejor Vida SMS";
  var options = {
    body: data.body || "New text message",
    icon: "/apple-touch-icon.png",
    badge: "/favicon-48x48.png",
    tag: data.phone ? "sms-" + data.phone : "sms-inbox",
    renotify: true,
    data: {
      url: data.url || "/staff/sms-inbox.html",
      phone: data.phone || "",
    },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || "/staff/sms-inbox.html";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clients) {
      for (var i = 0; i < clients.length; i++) {
        if (clients[i].url.indexOf("/staff/sms-inbox") !== -1 && "focus" in clients[i]) {
          clients[i].postMessage({ type: "sms-open", url: url });
          return clients[i].focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
