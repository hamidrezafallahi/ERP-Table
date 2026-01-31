import type { IIconConfig } from '../type';

export const Edit = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "16"}
      height={config?.height ? `${config.height}` : "16"}
      viewBox="0 0 15 15"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <path
        d="M5.50015 2H3.40015C2.56007 2 2.13972 2 1.81885 2.16349C1.5366 2.3073 1.3073 2.5366 1.16349 2.81885C1 3.13972 1 3.56007 1 4.40015V11.6001C1 12.4402 1 12.86 1.16349 13.1809C1.3073 13.4632 1.5366 13.6929 1.81885 13.8367C2.1394 14 2.55925 14 3.39768 14H10.6023C11.4408 14 11.86 14 12.1805 13.8367C12.4628 13.6929 12.6929 13.4629 12.8367 13.1807C13 12.8601 13 12.4408 13 11.6023V9.5M10 2.75L5.5 7.25V9.5H7.75L12.25 5M10 2.75L12.25 0.5L14.5 2.75L12.25 5M10 2.75L12.25 5"
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
