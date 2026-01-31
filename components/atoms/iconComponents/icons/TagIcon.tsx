import type { IIconConfig } from '../type';

export const TagIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <path
        d="M3.95643 6.37077L3.68041 9.40698C3.63953 9.85664 3.61892 10.0834 3.65634 10.2986C3.68977 10.4909 3.75655 10.6759 3.85397 10.8451C3.96342 11.0351 4.12519 11.1968 4.4469 11.5185L8.75981 15.8315C9.41568 16.4873 9.74379 16.8154 10.1231 16.9387C10.4579 17.0475 10.819 17.0477 11.1538 16.9389C11.5343 16.8153 11.865 16.485 12.525 15.825L15.8249 12.5251C16.4849 11.8651 16.8144 11.5353 16.938 11.1547C17.0468 10.82 17.0461 10.4592 16.9374 10.1245C16.8137 9.74392 16.4847 9.41412 15.8247 8.7541L11.5224 4.45183C11.1978 4.12719 11.0354 3.96485 10.8445 3.8549C10.6754 3.75748 10.4904 3.69042 10.2981 3.65699C10.081 3.61925 9.85231 3.64 9.39509 3.68156L6.37025 3.95655C5.58294 4.02812 5.18905 4.06407 4.88099 4.23537C4.60938 4.38641 4.38548 4.61031 4.23444 4.88192C4.06399 5.18844 4.02843 5.57955 3.95758 6.35902L3.95643 6.37077Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.09366 8.09406C8.4191 7.76862 8.4191 7.24099 8.09366 6.91555C7.76822 6.59011 7.24021 6.59011 6.91477 6.91555C6.58934 7.24099 6.58902 7.7685 6.91446 8.09393C7.2399 8.41937 7.76822 8.4195 8.09366 8.09406Z"
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
