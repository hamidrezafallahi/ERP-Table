import {
  FC,
  useCallback,
  useEffect,
} from 'react';

import { Select } from 'antd';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  PlusOutline,
  Reload,
} from '@components/atoms/iconComponents';
import { useInitializePage } from '@hooks/custom';
import { useAppSelector } from '@redux/index';
import { setPageData } from '@slice/pages';

import { MobileSelect } from './mobileSelect';
import type { IProps } from './type';

export const CustomSelect: FC<IProps> = ({
  ref,
  searchPhrase,
  setSearchPhrase,
  handleScroll,
  addButton,
  handleRefetch,
  isFetching,
  ...props
}) => {
  const { config } = props;
  const t = useTranslations();
  const dispatch = useDispatch();
  const initializePage = useInitializePage();

  const { match, lang, pageId, existField, initElement, defaultElement } =
    useAppSelector((state) => {
      const match = state.withPersist.config.initMatch;
      const pageId = state.withPersist.pages.find(
        (item) => item.isActive
      )?.pageId;
      const lang = state.withPersist.config.lang;
      const existField = state.withPersist.pages
        .find((item) => item.isActive)
        ?.pageData?.find((field) => field.name === config?.name)
        ? true
        : false;
      if (!config)
        return { match, lang, pageId, existField: null, initElement: null };
      const initElement = state.withPersist.pages
        .find((item) => item.isActive)
        ?.pageData?.find((element) => element.name === config.name)?.value;
      const defaultElement = state.withPersist.config.defaultConfigs;

      return { match, lang, pageId, existField, initElement, defaultElement };
    }, shallowEqual);

  // const globalCurrencyValue = getCookie("CurrencyId").split("/")[0];
  // const globalYearValue = getCookie("YearId").split("/")[0];
  // const globalPlaceValue = getCookie("PlaceId").split("/")[0];
  // const globalCashierValue = getCookie("CashierId").split("/")[0];
  const globalCurrencyValue = defaultElement?.CurrencyId?.id;
  const globalYearValue = defaultElement?.YearId?.id;
  const globalPlaceValue = defaultElement?.PlaceId?.id;
  const globalCashierValue = defaultElement?.CashierId?.id;

  let defaultValue;


    if (config?.name) {
      if (config.name.includes("CurrencyId")) {
        defaultValue = Number(globalCurrencyValue);
      }
      if (config.name.includes("CashierId")) {
        defaultValue = Number(globalCashierValue);
      }
      if (config.name.includes("YearId")) {
        defaultValue = Number(globalYearValue);
      }
      if (config.name.includes("PlaceId")) {
        defaultValue = Number(globalPlaceValue);
      }
    }
  

  useEffect(() => {
    if (config) {
      const { name, setFieldValue } = config;
      if (initElement !== undefined) {
        setFieldValue && setFieldValue(name, initElement);
      } else {
        if (defaultValue) {
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
              value: defaultValue,
            })
          );
          setFieldValue && setFieldValue(name, defaultValue);
        }
      }
    }
  }, [initElement]);

  const defaultClass = `dark:!bg-gray-gray95 ${
    match ? "h-[2.125rem]" : "h-[42px] text-sm"
  } !bg-gray-gray3 rounded w-full ${props.className} `;
  const selectHandler = useCallback(
    (e, option) => {
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

      props.onChange && props.onChange(e, option);
    },
    [config]
  );

  const handleAddNew = () => {
    initializePage({
      config: {
        RepoId: addButton?.RepoId ?? addButton?.repoId,
        SystemId: addButton?.SystemId ?? addButton?.systemId,
        url: addButton?.url,
        returnPageId: pageId,
      },
    });
  };
  if (!props.mode && !match) {
    return (
      <MobileSelect
        isFetching={isFetching}
        searchPhrase={searchPhrase}
        setSearchPhrase={setSearchPhrase}
        handleScroll={handleScroll}
        fieldValue={config && existField ? initElement : props.value}
        options={props.options}
        config={config}
        handleAddNew={handleAddNew}
        addButton={addButton}
        handleRefetch={handleRefetch}
        {...props}
      />
    );
  }
  if (config && existField) {
    return (
      <div className="relative">
        <Select
          {...props}
          ref={ref}
          defaultValue={defaultValue}
          value={initElement}
          placement={lang === "fa" ? "bottomRight" : "bottomLeft"}
          className={defaultClass}
          onChange={selectHandler}
          allowClear={props.allowClear ? props.allowClear : match}
          popupRender={
            props?.popupRender
              ? props?.popupRender
              : (menu) => (
                  <>
                    {menu}
                    {!!addButton && (
                      <div
                        className="flex gap-2 p-2 font-xs font-bold cursor-pointer"
                        onClick={handleAddNew}
                      >
                        <PlusOutline />
                        {t("general.addNew")}
                      </div>
                    )}
                  </>
                )
          }
        />
        {handleRefetch && (
          <div
            className={`${
              isFetching ? "animate-spin" : ""
            } top-[0.65rem] left-8 absolute cursor-pointer transition-all duration-400`}
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
      </div>
    );
  } else {
    return (
      <div className="relative">
        <Select
          {...props}
          className={defaultClass}
          placement={lang === "fa" ? "bottomRight" : "bottomLeft"}
          ref={ref}
          allowClear={props.allowClear ? props.allowClear : match}
          onChange={selectHandler}
          popupRender={
            props?.popupRender
              ? props?.popupRender
              : (menu) => (
                  <>
                    {menu}
                    {!!addButton && (
                      <div
                        className="flex gap-2 p-2 font-xs font-bold cursor-pointer"
                        onClick={handleAddNew}
                      >
                        <PlusOutline />
                        {t("general.addNew")}
                      </div>
                    )}
                  </>
                )
          }
        />
        {handleRefetch && (
          <div
            className={`${
              isFetching ? "animate-spin" : ""
            } top-[0.65rem] left-8 absolute cursor-pointer transition-all duration-400`}
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
      </div>
    );
  }
};
