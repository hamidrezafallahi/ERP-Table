import type { IIconConfig } from '../type';

export const ReceivedChequeIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <>
      <svg
        width={config?.width ? `${config.width}` : "25"}
        height={config?.height ? `${config.height}` : "24"}
        viewBox="0 0 25 24"
        fill={config?.fill ? `${config.fill}` : "none"}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          opacity="0.5"
          d="M2.5 12C2.5 7.28595 2.5 4.92893 3.96447 3.46447C5.42893 2 7.78595 2 12.5 2C17.214 2 19.5711 2 21.0355 3.46447C22.5 4.92893 22.5 7.28595 22.5 12"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
        />
        <path
          d="M2.5 14C2.5 11.1997 2.5 9.79961 3.04497 8.73005C3.52433 7.78924 4.28924 7.02433 5.23005 6.54497C6.29961 6 7.69974 6 10.5 6H14.5C17.3003 6 18.7004 6 19.77 6.54497C20.7108 7.02433 21.4757 7.78924 21.955 8.73005C22.5 9.79961 22.5 11.1997 22.5 14C22.5 16.8003 22.5 18.2004 21.955 19.27C21.4757 20.2108 20.7108 20.9757 19.77 21.455C18.7004 22 17.3003 22 14.5 22H10.5C7.69974 22 6.29961 22 5.23005 21.455C4.28924 20.9757 3.52433 20.2108 3.04497 19.27C2.5 18.2004 2.5 16.8003 2.5 14Z"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
        />
        <path
          d="M10 14.4L11.4286 16L15 12"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
};
