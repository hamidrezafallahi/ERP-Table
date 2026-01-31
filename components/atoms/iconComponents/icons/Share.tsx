import type { IIconConfig } from '../type';

export const Share = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <path
        d="M7.49967 5L9.99967 2.5M9.99967 2.5L12.4997 5M9.99967 2.5V10.8333M5.8332 8.33333C5.05663 8.33333 4.66835 8.33333 4.36206 8.4602C3.95368 8.62936 3.62903 8.95401 3.45988 9.36239C3.33301 9.66867 3.33301 10.0568 3.33301 10.8333V14.8333C3.33301 15.7668 3.33301 16.2331 3.51466 16.5897C3.67445 16.9033 3.92924 17.1587 4.24284 17.3185C4.59901 17.5 5.0655 17.5 5.9971 17.5H14.0027C14.9343 17.5 15.4001 17.5 15.7562 17.3185C16.0698 17.1587 16.3251 16.9033 16.4849 16.5897C16.6663 16.2335 16.6663 15.7675 16.6663 14.8359V10.8333C16.6663 10.0568 16.6663 9.66867 16.5394 9.36239C16.3702 8.95401 16.0459 8.62936 15.6375 8.4602C15.3312 8.33333 14.9429 8.33333 14.1663 8.33333"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
