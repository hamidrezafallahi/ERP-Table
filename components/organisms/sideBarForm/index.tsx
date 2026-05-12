import { useAppSelector } from "@redux/index";
import { shallowEqual } from "react-redux";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import SideBarFormToolbar from "./sideBarFormToolbar";
import SideBar from "./sideBar";
import { CustomFormComponentProps, IDynamicModalConfig } from "./types";
import SideBarFormContext from "./sideBarFormContext";

interface SideBarBaseProps {
  config: IDynamicModalConfig;
  sideBarTitle: string;
}

interface SideBarComponentProps extends SideBarBaseProps {
  typeId?: number;
  setTypeId: Dispatch<SetStateAction<number | undefined>>;
}
interface SideBarFormProps extends SideBarBaseProps {
  id?: number;
  setId?: (id: number) => void;
  isModal?: boolean;
  ExternalSidebar?: React.ComponentType<SideBarComponentProps>;
  ExternalCustomForm?: React.ComponentType<CustomFormComponentProps>;
}

export default function SideBarForm(props: SideBarFormProps) {
  const {
    id,
    setId,
    config,
    isModal,
    sideBarTitle,
    ExternalSidebar,
    ExternalCustomForm,
  } = props;
  const [internalId, setInternalId] = useState<number | undefined>(undefined);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const typeId = id ?? internalId;
  const setTypeId = setId ?? setInternalId;

  const { selectedTafsiliId, match } = useAppSelector((state) => {
    const selectedTafsiliId = state.withPersist.pages
      .find((item) => item.isActive)
      ?.pageData?.find((pro) => pro.name === "selectedTafsiliId")?.value;
    const match = state.withPersist.config.initMatch;
    return {
      selectedTafsiliId,
      match,
    };
  }, shallowEqual);

  useEffect(() => {
    if (!selectedTafsiliId) return;
    setTypeId(selectedTafsiliId);
  }, [selectedTafsiliId]);

  const SidebarComponent = ExternalSidebar ?? SideBar;
  return (
    <div className="relative flex lg:flex-row items-center flex-col gap-4 h-full">
      {match && <SideBarFormToolbar />}
      <SidebarComponent
        typeId={typeId}
        setTypeId={setTypeId}
        config={config}
        sideBarTitle={sideBarTitle}
        {...(ExternalSidebar ? { isEdit, setIsEdit } : {})}
      />
      {typeId ? (
        <SideBarFormContext
          config={config}
          typeId={typeId}
          isModal={isModal}
          ExternalCustomForm={ExternalCustomForm}
        />
      ) : (
        <div className="flex justify-center items-center w-full h-full text-gray-400">
          {`لطفاً ابتدا ${sideBarTitle} را انتخاب کنید.`}
        </div>
      )}
    </div>
  );
}
