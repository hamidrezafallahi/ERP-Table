import type { IIconConfig } from '../type';

export const Monitor = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "24"}
      height={config?.height ? `${config.height}` : "23"}
      viewBox="0 0 24 23"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.0007 21.6667H8.00065M1.33398 13.4003V5.93361C1.33398 4.44014 1.33398 3.69285 1.62463 3.12242C1.8803 2.62065 2.28795 2.213 2.78971 1.95734C3.36014 1.66669 4.10744 1.66669 5.60091 1.66669H18.4009C19.8944 1.66669 20.6401 1.66669 21.2105 1.95734C21.7123 2.213 22.1213 2.62065 22.377 3.12242C22.6673 3.69229 22.6673 4.43868 22.6673 5.92923V13.4041C22.6673 14.8947 22.6673 15.64 22.377 16.2099C22.1213 16.7116 21.7123 17.1207 21.2105 17.3763C20.6406 17.6667 19.8953 17.6667 18.4048 17.6667H5.59653C4.10598 17.6667 3.35959 17.6667 2.78971 17.3763C2.28795 17.1207 1.8803 16.7116 1.62463 16.2099C1.33398 15.6394 1.33398 14.8938 1.33398 13.4003Z"
        className={
          !config?.stroke ? "stroke-gray-gray7  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
