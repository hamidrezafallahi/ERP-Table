import type { IIconConfig } from '../type';

export const LogOut = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <path
        opacity="0.5"
        d="M7.50171 5.83332C7.5118 4.0208 7.59217 3.03921 8.23249 2.39889C8.96473 1.66666 10.1432 1.66666 12.5003 1.66666L13.3336 1.66666C15.6906 1.66666 16.8691 1.66666 17.6014 2.39889C18.3336 3.13112 18.3336 4.30963 18.3336 6.66666L18.3336 13.3333C18.3336 15.6903 18.3336 16.8689 17.6014 17.6011C16.8691 18.3333 15.6906 18.3333 13.3336 18.3333L12.5003 18.3333C10.1432 18.3333 8.96473 18.3333 8.23249 17.6011C7.59217 16.9608 7.5118 15.9792 7.50171 14.1667"
        stroke={config?.stroke ? `${config.stroke}` : "#dc3545"}
        strokeLinecap="round"
      />
      <path
        d="M12.5 10L1.66667 10M1.66667 10L4.58333 7.5M1.66667 10L4.58333 12.5"
        stroke={config?.stroke ? `${config.stroke}` : "#dc3545"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
