"use client";
import { useEffect, useRef } from "react";

import { getMessaging, onMessage } from "firebase/messaging";
import { shallowEqual, useDispatch } from "react-redux";

import { useAppSelector } from "@redux/index";
import { showNotificationToast } from "@utils/core";
import firebaseApp from "@utils/firebase";

import { setListStateByRepo } from "../slice/pages";
import { PageStateEnum } from "../slice/pages/enum";
import { useFcmToken, useHandle } from "./custom";

export default function FirebaseNotification() {
  const { notificationPermissionStatus, fcmToken } = useFcmToken();
  const { handleLogout } = useHandle();
  const dispatch = useDispatch();
  const { pages } = useAppSelector((state) => {
    const pages = state?.withPersist?.pages;
    return { pages };
  }, shallowEqual);
  const pagesRef = useRef(pages);

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (notificationPermissionStatus === "granted") {
        const messaging = getMessaging(firebaseApp);

        const unsubscribe = onMessage(messaging, (payload) => {
          const msg = payload.data || {};
          console.log("msg", msg);

          // 🔹 Check if it's a command message
          const body = msg.body || "";
          if (body.startsWith("cmd:")) {
            const commandStr = body.replace("cmd:", "");
            const [command, targetToken] = commandStr.split("$");

            if (command === "logout") {
              if (targetToken === fcmToken) {
                handleLogout();
              }
            }

            // Skip showing toast for command messages
            return;
          }

          // 🔹 Regular data handling (non-command)
          if (msg["D$repoid"] && msg["D$keyid"]) {
            const repoId = msg["D$repoid"];
            const keyId = msg["D$keyid"];
            const action = msg["D$ActionMode"];
            const status = msg["D$Status"];

            // dispatch(
            //   setStatusItemsList({
            //     RepoId: Number(repoId),
            //     items: {
            //       id: Number(keyId),
            //       status: Number(status),
            //     },
            //   })
            // );

            if (action == "2" && status !== "0") {
              // dispatch(
              //   setUndoDeleteItemsList({
              //     RepoId: Number(repoId),
              //     deletedId: Number(keyId),
              //   })
              // );
            }

            const exists = pagesRef.current.findIndex(
              (p) => p.RepoId == repoId && p.Key == keyId
            );

            if (exists !== -1) {
              // dispatch(
              //   setPageStateByRepo({
              //     RepoId: parseInt(repoId),
              //     Key: parseInt(keyId),
              //     pageState: findingPageState(status),
              //   })
              // );

              if (status === "0" && action == "2") {
                // dispatch(
                //   deletePageByRepo({
                //     RepoId: parseInt(repoId),
                //     Key: parseInt(keyId),
                //     pageState: findingPageState(status),
                //   })
                // );
              } else {
                showNotificationToast(msg.body, msg.title);
              }
            } else {
              dispatch(
                setListStateByRepo({
                  RepoId: parseInt(repoId),
                  pageState: PageStateEnum.NeedReload,
                })
              );
              showNotificationToast(msg.body, msg.title);
            }
          } else {
            showNotificationToast(msg.body, msg.title);
          }
        });

        return () => {
          unsubscribe();
        };
      }
    }
  }, [notificationPermissionStatus, fcmToken]);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "FORCE_LOGOUT") {
          const targetToken = event.data.token;
          if (targetToken === fcmToken) {
            handleLogout();
          }
        }
      });
    }
  }, [fcmToken]);

  return null;
}
