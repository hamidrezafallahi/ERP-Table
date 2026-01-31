import type { IIconConfig } from '../type';

export const MoneyBag = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <path
        d="M1.66675 11.6667C1.66675 8.52397 1.66675 6.95262 2.64306 5.97631C3.61937 5 5.19072 5 8.33342 5H11.6667C14.8094 5 16.3808 5 17.3571 5.97631C18.3334 6.95262 18.3334 8.52397 18.3334 11.6667C18.3334 14.8094 18.3334 16.3807 17.3571 17.357C16.3808 18.3333 14.8094 18.3333 11.6667 18.3333H8.33341C5.19072 18.3333 3.61937 18.3333 2.64306 17.357C1.66675 16.3807 1.66675 14.8094 1.66675 11.6667Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
      />
      <path
        opacity="0.5"
        d="M13.3334 5.00002C13.3334 3.42867 13.3334 2.643 12.8453 2.15484C12.3571 1.66669 11.5714 1.66669 10.0001 1.66669C8.42873 1.66669 7.64306 1.66669 7.1549 2.15484C6.66675 2.643 6.66675 3.42867 6.66675 5.00002"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
      />
      <path
        opacity="0.5"
        d="M9.99992 14.4444C10.9204 14.4444 11.6666 13.8226 11.6666 13.0555C11.6666 12.2885 10.9204 11.6666 9.99992 11.6666C9.07944 11.6666 8.33325 11.0448 8.33325 10.2778C8.33325 9.5107 9.07944 8.88887 9.99992 8.88887M9.99992 14.4444C9.07944 14.4444 8.33325 13.8226 8.33325 13.0555M9.99992 14.4444V15M9.99992 8.33331V8.88887M9.99992 8.88887C10.9204 8.88887 11.6666 9.5107 11.6666 10.2778"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
      />
    </svg>
  );
};
