import type { IIconConfig } from '../type';

export const PhysicalCharacteristicsIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "24"}
      height={config?.height ? `${config.height}` : "24"}
      viewBox="0 0 24 24"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
       <path d="M11.25 3.86719C11.25 5.10983 9.93134 6.49219 9 6.49219C8.06866 6.49219 6.75 5.10983 6.75 3.86719C6.75 2.62455 7.75736 1.61719 9 1.61719C10.2426 1.61719 11.25 2.62455 11.25 3.86719Z" className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}/>

      <path d="M12.0311 6.86719C13.1733 7.86867 13.9135 9.56483 13.2488 11.1461C13.1056 11.4867 12.7771 11.7076 12.4135 11.7076C12.0439 11.7076 11.4367 11.5892 11.3187 12.0703L10.4958 15.4264C10.3242 16.1263 9.70749 16.6172 8.99999 16.6172C8.29249 16.6172 7.67578 16.1263 7.50419 15.4264L6.68125 12.0703C6.56328 11.5892 5.95612 11.7076 5.58647 11.7076C5.22293 11.7076 4.89437 11.4867 4.75116 11.1461C4.0865 9.56483 4.82668 7.86867 5.96893 6.86719" className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke} strokeLinecap="round"/>

    
    </svg>
  );
};
