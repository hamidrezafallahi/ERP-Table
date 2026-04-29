import { useAppSelector } from "@redux/index";
import { shallowEqual } from "react-redux";
import { useState } from "react";
import SideBarFormToolbar from "./sideBarFormToolbar";
import SideBar from "./sideBar";
import { IDynamicModalConfig } from "./type";
import SideBarFormContext from "./sideBarFormContext";

interface SideBarFormProps {
  id?: number;
  setId?: (id: number) => void;
  config: IDynamicModalConfig;
  isModal?: boolean;
  sideBarTitle: string;
}

export default function SideBarForm({
  id,
  setId,
  config,
  isModal,
  sideBarTitle,
}: SideBarFormProps) {
  const [internalId, setInternalId] = useState<number | undefined>(undefined);

  const typeId = id ?? internalId;
  const setTypeId = setId ?? setInternalId;

  const { match } = useAppSelector(
    (state) => ({
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual,
  );

  return (
    <div className="relative flex lg:flex-row items-center flex-col gap-4 h-full">
      {match && <SideBarFormToolbar />}
      <SideBar
        typeId={typeId}
        setTypeId={setTypeId}
        config={config}
        sideBarTitle={sideBarTitle}
      />
      {typeId ? (
        <SideBarFormContext config={config} typeId={typeId} isModal={isModal} />
      ) : (
        <div className="flex justify-center items-center w-full h-full text-gray-400">
          {`لطفاً ابتدا ${sideBarTitle} را انتخاب کنید.`}
        </div>
      )}
    </div>
  );
}
