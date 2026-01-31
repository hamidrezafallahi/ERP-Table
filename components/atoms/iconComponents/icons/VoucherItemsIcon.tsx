import type { IIconConfig } from '../type';

export const VoucherItemsIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.3333 3.33496C15.1459 3.34505 16.1274 3.42543 16.7678 4.06575C17.5 4.79798 17.5 5.97649 17.5 8.33351V13.3335C17.5 15.6905 17.5 16.869 16.7678 17.6013C16.0355 18.3335 14.857 18.3335 12.5 18.3335H7.5C5.14298 18.3335 3.96447 18.3335 3.23223 17.6013C2.5 16.869 2.5 15.6905 2.5 13.3335V8.33351C2.5 5.97649 2.5 4.79798 3.23223 4.06575C3.87255 3.42543 4.85414 3.34505 6.66667 3.33496"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
      <path
        d="M6.6665 11.667H13.3332"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M5.8335 8.75H14.1668"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7.5 14.583H12.5"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6.6665 2.91699C6.6665 2.22664 7.22615 1.66699 7.9165 1.66699H12.0832C12.7735 1.66699 13.3332 2.22664 13.3332 2.91699V3.75033C13.3332 4.44068 12.7735 5.00033 12.0832 5.00033H7.9165C7.22615 5.00033 6.6665 4.44068 6.6665 3.75033V2.91699Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
    </svg>
  );
};
