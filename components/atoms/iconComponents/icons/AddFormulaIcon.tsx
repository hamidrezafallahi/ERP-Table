import type { IIconConfig } from '../type';

export const AddFormulaIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "28"}
      height={config?.height ? `${config.height}` : "28"}
      viewBox="0 0 28 28"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 20.9999L14 13.5874M14 13.5874C14 13.5874 14 6.99995 13.9999 6.53328M14 13.5874L21.4667 13.5875M14 13.5874L6.53333 13.5875"
        className={
          !config?.stroke ? "stroke-[#0E0E0E] dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
