import type { IIconConfig } from '../type';

export const UploadSuccessfully = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "32"}
      height={config?.height ? `${config.height}` : "32"}
      viewBox="0 0 32 32"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 13.3333L14.6667 18.6667L12 16M16 28C9.37258 28 4 22.6274 4 16C4 9.37258 9.37258 4 16 4C22.6274 4 28 9.37258 28 16C28 22.6274 22.6274 28 16 28Z"
        stroke={config?.stroke ? config.stroke : "#5BC16D"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
