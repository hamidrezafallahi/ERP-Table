import type { IIconConfig } from '../type';

export const Circle = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "8"}
      height={config?.height ? `${config.height}` : "8"}
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="4"
        cy="4"
        r="4"
        fill={config?.fill ? config.fill : "#3ED060"}
      />
    </svg>
  );
};
