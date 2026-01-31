import type { IIconConfig } from '../type';

export const AddChild = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? config.width : "16"}
      height={config?.height ? config.height : "14"}
      viewBox="0 0 15 13"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.5 9.75013L10.5 8.42647M10.5 8.42647C10.5 8.42647 10.5 7.25013 10.5 7.1668M10.5 8.42647L11.8333 8.42647M10.5 8.42647L9.16667 8.42647"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="0.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.65 8.5C13.65 10.2397 12.2397 11.65 10.5 11.65C8.7603 11.65 7.35 10.2397 7.35 8.5C7.35 6.7603 8.7603 5.35 10.5 5.35C12.2397 5.35 13.65 6.7603 13.65 8.5Z"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="0.7"
      />
      <path
        d="M7 9L3 9"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="0.7"
        strokeLinecap="round"
      />
      <path
        d="M3 1L3 9"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="0.7"
        strokeLinecap="round"
      />
      <path
        d="M10 1L1 1"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="0.7"
        strokeLinecap="round"
      />
    </svg>
  );
};
