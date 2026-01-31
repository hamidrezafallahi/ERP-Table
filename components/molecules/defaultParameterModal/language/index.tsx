import { useRef, useState } from "react";

import { Skeleton } from "antd";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { shallowEqual, useDispatch } from "react-redux";

import { CustomButton } from "@components/atoms/defaultElements";
import {
  LanguageIcon,
  ListCheck,
  TickIcon,
} from "@components/atoms/iconComponents";
import { useDarkMode } from "@hooks/custom";
import { useAppSelector } from "@redux/index";
import { apiService, useGetData } from "@services/base";
import type { ILanguage, IRequest } from "@services/management/language/type";
import { setDefaultConfig, setLanguage } from "@slice/config";
import { createCookie } from "@utils/core";

import type { IDefaultConfigProps } from "../type";

const DefaultLanguage = ({ ...props }: IDefaultConfigProps) => {
  const { mode = "light" } = useDarkMode();
  const { setContent, setOpenModal, onChange, showReverse = false } = props;

  const { LanguageId } = useAppSelector((state) => {
    const LanguageId = state.withPersist.config.defaultConfigs?.LanguageId;
    return { LanguageId };
  }, shallowEqual);

  const [isHovered, setIsHovered] = useState(false);
  const t = useTranslations();
  const language = {
    key: "language",
    title: (
      <div className="flex gap-1 font-[700] !text-black-black3 dark:!text-white text-lg">
        <ListCheck />
        {t("title.imposingDuties")}
      </div>
    ),
    content: (
      <LanguageContent setOpenModal={setOpenModal} onChange={onChange} />
    ),
  };
  const openLanguageModal = () => {
    setOpenModal(true);
    setContent(language);
  };
  const getStrokeColor = (mode, isHovered) => {
    if (mode === "dark" && isHovered) return "#FBFBFB";
    if (mode === "dark") return "#cccc";
    if (mode === "light" && isHovered) return "black";
    return;
  };

  const strokeColor = getStrokeColor(mode, isHovered);

  return (
    <>
      <CustomButton
        type="text"
        className="hover:!bg-transparent p-0"
        onClick={openLanguageModal}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {showReverse ? (
          <div className="flex justify-start !items-center gap-2 hover:!bg-transparent ps-1 text-gray-gray8">
            <div
              className={`flex justify-end items-center w-fit overflow-hidden text-ellipsis text-nowrap`}
            >
              {LanguageId?.desc ?? t("sidebar.language")}
            </div>
            <div>
              <LanguageIcon config={{ stroke: strokeColor }} />
            </div>
          </div>
        ) : (
          <div className="flex justify-start !items-center gap-2 hover:!bg-transparent text-gray-gray8">
            <div>
              <LanguageIcon config={{ stroke: strokeColor }} />
            </div>
            <div className="flex justify-start items-center min-w-24 overflow-hidden text-ellipsis text-nowrap">
              {LanguageId?.desc ?? t("sidebar.language")}
            </div>
          </div>
        )}
      </CustomButton>
    </>
  );
};
export const LanguageContent = ({
  setOpenModal,
  onChange,
}: IDefaultConfigProps) => {
  const scrollRef = useRef(null);

  const handleWheel = (event) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += event.deltaY * 2;
    }
  };
  const { LanguageId } = useAppSelector((state) => {
    const LanguageId = state.withPersist.config.defaultConfigs?.LanguageId;

    return { LanguageId };
  }, shallowEqual);
  const { data, isLoading } = useGetData<ILanguage[], IRequest>({
    url: "/api/mng/select/language",
    body: {
      RepoViewId: 100007,
    },
  });
  const dispatch = useDispatch();
  const router = useRouter();

  const handleChangeLang = (newSlug) => {
    const currentSlug = document.location.href
      .replace(document.location.origin, "")
      .split("/")[1];
    if (newSlug !== currentSlug) {
      const formattedNewSlug = newSlug.toLowerCase().trim();
      const newUrl = document.location.href.replace(
        `/${currentSlug}/`,
        `/${formattedNewSlug}/`
      );
      router.replace(newUrl);
    }
  };

  const handleButtonClick = async (item) => {
    onChange?.();
    dispatch(
      setDefaultConfig({
        LanguageId: { id: item.LanguageId, desc: item.LanguageDesc },
      })
    );
    createCookie("LanguageId", item.LanguageId.toString());
    dispatch(apiService.util.resetApiState());
    if (typeof handleChangeLang === "function") {
      handleChangeLang(item.Code);
    }
    const temp = item.LanguageId === 2 ? "fa" : "en";
    dispatch(setLanguage({ lang: temp }));
    if (setOpenModal) {
      setOpenModal(false);
    }
  };

  const t = useTranslations();
  const sortedData = [...(data?.Data ?? [])].sort((a, b) =>
    a.LanguageDesc === LanguageId?.desc
      ? -1
      : b.LanguageDesc === LanguageId?.desc
      ? 1
      : 0
  );
  return (
    <div
      key="language"
      className={`flex flex-col gap-3 p-4 px-8 py-5 w-full  h-fit lg:h-full`}
    >
      <div className="flex !items-center gap-2">
        <LanguageIcon /> {t("sidebar.language")}
      </div>
      <div
        className="hidden-show-scrollBar flex md:flex-wrap gap-4 overflow-x-auto scroll-smooth"
        onWheel={handleWheel}
        ref={scrollRef}
      >
        {isLoading ? (
          <Skeleton active loading />
        ) : (
          <>
            {sortedData?.map((item: ILanguage, index) => {
              return (
                <CustomButton
                  key={index}
                  className={`border-gray-gray9 px-4 py-1 border rounded-[4px] hover:!text-gray-gray9 hover:!border-gray-gray9 focus:!border-gray-gray9 text-gray-gray9 focus:!text-gray-gray9 
                    dark:bg-black-black5  dark:hover:!bg-black-black5   
                    dark:text-gray-200 dark:hover:!text-gray-200 dark:hover:!border-gray-gray9 dark:focus:!border-gray-gray9
                    ${
                      item.LanguageDesc == LanguageId?.desc
                        ? "bg-gray-gray5 flex hover:!bg-gray-gray5 focus:!bg-gray-gray5 dark:bg-black-black3  focus:dark:bg-black-black3 dark:hover:!bg-black-black3 dark:!border-gray-gray6"
                        : ""
                    }`}
                  onClick={() => handleButtonClick(item)}
                >
                  {item?.LanguageDesc == LanguageId?.desc && (
                    <>
                      <div className="flex !self-center pe-1 !item-center !align-center">
                        <TickIcon />
                      </div>
                    </>
                  )}
                  {item.LanguageDesc}
                </CustomButton>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
export default DefaultLanguage;
