import type { IIconConfig } from '../type';

export const FormulaIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "18"}
      height={config?.height ? `${config.height}` : "18"}
      viewBox="0 0 18 18"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.875 9C1.875 5.64124 1.875 3.96186 2.91843 2.91843C3.96186 1.875 5.64124 1.875 9 1.875C12.3588 1.875 14.0381 1.875 15.0816 2.91843C16.125 3.96186 16.125 5.64124 16.125 9C16.125 12.3588 16.125 14.0381 15.0816 15.0816C14.0381 16.125 12.3588 16.125 9 16.125C5.64124 16.125 3.96186 16.125 2.91843 15.0816C1.875 14.0381 1.875 12.3588 1.875 9Z"
         className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
      />
      <path
        d="M4.125 9.375L4.48091 9.13773C4.83636 8.90076 5.01409 8.78227 5.1847 8.83526C5.3553 8.88825 5.43463 9.08657 5.59329 9.48322L6.75 12.375L8.31623 7.67632C8.64624 6.68629 8.81124 6.19127 9.20407 5.90814C9.5969 5.625 10.1187 5.625 11.1623 5.625H13.875"
         className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.75 9L11.625 10.125M11.625 10.125L10.5 11.25M11.625 10.125L12.75 11.25M11.625 10.125L10.5 9"
         className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
