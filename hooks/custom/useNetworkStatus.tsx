import { useEffect, useState } from "react";

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(
    typeof window !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
};
// import {
//   useEffect,
//   useRef,
//   useState,
// } from 'react';

// export default function useNetworkStatus(
//   pingUrl: string = "https://httpbin.org/status/200",
//   intervalMs: number = 5000,
//   maxFailures: number = 3
// ) {
//   const [isOnline, setIsOnline] = useState(true);
//   const failedCountRef = useRef(0);

//   const checkConnection = async () => {
//     try {
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 3000);

//       await fetch(pingUrl, {
//         method: "HEAD",
//         cache: "no-cache",
//         mode: "no-cors",
//         signal: controller.signal,
//       });

//       clearTimeout(timeoutId);

//       failedCountRef.current = 0;
//       setIsOnline(true);
//     } catch (error) {
//       failedCountRef.current += 1;
//       if (failedCountRef.current >= maxFailures) {
//         setIsOnline(false);
//       }
//     }
//   };

//   useEffect(() => {
//     checkConnection();

//     const handleOnline = () => {
//       failedCountRef.current = 0;
//       checkConnection();
//     };

//     const handleOffline = () => {
//       failedCountRef.current = maxFailures;
//       setIsOnline(false);
//     };

//     window.addEventListener("online", handleOnline);
//     window.addEventListener("offline", handleOffline);

//     const intervalId = setInterval(checkConnection, intervalMs);

//     return () => {
//       window.removeEventListener("online", handleOnline);
//       window.removeEventListener("offline", handleOffline);
//       clearInterval(intervalId);
//     };
//   }, []);

//   return isOnline;
// }
