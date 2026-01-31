import { FC, useCallback, useEffect } from "react";

import { TreeSelect } from "antd";
import { useTranslations } from "next-intl";
import { shallowEqual, useDispatch } from "react-redux";

import { PlusOutline, Reload } from "@components/atoms/iconComponents";
import { useInitializePage } from "@hooks/custom";
import { useAppSelector } from "@redux/index";
import { setPageData } from "@slice/pages";

import { MobileTreeSelect } from "./mobileTreeSelect";
import type { IProps } from "./type";

export const CustomTreeSelect: FC<IProps> = ({
  ref,
  addButton,
  handleRefetch,
  isFetching,
  ...props
}) => {
  const { config } = props;
  const dispatch = useDispatch();
  const t = useTranslations();
  const initializePage = useInitializePage();

  const { match, pageId, lang, initElement } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    const lang = state.withPersist.config.lang;
    const pageId = state.withPersist.pages.find(
      (item) => item.isActive
    )?.pageId;
    if (!config) return { match, pageId, lang, initElement: null };
    const initElement =
      state.withPersist.pages
        .find((item) => item.isActive)
        ?.pageData?.find((element) => element.name === config.name)?.value ??
      null;
    return { match, pageId, lang, initElement };
  }, shallowEqual);
  const defaultClass = `h-[2.125rem] bg-gray-gray3 dark:bg-gray-gray95  rounded w-full ${props.className}  `;
  const handleAddNew = () => {
    initializePage({
      config: {
        RepoId: addButton?.RepoId,
        SystemId: addButton?.SystemId,
        url: addButton?.url,
        returnPageId: pageId,
      },
    });
  };

  useEffect(() => {
    if (config) {
      const { name, setFieldValue } = config;
      if (setFieldValue && initElement) {
        setFieldValue(name, initElement);
      }
    }
  }, [initElement, config]);

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

  if (!match) {
    return (
      <MobileTreeSelect
        isFetching={isFetching}
        fieldValue={config ? initElement : props.value}
        treeData={props.treeData}
        config={config}
        handleAddNew={handleAddNew}
        addButton={addButton}
        handleRefetch={handleRefetch}
        {...props}
      />
    );
  }

  if (config) {
    return (
      <div className="relative">
        <TreeSelect
          {...props}
          ref={ref}
          value={initElement}
          placement={lang === "fa" ? "bottomRight" : "bottomLeft"}
          className={defaultClass}
          onChange={selectHandler}
          popupRender={(menu) => (
            <>
              {menu}
              {!!addButton && (
                <div
                  className="flex gap-2 px-8 py-2 font-xs font-bold cursor-pointer"
                  onClick={handleAddNew}
                >
                  <PlusOutline />
                  {t("general.addNew")}
                </div>
              )}
            </>
          )}
        />
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
      </div>
    );
  } else {
    return (
      <div className="relative">
        <TreeSelect
          {...props}
          className={defaultClass}
          ref={ref}
          placement={lang === "fa" ? "bottomRight" : "bottomLeft"}
          popupRender={(menu) => (
            <>
              {menu}
              {!!addButton && (
                <div
                  className="flex gap-2 px-8 py-2 font-xs font-bold cursor-pointer"
                  onClick={handleAddNew}
                >
                  <PlusOutline />
                  {t("general.addNew")}
                </div>
              )}
            </>
          )}
        />
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
      </div>
    );
  }
};
