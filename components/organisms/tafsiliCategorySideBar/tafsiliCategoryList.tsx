import { useCUDDataMutation, apiService } from "@services/base";
import { shallowEqual, useDispatch } from "react-redux";
import { showSuccessToast } from "@utils/core";
import { TrashBin } from "@components/atoms/iconComponents";
import { useAppSelector } from "@redux/index";
import { setPageData } from "@slice/pages";
import { ISelectTafsili, TafsiliCategoryListProps } from "./type";

export const TafsiliCategoryList = ({
  listUrl,
  deleteUrl,
  repoViewId,
  tafsiliCategoryList,
}: TafsiliCategoryListProps) => {
  const dispatch = useDispatch();
  const { selectedTafsiliId } = useAppSelector((state) => {
    const selectedTafsiliId = state.withPersist.pages
      .find((item) => item.isActive)
      ?.pageData?.find((pro) => pro.name == "selectedTafsiliId")?.value;
    return { selectedTafsiliId };
  }, shallowEqual);

  const handleTafsiliSelected = (e: ISelectTafsili) => {
    dispatch(
      setPageData({
        name: "selectedTafsiliId",
        value: e.TafsiliCategoryId,
      }),
    );
  };

  const [mutateItem] = useCUDDataMutation();

  const handleDelete = async (id: number) => {
    try {
      const result = await mutateItem({
        url: deleteUrl,
        body: { Id: id },
      }).unwrap();

      if (result?.Result === "Success") {
        showSuccessToast("حذف شد");
        (dispatch as any)(
          apiService.util.updateQueryData(
            "getInfinite",
            {
              url: listUrl,
              body: { RepoViewId: repoViewId },
              id: "All",
            },
            (draft) => {
              if (draft?.Data) draft.Data = [];
            },
            false,
          ),
        );
      }
    } catch (error) {
      null;
    }
  };

  return (
    <div className="flex flex-col">
      {tafsiliCategoryList?.map((tafsili: ISelectTafsili) => (
        <div
          className="w-full border-b last:border-b-0"
          key={tafsili.TafsiliCategoryId}
        >
          <div
            className={`${
              selectedTafsiliId === tafsili.TafsiliCategoryId &&
              "bg-blue-blue11"
            } mb-1 rounded-md w-full !min-h-10 bg-transparent flex justify-between cursor-pointer items-center p-2`}
            onClick={() => handleTafsiliSelected(tafsili)}
          >
            <span className="text-sm font-normal">
              {tafsili.TafsiliCategoryDesc}
            </span>
            <div onClick={() => handleDelete(tafsili.TafsiliCategoryId)}>
              <TrashBin />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
