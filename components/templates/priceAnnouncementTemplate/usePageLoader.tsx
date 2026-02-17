import { useGetConditionallyMutation } from "@services/base";
import { useLazyGetToolbarDataQuery } from "@services/toolbar";
import { IInitialPage } from "@slice/init/type";
import { addNewPage } from "@slice/pages";
import { PageStateEnum } from "@slice/pages/enum";
import { PageTypeEnum } from "@type/enum";
import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";

type LoadPageProps = {
  pageId: string;
  pageType: PageTypeEnum.Form;
  pageIcon: string;
  caption: string;
  initPage: IInitialPage;
  id: number;
  RepoId: number;
  SystemId: number;
  BaseUrl: string;
  listUrl: string;
  pageState?: PageStateEnum;
  originalPageState?: PageStateEnum;
  recordsPerPageOverride?: any;
};

export const usePageLoader = ({
  formConfig,
  storedData,
  fieldKey,
  titleKey,
  recordsPerPage,
  getUrl,
  getDetailUrl,
  testActor,
  storeName,
  params,
  activePage,
  colConfigs,
}) => {
  const dispatch = useDispatch();
  const [pageReady, setPageReady] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [fetchDefault] = useGetConditionallyMutation();
  const [getToolbarData] = useLazyGetToolbarDataQuery();

  // Value
  const resolveValue = (name, defaultValue, fallback) => {
    const stored = storedData?.find((i) => i.name === name);
    if (stored?.value != null) return stored.value;
    if (defaultValue?.[name] != null) return defaultValue[name];
    return fallback;
  };

  //  OriginalValue
  const resolveOriginalValue = (name, defaultValue, fallback) => {
    const stored = storedData?.find((i) => i.name === name);
    if (stored?.originalValue != null) return stored.originalValue;
    if (defaultValue?.[name] != null) return defaultValue[name];
    return fallback;
  };

  // Getting data from form
  const loadDefaultValues = async (id) => {
    let defaultData = [];

    // Getting header data from server
    const res = await fetchDefault({ url: getUrl, body: { Id: id } }).unwrap();
    if (res.Result !== "Success") return [];

    const header = res.Data[0];

    // Getting table data from server
    const detailRes = await fetchDefault({
      url: getDetailUrl,
      body: {
        HeaderId: header[fieldKey],
        RepoViewId: null,
        PagingInfo: { PageNumber: 1, PageRecordCount: recordsPerPage },
      },
    }).unwrap();

    const correctDefaultValue = { ...header };

    // Fill out the form with the correct value
    defaultData = formConfig.map((item) => {
      const isDetails = item.name === "Details";
      return {
        ...item,
        value: isDetails
          ? detailRes.Result === "Success"
            ? detailRes.Data
            : []
          : resolveValue(item.name, correctDefaultValue, item.value),
        originalValue: isDetails
          ? detailRes.Result === "Success"
            ? detailRes.Data
            : []
          : resolveOriginalValue(
              item.name,
              correctDefaultValue,
              item.originalValue,
            ),
        isTitleField: item.name === titleKey,
      };
    });

    // Add MainIdField automatically
    defaultData.push({
      name: fieldKey,
      caption: "MainIdField",
      value: id,
      originalValue: id,
      isTitleField: false,
      type: "",
    });

    return defaultData;
  };

  // Convert config to object
  const safeParse = (s: any) => {
    try {
      return typeof s === "string" && s.trim() !== "" ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  };

  // Extract rows
  const getRows = (pageData: any[]) => {
    const Details = pageData?.find((d) => d.name === "Details")?.value ?? [];
    return Details.map((row: any) => ({
      id: row.RowNum,
      values: { ...row },
    }));
  };

  // Loading page and form
  const loadPage = async ({
    pageId,
    pageType,
    pageIcon,
    caption,
    initPage,
    id,
    RepoId,
    SystemId,
    BaseUrl,
    listUrl,
    pageState,
    originalPageState,
    recordsPerPageOverride,
  }: LoadPageProps) => {
    const { data: res } = await getToolbarData({
      RepoId,
      SystemId,
      Type: pageType,
    });

    if (res?.Result !== true) {
      setRows([]);
      return false;
    }

    let formData = [];
    const Config = safeParse(res?.Data?.List?.ListProp?.[0]?.Config) || {};
    const info = {
      addEndpoint: Config.addEndpoint,
      deleteEndpoint: Config.deleteEndpoint,
      updateEndpoint: Config.updateEndpoint,
      formIdField: Config.formIdField,
    };

    if (id) {
      formData = await loadDefaultValues(id);
    }

    dispatch(
      addNewPage({
        pageId,
        icon: pageIcon,
        caption,
        captionII: initPage.caption,
        pageState: pageState ?? PageStateEnum.Opened,
        originalPageState: originalPageState ?? PageStateEnum.Opened,
        type: pageType,
        pageData: formData,
        viewData: {
          PagingInfo: {
            PageNumber: 1,
            PageRecordCount: recordsPerPageOverride ?? recordsPerPage,
          },
        },
        data: initPage.data,
        RepoId,
        SystemId,
        url: BaseUrl,
        pageInfo: info,
        listUrl,
      }),
    );

    const newRows = getRows(formData);
    setRows(newRows);
    return true;
  };

  const prop = useMemo(() => {
    return {
      actor: testActor,
      store: storeName,
      tableKey: params?.get("id") ?? activePage?.pageId,
      rows,
      columns: colConfigs,
    };
  }, [activePage?.pageId, colConfigs, rows, params, testActor]);

  return { loadDefaultValues, loadPage, pageReady, rows, prop };
};
