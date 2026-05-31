import { CustomModal } from "@components/atoms/defaultElements";
import { HeadOfAccountsIcon } from "@components/atoms/iconComponents";
import { useTranslations } from "next-intl";
import React from "react";
import { levelHeaders, titlePrefixes } from "./content";
import { handleUpdateTitle, toggleModal } from "./utils";
import { PlaceDefinitionForm } from "@components/molecules/placeDefinitionForm";
import { NestedListForm } from "@components/molecules/nestedList";
import { FormModalData , INestedListConfig, LoadingType, SetStates, States } from "../types"


interface FormModalProps {
  states: States;
  match: boolean;
  data: FormModalData ;
  config: INestedListConfig;
  loading: LoadingType;
  setStates: SetStates;
}

const FormModal = (props: FormModalProps) => {
  const { states, setStates, data, config, loading, match } = props;
  const t = useTranslations();
  return (
    <>
      {states.modals.form && (
        <CustomModal
          contentClassName={`  ${match ? "!min-w-[520px] h-full" : ""}`}
          headerName={
            <div className="flex flex-col justify-between items-start">
              <div className="flex items-center gap-1">
                <HeadOfAccountsIcon config={{ width: 20, height: 20 }} />
                <span className="font-bold text-gray-gray10 dark:text-white lg:text-lg">
                  {data.id
                    ? t("general.update")
                    : t(levelHeaders[data.level] || "general.addNew")}
                </span>
              </div>
              <div className="flex gap-2">
                {data.title && (
                  <span className="font-light text-gray-gray85 text-xs">
                    {!data.id && titlePrefixes[data.level]
                      ? `${titlePrefixes[data.level]} `
                      : ""}
                    {data.title}
                  </span>
                )}
              </div>
            </div>
          }
          closeModal={() => toggleModal(setStates, "form", false)}
          isModalOpen={states.modals.form}
          content={
            config.formType === "placeDefinition" ? (
              <PlaceDefinitionForm
                config={config}
                fatherId={data.fatherId}
                id={data.id}
                level={data.level}
                onClose={() => toggleModal(setStates, "form", false)}
                onGetDefault={(e) => {
                  if (!data.titleKey) return;
                  const title = Array.isArray(data.titleKey)
                    ? data.titleKey
                        .map((k) => e?.[k])
                        .filter(Boolean)
                        .join(" - ")
                    : (e?.[data.titleKey] ?? null);
                  handleUpdateTitle(setStates, title);
                }}
              />
            ) : (
              <NestedListForm
                config={config}
                fatherId={data.fatherId}
                getIsLoading={loading.isLoading}
                onGetDefault={(e) => {
                  if (!data.titleKey) return;
                  const title = Array.isArray(data.titleKey)
                    ? data.titleKey
                        .map((k) => e?.[k])
                        .filter(Boolean)
                        .join(" - ")
                    : (e?.[data.titleKey] ?? null);
                  handleUpdateTitle(setStates, title);
                }}
                id={data.id}
                level={data.level}
                onClose={() => toggleModal(setStates, "form", false)}
              />
            )
          }
        />
      )}
    </>
  );
};

export default FormModal;
