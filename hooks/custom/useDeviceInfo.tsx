import { useEffect, useState } from "react";

export const useDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    android: false,
    blackberry: false,
    chrome: false,
    fullVersion: "0.0.0.0",
    ios: false,
    majorVersion: 127,
    mobile: false,
    mozilla: false,
    msie: false,
    name: "",
    opera: false,
    operaMobile: false,
    safari: false,
    version: 0,
    webkit: false,
    windowsMobile: false,
  });
  useEffect(() => {
    const userAgent = navigator.userAgent;
    let verOffset = 0;
    let version = userAgent.indexOf("Version");
    let nameOffset = -1;
    if ((verOffset = userAgent.indexOf("Opera")) > -1) {
      setDeviceInfo((prev) => {
        return {
          ...prev,
          name: "Opera",
          opera: true,
          fullVersion:
            version > -1
              ? userAgent.substring(version + 8)
              : userAgent.substring(verOffset + 6),
        };
      });
    } else if ((verOffset = userAgent.indexOf("MSIE")) > -1) {
      setDeviceInfo((prev) => {
        return {
          ...prev,
          name: "Microsoft Internet Explorer",
          msie: true,
          fullVersion: userAgent.substring(verOffset + 5),
        };
      });
    } else if (userAgent.indexOf("Trident") > -1) {
      const start = userAgent.indexOf("rv:") + 3;
      const end = start + 4;
      setDeviceInfo((prev) => {
        return {
          ...prev,
          name: "Microsoft Internet Explorer",
          msie: true,
          fullVersion: userAgent.substring(start, end),
        };
      });
    } else if ((verOffset = userAgent.indexOf("Chrome")) > -1) {
      setDeviceInfo((prev) => {
        return {
          ...prev,
          name: "Chrome",
          webkit: true,
          fullVersion: userAgent.substring(verOffset + 7),
        };
      });
    } else if ((verOffset = userAgent.indexOf("Safari")) > -1) {
      setDeviceInfo((prev) => {
        return {
          ...prev,
          name: "Safari",
          webkit: true,
          fullVersion:
            version > -1
              ? userAgent.substring(version + 8)
              : userAgent.substring(verOffset + 7),
        };
      });
    } else if ((verOffset = userAgent.indexOf("AppleWebkit")) > -1) {
      setDeviceInfo((prev) => {
        return {
          ...prev,
          name: "Safari",
          webkit: true,
          fullVersion:
            version > -1
              ? userAgent.substring(version + 8)
              : userAgent.substring(verOffset + 7),
        };
      });
    } else if ((verOffset = userAgent.indexOf("Firefox")) > -1) {
      setDeviceInfo((prev) => {
        return {
          ...prev,
          name: "Firefox",
          fullVersion: userAgent.substring(verOffset + 8),
        };
      });
    } else if (
      (nameOffset = userAgent.lastIndexOf(" ") + 1) <
      (verOffset = userAgent.lastIndexOf("/"))
    ) {
      setDeviceInfo((prev) => {
        return {
          ...prev,
          name: userAgent.substring(nameOffset, verOffset),
          fullVersion: userAgent.substring(verOffset + 1),
        };
      });
    }

    setDeviceInfo((prev) => {
      const a = {
        ...prev,
        android: /Android/i.test(userAgent),
        blackberry: /BlackBerry/i.test(userAgent),
        ios: /iPhone|iPad|iPod/i.test(userAgent),
        operaMobile: /Opera Mini/i.test(userAgent),
        windowsMobile: /IEMobile/i.test(userAgent),
      };
      let ix = a.fullVersion.indexOf(";");
      if (ix > -1) {
        a.fullVersion = a.fullVersion.substring(0, ix);
      }
      ix = a.fullVersion.indexOf(" ");
      if (ix > -1) {
        a.fullVersion = a.fullVersion.substring(0, ix);
      }
      a.majorVersion = parseInt("" + a.fullVersion, 10);
      a.version = a.majorVersion;
      return {
        ...a,
        mobile:
          a.android ||
          a.blackberry ||
          a.ios ||
          a.windowsMobile ||
          a.operaMobile,
      };
    });

    return () => {};
  }, []);

  return { deviceInfo };
};
