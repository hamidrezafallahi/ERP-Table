import { CustomModal, CustomSelect } from "@components/atoms/defaultElements";
import { ISelectTafsili } from "../types";
import { useTranslations } from "next-intl";
import {
  IDynamicModalConfig,
  ReloadType,
} from "@components/organisms/sideBarForm/types";
import { Dispatch, SetStateAction } from "react";
import { AddCategoryForm } from "../addCategoryForm";
import { FormInstance } from "antd";

interface TafsiliCategorySideBarMobileProps {
  typeId?: number;
  setTypeId: Dispatch<SetStateAction<number | undefined>>;
  selectData: ISelectTafsili[];
  selectRefetch: ReloadType;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  openModal: boolean;
  config: IDynamicModalConfig;
  isEdit: boolean;
  setIsEdit: Dispatch<SetStateAction<boolean>>;
  form: FormInstance<any>;
  editingRecordSide?: ISelectTafsili;
  setEditingRecordSide?: Dispatch<SetStateAction<ISelectTafsili>>;
}

export const TafsiliCategorySideBarMobile = (
  props: TafsiliCategorySideBarMobileProps,
) => {
  const {
    setTypeId,
    typeId,
    selectData,
    selectRefetch,
    openModal,
    setOpenModal,
    config,
    isEdit,
    setIsEdit,
    form,
    editingRecordSide,
    setEditingRecordSide,
  } = props;
  const t = useTranslations();

  const selectOption = selectData?.map((item) => ({
    value: item.TafsiliCategoryId,
    label: item.TafsiliCategoryDesc,
    title: item.TafsiliCategoryDesc,
  }));

  return (
    <>
      {isEdit ? (
        <AddCategoryForm
          config={config}
          setTypeId={setTypeId}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          form={form}
          editingRecordSide={editingRecordSide}
          setEditingRecordSide={setEditingRecordSide}
          setOpenModal={null}
          selectRefetch={selectRefetch}
          openModal={openModal}
        />
      ) : (
        <CustomSelect
          showSearch
          allowClear
          optionFilterProp={"label"}
          className="!h-10 text-xs"
          value={typeId}
          placeholder={t("general.selectField")}
          onChange={(val) => setTypeId(val)}
          options={selectOption}
          autoFocus
          handleRefetch={() => selectRefetch()}
        />
      )}
      {openModal && (
        <CustomModal
          headerDescription={t("general.addCategory")}
          closeModal={() => {
            setOpenModal(false);
          }}
          isModalOpen={openModal}
          content={
            <div className="flex flex-col gap-3 p-4 w-full h-[calc(100dvh-64px)]">
              <AddCategoryForm
                config={config}
                setOpenModal={setOpenModal}
                setTypeId={setTypeId}
                form={form}
                selectRefetch={selectRefetch}
                openModal={openModal}
              />
            </div>
          }
        />
      )}
    </>
  );
};
