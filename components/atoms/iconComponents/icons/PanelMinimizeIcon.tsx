import type { IIconConfig } from '../type';

export const PanelMinimizeIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.08325 9.99967C2.08325 6.26772 2.08325 4.40175 3.24262 3.24238C4.40199 2.08301 6.26797 2.08301 9.99992 2.08301C13.7319 2.08301 15.5978 2.08301 16.7572 3.24238C17.9166 4.40175 17.9166 6.26772 17.9166 9.99967C17.9166 13.7316 17.9166 15.5976 16.7572 16.757C15.5978 17.9163 13.7319 17.9163 9.99992 17.9163C6.26797 17.9163 4.40199 17.9163 3.24262 16.757C2.08325 15.5976 2.08325 13.7316 2.08325 9.99967Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth={config?.strokeWidth ? `${config.strokeWidth}` : "1.5"}
      />
      <path
        d="M10.9722 6.66699L12.6758 8.42898C13.3919 9.16972 13.75 9.54009 13.75 10.0003C13.75 10.4606 13.3919 10.8309 12.6758 11.5717L10.9722 13.3337M6.25 6.66699L7.95353 8.42898C8.66969 9.16972 9.02778 9.54009 9.02778 10.0003C9.02778 10.4606 8.6697 10.8309 7.95353 11.5717L6.25 13.3337"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth={config?.strokeWidth ? `${config.strokeWidth}` : "1.5"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
