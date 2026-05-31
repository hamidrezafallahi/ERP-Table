import React, {
  forwardRef,
  useEffect,
  useState,
} from 'react';

import { ItemType } from 'antd/es/menu/interface';
import {
  useLocale,
  useTranslations,
} from 'next-intl';

import {
  CustomDropdownButton,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import InputText from '@components/atoms/defaultElements/inputText';
import {
  Dots,
  SavePlus,
} from '@components/atoms/iconComponents';
import { useGetData } from '@services/base';

import { CellMeta } from '../';

export interface DescriptionComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
  value?: unknown;
  onChange?: (e: unknown) => void;
  meta: CellMeta;
}
export interface IDesc {
  AccountDescItemId: number;
  AccountDescId: number;
  Desc: string;
}

export const DescriptionComponent = forwardRef<
  HTMLDivElement,
  DescriptionComponentProps
>((props, ref) => {
  const t = useTranslations();
  const [items, setItems] = useState<ItemType[]>([]);
  const locale = useLocale();
  //    const { inputKey, items, isDisabled, lang, handleSaveDescription } = useVoucherDescription({});
  const { meta } = props;
  const dynamicValue = meta.dynamicValue;
  const { endpoint, ...res } = dynamicValue;
  const { data, isLoading } = useGetData<any, IDesc>({
    url: endpoint,
    body: { ...res },
  });
  useEffect(() => {
    if (data?.Result == "Success") {
      const temp: ItemType[] = data.Data.map((item, idx) => ({
        key: idx,
        label: (
          <span
            className="flex text-sm"
            // onClick={() => handleAdjustToZeroBalance(index)}
          >
            {item.Desc}
          </span>
        ),
 
      }));
      setItems(temp)
    }
  }, [data]);
  return (
    <div className="flex justify-between items-center w-full">
      <InputText />

      <CustomDropdownButton
        placement={locale !== "fa" ? "bottomRight" : "bottomLeft"}
        loading={isLoading}
        //   className={`${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} flex bg-gray-gray3 dark:!bg-gray-gray11 p-[6px] rounded h-[2.125rem]`}
        items={items}
        dropdownClassName="max-h-[20rem] max-w-[40vw]"
      >
        <span className="cursor-pointer" id="descriptionsList">
          <Dots />
        </span>
      </CustomDropdownButton>
      <CustomTooltip
      //   title={isDisabled ? t("general.notActive") : t("general.save")}
      //   className={`
      //              bg-gray-gray3 flex justify-center items-center w-[2.125rem] h-[2.125rem] rounded
      //               ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
      //             `}
      >
        <span
          onClick={() => {
            //   if (!isDisabled) {
            //     handleSaveDescription();
            //   }
          }}
        >
          <SavePlus
            config={{
              width: 18,
              height: 18,
              stroke: "black",
            }}
          />
        </span>
      </CustomTooltip>
    </div>
    // key={idx}
    // ref={inputRef}
    // disabled={isDeleted || !editable}
    // value={value == null ? "" : String(value)}
    // className={`${isDeleted && "cursor-not-allowed"}
    //   bg-transparent px-2 outline-none focus-visible:outline-none
    //   focus:outline-none ring-0 focus:!ring-0 focus:ring-offset-0 border transition-colors h-full w-full text-xs bg-red-400 ${meta.className}`}
    // draggable={false}
    // onDragStart={blockDrag}
    // onDragOver={blockDrag}
    // onDrop={blockDrag}
    // onChange={(e) => dispatchChangeValue(e.target.value)}
    // onClick={() => activeCell()}
    // />
  );
});

DescriptionComponent.displayName = "DescriptionComponent";
