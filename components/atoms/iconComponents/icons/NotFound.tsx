import { IIconConfig } from '../type';

export const NotFound = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "35"}
      height={config?.height ? `${config.height}` : "35"}
      viewBox={`0 0 35 35`}
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
        className={
          !config?.stroke ? "stroke-[#454545 ]  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.32812 14.49L9.70813 11.4C10.0481 10.96 10.6781 10.88 11.1181 11.22L12.9481 12.66C13.3881 13 14.0181 12.92 14.3581 12.49L16.6681 9.51001"
        className={
          !config?.stroke ? "stroke-[#454545 ]  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
