import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const defaultTheme = require("tailwindcss/defaultTheme");
const config: Config = {
  //   corePlugins: {
  //     preflight: false
  // },
  darkMode: ["class", '[data-theme="dark"]'], // حالت ترکیبی
  content: [
    "./app/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./layout/*/*.{js,ts,jsx,tsx,mdx}",
    "./layout/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      en: ["Poppins", "sans-serif"],
      IRANSans: ["IRANSans"],
      // Bold: ["Bold"],
      // Medium: ["Medium"],
      // Light: ["Light"],
      Yekan: ["Yekan"],
      Arimo: ["Arimo"],
      BaiJamjuree: ["BaiJamjuree"],
    },
    extend: {
      aspectRatio: {
        "3/4": "3/4",
      },
      screens: {
        xs: "431px",
        s: "576px",
        xxl: "1366px",
      },
      fontSize: {
        "3xs": "8px",
        "2xs": "10px",
        md: "16px",
      },
      boxShadow: {
        toast: "0px 0px 16px rgba(0, 0, 0, 0.1)",
      },
      colors: {
        darkHover: "#00000021",
        primary: "#00337c",
        secondary: "#ecc94b",
        customColor900: "#aee34a",
        num1: "#DFDFDF",
        num2: "#F1F1F1",
        num3: "#F2F2F2",
        scrollbar: "#D9D9D9",
        scrollbarBg: "#ECEDF2",
        border1: "#E6EFF5",
        closeBtn: "#807E7E",
        plusBtn: "#B5C0E2",
        arrowBtn: "#1E398C",
        redBadge: "#DC3545",
        custom: "rgb(var(--color-primary) / <alpha-value>)",
        // num4: '#9EC8B9',
        // saveBadge: '#ECFEF0',
        test: {
          num1: "rgb(var(--color-test-1) / <alpha-value>)",
          num2: "rgb(var(--color-test-2) / <alpha-value>)",
        },
        main: {
          black: "#0e0e0e",
          white: "#fff",
        },
        gray: {
          gray0: "#FFFFFF",
          gray05: "#FDFDFD",
          gray1: "#FBFBFB",
          gray15: "#F9F9F9",
          gray2: "#F7F7F7",
          gray3: "#F4F4F4 ",
          gray4: "#F0F0F0",
          gray5: "#ECECEC",
          gray55: "#D9D9D9",
          gray6: "#CECECE",
          gray7: "#B1B1B1",
          gray8: "#939393",
          gray85: "#848484",
          gray9: "#767676",
          gray95: "#676767",
          gray10: "#585858",
          gray54: "#545454",
          gray11: "#515151",
          gray12: "#333333",
          gray13: "#292929",
          gray135: "#6E6E6E",
        },
        black: {
          black0: "#C7C7C7",
          black05: "#B8B8B8",
          black1: "#A9A9A9",
          black15: "#9B9B9B",
          black2: "#8C8C8C",
          black3: "#6E6E6E",
          black4: "#515151",
          black5: "#333333",
          black6: "#292929",
          black7: "#1F1F1F",
          black8: "#141414",
          black9: "#0A0A0A",
          black95: "#050505",
        },
        blue: {
          blue0: "#FFFFFF",
          blue05: "#E6F1FC",
          blue005: "#E6F0FB",
          blue1: "#CEE2F8",
          blue10: "#F1F8FF",
          blue11: "#DDECFD",
          blue15: "#B5D4F5",
          blue2: "#9CC5F1",
          blue3: "#6BA8EA ",
          blue4: "#398BE3",
          blue5: "#086EDC",
          blue6: "#0658B0",
          blue7: "#054284",
          blue8: "#032C58",
          blue9: "#02162C",
          blue95: "#010B16",
          blue: "#045DAF",
          blue19: "#A2AFD7",
          button: "#025099",
        },
        purple: {
          purple0: "#F4DBFB",
          purple05: "#E8C7F1",
          purple1: "#DCB3E8",
          purple15: "#D19FDE",
          purple2: "#C58BD5",
          purple3: "#AD63C1 ",
          purple4: "#963BAE",
          purple5: "#7E139B",
          purple6: "#650F7C",
          purple7: "#4C0B5D",
          purple8: "#32083E",
          purple85: "#26062F",
          purple9: "#19041F",
          purple95: "#0D0210",
        },
        state: {
          success1: "#2c8440",
          success2: "#e8f4e6",
          success3: "#32bc52",
          error1: "#dc3545",
          error4: "#D9878E",
          error7: "#f9e5e7",
          error8: "#b95f66",
          warning2: "#FFF4CD",
        },
        logo: {
          green6: "#288e3a",
        },
      },
      borderRadius: {
        xxl: "20px",
      },
      text: {
        primary: "#6E6E6E",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        rotate: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(-360deg)" },
        },
        scan: {
          "0%": { top: "0%" },
          "100%": { top: "100%" },
        },
      },
      animation: {
        fadeIn: "fadeIn 2s linear ",
        rotate: "rotate 1s ease-in-out infinite",
        scan: "scan 7s ease-in-out infinite",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".hidden-show-scrollbar": {
          "scrollbar-width": "none" /* Firefox */,
          "-ms-overflow-style": "none" /* IE 10+ */,
        },
        ".hidden-show-scrollbar::-webkit-scrollbar": {
          display: "none" /* Chrome, Safari */,
        },
        ".hidden-show-scrollbar:hover::-webkit-scrollbar": {
          display: "block",
        },
      });
    }),
  ],
};
export default config;
//////////////////////////////////////////////////////////////////////////
// module.exports = {
//   content: [
//     "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
//   ],
//   theme: {
//     extend: {
//       aspectRatio: {
//         '3/4': '3/4',
//       },
//       screens: {
//         'xs': '430px',
//       },
//       backgroundImage: {
//         "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
//         "gradient-conic":
//           "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
//       },
//       colors: {
//         num1: '#092635',
//         num2: '#1B4242',
//         num3: '#5C8374',
//         num4: '#9EC8B9',
//       },
//       keyframes: {
//         popup: {
//           '0%': {
//             transform: 'scale(1, 1)'
//           },
//           '10%': {
//             transform: 'scale(1.1, 1.1)'
//           },
//           '30%': {
//             transform: 'scale(.9,.9)'
//           },
//           '50%': {
//             transform: 'scale(1, 1)'
//           },
//           '57%': {
//             transform: 'scale(1, 1)'
//           },
//           '64%': {
//             transform: 'scale(1, 1)'
//           },
//           '100%': {
//             transform: 'scale(1, 1)'
//           },
//         }
//       },
//       animation: {
//         popup: 'popup 1s linear infinite'
//       }
//     },
//   },
//   plugins: [require("daisyui")],
// };
