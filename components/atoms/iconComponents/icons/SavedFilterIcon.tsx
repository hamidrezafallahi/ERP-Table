import type { IIconConfig } from '../type';

export const SavedFilterIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "18"}
      height={config?.height ? `${config.height}` : "18"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.66675 16.4821V8.89824C3.66675 5.56766 3.66675 3.90237 4.74069 2.86769C5.81463 1.83301 7.54312 1.83301 11.0001 1.83301C14.457 1.83301 16.1855 1.83301 17.2595 2.86769C18.3334 3.90237 18.3334 5.56766 18.3334 8.89824V16.4821C18.3334 18.5958 18.3334 19.6526 17.625 20.0309C16.2531 20.7635 13.6797 18.3194 12.4576 17.5835C11.7488 17.1568 11.3944 16.9434 11.0001 16.9434C10.6057 16.9434 10.2514 17.1568 9.54258 17.5835C8.32048 18.3194 5.74709 20.7635 4.37519 20.0309C3.66675 19.6526 3.66675 18.5958 3.66675 16.4821Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.16675 12.5711C9.16675 12.5711 10.0834 13.0491 10.5417 13.7497C10.5417 13.7497 11.9167 10.9997 13.7501 10.083"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.66675 6.41699H18.3334"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
    </svg>
  );
};
