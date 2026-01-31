import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { shallowEqual } from "react-redux";

import { useAppSelector } from "@redux/index";
import { PageStateEnum } from "@slice/pages/enum";
import { PageTypeEnum } from "@type/enum";

import * as Icons from "../iconComponents";

// Cannot destructure property 'caption' of 'x' as it is undefined.
export default function PageTitle() {
  const t = useTranslations();
  const params = useSearchParams();
  const title = params.get("title");
  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages?.find((item) => item.isActive),
    }),
    shallowEqual
  );
  const IconComponent = Icons[activePage?.icon];

  const captionI = activePage?.caption ? t(activePage?.caption) : "";
  const captionII = activePage?.captionII ?? "";

  const finalCaption = [captionI, captionII].filter(Boolean).join(" - ");
  console.log(captionI, captionII);
  return (
    <div className="flex justify-center items-center gap-2 w-fit">
      <div>{IconComponent && <IconComponent />}</div>
      {finalCaption && (
        <div>
          {activePage && activePage?.url?.includes("id")
            ? finalCaption +
              " - " +
              activePage?.pageData?.find((i) => i.isTitleField === true)?.value
            : activePage?.type === PageTypeEnum.Form
            ? activePage?.pageState === PageStateEnum.Pending ||
              activePage?.pageState === PageStateEnum.PendingDelete ||
              activePage?.pageState === PageStateEnum.PendingUpdate ||
              activePage?.pageState === PageStateEnum.Saved
              ? finalCaption +
                " - " +
                activePage?.pageData?.find((i) => i.isTitleField === true)
                  ?.value
              : finalCaption + " - " + t("general.newForm")
            : title !== null
            ? finalCaption + "-" + title
            : finalCaption}
        </div>
      )}
    </div>
  );
}
