import type { IIconConfig } from '../type';

export const AddGallery = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "40"}
      height={config?.height ? `${config.height}` : "40"}
      viewBox="0 0 40 40"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <path
        d="M36.6663 19.9999C36.6663 27.8567 36.6663 31.785 34.2256 34.2258C31.7848 36.6666 27.8564 36.6666 19.9997 36.6666C12.1429 36.6666 8.21456 36.6666 5.77378 34.2258C3.33301 31.785 3.33301 27.8567 3.33301 19.9999C3.33301 12.1432 3.33301 8.21481 5.77378 5.77403C8.21456 3.33325 12.1429 3.33325 19.9997 3.33325"
        className={
          !config?.stroke ? "stroke-gray-gray7 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        opacity="0.5"
        d="M3.33301 20.8332L6.25232 18.2788C7.7711 16.9499 10.0601 17.0261 11.4871 18.4531L18.6367 25.6026C19.7821 26.748 21.5851 26.9042 22.9103 25.9728L23.4073 25.6235C25.3144 24.2833 27.8946 24.4386 29.6271 25.9979L34.9997 30.8332"
        className={
          !config?.stroke ? "stroke-gray-gray7 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M25 9.16659H30.8333M30.8333 9.16659H36.6667M30.8333 9.16659V14.9999M30.8333 9.16659V3.33325"
        className={
          !config?.stroke ? "stroke-gray-gray7 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
