import type { IIconConfig } from '../type';

export const DetailIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "22"}
      height={config?.height ? `${config.height}` : "22"}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.083 16.5006C10.083 17.0069 10.4934 17.4173 10.9997 17.4173C11.5059 17.4173 11.9163 17.0069 11.9163 16.5006C11.9163 15.9944 11.5059 15.584 10.9997 15.584C10.4934 15.584 10.083 15.9944 10.083 16.5006Z"
        className={
          !config?.fill ? "fill-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        fill={config?.fill}
      />
      <path
        d="M10.083 11.0007C10.083 11.5069 10.4934 11.9173 10.9997 11.9173C11.5059 11.9173 11.9163 11.5069 11.9163 11.0007C11.9163 10.4944 11.5059 10.084 10.9997 10.084C10.4934 10.084 10.083 10.4944 10.083 11.0007Z"
        className={
          !config?.fill ? "fill-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        fill={config?.fill}
      />
      <path
        d="M10.083 5.50065C10.083 6.00691 10.4934 6.41732 10.9997 6.41732C11.5059 6.41732 11.9163 6.00691 11.9163 5.50065C11.9163 4.99439 11.5059 4.58398 10.9997 4.58398C10.4934 4.58398 10.083 4.99439 10.083 5.50065Z"
        className={
          !config?.fill ? "fill-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        fill={config?.fill}
      />
      <path
        d="M10.083 16.5006C10.083 17.0069 10.4934 17.4173 10.9997 17.4173C11.5059 17.4173 11.9163 17.0069 11.9163 16.5006C11.9163 15.9944 11.5059 15.584 10.9997 15.584C10.4934 15.584 10.083 15.9944 10.083 16.5006Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.083 11.0007C10.083 11.5069 10.4934 11.9173 10.9997 11.9173C11.5059 11.9173 11.9163 11.5069 11.9163 11.0007C11.9163 10.4944 11.5059 10.084 10.9997 10.084C10.4934 10.084 10.083 10.4944 10.083 11.0007Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.083 5.50065C10.083 6.00691 10.4934 6.41732 10.9997 6.41732C11.5059 6.41732 11.9163 6.00691 11.9163 5.50065C11.9163 4.99439 11.5059 4.58398 10.9997 4.58398C10.4934 4.58398 10.083 4.99439 10.083 5.50065Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
