import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import { useAppSelector } from '@hooks/custom/useAppSelector';
import { PageStateEnum } from '@slice/pages/enum';
import { PageTypeEnum } from '@type/enum';

import { iconRegistry } from '../iconComponents/iconRegistry';

export default function PageTitle() {
  const t = useTranslations();
  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages?.find((item) => item.isActive),
    }),
    shallowEqual,
  );
const Icon =
  activePage?.icon &&
  iconRegistry[activePage.icon as keyof typeof iconRegistry];
  const captionI = activePage?.caption ? t(activePage?.caption) : "";
  const captionII = activePage?.captionII ?? "";

  const titleValues = activePage?.pageData
    ?.filter((i) => i.isTitleField)
    .map((i) => i.value)
    .filter((v) => v != null);

  const combinedTitle = titleValues?.join(" - ");
  const finalCaption = [captionI, captionII].filter(Boolean).join(" - ");

  const renderTitleWithRedAfterDash = (text: string) => {
    const [first, ...rest] = text.split(" - ");

    if (!rest.length) return <span>{first}</span>;

    return (
      <>
        <span>{first}</span>
        <span className="mx-1">-</span>
        <span className="text-gray-gray9 text-sm">{rest.join(" - ")}</span>
      </>
    );
  };

  return (
    <div className="flex justify-center items-center gap-2 w-fit">
      {Icon && <Icon />}
      {finalCaption && (
        <div>
          {renderTitleWithRedAfterDash(
            activePage && activePage?.url?.includes("id")
              ? finalCaption + (combinedTitle ? " - " + combinedTitle : "")
              : activePage?.type === PageTypeEnum.Form
                ? activePage?.pageState === PageStateEnum.Pending ||
                  activePage?.pageState === PageStateEnum.PendingDelete ||
                  activePage?.pageState === PageStateEnum.PendingUpdate ||
                  activePage?.pageState === PageStateEnum.Saved
                  ? finalCaption + (combinedTitle ? " - " + combinedTitle : "")
                  : finalCaption + " - " + t("general.newForm")
                : finalCaption,
          )}
        </div>
      )}
    </div>
  );
}
