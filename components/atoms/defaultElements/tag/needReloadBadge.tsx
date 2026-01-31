import { useTranslations } from "next-intl";

export const NeedReloadBadge = () => {
  const t = useTranslations();
  return (
    <span className="flex justify-center items-center bg-blue-blue10 px-2 py-[4px] border-none rounded text-3xs text-blue-blue7">
      {t("sidebar.needRevalidate")}
    </span>
  );
};
