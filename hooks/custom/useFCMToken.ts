"use client";
import { useEffect, useState } from "react";

import { getMessaging, getToken } from "firebase/messaging";

import firebaseApp from "@utils/firebase";

export const useFcmToken = () => {
  const [fcmToken, setFCMToken] = useState("");
  const [notificationPermissionStatus, setNotificationPermissionStatus] =
    useState("");

  useEffect(() => {
    const retrieveToken = async () => {
      try {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
          const messaging = getMessaging(firebaseApp);

          const permission = await Notification.requestPermission();

          setNotificationPermissionStatus(permission);

          if (permission === "granted") {
            // Delete the current token
            // await deleteToken(messaging);
            // console.log("Token deleted.");
            const currentToken = await getToken(messaging, {
              //vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
              //serviceWorkerRegistration: await navigator.serviceWorker.ready,
            });

            if (currentToken) {
              setFCMToken(currentToken);
              localStorage.setItem("fcm_token", currentToken);
            } else {
              null;
            }
          }
        }
      } catch (error) {
        null;
      }
    };

    retrieveToken();
  }, []);

  return { fcmToken, notificationPermissionStatus };
};
