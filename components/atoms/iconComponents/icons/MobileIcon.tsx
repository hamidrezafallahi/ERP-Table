


import type { IIconConfig } from '../type';

export const MobileIcon = ({ config }: { config?: IIconConfig }) => {
  return (
<svg   width={config?.width ? `${config.width}` : "18"}
      height={config?.height ? `${config.height}` : "25"} viewBox="0 0 18 25"   fill={config?.fill ? `${config.fill}` : "none"}  xmlns="http://www.w3.org/2000/svg">
<path d="M0.75 8.91667C0.75 5.06686 0.75 3.14196 1.94598 1.94598C3.14196 0.75 5.06686 0.75 8.91667 0.75C12.7665 0.75 14.6914 0.75 15.8874 1.94598C17.0833 3.14196 17.0833 5.06686 17.0833 8.91667V15.9167C17.0833 19.7665 17.0833 21.6914 15.8874 22.8874C14.6914 24.0833 12.7665 24.0833 8.91667 24.0833C5.06686 24.0833 3.14196 24.0833 1.94598 22.8874C0.75 21.6914 0.75 19.7665 0.75 15.9167V8.91667Z" className={
          !config?.stroke ? "stroke-main-black  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke} strokeWidth={config?.strokeWidth ? `${config.strokeWidth}` : "1.5"}  strokeLinecap="round"/>
<path d="M7.75 20.5859H10.0833"   className={
          !config?.stroke ? "stroke-main-black  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke} strokeWidth={config?.strokeWidth ? `${config.strokeWidth}` : "1.5"}    strokeLinecap="round"
        strokeLinejoin="round"/>



<path d="M5.41797 0.75L5.52181 1.37302C5.74683 2.72317 5.85934 3.39825 6.32236 3.80905C6.80534 4.23757 7.49014 4.25 8.91797 4.25C10.3458 4.25 11.0306 4.23757 11.5136 3.80905C11.9766 3.39825 12.0891 2.72317 12.3141 1.37302L12.418 0.75"
 className={
    !config?.stroke ? "stroke-main-black  dark:stroke-gray-gray1" : ""
  }
  stroke={config?.stroke}strokeWidth={config?.strokeWidth ? `${config.strokeWidth}` : "1.5"}   strokeLinejoin="round"/>
</svg>

  );
};




