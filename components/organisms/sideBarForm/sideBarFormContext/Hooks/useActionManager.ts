import { ActionLabelsEnum } from "@components/organisms/list/enum";
import { apiService, useCUDDataMutation } from "@services/base";
import { IToolbarMenu } from "@type/toolbar";
import { showSuccessToast } from "@utils/core";
import { Dispatch, SetStateAction } from "react";
import { useDispatch } from "react-redux";
import {
  IDynamicModalConfig,
  RecordType,
  ReloadType,
  TFunction,
} from "../../types";
import { FormInstance } from "antd";

interface UseActionManagerProps {
  config: IDynamicModalConfig;
  match: boolean;
  refetchCard: ReloadType;
  refetchTable: ReloadType;
  setPageNumber: Dispatch<SetStateAction<number>>;
  setSelectedId: Dispatch<SetStateAction<number>>;
  setIsConfirmDrawerOpen: Dispatch<SetStateAction<boolean>>;
  setIsConfirmModalOpen: Dispatch<SetStateAction<boolean>>;
  selectedId: number;
  t: TFunction;
  form: FormInstance<any>;
  setEditingRecord: Dispatch<SetStateAction<RecordType>>;
}

export function useActionManager(props: UseActionManagerProps) {
  const {
    match,
    config,
    setPageNumber,
    setSelectedId,
    setIsConfirmDrawerOpen,
    setIsConfirmModalOpen,
    selectedId,
    t,
    form,
    refetchTable,
    refetchCard,
    setEditingRecord,
  } = props;
  const dispatch = useDispatch();

  const [triggerItem, { isLoading: triggerIsLoading }] = useCUDDataMutation();

  const handleActionClick = (
    action: IToolbarMenu,
    id: number,
    ...rest: [number?, RecordType?]
  ) => {
    const record = rest[1];
    setSelectedId(id);
    if (action.MenuDesc === ActionLabelsEnum.Delete) {
      match ? setIsConfirmModalOpen(true) : setIsConfirmDrawerOpen(true);
    }
    if (action.MenuDesc === ActionLabelsEnum.Edit && record) {
      setEditingRecord(record);
      form.setFieldsValue(record);
    }
  };

  const handleConfirmation = async () => {
    try {
      const confirmResult = await triggerItem({
        url: config.deleteUrl,
        body: { Id: selectedId },
      }).unwrap();

      if (confirmResult.Result === "Success") {
        showSuccessToast(t("toast.successTitle"));
        setSelectedId(null);
        (dispatch as any)(
          apiService.util.updateQueryData(
            "getInfinite",
            {
              url: config.listConfig.selectUrl,
              body: {
                RepoViewId: config.listConfig.repoViewId,
                RepoId: config.listConfig.RepoId,
              },
              id: "All",
            },
            (draft) => {
              if (draft?.Data) draft.Data = [];
            },
            false,
          ),
        );

        setPageNumber(1);
        match ? await refetchTable() : await refetchCard();
      }
      setIsConfirmModalOpen(false);
      setIsConfirmDrawerOpen(false);
    } catch (error) {
      null;
    }
  };
  return {
    handleActionClick,
    triggerIsLoading,
    handleConfirmation,
  };
}
