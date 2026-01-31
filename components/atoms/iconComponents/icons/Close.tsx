import type { IIconConfig } from '../type';

export const Close = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "22"}
      height={config?.height ? `${config.height}` : "22"}
      viewBox="0 0 11 10"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.66681 9.30877L5.50017 5.14214M5.50017 5.14214L1.3335 0.975464M5.50017 5.14214L9.66685 0.975464M5.50017 5.14214L1.3335 9.30882"
        className={
          !config?.stroke ? "stroke-gray-gray85  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
