import type { IIconConfig } from '../type';

export const ReminderMakerIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "38"}
      height={config?.height ? `${config.height}` : "38"}
      viewBox="0 0 38 38"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M28.5 3.16602V6.33268M9.5 3.16602V6.33268"
        className={
          !config?.stroke ? "stroke-[#585858]  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.4984 34.8333C11.1168 34.8333 7.92598 34.8333 5.94346 32.6901C3.96094 30.5468 3.96094 27.0973 3.96094 20.1982V19.3851C3.96094 12.4861 3.96094 9.03653 5.94346 6.89327C7.92598 4.75 11.1168 4.75 17.4984 4.75H20.5068C26.8884 4.75 30.0792 4.75 32.0617 6.89327C34.007 8.99627 34.0436 12.3569 34.0443 19"
        className={
          !config?.stroke ? "stroke-[#585858]  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.75 12.666H33.25"
        className={
          !config?.stroke ? "stroke-[#585858]  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.5859 28.4993H33.2526M26.9193 22.166L26.9193 34.8327"
        className={
          !config?.stroke ? "stroke-[#585858]  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
