import type { IIconConfig } from '../type';

export const UserCheck = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <path
        d="M12.5 15.8333C12.5 13.9923 10.2614 12.4999 7.5 12.4999C4.73858 12.4999 2.5 13.9923 2.5 15.8333M17.5 8.33325L14.1667 11.6666L12.5 9.99992M7.5 9.99992C5.65905 9.99992 4.16667 8.50753 4.16667 6.66659C4.16667 4.82564 5.65905 3.33325 7.5 3.33325C9.34095 3.33325 10.8333 4.82564 10.8333 6.66659C10.8333 8.50753 9.34095 9.99992 7.5 9.99992Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
