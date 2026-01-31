import {
  Dispatch,
  SetStateAction,
} from 'react';

import { SelectProps } from 'antd';
import { useTranslations } from 'next-intl';

import {
  CustomButton,
  CustomSelect,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import { CloseModalIcon } from '@components/atoms/iconComponents';
import {
  ElementTypeEnum,
} from '@services/sale/increasingAndDecreasingFactors/type';
import { IEffectiveTypeInFactor } from '@slice/pages/factors/type';

interface IRowField {
  key: number;
  item: IEffectiveTypeInFactor;
  setArray: Dispatch<SetStateAction<IEffectiveTypeInFactor[]>>;
  Options: SelectProps["options"];
}

const RowField = ({ ...props }: IRowField) => {
  const { item, setArray, Options } = props;
  const t = useTranslations();
  const onChangeTitle = (e) => {
    setArray((prev) =>
      prev.map((row, i) => (row.id === item.id ?
         { ...row, title: e,desc:Options.find(item=>item.value == e)?.label  as string,type: 2,amount: 2} 
         : row))
    );
  };
  const onRemove = () => {
    setArray((prev) => prev.filter((row) => row.id !== item.id));
  };
  console.log(item)
  return (
    <div className="flex justify-between p-4 w-full">
      <CustomSelect
        className="min-w-60"
        value={item.title}
        onChange={onChangeTitle}
        options={Options}
      />
      <div>
        {item.type === ElementTypeEnum.Increasing ? (
          <CustomTooltip title={t("general.increasingFactor")}>
            <span>↑</span>
          </CustomTooltip>
        ) : item.type === ElementTypeEnum.Decreasing ? (
          <CustomTooltip title={t("general.decreasingFactor")}>
            <span>↓</span>
          </CustomTooltip>
        ) : (
          <></>
        )}
      </div>
      <CustomButton
        type="text"
        disabled={!item.deletable}
        className="bg-gray-gray3 p-0"
        onClick={onRemove}
      >
        <CloseModalIcon />
      </CustomButton>
    </div>
  );
};
export default RowField;
