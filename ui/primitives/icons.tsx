import React from 'react';

export type IconConfig = {
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
};

type IconProps = {
  config?: IconConfig;
  className?: string;
};

function strokeClass(config?: IconConfig) {
  return !config?.stroke ? 'stroke-gray-gray10' : undefined;
}

export function PlusIcon({ config, className }: IconProps) {
  return (
    <svg
      className={className}
      width={config?.width ?? 18}
      height={config?.height ?? 18}
      viewBox="0 0 60 60"
      fill="none"
      aria-hidden
    >
      <path
        className={strokeClass(config)}
        d="M30 44.9996L30 29.1157M30 29.1157C30 29.1157 30 14.9996 29.9999 13.9996M30 29.1157L46 29.1157M30 29.1157L14 29.1157"
        stroke={config?.stroke}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GuaranteeReceive({ config, className }: IconProps) {
  return (
    <svg
      className={className}
      width={config?.width ?? 18}
      height={config?.height ?? 18}
      viewBox="0 0 20 20"
      fill={config?.fill ?? 'none'}
      aria-hidden
    >
      <path
        d="M10.8327 2.50072C10.7531 2.5 10.6638 2.5 10.5616 2.5H6.83285C5.89942 2.5 5.43237 2.5 5.07585 2.68166C4.76224 2.84144 4.50746 3.09623 4.34767 3.40983C4.16602 3.76635 4.16602 4.23341 4.16602 5.16683V14.8335C4.16602 15.7669 4.16602 16.2334 4.34767 16.5899C4.50746 16.9035 4.76224 17.1587 5.07585 17.3185C5.43202 17.5 5.89852 17.5 6.83013 17.5L13.1686 17.5C14.1002 17.5 14.566 17.5 14.9222 17.3185C15.2358 17.1587 15.4914 16.9035 15.6512 16.5899C15.8327 16.2337 15.8327 15.7679 15.8327 14.8363V7.7714C15.8327 7.66913 15.8327 7.57967 15.8319 7.5M10.8327 2.50072C11.0707 2.50289 11.2213 2.51154 11.3651 2.54605C11.5351 2.58688 11.6976 2.65439 11.8467 2.74577C12.0148 2.8488 12.1592 2.99318 12.4473 3.28125L15.0518 5.88582C15.3401 6.17407 15.4834 6.3178 15.5865 6.48599C15.6779 6.63512 15.7455 6.79771 15.7863 6.96777C15.8208 7.11147 15.8296 7.26209 15.8319 7.5M10.8327 2.50072V4.83333C10.8327 5.76675 10.8327 6.23314 11.0143 6.58966C11.1741 6.90326 11.4289 7.15873 11.7425 7.31852C12.0987 7.5 12.5652 7.5 13.4968 7.5H15.8319M15.8319 7.5H15.8328"
        className={strokeClass(config)}
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CutIcon({ config, className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ?? 18}
      height={config?.height ?? 18}
      viewBox="0 0 32 32"
      fill={config?.fill ?? 'none'}
      aria-hidden
    >
      <path
        d="M5.75 17.531h-.125c-1.313 0-2.719.625-3.781 1.656-1.094 1-1.844 2.344-1.844 3.688 0 1.531 1.094 2.469 2.594 2.469 1.281 0 2.719-.656 3.813-1.656 1.063-1.031 1.813-2.344 1.813-3.688 0-.156 0-.375-.031-.531l1-.875 9.813 5.031c.156.063.313.125.469.125.219 0 .625-.125 1.063-.188.406-.094.844-.188 1.094-.219.438-.063.781-.469.781-.906 0-.313-.156-.594-.438-.781l-8.156-5.656 8.156-5.656c.281-.188.438-.469.438-.781 0-.438-.344-.875-.781-.938-.125 0-.281-.031-.469-.094-.375-.094-.875-.156-1.25-.219s-.656-.063-.906.063c-.063.031-.25.125-.594.281-.313.156-.719.375-1.188.625s-1 .5-1.563.813c-.563.281-1.219.594-1.781.906-1.188.594-2.344 1.188-3.219 1.625-.438.219-.813.438-1.094.563-.25.125-.375.219-.375.219l-1-.906c.031-.156.031-.344.031-.5 0-1.344-.75-2.688-1.813-3.688-1.094-1-2.531-1.656-3.813-1.656-1.5 0-2.594.938-2.594 2.469 0 1.313.75 2.656 1.875 3.688 1.125 1.063 2.563 1.75 3.875 1.656.125.188.406.438.688.688s.531.531.719.719v.25c-.188.188-.406.406-.719.688-.281.25-.531.531-.688.719zM2.313 9.125v-.094c.094-.031.188-.031.281-.031.75 0 1.563.469 2.094.906.25.219.563.594.781.969.25.375.469.813.469 1.156v.063c-.156.031-.25.031-.313.031-.75 0-1.5-.469-2.063-.938-.219-.219-.563-.531-.813-.906s-.438-.813-.438-1.156zM6.844 17.75l1.281-1.25-.063-1.5 11.406-5.813 2 .375-11.875 8.188-.531-.281-1.25 1.125c-.219-.344-.563-.625-.969-.844zM7.25 14.625l-.406-.438c.406-.156.75-.438.969-.781l.5.438c-.469.219-.875.344-1.063.781zM8.688 16c0 .5.406.906.906.906.531 0 .938-.406.938-.906 0-.531-.406-.938-.906-.938-.563 0-.938.406-.938.938zM10.563 18.219l2.406-1.656 8.5 5.875-2 .375zM2.344 22.875c0-.688.469-1.469 1.156-2.031s1.5-1 2.125-1c.094 0 .188.031.25.031v.063c.031 0 .031.031.031.063 0 .688-.469 1.438-1.156 2s-1.469 1-2.156 1h-.125c-.031-.031-.063-.031-.125-.031v-.094z"
        className={!config?.fill ? 'fill-gray-gray8' : undefined}
        fill={config?.fill}
      />
    </svg>
  );
}

export function ClipboardIcon({ config, className }: IconProps) {
  return (
    <svg
      className={className}
      width={config?.width ?? 18}
      height={config?.height ?? 18}
      viewBox="0 0 20 20"
      fill={config?.fill ?? 'none'}
      aria-hidden
    >
      <path
        className={strokeClass(config)}
        d="M13.3333 3.33594C15.1459 3.34603 16.1274 3.4264 16.7678 4.06672C17.5 4.79896 17.5 5.97747 17.5 8.33449V13.3345C17.5 15.6915 17.5 16.87 16.7678 17.6023C16.0355 18.3345 14.857 18.3345 12.5 18.3345H7.5C5.14298 18.3345 3.96447 18.3345 3.23223 17.6023C2.5 16.87 2.5 15.6915 2.5 13.3345V8.33449C2.5 5.97747 2.5 4.79896 3.23223 4.06672C3.87255 3.4264 4.85414 3.34603 6.66667 3.33594"
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
      <path
        className={strokeClass(config)}
        d="M6.66797 11.668H13.3346"
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        className={strokeClass(config)}
        d="M5.83203 8.75H14.1654"
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        className={strokeClass(config)}
        d="M7.5 14.582H12.5"
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        className={strokeClass(config)}
        d="M6.66797 2.91797C6.66797 2.22761 7.22761 1.66797 7.91797 1.66797H12.0846C12.775 1.66797 13.3346 2.22761 13.3346 2.91797V3.7513C13.3346 4.44166 12.775 5.0013 12.0846 5.0013H7.91797C7.22761 5.0013 6.66797 4.44166 6.66797 3.7513V2.91797Z"
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function ClipboardCheck({ config, className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ?? 18}
      height={config?.height ?? 18}
      viewBox="0 0 52 52"
      fill={config?.fill ?? 'none'}
      aria-hidden
    >
      <path
        d="M44 2.5H19C16.4 2.5 14.3 4.6 14.3 7.2V8C14.3 8.5 14.6 8.8 15.1 8.8H37.8C40.4 8.8 42.5 10.9 42.5 13.5V37.8C42.5 38.3 42.8 38.6 43.3 38.6H44C46.6 38.6 48.7 36.5 48.7 33.9V7.2C48.7 4.6 46.6 2.5 44 2.5Z"
        className={strokeClass(config)}
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M33 13.5H8C5.4 13.5 3.3 15.6 3.3 18.2V44.8C3.3 47.4 5.4 49.5 8 49.5H33C35.6 49.5 37.8 47.4 37.8 44.8V18.2C37.8 15.6 35.6 13.5 33 13.5ZM31 26.8L19 38.8C18.5 39.3 18 39.5 17.4 39.5C16.9 39.5 16.2 39.3 15.8 38.8L10 33C9.5 32.5 9.5 31.8 10 31.4L11.6 29.8C12.1 29.3 12.8 29.3 13.2 29.8L17.4 34L27.7 23.7C28.2 23.2 28.9 23.2 29.3 23.7L30.9 25.3C31.4 25.6 31.4 26.4 31 26.8Z"
        className={strokeClass(config)}
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#000"
      />
    </svg>
  );
}

export function TrashBin({ config, className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ?? 18}
      height={config?.height ?? 18}
      viewBox="0 0 18 18"
      fill={config?.fill ?? 'none'}
      aria-hidden
    >
      <path
        d="M15.3751 4.5H2.625"
        className={strokeClass(config)}
        stroke={config?.stroke}
        strokeLinecap="round"
      />
      <path
        d="M14.125 6.375L13.78 11.5493C13.6473 13.5405 13.5809 14.5361 12.9322 15.1431C12.2834 15.75 11.2856 15.75 9.29001 15.75H8.70999C6.71439 15.75 5.71659 15.75 5.06783 15.1431C4.41907 14.5361 4.3527 13.5405 4.21996 11.5493L3.875 6.375"
        className={strokeClass(config)}
        stroke={config?.stroke}
        strokeLinecap="round"
      />
      <path
        opacity="0.5"
        d="M4.875 4.5C4.91691 4.5 4.93786 4.5 4.95686 4.49952C5.57444 4.48387 6.11927 4.09118 6.32941 3.51024C6.33588 3.49237 6.3425 3.47249 6.35576 3.43273L6.42857 3.21429C6.49073 3.02781 6.52181 2.93457 6.56304 2.8554C6.72751 2.53955 7.03181 2.32023 7.38346 2.26407C7.4716 2.25 7.56988 2.25 7.76645 2.25H10.2336C10.4301 2.25 10.5284 2.25 10.6165 2.26407C10.9682 2.32023 11.2725 2.53955 11.437 2.8554C11.4782 2.93457 11.5093 3.02781 11.5714 3.21429L11.6442 3.43273C11.6575 3.47244 11.6641 3.49238 11.6706 3.51024C11.8807 4.09118 12.4256 4.48387 13.0431 4.49952C13.0621 4.5 13.0831 4.5 13.125 4.5"
        className={strokeClass(config)}
        stroke={config?.stroke}
      />
    </svg>
  );
}

export function RedTrashBin({ config, className }: IconProps) {
  return (
    <svg
      className={className}
      width={config?.width ?? 18}
      height={config?.height ?? 18}
      viewBox="0 0 30 30"
      fill={config?.fill ?? 'none'}
      aria-hidden
    >
      <path
        d="M17.5 12.5V21.25M12.5 12.5V21.25M7.5 7.5V22.25C7.5 23.6501 7.5 24.3497 7.77248 24.8845C8.01217 25.3549 8.39434 25.7381 8.86475 25.9778C9.399 26.25 10.0987 26.25 11.4961 26.25H18.5039C19.9013 26.25 20.6 26.25 21.1342 25.9778C21.6046 25.7381 21.9881 25.3549 22.2278 24.8845C22.5 24.3502 22.5 23.6513 22.5 22.2539V7.5M7.5 7.5H10M7.5 7.5H5M10 7.5H20M10 7.5C10 6.33515 10 5.75301 10.1903 5.29358C10.444 4.68101 10.9304 4.19404 11.543 3.9403C12.0024 3.75 12.5851 3.75 13.75 3.75H16.25C17.4149 3.75 17.9973 3.75 18.4567 3.9403C19.0693 4.19404 19.5558 4.68101 19.8096 5.29358C19.9999 5.75301 20 6.33515 20 7.5M20 7.5H22.5M22.5 7.5H25"
        stroke={config?.stroke ?? '#DC3545'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Layers({ config, className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ?? 18}
      height={config?.height ?? 18}
      viewBox="0 0 30 30"
      fill={config?.fill ?? 'none'}
      aria-hidden
    >
      <path
        d="M26.25 15L15 22.5L3.75 15M26.25 20L15 27.5L3.75 20M26.25 10L15 17.5L3.75 10L15 2.5L26.25 10Z"
        className={strokeClass(config)}
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PdfIcon({ config, className }: IconProps) {
  const width = config?.width ?? 18;
  const height = config?.height ?? 18;
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <rect x="4" y="2.5" width="16" height="19" rx="2" fill={config?.fill ?? '#b91c1c'} />
      <path
        d="M8 15.2V8.8h1.7c1.15 0 1.85.62 1.85 1.55 0 .92-.7 1.52-1.85 1.52H9.15v3.33H8Zm1.15-4.4h.5c.52 0 .82-.28.82-.68 0-.4-.3-.67-.82-.67h-.5v1.35Zm4.05 4.4V8.8h2.35c1.55 0 2.5.88 2.5 2.2 0 1.33-.95 2.22-2.5 2.22h-1.2v1.98h-1.15Zm1.15-3.05h1.1c.72 0 1.18-.4 1.18-1.05 0-.66-.46-1.04-1.18-1.04h-1.1v2.09Z"
        fill="#fff"
      />
    </svg>
  );
}

export function Excel({ config, className }: IconProps) {
  const width = config?.width ?? 18;
  const height = config?.height ?? 18;
  const fill = config?.fill ?? '#585858';
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
    >
      <path
        d="M28.8 4.4H18.7V2L2 4.6v22.5l16.7 2.9v-3.6h10.1a1.2 1.2 0 0 0 1.2-1.1V5.5a1.2 1.2 0 0 0-1.2-1.1zm.1 21.1H18.6v-1.9h2.5v-2.2h-2.5v-1.3h2.5v-2.2h-2.5v-1.3h2.5v-2.2h-2.5v-1.3h2.5v-2.2h-2.5v-1.3h2.5v-2.2h-2.5v-2h10.3zM22.5 7.4h4.3v2.2h-4.3zm0 3.5h4.3v2.2h-4.3zm0 3.5h4.3v2.2h-4.3zm0 3.5h4.3v2.2h-4.3zm0 3.5h4.3v2.2h-4.3z"
        fill={fill}
        fillRule="evenodd"
      />
      <path
        d="M6.3 10.7l2.2-.1 1.3 3.7 1.6-3.9 2.2-.1-2.6 5.2 2.6 5.3-2.3-.2-1.5-4-1.5 3.9-2.1-.2 2.4-4.6z"
        fill="#585858"
      />
    </svg>
  );
}

export function ExcelImport({ config, className }: IconProps) {
  const width = config?.width ?? 18;
  const height = config?.height ?? 18;
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <rect x="3" y="2.5" width="18" height="19" rx="2" fill={config?.fill ?? '#217346'} />
      <path
        d="M12 7v7.5M8.8 12.2 12 15.4l3.2-3.2M7.5 17.5h9"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SpinIcon({ config, className }: IconProps) {
  return (
    <svg
      className={className}
      width={config?.width ?? 18}
      height={config?.height ?? 18}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        fill={config?.fill}
        className={!config?.fill ? 'fill-gray-gray6' : undefined}
        d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
        opacity=".25"
      />
      <path
        fill={config?.fill}
        className={!config?.fill ? 'fill-gray-gray7' : undefined}
        d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          dur="0.75s"
          values="0 12 12;360 12 12"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

export function Magnifier({ config, className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ?? 18}
      height={config?.height ?? 18}
      viewBox="0 0 18 18"
      fill={config?.fill ?? 'none'}
      aria-hidden
    >
      <circle
        cx="8.625"
        cy="8.625"
        r="7.125"
        className={strokeClass(config)}
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
      <path
        d="M13.875 13.875L16.5 16.5"
        className={strokeClass(config)}
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LeftChevron({ config, className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ?? 18}
      height={config?.height ?? 18}
      viewBox="0 0 24 24"
      fill={config?.fill ?? 'none'}
      aria-hidden
    >
      <path
        d="M14 16L10 12L14 8"
        className={strokeClass(config)}
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RightChevron({ config, className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ?? 18}
      height={config?.height ?? 18}
      viewBox="0 0 24 24"
      fill={config?.fill ?? 'none'}
      aria-hidden
    >
      <path
        d="M10 8L14 12L10 16"
        className={strokeClass(config)}
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function InfoIcon({ config, className }: IconProps) {
  return (
    <svg
      className={className}
      width={config?.width ?? 18}
      height={config?.height ?? 18}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 11V16M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21ZM12.0498 8V8.1L11.9502 8.1002V8H12.0498Z"
        stroke={config?.stroke ?? '#086EDC'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NoData({ config, className }: IconProps) {
  return (
    <svg
      className={className}
      width={config?.width ?? 60}
      height={config?.height ?? 60}
      viewBox="0 0 145 145"
      fill={config?.fill ?? 'none'}
      aria-hidden
    >
      <path
        d="M103.121 123.752L91.725 112.357M89.378 20.631C88.721 20.625 87.982 20.625 87.139 20.625H56.376C48.676 20.625 44.822 20.625 41.881 22.124C39.294 23.442 37.192 25.544 35.874 28.131C34.375 31.072 34.375 34.926 34.375 42.626V122.376C34.375 130.077 34.375 133.925 35.874 136.867C37.192 139.454 39.294 141.56 41.881 142.878C44.819 144.375 48.668 144.375 56.354 144.375L108.646 144.375C116.332 144.375 120.175 144.375 123.113 142.878C125.701 141.56 127.81 139.454 129.128 136.867C130.625 133.928 130.625 130.085 130.625 122.4V64.114C130.625 63.271 130.624 62.532 130.618 61.875M89.378 20.631C91.34 20.649 92.577 20.722 93.763 21.006C95.165 21.343 96.51 21.899 97.74 22.653C99.128 23.503 100.319 24.694 102.695 27.07L124.183 48.558C126.561 50.936 127.743 52.122 128.594 53.51C129.348 54.74 129.905 56.081 130.242 57.484C130.527 58.67 130.6 59.913 130.618 61.875M89.378 20.631L89.375 39.876C89.375 47.577 89.375 51.426 90.874 54.367C92.192 56.955 94.294 59.059 96.881 60.378C99.82 61.875 103.668 61.875 111.354 61.875H130.618M79.063 116.875C69.57 116.875 61.875 109.18 61.875 99.688C61.875 90.195 69.57 82.5 79.063 82.5C88.555 82.5 96.25 90.195 96.25 99.688C96.25 109.18 88.555 116.875 79.063 116.875Z"
        className={!config?.stroke ? 'stroke-gray-gray6' : undefined}
        stroke={config?.stroke}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M84.5 105.5L79 100M79 100L73.5 94.5M79 100L84.5 94.5M79 100L73.5 105.5"
        className={!config?.stroke ? 'stroke-gray-gray85' : undefined}
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DragIcon({ config, className }: IconProps) {
  return (
    <svg
      className={className}
      width={config?.width ?? 16}
      height={config?.height ?? 16}
      viewBox="0 0 21 22"
      fill={config?.fill ?? 'none'}
      aria-hidden
    >
      <path d="M10.5 2L10.5 20" className={strokeClass(config)} stroke={config?.stroke} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 2L14 5" className={strokeClass(config)} stroke={config?.stroke} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M1 11L4 14" className={strokeClass(config)} stroke={config?.stroke} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17 8L20 11" className={strokeClass(config)} stroke={config?.stroke} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 17L10 20" className={strokeClass(config)} stroke={config?.stroke} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 2L7 5" className={strokeClass(config)} stroke={config?.stroke} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 17L11 20" className={strokeClass(config)} stroke={config?.stroke} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 11L17 14" className={strokeClass(config)} stroke={config?.stroke} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 8L1 11" className={strokeClass(config)} stroke={config?.stroke} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M1 11L20 11" className={strokeClass(config)} stroke={config?.stroke} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Expand({ config, className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ?? 18}
      height={config?.height ?? 18}
      viewBox="0 0 24 24"
      fill={config?.fill ?? 'none'}
      aria-hidden
    >
      <path
        d="M10 19H5V14M14 5H19V10"
        className={strokeClass(config)}
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Undo({ config, className }: IconProps) {
  return (
    <svg
      className={className}
      width={config?.width ?? 18}
      height={config?.height ?? 18}
      viewBox="0 0 24 24"
      fill={config?.fill ?? 'none'}
      aria-hidden
    >
      <path
        d="M10 8H5V3M5.29102 16.3569C6.22284 17.7918 7.59014 18.8902 9.19218 19.4907C10.7942 20.0913 12.547 20.1624 14.1925 19.6937C15.8379 19.225 17.2893 18.2413 18.3344 16.8867C19.3795 15.5321 19.963 13.878 19.9989 12.1675C20.0347 10.4569 19.5211 8.78001 18.5337 7.38281C17.5462 5.98561 16.1366 4.942 14.5122 4.40479C12.8878 3.86757 11.1341 3.86499 9.5083 4.39795C7.88252 4.93091 6.47059 5.97095 5.47949 7.36556"
        className={strokeClass(config)}
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Dots({ config, className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ?? 18}
      height={config?.height ?? 18}
      viewBox="0 0 24 24"
      fill={config?.fill ?? 'none'}
      aria-hidden
    >
      <path
        d="M11 18C11 18.5523 11.4477 19 12 19C12.5523 19 13 18.5523 13 18C13 17.4477 12.5523 17 12 17C11.4477 17 11 17.4477 11 18Z"
        className={!config?.fill ? 'fill-gray-gray10' : undefined}
        fill={config?.fill}
      />
      <path
        d="M11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12Z"
        className={!config?.fill ? 'fill-gray-gray10' : undefined}
        fill={config?.fill}
      />
      <path
        d="M11 6C11 6.55228 11.4477 7 12 7C12.5523 7 13 6.55228 13 6C13 5.44772 12.5523 5 12 5C11.4477 5 11 5.44772 11 6Z"
        className={!config?.fill ? 'fill-gray-gray10' : undefined}
        fill={config?.fill}
      />
      <path
        d="M11 18C11 18.5523 11.4477 19 12 19C12.5523 19 13 18.5523 13 18C13 17.4477 12.5523 17 12 17C11.4477 17 11 17.4477 11 18Z"
        className={strokeClass(config)}
        stroke={config?.stroke}
        strokeWidth="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12Z"
        className={strokeClass(config)}
        stroke={config?.stroke}
        strokeWidth="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 6C11 6.55228 11.4477 7 12 7C12.5523 7 13 6.55228 13 6C13 5.44772 12.5523 5 12 5C11.4477 5 11 5.44772 11 6Z"
        className={strokeClass(config)}
        stroke={config?.stroke}
        strokeWidth="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SavePlus({ config, className }: IconProps) {
  return (
    <svg
      className={className}
      width={config?.width ?? 18}
      height={config?.height ?? 18}
      viewBox="0 0 24 24"
      fill={config?.fill ?? 'none'}
      aria-hidden
    >
      <path
        d="M17 21.0002L7 21M17 21.0002L17.8031 21C18.921 21 19.48 21 19.9074 20.7822C20.2837 20.5905 20.5905 20.2843 20.7822 19.908C21 19.4806 21 18.921 21 17.8031V9.21955C21 8.77072 21 8.54521 20.9521 8.33105C20.9095 8.14 20.8393 7.95652 20.7432 7.78595C20.6366 7.59674 20.487 7.43055 20.1929 7.10378L17.4377 4.04241C17.0969 3.66374 16.9242 3.47181 16.7168 3.33398C16.5303 3.21 16.3242 3.11858 16.1073 3.06287C15.8625 3 15.5998 3 15.075 3H6.2002C5.08009 3 4.51962 3 4.0918 3.21799C3.71547 3.40973 3.40973 3.71547 3.21799 4.0918C3 4.51962 3 5.08009 3 6.2002V17.8002C3 18.9203 3 19.4796 3.21799 19.9074C3.40973 20.2837 3.71547 20.5905 4.0918 20.7822C4.5192 21 5.07899 21 6.19691 21H7M17 21.0002V17.1969C17 16.079 17 15.5192 16.7822 15.0918C16.5905 14.7155 16.2837 14.4097 15.9074 14.218C15.4796 14 14.9203 14 13.8002 14H10.2002C9.08009 14 8.51962 14 8.0918 14.218C7.71547 14.4097 7.40973 14.7155 7.21799 15.0918C7 15.5196 7 16.0801 7 17.2002V21M15 7H9"
        className={strokeClass(config)}
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="18.5"
        cy="18.5"
        r="4.75"
        stroke={config?.stroke}
        fill={config?.fill}
        className={!config?.stroke && !config?.fill ? 'fill-white stroke-gray-gray3' : undefined}
        strokeWidth="1.5"
      />
      <path
        d="M18.5 20.7498L18.5 18.3673M18.5 18.3673C18.5 18.3673 18.5 16.2498 18.5 16.0998M18.5 18.3673L20.9 18.3673M18.5 18.3673L16.1 18.3673"
        className={strokeClass(config)}
        stroke={config?.stroke}
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Reload({ config, className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ?? 16}
      height={config?.height ?? 16}
      viewBox="0 0 24 24"
      fill={config?.fill ?? 'none'}
      aria-hidden
    >
      <path
        d="M10 16H5V21M14 8H19V3M4.58301 9.0034C5.14369 7.61566 6.08244 6.41304 7.29255 5.53223C8.50266 4.65141 9.93686 4.12752 11.4298 4.02051C12.9227 3.9135 14.4147 4.2274 15.7381 4.92661C17.0615 5.62582 18.1612 6.68254 18.9141 7.97612M19.4176 14.9971C18.8569 16.3848 17.9181 17.5874 16.708 18.4682C15.4979 19.3491 14.0652 19.8723 12.5723 19.9793C11.0794 20.0863 9.58606 19.7725 8.2627 19.0732C6.93933 18.374 5.83882 17.3175 5.08594 16.0239"
        className={strokeClass(config)}
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MoonIcon({ config, className }: IconProps) {
  return (
    <svg
      className={className}
      width={config?.width ?? 18}
      height={config?.height ?? 18}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        className={strokeClass(config)}
        d="M21 14.3A8.5 8.5 0 0 1 9.7 3 7.5 7.5 0 1 0 21 14.3Z"
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SunIcon({ config, className }: IconProps) {
  return (
    <svg
      className={className}
      width={config?.width ?? 18}
      height={config?.height ?? 18}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className={strokeClass(config)}
        cx="12"
        cy="12"
        r="4"
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
      <path
        className={strokeClass(config)}
        d="M12 3v1.5M12 19.5V21M4.93 4.93l1.06 1.06M17.99 17.99l1.06 1.06M3 12h1.5M19.5 12H21M4.93 19.07l1.06-1.06M17.99 6.01l1.06-1.06"
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function EditPencil({ config, className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ?? 16}
      height={config?.height ?? 16}
      viewBox="0 0 20 20"
      fill={config?.fill ?? 'none'}
      aria-hidden
    >
      <path
        d="M3.3335 16.6668H16.6668M3.3335 16.6668V13.3334L10.0002 6.66676M3.3335 16.6668L6.66683 16.6667L13.3335 10.0001M10.0002 6.66676L12.3907 4.27622L12.3921 4.2748C12.7212 3.94573 12.886 3.7809 13.076 3.71917C13.2434 3.66479 13.4237 3.66479 13.5911 3.71917C13.7809 3.78086 13.9456 3.9455 14.2742 4.2741L15.724 5.72393C16.054 6.05394 16.2191 6.21903 16.2809 6.4093C16.3353 6.57667 16.3353 6.75696 16.2809 6.92433C16.2191 7.11447 16.0543 7.2793 15.7247 7.60884L15.724 7.60955L13.3335 10.0001M10.0002 6.66676L13.3335 10.0001"
        className={strokeClass(config)}
        stroke={config?.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
