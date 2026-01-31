import type { IIconConfig } from '../type';

export const EndorsementOfACheque = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.927 10.5387L17.3584 8.92887C17.8619 7.04963 18.1137 6.11002 17.9241 5.29687C17.7744 4.65482 17.4376 4.07158 16.9565 3.62091C16.347 3.05014 15.4074 2.79837 13.5282 2.29483C11.649 1.79129 10.7093 1.53952 9.8962 1.72912C9.25416 1.87883 8.67092 2.21556 8.22024 2.69674C7.73156 3.2185 7.47672 3.98233 7.09749 5.37069C7.0338 5.60388 6.96659 5.85469 6.89418 6.12493L6.89417 6.12499L6.4628 7.73487C5.95926 9.6141 5.70749 10.5537 5.89709 11.3669C6.0468 12.0089 6.38353 12.5922 6.86471 13.0428C7.47411 13.6136 8.41372 13.8654 10.2929 14.3689L10.293 14.3689C11.9868 14.8228 12.9173 15.0721 13.6798 14.978C13.7633 14.9677 13.8447 14.9533 13.925 14.9346C14.567 14.7849 15.1502 14.4482 15.6009 13.967C16.1717 13.3576 16.4235 12.418 16.927 10.5387Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
      />
      <path
        opacity="0.5"
        d="M13.6785 14.9784C13.5048 15.5105 13.1993 15.9918 12.7885 16.3766C12.1791 16.9473 11.2395 17.1991 9.36023 17.7026C7.481 18.2062 6.54138 18.4579 5.72824 18.2683C5.08619 18.1186 4.50295 17.7819 4.05228 17.3007C3.48151 16.6913 3.22974 15.7517 2.7262 13.8725L2.29483 12.2626C1.79129 10.3834 1.53952 9.44375 1.72912 8.6306C1.87883 7.98856 2.21556 7.40532 2.69674 6.95464C3.30614 6.38387 4.24576 6.13211 6.12499 5.62857C6.48052 5.5333 6.80242 5.44705 7.09619 5.37109"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
      />
      <path
        d="M9.81445 8.33398L13.8391 9.4124"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
      />
      <path
        opacity="0.5"
        d="M9.16602 10.748L11.5808 11.3951"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
      />
    </svg>
  );
};
