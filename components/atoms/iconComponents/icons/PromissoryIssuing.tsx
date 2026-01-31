import type { IIconConfig } from '../type';

export const PromissoryIssuing = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.4167 13.332C15.8381 13.7416 17.5 14.8318 17.5 15.4154M15.4167 17.4987C15.8381 17.0891 17.5 15.9989 17.5 15.4154M17.5 15.4154L10.8333 15.4154"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.16602 18.332H8.93874C6.22107 18.332 4.86224 18.332 3.91857 17.6672C3.6482 17.4767 3.40817 17.2508 3.20577 16.9963C2.49935 16.1081 2.49935 14.8292 2.49935 12.2714V10.1502C2.49935 7.6809 2.49935 6.44625 2.89013 5.46016C3.51836 3.87488 4.84696 2.62444 6.53132 2.03316C7.57904 1.66537 8.89086 1.66536 11.5145 1.66536C13.0137 1.66536 13.7633 1.66536 14.362 1.87553C15.3245 2.2134 16.0837 2.92795 16.4427 3.83382C16.666 4.3973 16.666 5.10282 16.666 6.51385V10.832"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.50065 10C2.50065 8.46588 3.7443 7.22222 5.27843 7.22222C5.83325 7.22222 6.48735 7.31944 7.02679 7.1749C7.50608 7.04647 7.88045 6.6721 8.00888 6.1928C8.15342 5.65336 8.05621 4.99926 8.05621 4.44444C8.05621 2.91032 9.29986 1.66667 10.834 1.66667"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
