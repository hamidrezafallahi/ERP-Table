import { useTranslations } from "next-intl";
import { TafsiliCategoryForm } from "./tafsiliCategoryForm";
import { TafsiliCategoryList } from "./tafsiliCategoryList";
import { useGetData } from "@services/base";
import { SpinIcon } from "@components/atoms/iconComponents";

export const TafsiliCategorySideBar = () => {
  const createUrl = "/api/acc/insert/tafsiliCategory";
  const listUrl = "/api/acc/select/tafsiliCategory";
  const deleteUrl = "/api/acc/delete/tafsiliCategory";
  const repoViewId = 0;
  const t = useTranslations();

  const {
    data: tafsiliCategoryList,
    isLoading,
    isFetching,
  } = useGetData<any, any>({
    url: listUrl,
    body: {},
  });

  return (
    <div className="flex flex-col gap-2 p-4 border rounded-lg w-full sm:w-60 sm:min-w-60 h-[calc(100dvh-165px)]">
      <div className="flex items-center gap-3">
        {t("general.tafsiliCategory")}
      </div>
      <TafsiliCategoryForm
        createUrl={createUrl}
        listUrl={listUrl}
        repoViewId={repoViewId}
      />
      {isFetching && tafsiliCategoryList?.Data.length === 0 ? (
        <div className="flex justify-center items-center h-full text-gray-400">
          <SpinIcon config={{ width: 12, height: 12 }} />
        </div>
      ) : tafsiliCategoryList?.Data.length === 0 ? (
        <div className="flex justify-center items-center h-full text-gray-400">
          {t("general.notFoundData")}
        </div>
      ) : (
        <TafsiliCategoryList
          tafsiliCategoryList={tafsiliCategoryList?.Data}
          deleteUrl={deleteUrl}
          listUrl={listUrl}
          repoViewId={repoViewId}
        />
      )}
    </div>
  );
};
