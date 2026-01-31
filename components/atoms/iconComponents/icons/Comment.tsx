import type { IIconConfig } from '../type';

export const CommentIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "16"}
      height={config?.height ? `${config.height}` : "16"}
      viewBox="0 0 16 16"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.25814 14.5015C5.35938 15.1366 6.63711 15.5 7.9997 15.5C12.1418 15.5 15.5 12.1421 15.5 8C15.5 3.85786 12.1421 0.5 8 0.5C3.85786 0.5 0.5 3.85786 0.5 8C0.5 9.3626 0.86337 10.6403 1.49849 11.7416L1.50095 11.7458C1.56207 11.8518 1.59288 11.9052 1.60684 11.9557C1.62001 12.0033 1.62368 12.0462 1.62031 12.0955C1.61669 12.1484 1.59884 12.2034 1.56224 12.3132L0.921549 14.2352L0.920743 14.2377C0.785565 14.6433 0.717976 14.846 0.766153 14.9811C0.808161 15.0989 0.901404 15.1919 1.01921 15.2339C1.15401 15.282 1.35587 15.2147 1.75962 15.0801L1.76465 15.0783L3.68671 14.4376C3.79614 14.4011 3.85178 14.3826 3.90466 14.379C3.95396 14.3756 3.99648 14.3801 4.04411 14.3932C4.09474 14.4072 4.1482 14.4381 4.2547 14.4995L4.25814 14.5015Z"
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
