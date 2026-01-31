import { Collapse } from 'antd';

import type { IProps } from './type';

export const CustomCollapse = ({
  accordion,
  activeKey,
  bordered,
  collapsible,
  defaultActiveKey,
  destroyInactivePanel,
  ghost,
  size,
  onChange,
}: IProps) => {
  return (
    <Collapse
      accordion={accordion}
      activeKey={activeKey}
      bordered={bordered}
      collapsible={collapsible}
      defaultActiveKey={defaultActiveKey}
      destroyInactivePanel={destroyInactivePanel}
      // expandIcon={expandIcon}
      // expandIconPosition={expandIconPosition}
      ghost={ghost}
      size={size}
      onChange={onChange}
      // items={items}
    />
  );
};
