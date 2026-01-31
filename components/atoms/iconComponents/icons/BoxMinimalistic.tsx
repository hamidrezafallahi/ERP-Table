import type { IIconConfig } from '../type';

export const BoxMinimalistic = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <path
        d="M12.9815 2.81827L14.6482 3.69289C16.4412 4.63384 17.3378 5.10432 17.8356 5.94974C18.3334 6.79517 18.3334 7.84718 18.3334 9.95122V10.0487C18.3334 12.1527 18.3334 13.2048 17.8356 14.0502C17.3378 14.8956 16.4412 15.3661 14.6482 16.307L12.9815 17.1817C11.5185 17.9494 10.787 18.3333 10.0001 18.3333C9.21319 18.3333 8.48168 17.9494 7.01866 17.1817L5.35199 16.307C3.55894 15.3661 2.66241 14.8956 2.16458 14.0502C1.66675 13.2048 1.66675 12.1527 1.66675 10.0487V9.95122C1.66675 7.84718 1.66675 6.79517 2.16458 5.94974C2.66241 5.10432 3.55894 4.63384 5.35199 3.69289L7.01866 2.81826C8.48168 2.05051 9.21319 1.66663 10.0001 1.66663C10.787 1.66663 11.5185 2.05051 12.9815 2.81827Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
      />
      <path
        opacity="0.5"
        d="M17.5 6.25L10 10M10 10L2.5 6.25M10 10V17.9167"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
      />
    </svg>
  );
};
