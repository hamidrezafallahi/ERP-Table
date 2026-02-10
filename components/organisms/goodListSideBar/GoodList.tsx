// InfiniteScrollGoodList.tsimport { Skeleton } from "antd";
import { useTranslations } from "next-intl";
import { shallowEqual, useDispatch } from "react-redux";

import { CustomButton } from "@components/atoms/defaultElements";
import { useAppSelector } from "@redux/index";
import { setPageData } from "@slice/pages";
import { IRepoEntityData } from "@type/elementType";
import { Skeleton } from "antd";

interface IProps {
  goodList: IRepoEntityData[];
  isFetching: boolean;
}

export default function GoodList({ goodList, isFetching }: IProps) {
  const dispatch = useDispatch();
  const t = useTranslations();

  const { selectedGoodId } = useAppSelector((state) => {
    const selectedGoodId = state.withPersist.pages
      .find((item) => item.isActive)
      ?.pageData?.find((pro) => pro.name == "selectedGoodId")?.value;
    return { selectedGoodId };
  }, shallowEqual);

  const handleGoodSelected = (e: IRepoEntityData) => {
    dispatch(
      setPageData({
        name: "selectedGoodId",
        value: e.RepoId,
      })
    );
    dispatch(setPageData({ name: "selectedVersionId", value: undefined }));
  };

  return (
    <>
      {isFetching && goodList.length === 0 ? (
        <div className="flex flex-col gap-4 w-full">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton.Button key={i} active style={{ width: "186px" }} />
          ))}
        </div>
      ) : goodList.length > 0 ? (
        <>
          <div className="flex flex-col gap-2 p-2 !h-full overflow-auto">
            {goodList.map((good, index) => (
              <div
                className="border-b last:border-b-0"
                key={`${good.RepoId}-${index}`}
              >
                <CustomButton
                  type="text"
                  className={`${
                    selectedGoodId == good.RepoId && "bg-blue-blue11"
                  } mb-1 rounded-lg w-full !min-h-10`}
                  onClick={() => handleGoodSelected(good)}
                >
                  {good.Title}
                </CustomButton>
              </div>
            ))}
            {isFetching && (
              <div className="flex justify-center items-center py-4">
                <Skeleton.Button
                  active
                  size="small"
                  style={{ width: "100px" }}
                />
                <span className="text-xs text-gray-500 mr-2">
                  در حال بارگذاری...
                </span>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center w-full">
          <p className="pt-10 text-gray-gray95 text-xs text-center">
            {t("general.notFoundData")}
          </p>
        </div>
      )}
    </>
  );
}
