import type { IIconConfig } from "../type";

export const MonitorIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "28"}
      height={config?.height ? `${config.height}` : "28"}
      viewBox="0 0 28 28"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.332 2.33594H11.6654C7.8396 2.33594 5.92671 2.33594 4.57075 3.28539C4.06909 3.63666 3.63275 4.073 3.28148 4.57466C2.33203 5.93062 2.33203 7.8435 2.33203 11.6693C2.33203 15.495 2.33203 17.4079 3.28148 18.7639C3.63275 19.2655 4.06909 19.7019 4.57075 20.0532C5.92671 21.0026 7.8396 21.0026 11.6654 21.0026H16.332C20.1578 21.0026 22.0707 21.0026 23.4266 20.0532C23.9283 19.7019 24.3646 19.2655 24.7159 18.7639C25.6654 17.4079 25.6654 15.495 25.6654 11.6693C25.6654 7.8435 25.6654 5.93062 24.7159 4.57466C24.3646 4.073 23.9283 3.63666 23.4266 3.28539C22.0707 2.33594 20.1578 2.33594 16.332 2.33594Z"
        className={
          !config?.stroke ? "stroke-main-black  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12.832 17.5H15.1654"
        className={
          !config?.stroke ? "stroke-main-black  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.9154 25.6667L16.5473 25.178C15.7175 24.0764 15.5118 22.3934 16.0366 21M11.082 25.6667L11.4501 25.178C12.2799 24.0764 12.4856 22.3934 11.9608 21"
        className={
          !config?.stroke ? "stroke-main-black  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8.16602 25.668H19.8327"
        className={
          !config?.stroke ? "stroke-main-black  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
