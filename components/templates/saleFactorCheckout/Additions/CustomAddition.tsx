import React, { useMemo } from 'react';

import { shallowEqual } from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import { EditPencil } from '@components/atoms/iconComponents';
import {
  IState,
} from '@components/molecules/salesAndPurchase/salesInvoice/type';
import { useAppSelector } from '@redux/index';

import { CustomAdditionProps } from './type';

function CustomAddition({ ...props }: CustomAdditionProps) {
  const { onChange, setIsOpen, content } = props;
  const { theme, elements } = useAppSelector((state) => {
    const theme = state.withPersist.config.theme;
    const activePageId = state.withPersist.pages.find(x=>x.isActive)?.pageId
    const elements:any = []//state.withPersist.factors[activePageId]?.invoice?.factor?.[content.fieldKey]
    return { theme, elements };
  }, shallowEqual);
  const renderElements: IState[] = useMemo(() => {
    return elements?.map((item) => ({
      id: item.id,
          title: item.desc,
          percent: item.PricePercent == 1 ?  <span className='text-state-success3'>↑</span> : item.ElementType == 2 ? <span className='text-state-error1'>↓</span> : <span>-</span>,
          amount: item.amount,
        }));
      }, [elements, content.fieldKey]);
  return (
    <>
      <CustomButton
        type="text"
        className="flex flex-col w-full !h-full"
        onClick={() => {
          setIsOpen(true);
          onChange?.(content);
        }}
      >
        <div className="flex items-center gap-2 w-full">
          <div>{content.icon}</div>
          <div>{content.label}</div>
          <CustomButton className="bg-main-black dark:bg-main-white m-0 p-2">
            <EditPencil
              config={{ stroke: theme == "light" ? "#fff" : "#000" }}
            />
          </CustomButton>
        </div>
        <div className="flex flex-col gap-2 p-2 border rounded-lg w-full !h-full">
          {renderElements?.map((item, index) => (
            <div className="flex justify-between gap-2 w-full text-start" key={index}>
              <div className="text-gray-gray10">{index + 1}</div>
              <div className="w-full overflow-hidden text-main-black text-ellipsis">{item.title}</div>
              <div className="text-gray-gray10">{item.percent}</div>
              <div className="text-gray-gray10">{item.amount}</div>
            </div>
          ))}
        </div>
      </CustomButton>
    </>
  );
}

export default CustomAddition;
