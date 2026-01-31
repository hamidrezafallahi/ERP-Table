import type { IIconConfig } from '../type';

export const AddCircle = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "16"}
      height={config?.height ? `${config.height}` : "16"}
      viewBox="0 0 11 10"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.46839 5.00014H5.50014M5.50014 5.00014H7.53189M5.50014 5.00014V7.03189M5.50014 5.00014V2.96839M5.50014 9.57157C2.97541 9.57157 0.928711 7.52487 0.928711 5.00014C0.928711 2.47541 2.97541 0.428711 5.50014 0.428711C8.02487 0.428711 10.0716 2.47541 10.0716 5.00014C10.0716 7.52487 8.02487 9.57157 5.50014 9.57157Z"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
