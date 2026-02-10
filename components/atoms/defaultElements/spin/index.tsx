import { Spin } from 'antd';

import { LoadingOutlined } from '@ant-design/icons';

import type { IProps } from './type';

export const CustomSpin = ({...props}: IProps) => {
  const{children,indicator,className}=props

  if (children) {
    return (
      <Spin
        indicator={indicator ? indicator : <LoadingOutlined spin />}
      >
        {children}
      </Spin>
    );
  }
  return (
    <Spin
      indicator={indicator ? indicator : <LoadingOutlined spin />}
      className={className}
      {...props}
    />
  );
};
