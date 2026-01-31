import {
  Dispatch,
  FC,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { SelectProps } from 'antd';
import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';

import { Reload } from '@components/atoms/iconComponents';
import { setPageData } from '@slice/pages';
import { IFormFieldConfig } from '@type/elementType';

import InputText from '../inputText';
import { CustomModal } from '../modal';

export interface IProps extends SelectProps {
  config?: IFormFieldConfig;
  searchPhrase?: any;
  setSearchPhrase?: Dispatch<any>;
  handleScroll?: (e: any) => void;
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

export const MobileSelect: FC<IProps> = ({
  options,
  config,
  handleScroll,
  searchPhrase,
  setSearchPhrase,
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
    (e) => {
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
            value: e,
          })
        );
      }
      props.onChange && props.onChange(e);
    },
    [config]
  );
  const [openModal, setOpenModal] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options ?? []);
  const [selectedTitle, setSelectedTitle] = useState("");

  useEffect(() => {
    if (options && options.length > 0) {
      const correctValue = options.find((item) => item.value === fieldValue);
      if (correctValue) {
        const title = correctValue?.title ?? correctValue?.label;
        setSelectedTitle(title.toString());
      }
    }
  }, [options, fieldValue]);

  useEffect(() => {
    if (searchPhrase) {
      const searchFilter = options.filter((option) =>
        option.title.includes(searchPhrase)
      );

      setFilteredOptions(searchFilter);
    } else {
      setFilteredOptions(options);
    }
  }, [searchPhrase, options]);

  return (
    <>
      <div
        className="flex items-center !bg-gray-gray3 dark:!bg-gray-gray10 px-2 border-1 hover:border-gray-gray5 focus:border-gray-gray5 active:border-gray-gray5 !border-none rounded ring-0 focus:ring-0 w-full h-[42px] text-sm ant-input-outlined"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpenModal(true);
        }}
      >
        {selectedTitle ? selectedTitle : t("general.selectField")}
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
              {props.showSearch && (
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
              )}
              {handleRefetch && (
                <div
                  className={`${
                    isFetching ? "animate-spin" : ""
                  } top-2 left-10 absolute cursor-pointer transition-all duration-400`}
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

              <div
                className="flex flex-col gap-2 p-2 w-full h-[95%] overflow-y-auto"
                onScroll={handleScroll}
              >
                {filteredOptions?.length === 0 ? (
                  <div className="text-center">{t("sidebar.notFound")}</div>
                ) : (
                  filteredOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => {
                        selectHandler(option.value);
                        setOpenModal(false);
                      }}
                      className={`${
                        fieldValue === option.value
                          ? "bg-blue-blue005 font-bold"
                          : ""
                      } flex items-center gap-2 w-full text-sm p-2 rounded cursor-pointer`}
                    >
                      {fieldValue === option.value && (
                        <span className="text-[16px]">✔</span>
                      )}
                      <span
                        className={`${
                          fieldValue === option.value ? " font-bold" : ""
                        } `}
                      >
                        {option.label}
                      </span>
                    </div>
                  ))
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
