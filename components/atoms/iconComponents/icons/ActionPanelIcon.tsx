import type { IIconConfig } from '../type';

export const ActionPanelIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "18"}
      viewBox="0 0 20 18"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.66675 9C1.66675 5.92572 1.66675 4.38858 2.34493 3.29897C2.59584 2.89585 2.9075 2.54522 3.26584 2.26295C4.23438 1.5 5.60072 1.5 8.33342 1.5H11.6667C14.3994 1.5 15.7658 1.5 16.7343 2.26295C17.0927 2.54522 17.4043 2.89585 17.6552 3.29897C18.3334 4.38858 18.3334 5.92572 18.3334 9C18.3334 12.0743 18.3334 13.6114 17.6552 14.701C17.4043 15.1041 17.0927 15.4548 16.7343 15.737C15.7658 16.5 14.3994 16.5 11.6667 16.5H8.33341C5.60072 16.5 4.23438 16.5 3.26584 15.737C2.9075 15.4548 2.59584 15.1041 2.34493 14.701C1.66675 13.6114 1.66675 12.0743 1.66675 9Z"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
      <path
        d="M12.0833 1.5L12.0833 16.5"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M15 4.83301H15.8333M15 7.33301H15.8333"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
