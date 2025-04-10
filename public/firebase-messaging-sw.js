importScripts(
  "https://www.gstatic.com/firebasejs/11.5.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.5.0/firebase-messaging-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyDnl4Ao1a4N4PJ9WRbqYScIZhSFEHAWM48",
  authDomain: "sports-registration-d45a1.firebaseapp.com",
  projectId: "sports-registration-d45a1",
  storageBucket: "sports-registration-d45a1.firebasestorage.app",
  messagingSenderId: "993235822680",
  appId: "1:993235822680:web:9e803a14cf18518f7a422d",
  measurementId: "G-FSWCP5GXWK",
});

const messaging = firebase.messaging();
const db = firebase.firestore();

messaging.onBackgroundMessage(async (payload) => {
  console.log("background:", payload);

  const ref = db.collection("notifications").doc();

  await db
    .collection("notifications")
    .doc(ref.id)
    .set({
      id: ref.id,
      ...payload.data,
      isRead: false,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    });
});
