import type { IIconConfig } from '../type';

export const CashOut = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <path
        opacity="0.5"
        d="M15.5556 10C17.1261 9.76777 18.3334 8.37146 18.3334 6.68364C18.3334 4.83332 16.8825 3.33334 15.0927 3.33334H4.90749C3.11768 3.33334 1.66675 4.83332 1.66675 6.68364C1.66675 8.37146 2.87402 9.76777 4.44453 10"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
      />
      <path
        d="M9.99992 5.83334V11.6667M9.99992 11.6667L11.6666 9.72223M9.99992 11.6667L8.33325 9.72223"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.16675 9.16668C4.16675 7.59533 4.16675 6.80965 4.6549 6.3215C5.14306 5.83334 5.92873 5.83334 7.50008 5.83334H12.5001C14.0714 5.83334 14.8571 5.83334 15.3453 6.3215C15.8334 6.80965 15.8334 7.59533 15.8334 9.16668V14.1667C15.8334 15.738 15.8334 16.5237 15.3453 17.0119C14.8571 17.5 14.0714 17.5 12.5001 17.5H7.50008C5.92873 17.5 5.14306 17.5 4.6549 17.0119C4.16675 16.5237 4.16675 15.738 4.16675 14.1667V9.16668Z"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
      />
      <path
        opacity="0.5"
        d="M4.16675 15H15.8334"
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
