import type { IIconConfig } from "../type";

export const StopRecordingIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.08333 9.99967C2.08333 6.26772 2.08333 4.40175 3.2427 3.24238C4.40207 2.08301 6.26804 2.08301 9.99999 2.08301C13.7319 2.08301 15.5979 2.08301 16.7573 3.24238C17.9167 4.40175 17.9167 6.26772 17.9167 9.99967C17.9167 13.7316 17.9167 15.5976 16.7573 16.757C15.5979 17.9163 13.7319 17.9163 9.99999 17.9163C6.26804 17.9163 4.40207 17.9163 3.2427 16.757C2.08333 15.5976 2.08333 13.7316 2.08333 9.99967Z"
        fill={config?.fill ? `${config.fill}` : "white"}
        className={!config?.fill ? "fill-white dark:fill-gray-gray1" : ""}
      />
    </svg>
  );
};
