import { useTranslations } from "next-intl";

export const SavedBadge = () => {
  const t = useTranslations();
  return (
    <span className="flex justify-center items-center bg-state-success2 px-2 py-[4px] border-none rounded text-3xs text-state-success1">
      {t("sidebar.saved")}
    </span>
  );
};
