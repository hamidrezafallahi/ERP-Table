import type { IIconConfig } from '../type';

export const Buildings = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <path
        d="M18.3334 18.3333L1.66675 18.3333"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
      />
      <path
        d="M14.1666 18.3333V4.99999C14.1666 3.42864 14.1666 2.64297 13.6784 2.15481C13.1903 1.66666 12.4046 1.66666 10.8333 1.66666H9.16659C7.59524 1.66666 6.80956 1.66666 6.32141 2.15481C5.83325 2.64297 5.83325 3.42864 5.83325 4.99999V18.3333"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
      />
      <path
        opacity="0.5"
        d="M17.4999 18.3333V9.58332C17.4999 8.41294 17.4999 7.82775 17.219 7.40737C17.0974 7.22539 16.9412 7.06914 16.7592 6.94754C16.3388 6.66666 15.7536 6.66666 14.5833 6.66666"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
      />
      <path
        opacity="0.5"
        d="M2.5 18.3333V9.58332C2.5 8.41294 2.5 7.82775 2.78088 7.40737C2.90248 7.22539 3.05873 7.06914 3.24072 6.94754C3.66109 6.66666 4.24628 6.66666 5.41667 6.66666"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
      />
      <path
        d="M10 18.3333V15.8333"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
      />
      <path
        opacity="0.5"
        d="M8.33325 4.16666H11.6666"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
      />
      <path
        opacity="0.5"
        d="M8.33325 6.66666H11.6666"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
      />
      <path
        opacity="0.5"
        d="M8.33325 11.6667H11.6666"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
      />
      <path
        opacity="0.5"
        d="M8.33325 9.16666H11.6666"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
      />
    </svg>
  );
};
