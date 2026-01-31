import type { IIconConfig } from '../type';

export const DiscountIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "25"}
      height={config?.height ? `${config.height}` : "24"}
      viewBox="0 0 25 24"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <rect
        x="0.5"
        width={config?.width ? `${config.width}` : "24"}
        height={config?.height ? `${config.height}` : "24"}
        fill={config?.fill ? `${config.fill}` : "url(#pattern0_14780_83325)"}
      />
      <defs>
        <pattern
          id="pattern0_14780_83325"
          patternContentUnits="objectBoundingBox"
          width={config?.width ? `${config.width}` : "1"}
          height={config?.height ? `${config.height}` : "1"}
        >
          <use xlinkHref="#image0_14780_83325" transform="scale(0.015625)" />
        </pattern>
        <image
          id="image0_14780_83325"
          width={config?.width ? `${config.width}` : "64"}
          height={config?.height ? `${config.height}` : "64"}
          preserveAspectRatio="none"
          xlinkHref="data:image/png;base64,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"
        />
      </defs>
    </svg>
  );
};
