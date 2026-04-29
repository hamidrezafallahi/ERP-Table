import { ActionLabelsEnum } from "@components/organisms/list/enum";
import { apiService, useCUDDataMutation } from "@services/base";
import { IToolbarMenu } from "@type/toolbar";
import { showSuccessToast } from "@utils/core";
import { Dispatch, SetStateAction } from "react";
import { useDispatch } from "react-redux";
import {
  IDynamicModalConfig,
  RecordType,
  RefetchType,
  ReloadType,
  TFunction,
} from "../type";
import { FormInstance } from "antd";

interface useDeleteManagerProps {
  config: IDynamicModalConfig;
  match: boolean;
  reload: ReloadType;
  setPageNumber: Dispatch<SetStateAction<number>>;
  setSelectedId: Dispatch<SetStateAction<number>>;
  setIsConfirmDrawerOpen: Dispatch<SetStateAction<boolean>>;
  setIsConfirmModalOpen: Dispatch<SetStateAction<boolean>>;
  selectedId: number;
  t: TFunction;
  refetch: RefetchType;
  form: FormInstance<any>;
  setEditingRecord: Dispatch<SetStateAction<RecordType>>;
}

export function useActionManager({
  match,
  config,
  reload,
  setPageNumber,
  setSelectedId,
  setIsConfirmDrawerOpen,
  setIsConfirmModalOpen,
  selectedId,
  t,
  refetch,
  form,
  setEditingRecord,
}: useDeleteManagerProps) {
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
      console.log({record});
        
      setEditingRecord(record);
      form.setFieldsValue({
        Desc: record.Desc,
      });
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
        match ? await reload() : await refetch();
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
