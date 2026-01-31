import type { IIconConfig } from '../type';

export const AccountSettingIcon = ({ config }: { config?: IIconConfig }) => {
  return (
<svg width={config?.width ? `${config.width}` : "22"}
      height={config?.height ? `${config.height}` : "22"} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }         stroke={config?.stroke} d="M10.5413 12.8446C8.66527 12.7573 6.76774 13.2065 5.11245 14.1921C3.81558 14.9643 0.415259 16.5411 2.48628 18.5142C3.49796 19.478 4.62471 20.1673 6.0413 20.1673H10.9997"  strokeLinecap="round" strokeLinejoin="round"/>
<path className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }         stroke={config?.stroke} d="M14.208 5.95898C14.208 8.23716 12.3612 10.084 10.083 10.084C7.80483 10.084 5.95801 8.23716 5.95801 5.95898C5.95801 3.68081 7.80483 1.83398 10.083 1.83398C12.3612 1.83398 14.208 3.68081 14.208 5.95898Z" />
<path className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }         stroke={config?.stroke} d="M16.4997 18.9874V20.166M16.4997 18.9874C15.4393 18.9874 14.5051 18.4666 13.9571 17.6757M16.4997 18.9874C17.5601 18.9874 18.4943 18.4666 19.0422 17.6757M16.4997 13.0946C17.5601 13.0946 18.4944 13.6155 19.0423 14.4065M16.4997 13.0946C15.4392 13.0946 14.5049 13.6155 13.957 14.4065M16.4997 13.0946V11.916M20.1663 13.6839L19.0423 14.4065M12.8334 18.3982L13.9571 17.6757M12.833 13.6839L13.957 14.4065M20.166 18.3982L19.0422 17.6757M19.0423 14.4065C19.3663 14.8742 19.5552 15.4363 19.5552 16.041C19.5552 16.6458 19.3663 17.208 19.0422 17.6757M13.957 14.4065C13.633 14.8742 13.4441 15.4363 13.4441 16.041C13.4441 16.6458 13.6331 17.208 13.9571 17.6757"  strokeLinecap="round"/>
</svg>
  );
};




