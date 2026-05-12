import { SpinIcon } from "@components/atoms/iconComponents";
import { AddCategoryForm } from "../addCategoryForm";
import { TafsiliCategoryList } from "./tafsiliCategoryList";
import { ISelectTafsili } from "../types";
import { Dispatch, SetStateAction } from "react";
import { FormInstance } from "antd";
import {
  IDynamicModalConfig,
  ReloadType,
} from "@components/organisms/sideBarForm/types";
import { useTranslations } from "next-intl";

interface TafsiliCategorySideBarWebProps {
  config: IDynamicModalConfig;
  selectRefetch: ReloadType;
  isEdit: boolean;
  setIsEdit: Dispatch<SetStateAction<boolean>>;
  form: FormInstance<any>;
  isFetchingSelect: boolean;
  selectData: ISelectTafsili[];
  handleSidebarDelete: (id?: number) => void;
  handleSidebarEdit: (id?: number) => void;
  setTypeId: Dispatch<SetStateAction<number | undefined>>;
  editingRecordSide?: ISelectTafsili;
  setEditingRecordSide?: Dispatch<SetStateAction<ISelectTafsili>>;
  isLoading: boolean;
}

export const TafsiliCategorySideBarWeb = (
  props: TafsiliCategorySideBarWebProps,
) => {
  const {
    config,
    selectRefetch,
    form,
    isFetchingSelect,
    selectData,
    handleSidebarDelete,
    setTypeId,
    handleSidebarEdit,
    isEdit,
    editingRecordSide,
    setEditingRecordSide,
    setIsEdit,
    isLoading,
  } = props;
  const t = useTranslations();

  return (
    <>
      <AddCategoryForm
        config={config}
        form={form}
        setOpenModal={null}
        selectRefetch={selectRefetch}
        isEdit={isEdit}
        editingRecordSide={editingRecordSide}
        setEditingRecordSide={setEditingRecordSide}
        setTypeId={setTypeId}
        setIsEdit={setIsEdit}
      />
      {isLoading || isFetchingSelect || selectData?.length === 0 ? (
        <div className="flex justify-center items-center h-full text-gray-400">
          <SpinIcon config={{ width: 12, height: 12 }} />
        </div>
      ) : selectData?.length === 0 ? (
        <div className="flex justify-center items-center h-full text-gray-400">
          {t("general.notFoundData")}
        </div>
      ) : (
        <TafsiliCategoryList
          tafsiliCategoryList={selectData}
          handleSidebarDelete={handleSidebarDelete}
          setTypeId={setTypeId}
          handleSidebarEdit={handleSidebarEdit}
          setIsEdit={setIsEdit}
        />
      )}
    </>
  );
};
