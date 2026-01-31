import { Button } from "antd";

import type { IProps } from "./type";

export const CustomButton = ({ children, ...rest }: IProps) => {
  return (
    <>
      <Button {...rest}>{children}</Button>
    </>
  );
};
