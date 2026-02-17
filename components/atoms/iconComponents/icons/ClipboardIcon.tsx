import type { IIconConfig } from "../type";

export const ClipboardIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        d="M13.3333 3.33594C15.1459 3.34603 16.1274 3.4264 16.7678 4.06672C17.5 4.79896 17.5 5.97747 17.5 8.33449V13.3345C17.5 15.6915 17.5 16.87 16.7678 17.6023C16.0355 18.3345 14.857 18.3345 12.5 18.3345H7.5C5.14298 18.3345 3.96447 18.3345 3.23223 17.6023C2.5 16.87 2.5 15.6915 2.5 13.3345V8.33449C2.5 5.97747 2.5 4.79896 3.23223 4.06672C3.87255 3.4264 4.85414 3.34603 6.66667 3.33594"
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
      <path
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        d="M6.66797 11.668H13.3346"
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        d="M5.83203 8.75H14.1654"
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        d="M7.5 14.582H12.5"
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        d="M6.66797 2.91797C6.66797 2.22761 7.22761 1.66797 7.91797 1.66797H12.0846C12.775 1.66797 13.3346 2.22761 13.3346 2.91797V3.7513C13.3346 4.44166 12.775 5.0013 12.0846 5.0013H7.91797C7.22761 5.0013 6.66797 4.44166 6.66797 3.7513V2.91797Z"
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
    </svg>
  );
};
