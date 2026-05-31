import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import { SelectProps } from 'antd';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import { NewButton } from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { setPageData } from '@slice/pages';
import { IEffectiveTypeInFactor } from '@slice/pages/factors/type';

import RowField from './rowField';

interface IProps {
  // fieldKey: "addElements"|"discountItems"|"taxItems";
  Options: SelectProps["options"];
}

function AddElementItem({ ...props }: IProps) {
  const { Options } = props;
   const { Factor} = useAppSelector((state) => {
     const Factor = state.withPersist.pages?.find(
       (p) => p.isActive
     )?.pageData?.find(i=>i.name == "factor")?.value;
     
     return { Factor};
   }, shallowEqual);
  const t = useTranslations();
  const dispatch = useDispatch();

  const containerRef = useRef(null);
  const template: IEffectiveTypeInFactor = {
    amount: null,
    PricePercent: null,
    deletable: true,
    id: Math.random(),
    title: null,
    desc: "",
    type: 0,
  };
  const [array, setArray] = useState<IEffectiveTypeInFactor[]>([]);
  const handleAddElement = () => {
    setArray((prev) => [...prev, { ...template }]);
    if (containerRef) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };
  const handleAcceptElement = () => {
        dispatch(setPageData({name:"elements",value:array }));
  };
  useEffect(() => {
    if (Factor?.addElements) {
      let temp: IEffectiveTypeInFactor[] = [];
      Factor.addElements.forEach((element) => {
        let subTemp: IEffectiveTypeInFactor = {
          id: Math.random(),
          PricePercent: element.PricePercent,
          amount: element.amount,
          desc: element.desc,
          deletable: element.deletable,
          title: element.title,
          type: element.type,
        };
        temp.push(subTemp);
      });
      setArray(temp);
    }
  }, [Factor]);
  console.log(array)
  return (
    <div className="flex flex-col gap-2 h-full overflow-hidden">
      <div className="flex justify-end items-center w-full">
        <CustomButton
          className="bg-main-black dark:bg-main-white px-2 h-fit text-main-white dark:text-main-black"
          type="text"
          onClick={handleAddElement}
        >
          <NewButton config={{ width: 22, height: 23 }} />
        </CustomButton>
      </div>
      <div
        ref={containerRef}
        className="hidden-show-scrollBar relative border rounded-lg w-full h-full overflow-auto scroll-smooth"
      >
        {array.map((item, index) => (
          <RowField
            key={index}
            item={item}
            setArray={setArray}
            Options={Options}
          />
        ))}
      </div>
      <div className="flex justify-end items-center w-full">
        <CustomButton
          className="bottom-4 left-4 absolute bg-main-black dark:bg-main-white text-main-white dark:text-main-black"
          onClick={handleAcceptElement}
          type="text"
        >
          {t("general.apply2")}
        </CustomButton>
      </div>
    </div>
  );
}

export default AddElementItem;
