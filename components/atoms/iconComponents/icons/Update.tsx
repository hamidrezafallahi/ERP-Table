import type { IIconConfig } from "../type";

export const Update = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "10"}
      height={config?.height ? `${config.height}` : "12"}
      viewBox="0 0 10 12"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.16569 8.33333H9.08236V11.25M3.83236 3.66667H0.91569V0.75M9.32593 4.25199C8.99886 3.44247 8.45126 2.74094 7.74536 2.22713C7.03946 1.71333 6.2037 1.40772 5.33284 1.3453C4.46199 1.28287 3.59089 1.46598 2.81893 1.87386C2.04696 2.28173 1.405 2.89815 0.96582 3.65274M0.671875 7.74829C0.998941 8.55781 1.54654 9.25934 2.25244 9.77314C2.95834 10.287 3.79495 10.5922 4.66581 10.6546C5.53667 10.717 6.40705 10.5339 7.17901 10.1261C7.95098 9.71819 8.5925 9.10188 9.03169 8.34729"
        className={
          !config?.stroke ? "stroke-gray-gray7  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
