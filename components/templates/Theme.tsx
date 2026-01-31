// import { ReactNode } from 'react';

// import {
//   ConfigProvider,
//   theme as AntdTheme,
// } from 'antd';

// import { useDarkMode } from '@customHook/useDarkMode';

// export default function Theme(props: { children: ReactNode }) {
//    const { mode="light" } = useDarkMode();
//   const { children } = props;
//   const { textColor, bgColor } = themePalette(mode);
//   return (
//     <ConfigProvider
//       wave={{ disabled: true }}
//       theme={{
//         algorithm:
//           mode === "Dark"
//             ? AntdTheme.darkAlgorithm
//             : AntdTheme.defaultAlgorithm,

//         token: {
//           fontFamily: "",
//           colorBgBase: bgColor,
//           colorTextBase: textColor,
//         },
//         components: {
//           List: { fontFamily: "" },
//           Menu: {
//             itemHeight: 24,
//             itemHoverBg: "#fff",
//             itemSelectedColor: "",
//             itemHoverColor: "",
//             itemBg: "#fff",
//             itemSelectedBg: "#eee",
//             itemActiveBg: "transparent",
//           },
//           Radio: {
//             colorBorder: "none",
//           },
//           DatePicker: {
//             colorPrimary: "#B1B1B1",
//             colorPrimaryActive: "#B1B1B1",
//           },
//           Switch: {
//             handleShadow: "none",
//           },
//         },
//       }}
//     >
//       {children}
//     </ConfigProvider>
//   );
// }
// export const themePalette = (
//   mode: "Light" | "Dark"
// ): { textColor: string; bgColor: string } => {
//   switch (mode) {
//     case "Light":
//       return {
//         textColor: "#000",
//         bgColor: "#fff",
//       };
//     case "Dark":
//       return {
//         textColor: "#fff",
//         bgColor: "#141414",
//       };
//     default:
//       return {
//         textColor: "#000",
//         bgColor: "#fff",
//       };
//   }
// };
import { ReactNode } from "react";

import { ConfigProvider, theme as AntdTheme } from "antd";

import { useDarkMode } from "@hooks/custom";

export default function Theme(props: { children: ReactNode }) {
  const { mode = "light" } = useDarkMode();
  const { children } = props;

  const normalizedMode = mode.toLowerCase() as "dark" | "light";
  const { textColor, bgColor } = themePalette(normalizedMode);

  return (
    <ConfigProvider
      wave={{ disabled: true }}
      theme={{
        algorithm:
          normalizedMode === "dark"
            ? AntdTheme.darkAlgorithm
            : AntdTheme.defaultAlgorithm,
        token: {
          fontFamily: "",
          colorBgBase: bgColor,
          colorTextBase: textColor,
          colorBgContainer: bgColor,
          colorText: textColor,
        },
        components: {
          List: { fontFamily: "" },
          Menu: {
            itemHeight: 24,
            itemHoverBg: "#fff",
            itemSelectedColor: "",
            itemHoverColor: "",
            itemBg: "#fff",
            itemSelectedBg: "#eee",
            itemActiveBg: "transparent",
          },
          Form: {
            labelFontSize: 12,
            labelColor: "#585858",
          },
          Radio: {
            colorBorder: "none",
          },
          DatePicker: {
            colorPrimary: "#B1B1B1",
            colorPrimaryActive: "#B1B1B1",
          },
          Switch: {
            handleShadow: "none",
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

export const themePalette = (
  mode: "dark" | "light"
): { textColor: string; bgColor: string } => {
  switch (mode) {
    case "light":
      return {
        textColor: "#000",
        bgColor: "#fff",
      };
    case "dark":
      return {
        textColor: "#fff",
        bgColor: "#141414",
      };
    default:
      return {
        textColor: "#000",
        bgColor: "#fff",
      };
  }
};
