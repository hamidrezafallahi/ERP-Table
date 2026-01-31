import type { IIconConfig } from '../type';

export const ErrorStatusIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "18"}
      height={config?.height ? `${config.height}` : "18"}
      viewBox="0 0 18 18"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.99128 7.26217C5.80154 4.05896 6.70667 2.45736 7.9487 2.04508C8.63198 1.81827 9.36802 1.81827 10.0513 2.04508C11.2933 2.45736 12.1985 4.05896 14.0087 7.26217C15.819 10.4654 16.7241 12.067 16.4526 13.372C16.3032 14.0899 15.9352 14.7411 15.4013 15.2322C14.4308 16.125 12.6205 16.125 9 16.125C5.37949 16.125 3.56923 16.125 2.59872 15.2322C2.06481 14.7411 1.69679 14.0899 1.54742 13.372C1.2759 12.067 2.18102 10.4654 3.99128 7.26217Z"
        className={
          !config?.stroke ? "stroke-main-black  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
      />
      <path
        d="M9.18164 12.75V9.74997C9.18164 9.39642 9.18164 9.21964 9.07181 9.1098C8.96197 8.99997 8.78519 8.99997 8.43164 8.99997"
        className={
          !config?.stroke ? "stroke-main-black  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.994 6.74997H9.00073"
        className={
          !config?.stroke ? "stroke-main-black  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
