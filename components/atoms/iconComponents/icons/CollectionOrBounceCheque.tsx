import type { IIconConfig } from '../type';

export const CollectionOrBounceCheque = ({
  config,
}: {
  config?: IIconConfig;
}) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.3333 3.33398C15.1459 3.34407 16.1274 3.42445 16.7678 4.06477C17.5 4.797 17.5 5.97551 17.5 8.33254V13.3325C17.5 15.6896 17.5 16.8681 16.7678 17.6003C16.0355 18.3325 14.857 18.3325 12.5 18.3325H7.5C5.14298 18.3325 3.96447 18.3325 3.23223 17.6003C2.5 16.8681 2.5 15.6896 2.5 13.3325V8.33254C2.5 5.97551 2.5 4.797 3.23223 4.06477C3.87255 3.42445 4.85414 3.34407 6.66667 3.33398"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
      <path
        d="M6.66602 2.91602C6.66602 2.22566 7.22566 1.66602 7.91602 1.66602H12.0827C12.773 1.66602 13.3327 2.22566 13.3327 2.91602V3.74935C13.3327 4.4397 12.773 4.99935 12.0827 4.99935H7.91602C7.22566 4.99935 6.66602 4.4397 6.66602 3.74935V2.91602Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
      <path
        d="M10.7329 12.7762H13.334V10M5.83398 13.3333C6.12566 12.5628 6.61402 11.8951 7.24354 11.406C7.87306 10.9169 8.61916 10.626 9.39579 10.5666C10.1724 10.5072 10.9486 10.6815 11.6371 11.0697C12.3255 11.458 12.8976 12.0447 13.2893 12.7629"
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
