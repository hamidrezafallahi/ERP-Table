import type { IIconConfig } from '../type';

export const CircleEditIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "18"}
      height={config?.height ? `${config.height}` : "18"}
      viewBox="0 0 18 18"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="9"
        cy="9"
        r="8.5"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
      />
      <path
        d="M5 13.0001H13M5 13.0001V11.0001L9 7.00006M5 13.0001L7 13L11 9.00005M9 7.00006L10.4343 5.56573L10.4352 5.56488C10.6326 5.36744 10.7315 5.26854 10.8455 5.2315C10.9459 5.19887 11.0541 5.19887 11.1545 5.2315C11.2685 5.26852 11.3672 5.3673 11.5644 5.56446L12.4343 6.43436C12.6323 6.63237 12.7314 6.73142 12.7685 6.84558C12.8011 6.946 12.8011 7.05418 12.7684 7.1546C12.7314 7.26868 12.6325 7.36758 12.4348 7.56531L12.4343 7.56573L11 9.00005M9 7.00006L11 9.00005"
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
