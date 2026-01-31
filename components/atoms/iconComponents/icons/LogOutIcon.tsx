import type { IIconConfig } from '../type';

export const LogOutIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        opacity="0.5"
        d="M7.50195 5.83329C7.51204 4.02077 7.59242 3.03918 8.23274 2.39886C8.96497 1.66663 10.1435 1.66663 12.5005 1.66663L13.3338 1.66663C15.6909 1.66663 16.8694 1.66663 17.6016 2.39886C18.3338 3.13109 18.3338 4.3096 18.3338 6.66663L18.3338 13.3333C18.3338 15.6903 18.3338 16.8688 17.6016 17.6011C16.8694 18.3333 15.6909 18.3333 13.3338 18.3333L12.5005 18.3333C10.1435 18.3333 8.96497 18.3333 8.23274 17.6011C7.59242 16.9607 7.51204 15.9791 7.50195 14.1666"
        stroke={config?.stroke ? config.stroke : "#DC3545"}
        strokeLinecap="round"
      />
      <path
        d="M12.5 10L1.66667 10M1.66667 10L4.58333 7.5M1.66667 10L4.58333 12.5"
        stroke={config?.stroke ? config.stroke : "#DC3545"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
