import { Badge } from "antd";

import type { IProps } from "./type";

export const CustomBadge = ({
  children,
  className,
  count,
  overflowCount,
  dot,
  offset,
  status,
  showZero,
  color,
  style,
  size,
  Ribbon,
  text,
  placement,
}: IProps) => {
  if (Ribbon) {
    return (
      <Badge.Ribbon
        text={text}
        className={className}
        color={color}
        placement={placement}
      >
        {children}
      </Badge.Ribbon>
    );
  } else {
    return (
      <Badge
        className={className}
        count={count}
        overflowCount={overflowCount}
        dot={dot}
        offset={offset}
        status={status}
        showZero={showZero}
        color={color}
        style={style}
        size={size}
      >
        {children}
      </Badge>
    );
  }
};
