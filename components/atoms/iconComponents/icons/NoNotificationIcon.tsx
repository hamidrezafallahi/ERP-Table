import type { IIconConfig } from "../type";

export const NotExistNotificationIcon = ({
  config,
}: {
  config?: IIconConfig;
}) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "52"}
      height={config?.height ? `${config.height}` : "52"}
      viewBox="0 0 52 52"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M39.0001 39.3629C29.7477 42.1177 18.1841 41.7177 9.60287 38.1628C7.08074 37.118 5.02083 35.0216 5.48158 32.0012C5.76474 30.145 7.1649 28.5993 8.20223 27.09C9.56098 25.0888 9.69599 22.906 9.69619 20.5837C9.69619 17.596 10.5052 14.3223 11.9167 11.917"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.25 7.55767C18.9671 5.53229 22.3391 4.33301 25.9919 4.33301C34.9888 4.33301 42.2822 11.6084 42.2822 20.583C42.2824 22.9053 42.4173 25.0881 43.7749 27.0893C44.8114 28.5986 46.2103 30.1443 46.4933 32.0005C46.7542 33.7122 46.4581 34.6547 45.4756 35.7497"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M47.6666 47.6663L4.33325 4.33301"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M17.3333 41.167C18.3266 44.905 21.8302 47.667 25.9999 47.667C30.1696 47.667 33.6732 44.905 34.6666 41.167"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
