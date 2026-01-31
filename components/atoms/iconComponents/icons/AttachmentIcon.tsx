import type { IIconConfig } from "../type";

export const AttachmentIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.1472 10L16.434 8.7132C17.8553 7.29185 17.8553 4.98737 16.434 3.56602C15.0126 2.14466 12.7082 2.14466 11.2868 3.56602L3.56602 11.2868C2.14466 12.7082 2.14466 15.0126 3.56602 16.434C4.98737 17.8553 7.29185 17.8553 8.7132 16.434L11.6085 13.5387C12.4968 12.6503 12.4968 11.21 11.6085 10.3217C10.7201 9.43335 9.27985 9.43335 8.3915 10.3217L6.78301 11.9302"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke ? `${config.stroke}` : "#585858"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
