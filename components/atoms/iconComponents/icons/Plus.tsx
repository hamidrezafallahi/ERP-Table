import type { IIconConfig } from '../type';

export const PlusIcon = ({ config }: { config?: IIconConfig }) => {
  return (
<svg

width={config?.width ? `${config.width}` : "60"}
      height={config?.height ? `${config.height}` : "60"} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
<path 
 className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
d="M30 44.9996L30 29.1157M30 29.1157C30 29.1157 30 14.9996 29.9999 13.9996M30 29.1157L46 29.1157M30 29.1157L14 29.1157" stroke={config?.stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
  );
};
