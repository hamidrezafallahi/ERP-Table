import { useRef, useState } from "react";

import { Skeleton } from "antd";
import { useTranslations } from "next-intl";
import { shallowEqual, useDispatch } from "react-redux";

import { CustomButton, CustomTooltip } from "@components/atoms/defaultElements";
import {
  FundIcon,
  ListCheck,
  TickIcon,
} from "@components/atoms/iconComponents";
import { useDarkMode } from "@hooks/custom";
import { useAppSelector } from "@redux/index";
import { apiService, useGetData } from "@services/base";
import type { IRequest } from "@services/trh/cash/type";
import { setDefaultConfig } from "@slice/config";
import { ISelectOption } from "@type/elementType";
import { createCookie } from "@utils/core";

import type { IDefaultConfigProps } from "../type";

const DefaultCash = ({ ...props }: IDefaultConfigProps) => {
  const { mode = "light" } = useDarkMode();
  const { onChange, setContent, setOpenModal } = props;
  const { CashierId, PlaceId } = useAppSelector((state) => {
    const CashierId = state.withPersist.config.defaultConfigs?.CashierId;
    const PlaceId = state.withPersist.config.defaultConfigs?.PlaceId;
    return { CashierId, PlaceId };
  }, shallowEqual);
  const [isHovered, setIsHovered] = useState(false);
  const t = useTranslations();

  const cash = {
    key: "cash",
    title: (
      <div className="flex gap-1 font-[700] !text-black-black3 dark:!text-white text-lg">
        <ListCheck />
        {t("title.imposingDuties")}
      </div>
    ),
    content: <CashContent setOpenModal={setOpenModal} onChange={onChange} />,
  };

  const openCashModal = () => {
    setOpenModal(true);
    setContent(cash);
  };
  const getStrokeColor = (mode, isHovered) => {
    if (mode === "dark" && isHovered) return "#FBFBFB";
    if (mode === "dark") return "#cccc";
    if (mode === "light" && isHovered) return "black";
    return;
  };

  const strokeColor = getStrokeColor(mode, isHovered);
  return (
    <CustomTooltip title={CashierId?.desc ?? t("sidebar.cashier")}>
      <CustomButton
        className="flex justify-start !items-center hover:!bg-transparent ps-1 w-full text-gray-gray8"
        type="text"
        onClick={openCashModal}
        disabled={!PlaceId}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div>
          <FundIcon config={{ stroke: strokeColor }} />
        </div>
        <div className="max-w-28 overflow-hidden text-ellipsis text-nowrap whitespace-nowrap">
          {CashierId?.desc ?? t("sidebar.cashier")}
        </div>
      </CustomButton>
    </CustomTooltip>
  );
};

export const CashContent = ({
  setOpenModal = null,
  onChange,
}: IDefaultConfigProps) => {
  const { role, CashierId } = useAppSelector((state) => {
    const CashierId = state.withPersist.config.defaultConfigs?.CashierId;

    const role = state.withPersist.config.userSession?.RoleDto?.find(
      (item) => item.isActiveRole
    );
    return { role, CashierId };
  }, shallowEqual);

  const scrollRef = useRef(null);

  const handleWheel = (event) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += event.deltaY * 2;
    }
  };
  const t = useTranslations();
  const { data, isLoading } = useGetData<ISelectOption[], IRequest>({
    url: "/api/trh/select/cashier4SelectOption",
    body: { RepoViewId: 140002 },
  });
  const dispatch = useDispatch();

  const handleButtonClick = async (item: ISelectOption) => {
    onChange?.();
    dispatch(
      setDefaultConfig({
        CashierId: { id: item._SelectId, desc: item._SelectDisplay },
      })
    );
    createCookie("CashierId", item._SelectId.toString());
    dispatch(apiService.util.resetApiState());
    if (setOpenModal) {
      setOpenModal(false);
    }
  };
  const sortedData = [...(data?.Data ?? [])].sort((a, b) =>
    a._SelectDisplay === CashierId?.desc
      ? -1
      : b._SelectDisplay === CashierId?.desc
      ? 1
      : 0
  );

  
  if (role == undefined || role.IsSupporter === true) {
    return null;
  } else {
    return (
      <div
        key="cashier"
        className={`flex flex-col gap-3 px-8 py-5 w-full h-fit lg:h-full`}
      >
        <div className="flex !items-center gap-2">
          <FundIcon /> {t("sidebar.cashier")}
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
              {sortedData?.map((item: ISelectOption, index) => (
                <CustomButton
                  key={index}
                  className={`border-gray-gray9 px-4 py-1 border rounded-[4px] hover:!text-gray-gray9 hover:!border-gray-gray9 focus:!border-gray-gray9 text-gray-gray9 focus:!text-gray-gray9 
                    dark:bg-black-black5  dark:hover:!bg-black-black5   
                    dark:text-gray-200 dark:hover:!text-gray-200 dark:hover:!border-gray-gray9 dark:focus:!border-gray-gray9
                    ${
                      item?._SelectDisplay == CashierId?.desc
                        ? "bg-gray-gray5 flex hover:!bg-gray-gray5 focus:!bg-gray-gray5 dark:bg-black-black3  focus:dark:bg-black-black3 dark:hover:!bg-black-black3 dark:!border-gray-gray6"
                        : ""
                    }`}
                  onClick={() => handleButtonClick(item)}
                >
                  {item?._SelectDisplay == CashierId?.desc && (
                    <>
                      <div className="flex !self-center pe-1 !item-center !align-center">
                        <TickIcon />
                      </div>
                    </>
                  )}
                  {item._SelectDisplay}
                </CustomButton>
              ))}
            </>
          )}
        </div>
      </div>
    );
  }
};

DefaultCash.forbiddenRoles = ["SuporterFull"];
export default DefaultCash;
