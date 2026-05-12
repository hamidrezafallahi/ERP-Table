import { FormInstance } from "antd";
import { ISelectTafsili } from "../types";
import { Dispatch, SetStateAction } from "react";
import { apiService, useCUDDataMutation } from "@services/base";
import { shallowEqual, useDispatch } from "react-redux";
import {
  IDynamicModalConfig,
  ReloadType,
  TFunction,
} from "@components/organisms/sideBarForm/types";
import { showSuccessToast } from "@utils/core";
import { useAppSelector } from "@redux/index";
import { setPageData } from "@slice/pages";

interface UseActionManagerProps {
  typeId: number;
  selectData: ISelectTafsili[];
  setEditingRecordSide: Dispatch<SetStateAction<ISelectTafsili>>;
  form: FormInstance<any>;
  setIsEdit: Dispatch<SetStateAction<boolean>>;
  setIsConfirmDrawerOpen: Dispatch<SetStateAction<boolean>>;
  setIsConfirmModalOpen: Dispatch<SetStateAction<boolean>>;
  config: IDynamicModalConfig;
  setTypeId: Dispatch<SetStateAction<number | undefined>>;
  match: boolean;
  t: TFunction;
  selectRefetch: ReloadType;
}

export function useActionManager(props: UseActionManagerProps) {
  const {
    typeId,
    selectData,
    setEditingRecordSide,
    form,
    setIsEdit,
    setIsConfirmDrawerOpen,
    setIsConfirmModalOpen,
    config,
    setTypeId,
    match,
    t,
    selectRefetch,
  } = props;
  const [triggerItem, { isLoading: triggerIsLoading }] = useCUDDataMutation();
  const dispatch = useDispatch();
  const { selectedTafsiliId } = useAppSelector((state) => {
    const selectedTafsiliId = state.withPersist.pages
      .find((item) => item.isActive)
      ?.pageData?.find((pro) => pro.name === "selectedTafsiliId")?.value;
    return {
      selectedTafsiliId,
    };
  }, shallowEqual);

  const getId = (id?: number) => id ?? typeId;

  const handleSidebarEdit = (id?: number) => {
    const finalId = getId(id);
    if (!finalId) return;
    const record = selectData?.find(
      (item) => item.TafsiliCategoryId === finalId,
    );
    if (!record) return;
    setTypeId(finalId);
    setEditingRecordSide(record);
    form.setFieldsValue({
      TafsiliCategoryDesc: record.TafsiliCategoryDesc,
    });
    setIsEdit(true);
    dispatch(
      setPageData({
        name: "selectedTafsiliId",
        value: id,
      }),
    );
  };

  const handleSidebarDelete = (id?: number) => {
    const finalId = getId(id);
    if (!finalId) return;
    setTypeId(finalId);
    match ? setIsConfirmModalOpen(true) : setIsConfirmDrawerOpen(true);
  };
  console.log(selectedTafsiliId,typeId,"reyhan");
  

  const handleConfirmation = async () => {
    try {
      const confirmResult = await triggerItem({
        url: config.deleteUrlSide,
        body: { Id: typeId },
      }).unwrap();
      if (confirmResult.Result === "Success") {
        showSuccessToast(t("toast.successTitle"));
        // if (selectedTafsiliId !== undefined) {
        //   setTypeId(selectedTafsiliId);
        // }
        setTypeId(null);
        setEditingRecordSide(null);
        setIsEdit(false);
        (dispatch as any)(
          apiService.util.updateQueryData(
            "getInfinite",
            {
              url: config.listConfig.selectUrlSide,
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
        selectRefetch();
      }
      setIsConfirmModalOpen(false);
      setIsConfirmDrawerOpen(false);
    } catch (error) {
      null;
    }
  };
  return {
    handleSidebarEdit,
    handleSidebarDelete,
    handleConfirmation,
    triggerIsLoading,
  };
}
