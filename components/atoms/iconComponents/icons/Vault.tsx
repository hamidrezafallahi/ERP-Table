import type { IIconConfig } from '../type';

export const VaultIcon = ({ config }: { config?: IIconConfig }) => {
  return (
<svg width={config?.width ? `${config.width}` : "22"}
      height={config?.height ? `${config.height}` : "22"} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path  className={
          !config?.stroke ? "stroke-gray-gray13  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke} d="M14.667 12.834C14.667 13.5934 15.2826 14.209 16.042 14.209C16.8014 14.209 17.417 13.5934 17.417 12.834C17.417 12.0746 16.8014 11.459 16.042 11.459C15.2826 11.459 14.667 12.0746 14.667 12.834Z" />
<path  className={
          !config?.stroke ? "stroke-gray-gray13  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke} d="M9.16634 6.41667H14.6663C17.2591 6.41667 18.5554 6.41667 19.3609 7.22212C20.1663 8.02758 20.1663 9.32394 20.1663 11.9167V13.75C20.1663 16.3427 20.1663 17.6391 19.3609 18.4445C18.5554 19.25 17.2591 19.25 14.6663 19.25H9.16634C5.70937 19.25 3.98089 19.25 2.90695 18.1761C1.83301 17.1021 1.83301 15.3736 1.83301 11.9167V10.0833C1.83301 6.62637 1.83301 4.89788 2.90695 3.82394C3.98089 2.75 5.70937 2.75 9.16634 2.75H12.833C13.6855 2.75 14.1117 2.75 14.4614 2.8437C15.4104 3.09799 16.1517 3.83924 16.406 4.78825C16.4997 5.13796 16.4997 5.56419 16.4997 6.41667"  strokeLinecap="round"/>
</svg>
  );
};

