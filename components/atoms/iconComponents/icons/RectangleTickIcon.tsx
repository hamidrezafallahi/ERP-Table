import type { IIconConfig } from '../type';

export const RectangleTickIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "18"}
      height={config?.height ? `${config.height}` : "18"}
      viewBox="0 0 18 18"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1.875 9C1.875 5.64124 1.875 3.96186 2.91843 2.91843C3.96186 1.875 5.64124 1.875 9 1.875C12.3588 1.875 14.0381 1.875 15.0816 2.91843C16.125 3.96186 16.125 5.64124 16.125 9C16.125 12.3588 16.125 14.0381 15.0816 15.0816C14.0381 16.125 12.3588 16.125 9 16.125C5.64124 16.125 3.96186 16.125 2.91843 15.0816C1.875 14.0381 1.875 12.3588 1.875 9Z"  className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}/>
<path d="M6 9.375L7.875 11.25L12 6.75"  className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke} strokeLinecap="round" strokeLinejoin="round"/>

    </svg>
  );
};

