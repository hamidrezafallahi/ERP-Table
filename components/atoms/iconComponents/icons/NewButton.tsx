import type { IIconConfig } from '../type';

export const NewButton = ({
  config,
  inheritStyle = false,
}: {
  config?: IIconConfig;
  inheritStyle?: boolean;
}) => {
  if (inheritStyle) {
    return (
      <svg
        style={{ color: "inherit" }}
        xmlns="http://www.w3.org/2000/svg"
        width={config?.width ? `${config.width}` : "26"}
        height={config?.height ? `${config.height}` : "26"}
        viewBox="0 0 26 26"
        fill={config?.fill ? `${config.fill}` : "none"}
      >
        <path
          style={{ color: "inherit" }}
          d="M13 17.5148V13.2722M13 13.2722V9.02954M13 13.2722H17.2427M13 13.2722H8.75735"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  } else {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={config?.width ? `${config.width}` : "26"}
        height={config?.height ? `${config.height}` : "26"}
        viewBox="0 0 26 26"
        fill={config?.fill ? `${config.fill}` : "none"}
      >
        <path
          d="M13 17.5148V13.2722M13 13.2722V9.02954M13 13.2722H17.2427M13 13.2722H8.75735"
          className={
            !config?.stroke ? "stroke-white  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
};
