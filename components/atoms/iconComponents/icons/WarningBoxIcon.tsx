import type { IIconConfig } from '../type';

export const WarningBoxIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "30"}
      height={config?.height ? `${config.height}` : "30"}
      viewBox="0 0 30 30"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.125 15C3.125 9.40207 3.125 6.60311 4.86405 4.86405C6.60311 3.125 9.40207 3.125 15 3.125C20.5979 3.125 23.3969 3.125 25.1359 4.86405C26.875 6.60311 26.875 9.40207 26.875 15C26.875 20.5979 26.875 23.3969 25.1359 25.1359C23.3969 26.875 20.5979 26.875 15 26.875C9.40207 26.875 6.60311 26.875 4.86405 25.1359C3.125 23.3969 3.125 20.5979 3.125 15Z"
        stroke="#398BE3"
        strokeWidth="1.5"
      />
      <path
        d="M14.9998 20H15.011"
        stroke="#398BE3"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 16.25L15 8.75"
        stroke="#398BE3"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
