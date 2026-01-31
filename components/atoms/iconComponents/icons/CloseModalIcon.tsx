import type { IIconConfig } from '../type';

export const CloseModalIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "28"}
      height={config?.height ? `${config.height}` : "28"}
      viewBox="0 0 28 28"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18.6653 18.6663L13.9987 13.9997M13.9987 13.9997L9.33203 9.33301M13.9987 13.9997L18.6654 9.33301M13.9987 13.9997L9.33203 18.6664"
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
