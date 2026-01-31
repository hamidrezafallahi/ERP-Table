import type { IIconConfig } from "../type";

export const SendIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_10445_74704)">
        <path
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          d="M9.98786 12.8403L12.689 15.9113C13.6898 17.0491 14.1902 17.618 14.7139 17.4795C15.2377 17.341 15.4173 16.5923 15.7765 15.0949L17.7691 6.78825C18.3223 4.48194 18.5989 3.32878 17.984 2.76C17.3692 2.19122 16.3034 2.61437 14.1718 3.46068L4.28231 7.38707C2.57744 8.06395 1.72501 8.40239 1.67089 8.98403C1.66536 9.04353 1.66527 9.10344 1.67062 9.16295C1.72295 9.74477 2.57435 10.086 4.27713 10.7686C5.04866 11.0779 5.43442 11.2325 5.71101 11.5286C5.7421 11.5619 5.772 11.5964 5.80065 11.632C6.05549 11.9486 6.16424 12.3642 6.38174 13.1954L6.78878 14.7508C7.00042 15.5596 7.10625 15.964 7.38341 16.0191C7.66057 16.0743 7.90188 15.7389 8.3845 15.0683L9.98786 12.8403ZM9.98786 12.8403L9.72302 12.5642C9.42162 12.2501 9.27092 12.0931 9.27092 11.8979C9.27092 11.7027 9.42162 11.5457 9.72302 11.2315L12.7005 8.12841"
          stroke={config?.stroke ? `${config.stroke}` : "#F7F7F7"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_10445_74704">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
