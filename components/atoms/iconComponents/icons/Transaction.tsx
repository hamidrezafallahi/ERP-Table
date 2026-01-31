import type { IIconConfig } from '../type';

export const Transaction = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.23352 5.1652L10.5751 3.00787L8.41779 0.66627M4.25628 9.69823C3.9201 8.80641 3.84084 7.83816 4.02752 6.90353C4.2142 5.96891 4.65982 5.10475 5.3128 4.4105C5.96578 3.71625 6.8 3.21948 7.72144 2.97594C8.64289 2.73241 9.61386 2.75278 10.5246 3.03375"
        className={
          !config?.stroke ? "stroke-gray-gray9  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.4102 14.3855L8.65288 15.9774L10.2448 18.7347M16.2839 10.8339C16.4165 11.7777 16.2818 12.7398 15.8949 13.6108C15.508 14.4818 14.8839 15.2273 14.0946 15.7617C13.3054 16.296 12.3827 16.598 11.4302 16.6337C10.4778 16.6695 9.5349 16.4369 8.70784 15.9632"
        className={
          !config?.stroke ? "stroke-gray-gray9  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.666 6V13"
        className={
          !config?.stroke ? "stroke-gray-gray9  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="0.6"
        strokeLinecap="round"
      />
      <path
        d="M12.3333 8.04232C12.3333 7.2369 11.5871 6.58398 10.6667 6.58398C9.74619 6.58398 9 7.2369 9 8.04232C9 8.84773 9.74619 9.50065 10.6667 9.50065C11.5871 9.50065 12.3333 10.1536 12.3333 10.959C12.3333 11.7644 11.5871 12.4173 10.6667 12.4173C9.74619 12.4173 9 11.7644 9 10.959"
        className={
          !config?.stroke ? "stroke-gray-gray9  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="0.6"
        strokeLinecap="round"
      />
    </svg>
  );
};
