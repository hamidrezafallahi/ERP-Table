import type { IIconConfig } from '../type';

export const CustomerIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "18"}
      height={config?.height ? `${config.height}` : "19"}
      viewBox="0 0 18 19"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.25 4.25C11.25 5.49264 9.93134 6.875 9 6.875C8.06866 6.875 6.75 5.49264 6.75 4.25C6.75 3.00736 7.75736 2 9 2C10.2426 2 11.25 3.00736 11.25 4.25Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
      <path
        d="M12.0311 7.25C13.1733 8.25148 13.9135 9.94764 13.2488 11.5289C13.1056 11.8696 12.7771 12.0904 12.4135 12.0904C12.0439 12.0904 11.4367 11.972 11.3187 12.4531L10.4958 15.8093C10.3242 16.5091 9.70749 17 8.99999 17C8.29249 17 7.67578 16.5091 7.50419 15.8093L6.68125 12.4531C6.56328 11.972 5.95612 12.0904 5.58647 12.0904C5.22293 12.0904 4.89437 11.8696 4.75116 11.5289C4.0865 9.94764 4.82668 8.25148 5.96893 7.25"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
