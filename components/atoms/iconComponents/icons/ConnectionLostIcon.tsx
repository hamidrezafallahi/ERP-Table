import type { IIconConfig } from '../type';

export const ConnectionLostIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "111"}
      height={config?.height ? `${config.height}` : "111"}
      viewBox="0 0 111 111"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M82.5589 53.3918C78.8444 49.4085 74.2963 46.2944 69.2394 44.2717M96.0884 40.7751C90.5166 34.8002 83.6946 30.129 76.1091 27.0951C68.5237 24.0611 60.3626 22.7381 52.2073 23.2226M38.5852 67.481C41.42 64.441 45.0218 62.2213 49.0116 61.0554C53.0015 59.8896 57.232 59.8175 61.2577 60.8528M28.4409 53.3903C32.8271 48.6867 38.3636 45.2076 44.5044 43.2961M14.9092 40.7742C19.0618 36.321 23.9189 32.5816 29.2859 29.7057M20.4149 18.5L85.8223 83.9074M55.4999 87.875C52.9456 87.875 50.8749 85.8043 50.8749 83.25C50.8749 80.6957 52.9456 78.625 55.4999 78.625C58.0542 78.625 60.1249 80.6957 60.1249 83.25C60.1249 85.8043 58.0542 87.875 55.4999 87.875Z"
        className={
          !config?.stroke ? "stroke-main-black  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
