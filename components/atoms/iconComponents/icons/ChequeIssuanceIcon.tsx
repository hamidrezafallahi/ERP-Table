import type { IIconConfig } from '../type';

export const ChequeIssuanceIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "21"}
      height={config?.height ? `${config.height}` : "25"}
      viewBox="0 0 21 25"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.04563 12.7568V12.7568C4.36908 12.7568 4.0308 12.7568 3.75489 12.8378C3.10184 13.0296 2.59113 13.5403 2.39937 14.1934C2.31836 14.4693 2.31836 14.8076 2.31836 15.4841V18.575C2.31836 20.4606 2.31836 21.4034 2.90415 21.9892C3.48993 22.575 4.43274 22.575 6.31836 22.575H14.682C16.5676 22.575 17.5104 22.575 18.0962 21.9892C18.682 21.4034 18.682 20.4606 18.682 18.575V14.575C18.682 13.5709 17.868 12.7568 16.8638 12.7568V12.7568"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 19.3027L15.9545 19.3027"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.614 5.47802L17.0315 4.77995C16.3193 3.92648 15.9632 3.49975 15.495 3.49991C15.0269 3.50006 14.6711 3.92703 13.9594 4.78097L8.23699 11.6479C8.00759 11.9232 7.89289 12.0608 7.83317 12.2258C7.77344 12.3908 7.77344 12.5699 7.77344 12.9283V14.0306C7.77344 14.9729 7.77344 15.444 8.06612 15.7369C8.3588 16.0297 8.82995 16.03 9.77225 16.0306L10.0178 16.0307C10.4788 16.031 10.7093 16.0311 10.911 15.9367C11.1127 15.8423 11.2603 15.6652 11.5554 15.3111L17.6148 8.03977C18.1253 7.42718 18.3806 7.12088 18.3805 6.75864C18.3803 6.39641 18.1249 6.09028 17.614 5.47802Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};
