import type { IIconConfig } from '../type';

export const ChequeIssuing = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.54563 10H1.81836V18.1818H18.182V10H16.3638"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 15.4551L15.4545 15.4551"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.7664 3.58754L16.4091 3.23067C15.7424 2.56486 15.409 2.23196 14.995 2.2321C14.581 2.23224 14.2478 2.56537 13.5816 3.23162L7.85922 8.95399C7.57019 9.24302 7.42568 9.38753 7.34956 9.5713C7.27344 9.75507 7.27344 9.95945 7.27344 10.3682V10.7284C7.27344 11.6708 7.27344 12.142 7.56616 12.4349C7.85887 12.7277 8.33007 12.728 9.27245 12.7284L9.62625 12.7286C10.0353 12.7288 10.2398 12.7289 10.4237 12.6528C10.6076 12.5767 10.7522 12.4321 11.0415 12.1428L16.7674 6.41691C17.4344 5.74984 17.768 5.4163 17.7678 5.00189C17.7677 4.58748 17.4339 4.25416 16.7664 3.58754Z"
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
