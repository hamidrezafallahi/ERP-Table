import type { IIconConfig } from '../type';

export const ListOrdered = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "16"}
      height={config?.height ? `${config.height}` : "12"}
      viewBox="0 0 16 12"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11 1L1 0.999999M11 6L1 6M11 11L1 11M14.998 1L14.998 0.998L15 0.998047L15 1L14.998 1ZM14.998 6L14.998 5.998L15 5.99805L15 6L14.998 6ZM14.998 11L14.998 10.998L15 10.998L15 11L14.998 11Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
