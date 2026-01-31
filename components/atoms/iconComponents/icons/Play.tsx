import type { IIconConfig } from '../type';

export const Play = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "10"}
      height={config?.height ? `${config.height}` : "10"}
      viewBox="0 0 10 10"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.33262 8.17594C6.98895 8.55487 7.31744 8.74429 7.58672 8.71598C7.8216 8.6913 8.03479 8.56802 8.17361 8.37695C8.33271 8.15797 8.33271 7.77928 8.33271 7.02193L8.33271 2.97904C8.33271 2.2217 8.33271 1.84306 8.17361 1.62408C8.03479 1.43301 7.8216 1.30968 7.58672 1.28499C7.31744 1.25669 6.98895 1.44605 6.33262 1.82498L2.83262 3.8457C2.1763 4.22463 1.84819 4.41418 1.73806 4.66154C1.642 4.8773 1.642 5.12382 1.73806 5.33957C1.84815 5.58683 2.17626 5.77626 2.83204 6.15488L6.33262 8.17594Z"
        fill={config?.fill ? `${config.fill}` : "#767676"}
        stroke={config?.stroke ? `${config.stroke}` : "#B1B1B1"}
        strokeWidth="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
