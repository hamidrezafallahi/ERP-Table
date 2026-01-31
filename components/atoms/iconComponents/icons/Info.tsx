import type { IIconConfig } from "../type";

export const Info = ({ config }: { config?: IIconConfig }) => {
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={config?.width ? `${config.width}` : "20"}
        height={config?.height ? `${config.height}` : "20"}
        viewBox="0 0 20 20"
        fill={config?.fill ? `${config.fill}` : "none"}
      >
        <path
          d="M10 9.16667V13.3333M10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10C17.5 14.1421 14.1421 17.5 10 17.5ZM10.0415 6.66667V6.75L9.9585 6.75016V6.66667H10.0415Z"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
};


