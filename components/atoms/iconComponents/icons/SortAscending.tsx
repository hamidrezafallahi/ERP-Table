import type { IIconConfig } from '../type';

export const SortAscending = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <path
        d="M3.3335 14.1666H8.3335M3.3335 9.99998H10.8335M15.0002 9.16665V15.8333M15.0002 15.8333L17.5002 13.3333M15.0002 15.8333L12.5002 13.3333M3.3335 5.83331H13.3335"
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
