import type { IIconConfig } from '../type';

export const CheckAll = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "50"}
      height={config?.height ? `${config.height}` : "50"}
      viewBox="0 0 50 50"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <path
        d="M16.6667 26.0111L25.5055 34.85L43.1813 17.1722M6.25 26.0111L15.0888 34.85M32.7665 17.1722L26.0417 23.9585"
        stroke={config?.stroke ? `${config.stroke}` : "#2c8440"}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
