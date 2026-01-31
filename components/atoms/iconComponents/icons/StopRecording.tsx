import type { IIconConfig } from '../type';

export const StopRecording = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "18"}
      height={config?.height ? `${config.height}` : "18"}
      viewBox="0 0 18 18"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width={config?.width ? `${config.width}` : "18"}
        height={config?.height ? `${config.height}` : "18"}
        rx="4"
        fill={config?.fill}
        className={!config?.fill ? "fill-white dark:fill-gray-gray1" : ""}
      />
    </svg>
  );
};
