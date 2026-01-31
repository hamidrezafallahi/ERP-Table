import type { IIconConfig } from '../type';

export const BankWithdrawalIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "25"}
      height={config?.height ? `${config.height}` : "25"}
      viewBox="0 0 25 25"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.12109 7.62226C6.05517 7.62226 5.04078 7.50295 4.12109 7.28767C3.16112 7.06296 2.12109 7.75425 2.12109 8.76073V19.7697C2.12109 20.5781 2.12109 20.9823 2.31521 21.3991C2.42592 21.6368 2.67806 21.9602 2.88008 22.1235C3.23429 22.41 3.52989 22.4792 4.12109 22.6176C5.04078 22.8328 6.05517 22.9521 7.12109 22.9521C9.03816 22.9521 10.7886 22.5662 12.1211 21.9302C13.4536 21.2941 15.204 20.9082 17.1211 20.9082C18.187 20.9082 19.2014 21.0275 20.1211 21.2428C21.0811 21.4675 22.1211 20.7762 22.1211 19.7697V8.76073C22.1211 7.95236 22.1211 7.54817 21.927 7.13136C21.8163 6.89364 21.5641 6.57026 21.3621 6.4069C20.1211 5.39087 18.1211 6.39438 18.1211 6.39438"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14.6211 14.4521C14.6211 15.8329 13.5018 16.9521 12.1211 16.9521C10.7404 16.9521 9.62109 15.8329 9.62109 14.4521C9.62109 13.0714 10.7404 11.9521 12.1211 11.9521C13.5018 11.9521 14.6211 13.0714 14.6211 14.4521Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
      <path
        d="M5.62109 15.4521L5.62109 15.4611"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.6211 13.4443L18.6211 13.4533"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.62109 5.45215C10.1126 4.94645 11.4209 2.95215 12.1211 2.95215M14.6211 5.45215C14.1296 4.94645 12.8213 2.95215 12.1211 2.95215M12.1211 2.95215V8.95215"
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
