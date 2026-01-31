import type { IIconConfig } from '../type';

export const MyDevicesIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "22"}
      height={config?.height ? `${config.height}` : "22"}
      viewBox="0 0 22 22"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18.332 15.7527C17.2714 16.4987 15.7752 16.4987 12.7827 16.4987H9.13247C6.14 16.4987 4.64376 16.4987 3.58314 15.7527C3.19074 15.4767 2.84944 15.1339 2.57468 14.7397C1.83203 13.6743 1.83203 12.1713 1.83203 9.16536C1.83203 6.1594 1.83203 4.65642 2.57468 3.59103C2.84944 3.19686 3.19074 2.85403 3.58314 2.57803C4.64376 1.83203 6.14 1.83203 9.13247 1.83203"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M11 16.5V20.1667"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
      <path
        d="M7.33203 20.1641H14.6654"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16.4993 1.83203C18.2278 1.83203 19.0921 1.83203 19.629 2.369C20.166 2.90597 20.166 3.77022 20.166 5.4987V9.16536C20.166 10.8938 20.166 11.7581 19.629 12.2951C19.0921 12.832 18.2278 12.832 16.4993 12.832H15.5827C13.8542 12.832 12.99 12.832 12.453 12.2951C11.916 11.7581 11.916 10.8938 11.916 9.16536L11.916 5.4987C11.916 3.77021 11.916 2.90597 12.453 2.369C12.99 1.83203 13.8542 1.83203 15.5827 1.83203L16.4993 1.83203Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16.041 10.5391H16.0492"
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
