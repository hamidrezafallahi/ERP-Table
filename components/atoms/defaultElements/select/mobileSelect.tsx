import { Dispatch, FC, useCallback, useEffect, useState } from "react";

import { SelectProps } from "antd";
import { useTranslations } from "next-intl";
import { useDispatch } from "react-redux";

import { Reload } from "@components/atoms/iconComponents";
import { setPageData } from "@slice/pages";
import { IFormFieldConfig } from "@type/elementType";

import InputText from "../inputText";
import { CustomModal } from "../modal";
import { ChevronDownIcon } from "@components/atoms/iconComponents/icons/ChevronDownIcon ";

export interface IProps extends SelectProps {
  config?: IFormFieldConfig;
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
  searchPhrase?: any;
  setSearchPhrase?: Dispatch<any>;
  disabled?: boolean;
}

export const MobileSelect: FC<IProps> = ({
  options,
  config,
  handleScroll,
  fieldValue,
  addButton,
  handleAddNew,
  handleRefetch,
  isFetching,
  searchPhrase,
  setSearchPhrase,
  disabled,
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
          }),
        );
      }
      props.onChange && props.onChange(e);
    },
    [config],
  );
  const [openModal, setOpenModal] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options ?? []);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [internalSearch, setInternalSearch] = useState("");

  const phrase = searchPhrase ?? internalSearch;
  const setPhrase = setSearchPhrase ?? setInternalSearch;

  useEffect(() => {
    if (!fieldValue) {
      setSelectedTitle("");
      return;
    }
    if (options && options.length > 0) {
      const correctValue = options.find((item) => item.value === fieldValue);
      if (correctValue) {
        const title = correctValue?.title ?? correctValue?.label;
        setSelectedTitle(title?.toString());
      }
    }
  }, [options, fieldValue]);

  useEffect(() => {
    if (phrase) {
      const searchFilter = (options ?? []).filter((option) => {
        const text = option.label ?? option.title ?? "";
        return text.toString().toLowerCase().includes(phrase.toLowerCase());
      });

      setFilteredOptions(searchFilter);
    } else {
      setFilteredOptions(options);
    }
  }, [phrase, options]);

  return (
    <>
      <div
        className={`${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} flex items-center justify-between !bg-gray-gray3 dark:!bg-gray-gray10 px-2 border-1 hover:border-gray-gray5 focus:border-gray-gray5 active:border-gray-gray5 !border-none rounded ring-0 focus:ring-0 w-full h-[42px] text-sm ant-input-outlined`}
        onClick={(e) => {
          if (disabled) return;
          e.preventDefault();
          e.stopPropagation();
          setOpenModal(true);
        }}
      >
        <span>{selectedTitle ? selectedTitle : t("general.selectField")}</span>

        <ChevronDownIcon
          config={{
            width: 16,
            height: 16,
            className: `text-gray-600 transition-transform duration-200 ${
              openModal ? "rotate-180" : ""
            }`,
          }}
        />
      </div>

      {openModal && !disabled && (
        <CustomModal
          headerDescription={
            config
              ? `${config.caption} را ${t("general.selectField")}`
              : t("general.selectField")
          }
          closeModal={() => {
            setOpenModal(false);
            setPhrase("");
          }}
          isModalOpen={openModal}
          content={
            <div className="flex flex-col gap-3 p-4 w-full h-[calc(100dvh-64px)]">
              {props.showSearch && (
                <InputText
                  disabled={props.showSearch ? false : true}
                  placeholder={
                    props.showSearch
                      ? t("general.search")
                      : t("general.selectField")
                  }
                  value={phrase}
                  onChange={(e) => setPhrase?.(e.target.value)}
                />
              )}
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

              <div
                className={`${filteredOptions?.length === 0 ? "justify-center" : "justify-start"} flex flex-col gap-2 w-full h-[calc(100dvh-167px)] mb-4 overflow-y-auto`}
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
                        setPhrase("");
                      }}
                      className={`${
                        fieldValue === option.value
                          ? "bg-blue-blue005 font-bold"
                          : ""
                      } flex items-center gap-2 w-full text-sm p-2 rounded cursor-pointer min-h-[44px]`}
                    >
                      {fieldValue === option.value && (
                        <span className="text-base">✔</span>
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
