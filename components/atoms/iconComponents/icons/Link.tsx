import type { IIconConfig } from '../type';

export const Link = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <path
        d="M7.64317 12.3572L12.3572 7.64319M5.87571 9.41076L4.6972 10.5893C3.39546 11.891 3.39508 14.0017 4.69682 15.3035C5.99857 16.6052 8.10975 16.6048 9.4115 15.3031L10.5888 14.1247M9.41074 5.87492L10.5893 4.69641C11.891 3.39466 14.0013 3.39489 15.303 4.69664C16.6048 5.99839 16.6047 8.10896 15.303 9.41071L14.1251 10.5892"
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
