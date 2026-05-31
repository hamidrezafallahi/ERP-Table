import {
  FC,
  useState,
} from 'react';

import { Tooltip } from 'antd';
import { shallowEqual } from 'react-redux';

import { useAppSelector } from '@hooks/custom/useAppSelector';

import type { IProps } from './type';

export const CustomTooltip: FC<IProps> = ({ children, ...rest }) => {
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  },shallowEqual);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const handleClick = () => {
    setTooltipVisible(!tooltipVisible);
  };

  return (
    <>
      {rest?.title ? (
        <Tooltip
          {...rest}
          color={rest.color ? rest.color : "#585858"}
          open={tooltipVisible}
          arrow={true}
          classNames={{ root: "" }}
          onOpenChange={(visible) => setTooltipVisible(visible)}
        >
          <span
            onClick={handleClick}
            onMouseEnter={() => match && setTooltipVisible(true)}
            onMouseLeave={() => match && setTooltipVisible(false)}
          >
            {children}
          </span>
        </Tooltip>
      ) : (
        <>{children}</>
      )}
    </>
  );
};
