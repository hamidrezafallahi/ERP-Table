"use client";
import { useEffect, useState } from "react";

import { shallowEqual, useDispatch } from "react-redux";

import Title from "@components/atoms/Title";
import { useAppSelector } from "@redux/index";
import { addNewPage } from "@slice/pages";
import { PageTypeEnum } from "@type/enum";
import RepoAssignToolbar from "./repoAssignToolbar";
import RepoAssignContext from "./repoAssignContext";
import GoodListSideBar from "@components/organisms/goodListSideBar";

export default function RepoAssignTemplate() {
  const dispatch = useDispatch();
  const [systemId, setSystemId] = useState<number>(undefined);
  const { initPage, selectedGoodId } = useAppSelector((state) => {
    const initPage = state.withPersist.init;
    const selectedGoodId = state.withPersist.pages
      .find((p) => p.isActive)
      ?.pageData?.find((d) => d.name == "selectedGoodId")?.value;
    return { initPage, selectedGoodId };
  }, shallowEqual);

  const { pageId, RepoId, SystemId, url, pageState, originalPageState } =
    initPage;

  useEffect(() => {
    dispatch(
      addNewPage({
        pageId: pageId,
        caption: "title.repoAssign",
        icon: "WebHookIcon",
        pageState,
        originalPageState,
        type: PageTypeEnum.Custom,
        RepoId: RepoId,
        SystemId: SystemId,
        url,
      }),
    );
  }, []);

  return (
    <div className="relative">
      <Title caption={"title.repoAssign"} />
      <div className="relative flex lg:flex-row items-center flex-col gap-4 h-full">
        <RepoAssignToolbar />
        <GoodListSideBar systemId={systemId} setSystemId={setSystemId} />
        {systemId && selectedGoodId ? (
          <div
            className={`hidden-show-scrollBar relative p-4 border-2 border-dashed rounded w-full h-[calc(100dvh-165px)] overflow-auto`}
          >
            <RepoAssignContext
              systemId={systemId}
              selectedGoodId={selectedGoodId}
            />
          </div>
        ) : (
          <div className="flex justify-center items-center w-full h-full text-gray-400">
            لطفاً ابتدا سیستم و کالا را انتخاب کنید.
          </div>
        )}
      </div>
    </div>
  );
}
