import type { IIconConfig } from '../type';

export const UploadMarker = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 40 40"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M36.6668 20.0002C36.6668 27.8569 36.6668 31.7853 34.2261 34.2261C31.7853 36.6668 27.8569 36.6668 20.0002 36.6668C12.1434 36.6668 8.21505 36.6668 5.77427 34.2261C3.3335 31.7853 3.3335 27.8569 3.3335 20.0002C3.3335 12.1434 3.3335 8.21505 5.77427 5.77427C8.21505 3.3335 12.1434 3.3335 20.0002 3.3335"
        className={
          !config?.stroke ? "stroke-gray-gray7  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        opacity="0.5"
        d="M3.3335 20.8329L6.25281 18.2785C7.77159 16.9496 10.0606 17.0258 11.4876 18.4528L18.6372 25.6024C19.7826 26.7478 21.5856 26.9039 22.9108 25.9726L23.4078 25.6233C25.3149 24.283 27.8951 24.4383 29.6276 25.9976L35.0002 30.8329"
        className={
          !config?.stroke ? "stroke-gray-gray7  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M25 9.16683H30.8333M30.8333 9.16683H36.6667M30.8333 9.16683V15.0002M30.8333 9.16683V3.3335"
        className={
          !config?.stroke ? "stroke-gray-gray7  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
