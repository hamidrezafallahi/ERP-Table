import { useTranslations } from 'next-intl';

export const ChangedBadge = () => {
  const t = useTranslations();
  return (
    <span className="flex justify-center items-center bg-state-error7 px-2 py-[4px] border-none rounded text-3xs text-state-error8">
      {t("sidebar.draft")}
    </span>
  );
};
