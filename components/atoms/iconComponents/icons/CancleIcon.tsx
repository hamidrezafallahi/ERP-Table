import type { IIconConfig } from "../type";

export const CancleIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "24"}
      height={config?.height ? `${config.height}` : "22"}
      viewBox="0 0 24 22"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.0005 4.5835L5.00049 17.4168M5.00049 4.5835L19.0005 17.4168"
        stroke={config?.stroke ? config.stroke : "#AFAFAF"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
