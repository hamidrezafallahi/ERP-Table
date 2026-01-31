import type { IIconConfig } from '../type';

export const UnPinIcon = ({ config }: { config?: IIconConfig }) => {
  return (
   
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.24996 6.66699C5.79882 6.77374 5.41606 6.78565 4.99386 7.04942C4.22691 7.52856 4.04253 8.09761 4.24014 8.96796C4.95019 12.0953 7.90495 15.05 11.0323 15.7601C11.9028 15.9577 12.4717 15.7736 12.9513 15.0067C13.2009 14.6076 13.2263 14.1737 13.3333 13.7503"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 6.49929C10.148 6.48162 10.2652 6.45028 10.3579 6.40196C11.1664 5.98072 11.6076 4.61134 12.0415 3.83341C12.4426 3.11429 12.6432 2.75473 13.115 2.58523C13.5867 2.41573 13.8706 2.51837 14.4385 2.72366C15.7664 3.20375 16.7962 4.2336 17.2763 5.5615C17.4816 6.12934 17.5843 6.41326 17.4148 6.88503C17.2453 7.35681 16.8857 7.55737 16.1666 7.95849C15.384 8.39497 13.9962 8.84233 13.5754 9.65816C13.5287 9.7486 13.4982 9.86061 13.4808 10"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 17.4997L6.66667 13.333"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 2.5L17.5 17.5"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
