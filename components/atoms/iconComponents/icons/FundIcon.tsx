import type { IIconConfig } from '../type';

export const FundIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        opacity="0.5"
        d="M15.5559 10.0007C17.1264 9.76841 18.3337 8.3721 18.3337 6.68428C18.3337 4.83396 16.8827 3.33398 15.0929 3.33398H4.90773C3.11792 3.33398 1.66699 4.83396 1.66699 6.68428C1.66699 8.3721 2.87426 9.76841 4.44477 10.0007"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
      />
      <path
        d="M9.99967 5.83398V11.6673M9.99967 11.6673L11.6663 9.72287M9.99967 11.6673L8.33301 9.72287"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.16699 9.16732C4.16699 7.59597 4.16699 6.8103 4.65515 6.32214C5.1433 5.83398 5.92898 5.83398 7.50033 5.83398H12.5003C14.0717 5.83398 14.8573 5.83398 15.3455 6.32214C15.8337 6.8103 15.8337 7.59597 15.8337 9.16732V14.1673C15.8337 15.7387 15.8337 16.5243 15.3455 17.0125C14.8573 17.5007 14.0717 17.5007 12.5003 17.5007H7.50033C5.92898 17.5007 5.1433 17.5007 4.65515 17.0125C4.16699 16.5243 4.16699 15.7387 4.16699 14.1673V9.16732Z"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
      />
      <path
        opacity="0.5"
        d="M4.16699 15H15.8337"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
