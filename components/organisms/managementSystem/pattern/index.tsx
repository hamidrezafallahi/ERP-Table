import {
  useEffect,
  useState,
} from 'react';

import { Form } from 'antd';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomModal } from '@components/atoms/defaultElements';
import { CustomDrawer } from '@components/atoms/defaultElements/drawer';
import Confirmation from '@components/molecules/confirmation';
import {
  FieldSelector,
  PatternForm,
  PatternItems,
} from '@components/molecules/managementSystem/pattern';
import { ActionLabelsEnum } from '@components/organisms/list/enum';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import {
  apiService,
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import type {
  IPattern,
  IPatternItem,
  IRequest,
} from '@services/mng/pattern/type';
import {
  setAllPageData,
  setPageData,
  setPageInfo,
} from '@slice/pages';
import type { IToolbarMenu } from '@type/toolbar';
import { showSuccessToast } from '@utils/toast';

import { formConfig } from './config';

export const Patterns = () => {
  const t = useTranslations();
  const dispatch = useDispatch();
  const { locale, activePage, match } = useAppSelector(
    (state) => ({
      locale: state.withPersist.config.lang,
      activePage: state.withPersist.pages?.find(
        (item) => item.isActive === true,
      ),
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual,
  );

  const [repoId, setRepoId] = useState<number>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirmDrawerOpen, setIsConfirmDrawerOpen] = useState(false);

  const [triggerItem, { isLoading: triggerIsLoading }] = useCUDDataMutation();

  const {
    data: patterns,
    isFetching,
    refetch,
  } = useGetData<IPattern[], IRequest>({
    url: "/api/mng/select/pattern",
    body: {
      Id: repoId,
    },
    skip: !repoId,
  });

  const pageId = activePage?.pageId;
  const fieldKey = "PatternId";
  const titleKey = "Title";
  const info = {
    addEndpoint: "/api/mng/insert/pattern",
    deleteEndpoint: "/api/mng/delete/pattern",
    updateEndpoint: "/api/mng/update/pattern",
    formIdField: "PatternId",
  };

  const [selectedId, setSelectedId] = useState<number>(null);
  const [form] = Form.useForm();
  const { data, isSuccess: defaultValueSuccess } = useGetData<
    IPattern[],
    IRequest
  >({
    url: "/api/mng/select/pattern",
    body: {
      RepoViewId: 120001,
      [fieldKey]: selectedId,
      Id: repoId,
      ShowBookmarked: true,
      ShowTags: true,
    },
    skip: !selectedId,
    id: selectedId,
  });

  useEffect(() => {
    if (!selectedId || defaultValueSuccess) {
      let defaultValue = data?.Data?.map((item: IPattern) => {
        return {
          ...item,
          PatternItem: item.PatternItem?.slice()
            ?.sort((a, b) => a.Order - b.Order)
            ?.map((item: IPatternItem) => {
              return {
                ...item,
                key: item.PatternItemId,
                PatternObjectId: item?.PatternObjectId,
                PatternObjectDesc: item?.PatternObject?.Desc,
                Text: item?.Text,
                Separator: item?.Separator,
                Order: item?.Order,
              };
            }),
        };
      });

      const defaultValues = defaultValue?.length > 0 ? defaultValue[0] : null;
      let formData;
      if (!selectedId) {
        defaultValue = null;
      }
      if (defaultValues) {
        formData = formConfig.map((item) => {
          const newValue = {
            ...item,
            value: defaultValues[item.name],
            originalValue: defaultValues[item.name],
            isTitleField: item.name === titleKey,
          };
          return newValue;
        });
      } else {
        formData = formConfig.map((item) => ({
          ...item,
          isTitleField: item.name === titleKey,
          value: item.name === "PatternItem" ? [] : undefined,
          originalValue: item.name === "PatternItem" ? [] : undefined,
        }));
      }

      if (selectedId) {
        formData.push({
          name: fieldKey,
          caption: "MainIdField",
          value: selectedId,
          originalValue: selectedId,
          isTitleField: true,
          type: "",
        });
      }

      dispatch(setAllPageData(formData));
      dispatch(setPageInfo({ pageId: pageId, pageInfo: info }));
    }
  }, [data?.Data]);

  const handleClearAll = () => {
    setSelectedId(null);
    form.resetFields();
    dispatch(
      setPageData({
        name: "PatternItem",
        value: [],
      }),
    );
    // dispatch(setAllPageData(formConfig));
    // dispatch(setPageInfo({ pageId: pageId, pageInfo: info }));
  };

  const handleConfirmation = async () => {
    try {
      const confirmResult = await triggerItem({
        url: "api/mng/delete/pattern",
        body: { Id: selectedId },
      }).unwrap();

      if (confirmResult.Result === "Success") {
        showSuccessToast(t("toast.successTitle"));
        setSelectedId(null);

        (dispatch as any)(
          apiService.util.updateQueryData(
            "getInfinite",
            {
              url: "/api/mng/select/pattern",
              body: {
                [fieldKey]: selectedId,
              },
              id: "All",
            },
            (draft) => {
              if (draft?.Data) draft.Data = [];
            },
            false,
          ),
        );
        (dispatch as any)(
          apiService.util.updateQueryData(
            "get",
            {
              url: "/api/mng/select/pattern",
              body: {
                [fieldKey]: selectedId,
              },
              id: "All",
            },
            (draft) => {
              if (draft?.Data) draft.Data = [];
            },
            false,
          ),
        );
      }
    } catch (error) {
      null;
    }
    setIsConfirmModalOpen(false);
    setIsConfirmDrawerOpen(false);
    if (repoId) {
      refetch();
    }
  };

  const handleActionClick = async (
    action: IToolbarMenu,
    id: number,
    PendingStatusId: number | null,
  ) => {
    setSelectedId(id);
    try {
      switch (action.MenuDesc) {
        case ActionLabelsEnum.Edit as string:
          break;

        case ActionLabelsEnum.Delete as string:
          match ? setIsConfirmModalOpen(true) : setIsConfirmDrawerOpen(true);
          break;

        default:
          null;
          break;
      }
    } catch (error) {
      null;
    }
  };

  return (
    <Form form={form} name="patternForm" layout="vertical">
      <div className="gap-4 grid grid-cols-4">
        <FieldSelector repoId={repoId} setRepoId={setRepoId} />
        <div className="col-span-3">
          <div className="flex flex-col gap-2">
            <PatternForm
              form={form}
              activePage={activePage}
              handleClearAll={handleClearAll}
            />
            <PatternItems
              repoId={repoId}
              fieldKey={fieldKey}
              locale={locale}
              handleActionClick={handleActionClick}
              patterns={patterns?.Data || []}
              isFetching={isFetching}
            />
          </div>
        </div>
      </div>
      {isConfirmModalOpen && (
        <CustomModal
          width={300}
          disableTitle
          centered
          closeModal={() => setIsConfirmModalOpen(false)}
          isModalOpen={isConfirmModalOpen}
          content={
            <Confirmation
              itemsToConfirm={selectedId}
              mode={"Delete"}
              onCancel={() => setIsConfirmModalOpen(false)}
              onConfirm={handleConfirmation}
              onLoading={triggerIsLoading}
            />
          }
        />
      )}

      <CustomDrawer
        isOpen={isConfirmDrawerOpen}
        onClose={() => setIsConfirmDrawerOpen(false)}
        content={
          <Confirmation
            itemsToConfirm={selectedId}
            mode={"Delete"}
            onCancel={() => setIsConfirmDrawerOpen(false)}
            onConfirm={handleConfirmation}
            onLoading={triggerIsLoading}
          />
        }
      />
    </Form>
  );
};
