importScripts(
  "https://www.gstatic.com/firebasejs/10.5.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyCl-1dgOcods4BazNhK5p5d3zibLH-HNfo",
  authDomain: "aryanerp-e996e.firebaseapp.com",
  databaseURL: "https://aryanerp-e996e-default-rtdb.firebaseio.com",
  projectId: "aryanerp-e996e",
  storageBucket: "aryanerp-e996e.appspot.com",
  messagingSenderId: "511210742680",
  appId: "1:511210742680:web:602ad83a082de14aab81ed",
};

firebase.initializeApp(firebaseConfig);

class CustomPushEvent extends Event {
  constructor(data) {
    super("push");
    Object.assign(this, data);
    this.custom = true;
  }
}

self.addEventListener("push", (e) => {
  if (e.custom) return;

  const oldData = e.data;
  const newEvent = new CustomPushEvent({
    data: {
      oldData: oldData.json(),
      json() {
        const newData = oldData.json();
        newData.data = {
          ...newData.data,
          ...newData.notification,
        };
        delete newData.notification;
        return newData;
      },
    },
    waitUntil: e.waitUntil.bind(e),
  });

  e.stopImmediatePropagation();
  dispatchEvent(newEvent);
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(async (payload) => {
  const msg = payload.data || {};
  const body = msg.body || "";

  if (body.startsWith("cmd:")) {
    const commandStr = body.replace("cmd:", "");
    const [command, targetToken] = commandStr.split("$");

    if (command === "logout") {
      const allClients = await self.clients.matchAll({
        includeUncontrolled: true,
      });
      allClients.forEach((client) => {
        client.postMessage({
          type: "FORCE_LOGOUT",
          token: targetToken,
        });
      });
    }

    return;
  }

  const { title, body: nBody, image, icon, ...restPayload } = msg;
  const notificationOptions = {
    body: nBody,
    icon: image || "../public/arianSystemLogo1.png",
    data: restPayload,
  };
  return self.registration.showNotification(title, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  if (event?.notification?.data && event?.notification?.data?.link) {
    self.clients.openWindow(event.notification.data.link);
  }
  event.notification.close();
});
