import type { IIconConfig } from '../type';

export const RemindMeIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "18"}
      height={config?.height ? `${config.height}` : "18"}
      viewBox="0 0 18 18"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 6H15M3 6V12.6001C3 13.4402 3 13.86 3.16349 14.1809C3.3073 14.4632 3.5366 14.6929 3.81885 14.8367C4.1394 15 4.55925 15 5.39768 15H12.6023C13.4408 15 13.86 15 14.1805 14.8367C14.4628 14.6929 14.6929 14.4632 14.8367 14.1809C15 13.8604 15 13.4411 15 12.6027V6M3 6V5.40015C3 4.56007 3 4.13972 3.16349 3.81885C3.3073 3.5366 3.5366 3.3073 3.81885 3.16349C4.13972 3 4.56007 3 5.40015 3H6M15 6V5.39768C15 4.55925 15 4.1394 14.8367 3.81885C14.6929 3.5366 14.4628 3.3073 14.1805 3.16349C13.8597 3 13.4402 3 12.6001 3H12M6 3H12M6 3V1.5M12 3V1.5M8.8125 12C8.91605 12 9 11.9161 9 11.8125V9.1875C9 9.08395 8.91605 9 8.8125 9H6.1875C6.08395 9 6 9.08395 6 9.1875V11.8125C6 11.9161 6.08395 12 6.1875 12H8.8125Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth={config?.strokeWidth ? config.strokeWidth : "1.5"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
