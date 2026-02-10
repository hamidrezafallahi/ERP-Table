"use client";
import "./style.css";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Drawer, Form } from "antd";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { shallowEqual, useDispatch } from "react-redux";

import { CustomButton } from "@components/atoms/defaultElements";
import { MenuDrawerIcon } from "@components/atoms/iconComponents";
import Title from "@components/atoms/Title";
import Comments from "@components/molecules/comments";
import FormToolbar from "@components/organisms/formToolbar";
import DynamicLoaderComponent from "@components/templates/dynamicLoaderComponent";
import { useFormHandlers, useFullScreen } from "@hooks/custom";
import { useAppSelector } from "@redux/index";
import { useGetConditionallyMutation, useGetData } from "@services/base";
import { addNewPage } from "@slice/pages";
import { PageStateEnum } from "@slice/pages/enum";
import type { IPageConfig } from "@type/elementType";
import { PageTypeEnum } from "@type/enum";
import type { IToolbar } from "@type/toolbar";
import { formRulesReturner, renderFormField } from "@utils/core";

import type { IProps } from "./type";

const safeParse = (s: any) => {
  try {
    return typeof s === "string" && s.trim() !== "" ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
};
export default function FormGenerator<T, K>({
  caption,
  fieldKey,
  titleKey,
  listUrl,
  url,
  pageIcon,
  conditionalActions,
  isModal = false,
  parentPageId,
  mutationSystemId,
  extraFunction,
  conditionalFields,
  setConditionalFields,
  withImage,
  submitCaption,
  withSubmitButton = true,
}: IProps) {
  const t = useTranslations();
  const dispatch = useDispatch();
  const toggleFullScreen = useFullScreen();
  const params = useSearchParams();
  const id = Number(params.get("id"));
  const [mobileDrawerContent, setMobileDrawerContent] = useState(null);
  const [openMobileDrawer, setOpenMobileDrawer] = useState(false);
  const [mobileDrawerHeight, setMobileDrawerHeight] = useState(160);
  const [fields, setFields] = useState([]);

  const { initPage, activePage, pages, match } = useAppSelector(
    (state) => ({
      initPage: state.withPersist.init,
      activePage: state?.withPersist?.pages?.find((item) => item.isActive),
      pages: state?.withPersist?.pages,
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual,
  );

  const pageType = PageTypeEnum.Form;
  const {
    pageId,
    RepoId,
    SystemId,
    url: BaseUrl,
    pageState,
    originalPageState,
    Id,
    selectedView,
    listPageId,
    Key,
    returnPageId,
    data,
  } = initPage;
  const [form] = Form.useForm();
  const formValuesRef = useRef(null);
  const routingValue = useRef(null);
  const [toolbar, setToolbar] = useState<IToolbar | null>(null);
  const [getDefaults] = useGetConditionallyMutation();
  const { data: dataToolbar, isSuccess } = useGetData<IToolbar, null>({
    url: "/api/menu/getToolbarData",
    body: { RepoId, SystemId, Type: pageType, Id: id },
    id: RepoId,
    skip: !RepoId,
  });
  useEffect(() => {
    if (dataToolbar?.Result) {
      setToolbar(dataToolbar.Data);
    }
  }, [dataToolbar]);
  const Config: IPageConfig = useMemo(() => {
    if (toolbar !== null) {
      const selectedViewIndex = activePage?.selectedViewIndex ?? 0;
      return safeParse(toolbar.List?.ListProp?.[selectedViewIndex]?.Config);
    } else {
      return {} as IPageConfig;
    }
  }, [toolbar, activePage?.selectedViewIndex]);

  let formData = useMemo(() => {
    if (Config && Object.keys(Config).length > 0) {
      return Config?.fields ?? [];
    } else {
      return [];
    }
  }, [Config]);

  const showDrawerContent = () => {
    setOpenMobileDrawer(!openMobileDrawer);
  };

  const handleValuesChange = (changedValues, allValues) => {
    formValuesRef.current = allValues;
  };
  const {
    handleAdd,
    handleReset,
    handleSubmit,
    handleSubmitAndClean,
    handleSubmitAndClose,
    isLoading,
  } = useFormHandlers({
    pages: pages,
    activePage: activePage,
    form: form,
    mutationSystemId: mutationSystemId,
  });
  const handleOutsideClick = useCallback(
    (event) => {
      if (event.target.closest(".ant-drawer-content") === null) {
        setOpenMobileDrawer(false);
      }
    },
    [setOpenMobileDrawer],
  );
  const handleKeyAction = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey === true) {
      if (e.key === "s") {
        submitCaption ? handleSubmitAndClose() : handleSubmit();
      }
      if (e.key === "r") handleReset();
      if (e.key === "n") handleAdd();
      if (e.key === "c") handleSubmitAndClean();
      if (e.key === "y") {
        toggleFullScreen();
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        e.preventDefault();
        if (e.key === "b" && containerRef.current) {
          containerRef.current.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  useEffect(() => {
    if (conditionalFields) {
      setConditionalFields(formData);
    }
  }, [formData]);
  useEffect(() => {
    if (
      typeof conditionalFields !== "boolean" &&
      conditionalFields?.length > 0
    ) {
      setFields(conditionalFields);
    } else {
      setFields(formData);
    }
  }, [formData, conditionalFields, isSuccess]);
  useEffect(() => {
    if (extraFunction) {
      extraFunction(formData);
    }
  }, [formData, activePage?.pageData]);
  useEffect(() => {
    const setNewPage = async () => {
      let pageData = [];
      try {
        const info = {
          addEndpoint: Config.addEndpoint,
          deleteEndpoint: Config.deleteEndpoint,
          updateEndpoint: Config.updateEndpoint,
          formIdField: Config.formIdField,
        };
        let defaultValue = undefined;
        let TagsInfo = undefined;
        if (id) {
          const config = safeParse(
            toolbar?.List?.ListProp?.[activePage?.selectedViewIndex ?? 0]
              ?.Config,
          );
          if (!Config.data) {
            const res = await getDefaults({
              url: url,
              body: {
                RepoViewId: config.repoViewId,
                Id: id,
                ShowBookmarked: true,
                ShowTags: true,
              },
              id: id,
            }).unwrap();

            if (res.Result === "Success" && res.Data?.[0]) {
              defaultValue = res.Data[0];
              TagsInfo = defaultValue.TagsInfo;
            }
          }
        }
        if (defaultValue) {
          pageData = formData.map((item) => {
            const undefinedValue =
              item.type === "checkBox"
                ? false
                : item.type === "bool"
                  ? false
                  : item.type === "radio"
                    ? item.radioValues?.[0]?.value
                    : item.type === "array"
                      ? []
                      : undefined;
            return {
              ...item,
              value: defaultValue[item.name] ?? undefinedValue,
              originalValue: defaultValue[item.name] ?? undefinedValue,
              isTitleField: Array.isArray(titleKey)
                ? titleKey.includes(item.name)
                : item.name === titleKey,
            };
          });
        } else if (formData.length > 0) {
          pageData = formData.map((item) => {
            const undefinedValue =
              item.type === "checkBox"
                ? false
                : item.type === "bool"
                  ? false
                  : item.type === "radio"
                    ? item.radioValues?.[0]?.value
                    : item.type === "array"
                      ? []
                      : undefined;
            return {
              ...item,
              value: undefinedValue,
              originalValue: undefinedValue,
              isTitleField: Array.isArray(titleKey)
                ? titleKey.includes(item.name)
                : item.name === titleKey,
            };
          });
        }

        pageData.push({
          name: fieldKey,
          caption: "MainIdField",
          value: id,
          originalValue: id,
          type: "hidden",
        });

        dispatch(
          addNewPage({
            pageId,
            icon: pageIcon,
            caption: caption,
            captionII: initPage.caption ?? "",
            pageState: pageState ? pageState : PageStateEnum.Opened,
            originalPageState: originalPageState
              ? originalPageState
              : PageStateEnum.Opened,
            type: pageType,
            RepoId,
            SystemId,
            url: BaseUrl,
            withImage: withImage,
            TagsInfo,
            pageData: pageData,
            pageInfo: info,
            toolbarData: toolbar,
            listUrl,
            isModal: isModal,
            parentPageId: parentPageId,
            listPageId,
            Key,
            returnPageId,
            selectedView: selectedView,
            selectedViewIndex: 0,
            data: data,
          }),
        );
      } catch (error) {
        null;
      }
    };
    if (formData?.length > 0 || Config?.data) {
      setNewPage();
    }
}, [formData, titleKey, id, Config?.data]);

  useEffect(() => {
    window.addEventListener("click", handleOutsideClick);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, [handleOutsideClick]);
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <>
      <Title caption={caption} />
      <div
        className={`${match ? "relative  h-full" : ""} w-full outline-none `}
        onKeyDown={handleKeyAction}
        tabIndex={0}
        ref={containerRef}
      >
        <div
          className={
            match ? `absolute -top-[60px] rtl:-left-[10px] -right-[10px]` : ""
          }
        >
          <FormToolbar
            form={form}
            selectedView={selectedView ?? activePage?.selectedView ?? 0}
            listUrl={listUrl}
            listPageId={listPageId}
            getUrl={url}
            toolbarData={toolbar}
            isEdit={!!id}
            id={id}
            fieldKey={fieldKey}
            conditionalActions={conditionalActions}
            statusHandler={(routing) => {
              routingValue.current = routing;
            }}
            mutationSystemId={mutationSystemId}
            submitCaption={submitCaption}
            withSubmitButton={withSubmitButton}
          />
        </div>
        <div className="hidden-show-scrollBar flex flex-col gap-10 mt-4 lg:mt-0 h-full max-h-[calc(100dvh-160px)] overflow-auto">
          {Config?.data ? (
            <DynamicLoaderComponent
              componentName={Config?.data}
              props={{ setMobileDrawerContent, setMobileDrawerHeight, form }}
            />
          ) : (
            <Form
              onValuesChange={handleValuesChange}
              className="gap-5 s:gap-y-16 xs:gap-8 grid grid-cols-4"
              form={form}
            >
              {Config?.fields &&
                fields
                  ?.filter((item) => item.type !== "info")
                  .sort((a, b) => a.order - b.order)
                  .map((item, index) => {
                    const colSpan = `lg:col-span-${item?.colSpan}`;
                    return (
                      <Form.Item
                        key={index}
                        label={item.type !== "checkBox" ? item.caption : ""}
                        tooltip={
                          item.help
                            ? { title: item.help, color: "#585858" }
                            : null
                        }
                        rules={formRulesReturner(item.rules)}
                        validateTrigger="onBlur"
                        name={item.name}
                        layout="vertical"
                        valuePropName={`${
                          item.type == "checkBox" ? "checked" : "value"
                        }`}
                        getValueFromEvent={(e) =>
                          item.type == "checkBox"
                            ? e.target.checked
                            : item.type === "number" ||
                                item.type === "price" ||
                                item.type === "selectOption" ||
                                item.type === "date"
                              ? e
                              : e?.target?.value
                        }
                        className={`m-0 p-0 col-span-4
                      ${item.type === "checkBox" ? "content-end" : ""}
                      ${item.type == "noShow" ? "hidden lg:block" : ""}
                      ${item.colSpan ? `${colSpan}` : `lg:col-span-2`}
                       `}
                      >
                        {renderFormField(item, form, !!id, index === 0)}
                      </Form.Item>
                    );
                  })}
            </Form>
          )}
          {!!id && activePage?.RepoId && (
            <Comments referId={Number(id)} repoId={activePage.RepoId} />
          )}
        </div>
      </div>

      {!match && (
        <div className="right-0 bottom-0 left-0 z-20 fixed flex flex-col bg-white w-full text-xs topShadow">
          {mobileDrawerContent ? (
            <div>
              <Drawer
                className="customMobileDrawer"
                style={{
                  padding: 0,
                  paddingRight: 0,
                  paddingLeft: 0,
                  paddingTop: 0,
                  paddingBottom: 0,
                  backgroundColor: "white",
                }}
                placement="bottom"
                closable={false}
                open={true}
                getContainer={false}
                mask={false}
                height={!openMobileDrawer ? 70 : mobileDrawerHeight}
              >
                <div
                  className="flex flex-col justify-between h-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="flex justify-center items-center customMobileDrawer"
                    onClick={showDrawerContent}
                  >
                    <span className="flex justify-center items-center h-6">
                      <MenuDrawerIcon />
                    </span>
                  </div>
                  {openMobileDrawer && (
                    <div className="pb-4">{mobileDrawerContent}</div>
                  )}
                  <CustomButton
                    loading={isLoading}
                    type="text"
                    className={`text-sm flex justify-center items-center focus:!text-none focus:none focus-within:none active:none active:bg-black-black95 !bg-black-black95 rounded w-full h-[42px] text-white`}
                    onClick={
                      submitCaption ? handleSubmitAndClose : handleSubmit
                    }
                  >
                    {submitCaption ? submitCaption : t("general.save")}
                  </CustomButton>
                </div>
              </Drawer>
            </div>
          ) : (
            <div className="px-4 py-3">
              <CustomButton
                loading={isLoading}
                type="text"
                className={`text-sm flex justify-center items-center focus:!text-none focus:none focus-within:none active:none active:bg-black-black95 !bg-black-black95 rounded w-full h-[42px] text-white`}
                onClick={submitCaption ? handleSubmitAndClose : handleSubmit}
              >
                {submitCaption ? submitCaption : t("general.save")}
              </CustomButton>
            </div>
          )}
        </div>
      )}
    </>
  );
}
