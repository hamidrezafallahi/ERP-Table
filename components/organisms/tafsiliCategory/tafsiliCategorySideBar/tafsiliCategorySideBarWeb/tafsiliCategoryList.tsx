import { shallowEqual, useDispatch } from "react-redux";
import { useAppSelector } from "@redux/index";
import { setPageData } from "@slice/pages";
import { ISelectTafsili } from "../types";
import { Dispatch, SetStateAction } from "react";
import { ActionsWeb } from "./actionsWeb";

interface TafsiliCategoryListProps {
  handleSidebarDelete: (id?: number) => void;
  handleSidebarEdit: (id?: number) => void;
  tafsiliCategoryList: ISelectTafsili[];
  setTypeId: Dispatch<SetStateAction<number | undefined>>;
  setIsEdit: Dispatch<SetStateAction<boolean>>;
}

export const TafsiliCategoryList = (props: TafsiliCategoryListProps) => {
  const {
    tafsiliCategoryList,
    handleSidebarDelete,
    handleSidebarEdit,
    setTypeId,
    setIsEdit,
  } = props;

  const dispatch = useDispatch();
  const { selectedTafsiliId } = useAppSelector((state) => {
    const selectedTafsiliId = state.withPersist.pages
      .find((item) => item.isActive)
      ?.pageData?.find((pro) => pro.name == "selectedTafsiliId")?.value;
    return { selectedTafsiliId };
  }, shallowEqual);

  const handleTafsiliSelected = (e: ISelectTafsili) => {
    setIsEdit(false);
    setTypeId(e.TafsiliCategoryId);
    dispatch(
      setPageData({
        name: "selectedTafsiliId",
        value: e.TafsiliCategoryId,
      }),
    );
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-21rem)] overflow-y-scroll">
      {tafsiliCategoryList?.map((tafsili: ISelectTafsili) => (
        <div
          className="w-full border-b last:border-b-0"
          key={tafsili.TafsiliCategoryId}
        >
          <div
            className={`${
              selectedTafsiliId === tafsili.TafsiliCategoryId &&
              "!bg-blue-blue11"
            } mb-1 rounded-md w-full gap-2 !min-h-10 bg-transparent flex justify-between cursor-pointer items-center p-2`}
            onClick={() => handleTafsiliSelected(tafsili)}
          >
            <span className="text-sm font-normal whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0">
              {tafsili.TafsiliCategoryDesc}
            </span>
            <ActionsWeb
              handleSidebarDelete={() =>
                handleSidebarDelete(tafsili.TafsiliCategoryId)
              }
              handleSidebarEdit={() =>
                handleSidebarEdit(tafsili.TafsiliCategoryId)
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
};
