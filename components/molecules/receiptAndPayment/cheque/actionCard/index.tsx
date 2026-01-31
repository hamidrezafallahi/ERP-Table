import {
  CSSProperties,
  forwardRef,
  ReactNode,
  RefAttributes,
  useEffect,
  useState,
} from 'react';

import {
  Checkbox,
  Collapse,
} from 'antd';
import { useTranslations } from 'next-intl';

import {
  DownChevron,
  NoData,
} from '@components/atoms/iconComponents';
import {
  useDarkMode,
  useProcessedData,
} from '@hooks/custom';
import { useAppSelector } from '@redux/index';
import { getColoredIcon } from '@utils/core';

import type { IProps } from './type';

const ActionCard = forwardRef(function Card(
  {
    staticKey,
    data,
    actions,
    columnsConfig,
    onActionClick,
    rowFieldKey,
    headerKey,
    selectedItems,
    setSelectedItems,
    selectedHeaderId,
    setSelectedHeaderId,
  }: IProps,
  ref: RefAttributes<HTMLDivElement>["ref"]
) {
  const t = useTranslations();
  const { lang: locale } = useAppSelector((state) => ({
    lang: state.withPersist.config.lang,
  }));

  const processedData = useProcessedData({ data, columnsConfig, locale });
  const { mode = "light" } = useDarkMode();
  const [selectAll, setSelectAll] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);

  const handleSelectRow = (item: number, headerId: number) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter((i) => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
    if (selectedHeaderId.includes(headerId)) {
      setSelectedHeaderId(selectedHeaderId.filter((i) => i !== headerId));
    } else {
      setSelectedHeaderId([...selectedHeaderId, headerId]);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(processedData.map((item) => item[rowFieldKey]));
      setSelectedHeaderId(processedData.map((item) => item[headerKey]));
    } else {
      setSelectedItems([]);
      setSelectedHeaderId([]);
    }
  };

  useEffect(() => {
    if (
      processedData?.length > 0 &&
      selectedItems?.length === processedData?.length
    ) {
      setSelectAll(true);
      setIndeterminate(false);
    } else if (selectedItems?.length > 0) {
      setSelectAll(false);
      setIndeterminate(true);
    } else {
      setSelectAll(false);
      setIndeterminate(false);
    }
  }, [selectedItems]);

  const Header = (item: any, index: number) => {
    const displayData: ReactNode = item[staticKey] as ReactNode;
    return (
      <div
        className="flex justify-between items-center"
        ref={index === processedData.length - 1 ? ref : null}
      >
        <div className="flex items-center gap-2 w-full">
          <Checkbox
            checked={selectedItems.includes(item[rowFieldKey])}
            onClick={(event) => event.stopPropagation()}
            onChange={() => handleSelectRow(item[rowFieldKey], item[headerKey])}
          />
          <p className="w-full text-[0.6rem] text-gray-gray10 dark:text-white">
            {displayData}
          </p>
        </div>

        {/* <CustomTag
        className="bg-state-warning2 text-[0.5rem] text-black-black95"
        bordered={false}
      >
        {(item as any).EconomicCode}
      </CustomTag> */}
      </div>
    );
  };

  const Details = (item) => {
    return (
      <>
        {columnsConfig?.map((el) => (
          <div
            key={el.fieldName}
            className="items-center gap-2 grid grid-cols-2 mx-6"
          >
            <div className="flex flex-col gap-2">
              <p className="text-[0.6rem] text-gray-gray10">
                {el.fieldCaption}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[0.6rem] text-gray-gray7">
                {item[el.fieldName]}
              </p>
            </div>
          </div>
        ))}

        <div className="flex items-center gap-2 ms-6 mt-6 pb-4">
          {actions &&
            actions
              .filter((i) => i.condition === item["DocumentCheque.StateId"])
              .map((action) => (
                <span
                  key={action.MenuDesc}
                  className="cursor-pointer"
                  aria-label={action.MenuDesc}
                  onClick={() => {
                    onActionClick(action, item);
                  }}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(action.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                </span>
              ))}
          {/* <CustomTooltip
              title={
                record.Inactive ? t("general.notActive") : t("general.active")
              }
            >
              <CustomSwitch
                config={{ url: activationUrl, id: id }}
                defaultChecked={record.Inactive ? false : true}
              />
            </CustomTooltip> */}
        </div>
      </>
    );
  };

  const panelStyle: CSSProperties = {
    marginBottom: "0.6rem",
    padding: 0,

    background: "#FBFBFB",

    border: "2px solid",
    borderColor: "#ECECEC",
  };

  const items = processedData?.map((item, index: number) => ({
    key: index.toString(),
    label: Header(item, index),
    children: Details(item),
    style: panelStyle,
  }));

  return (
    <div className="hidden-show-scrollBar pt-3 w-full h-[calc(100dvh-220px)] overflow-y-scroll">
      {processedData?.length > 0 ? (
        <>
          <div className="flex items-center gap-2 m-2">
            <Checkbox
              indeterminate={indeterminate}
              checked={selectAll}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            <p className="text-[0.7rem]">{t("general.selectAll")}</p>
          </div>
          <Collapse
            expandIcon={({ isActive }) => (
              <div className={isActive ? "rotate-180" : ""}>
                <DownChevron />
              </div>
            )}
            expandIconPosition="end"
            style={{
              backgroundColor: "white",
              padding: 0,
              margin: 0,
            }}
            items={items}
            bordered={false}
          />
        </>
      ) : (
        <div className="flex flex-col justify-center items-center gap-8 m-6">
          <NoData />
          <span className="text-gray-gray9 dark:text-white text-sm">
            {t("general.noData")}
          </span>
          {/* <CustomButton
            type="text"
            className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
          >
            {t("general.addNew")}
          </CustomButton> */}
        </div>
      )}
    </div>
  );
});

export default ActionCard;
