import { Avatar } from "antd";

import { UserOutlined } from "@ant-design/icons";

import type { IProps } from "./type";

export const CustomAvatar = ({
  icon,
  shape,
  size,
  gap,
  src,
  className,
}: IProps) => (
  <Avatar
    className={className}
    shape={shape}
    size={size}
    icon={icon ? icon : <UserOutlined />}
    gap={gap}
    src={src}
  />
);
