import {
  FC,
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Tree,
  TreeSelectProps,
} from 'antd';
import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';

import {
  DownChevron,
  Reload,
} from '@components/atoms/iconComponents';
import { setPageData } from '@slice/pages';
import { IFormFieldConfig } from '@type/elementType';
import { findItemInNestedData } from '@utils/core';

import InputText from '../inputText';
import { CustomModal } from '../modal';

export interface IProps extends TreeSelectProps {
  config?: IFormFieldConfig;
  fieldValue: any;
  addButton?: {
    url?: string;
    systemId?: number;
    repoId?: number;
  };
  handleAddNew?: () => void;
  handleRefetch?: () => void;
  isFetching?: boolean;
}

const switcherIcon = (nodeProps) => (
  <>
    {nodeProps?.expanded ? (
      <span className={`custom-switcher-icon ${"rotate-180"} h-full `}>
        <DownChevron />
      </span>
    ) : (
      <span className="custom-switcher-icon">
        <DownChevron />
      </span>
    )}
  </>
);

export const MobileTreeSelect: FC<IProps> = ({
  treeData,
  config,
  fieldValue,
  addButton,
  handleAddNew,
  handleRefetch,

  isFetching,
  ...props
}) => {
  const t = useTranslations();
  const dispatch = useDispatch();

  const selectHandler = useCallback(
    (value, label, extra) => {
      if (config) {
        const {
          caption,
          help,
          name,
          order,
          placeHolder,
          rules,
          type,
          selectEndpoint,
        } = config;

        dispatch(
          setPageData({
            caption,
            help,
            name,
            order,
            placeHolder,
            rules,
            type,
            selectEndpoint,
            value: value,
          })
        );
      }
      props.onChange && props.onChange(value, label, extra);
    },
    [config]
  );
  const [openModal, setOpenModal] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(treeData);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [searchPhrase, setSearchPhrase] = useState("");

  const allKeys = filteredOptions.map((i) => i.key);

  const handleSelect = (selectedKeys: number[]) => {
    if (selectedKeys.length > 0) {
      selectHandler(selectedKeys[0], null, null);
      setOpenModal(false);
    }
  };

  const findOptionWithTitle = (data: any[], searchTerm: string) => {
    const results = [];
    const search = (items) => {
      items.forEach((item) => {
        if (
          item?.title?.includes(searchTerm) ||
          item?.label?.includes(searchTerm)
        ) {
          results.push(item);
        }
        if (item.children && item.children.length > 0) {
          search(item.children);
        }
      });
    };
    search(data);
    return results;
  };

  useEffect(() => {
    if (treeData && treeData.length > 0) {
      const correctItem = findItemInNestedData(treeData, "value", fieldValue);

      if (correctItem) {
        const title = correctItem?.title ?? correctItem?.label;
        setSelectedTitle(title);
      }
    }
  }, [treeData, fieldValue]);

  useEffect(() => {
    if (searchPhrase) {
      const searchFilter = findOptionWithTitle(treeData, searchPhrase);
      if (searchFilter.length === 1) {
        selectHandler(searchFilter[0].value, null, null);
      }

      setFilteredOptions(searchFilter);
    } else {
      setFilteredOptions(treeData);
    }
  }, [searchPhrase, treeData]);

  return (
    <>
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpenModal(true);
        }}
      >
        <InputText
          value={selectedTitle ? selectedTitle : t("general.selectField")}
        />
      </div>

      {openModal && (
        <CustomModal
          headerDescription={
            config
              ? `${config.caption} را ${t("general.selectField")}`
              : t("general.selectField")
          }
          closeModal={() => setOpenModal(false)}
          isModalOpen={openModal}
          content={
            <div className="flex flex-col gap-2 p-2 w-full h-[95%]">
              <InputText
                disabled={props.showSearch ? false : true}
                placeholder={
                  props.showSearch
                    ? t("general.search")
                    : t("general.selectField")
                }
                value={searchPhrase ?? selectedTitle}
                onChange={(e) => {
                  const searchValue = e?.target?.value;
                  setSearchPhrase?.(searchValue);
                }}
              />

              {handleRefetch && (
                <div
                  className={`${
                    isFetching ? "animate-spin" : ""
                  } top-6 left-4 absolute cursor-pointer transition-all duration-400`}
                  onClick={handleRefetch}
                >
                  <Reload
                    config={{
                      height: 16,
                      width: 16,
                    }}
                  />
                </div>
              )}

              <div className="flex flex-col gap-2 p-2 w-full h-[95%] overflow-y-auto">
                {filteredOptions?.length === 0 ? (
                  <div className="text-center">{t("sidebar.notFound")}</div>
                ) : (
                  <Tree
                    showLine={{ showLeafIcon: false }}
                    selectedKeys={fieldValue ? [fieldValue] : []}
                    onSelect={handleSelect}
                    treeData={filteredOptions}
                    expandedKeys={allKeys}
                    switcherIcon={switcherIcon}
                  />
                )}
              </div>
              {!!addButton && (
                <div
                  className="p-2 font-xs font-bold cursor-pointer"
                  onClick={handleAddNew}
                >
                  {t("general.addNew")}
                </div>
              )}
            </div>
          }
        />
      )}
    </>
  );
};
