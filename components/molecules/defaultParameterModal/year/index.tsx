import {
  useRef,
  useState,
} from 'react';

import { Skeleton } from 'antd';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomButton,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import {
  FinancialYearIcon,
  ListCheck,
  TickIcon,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useDarkMode } from '@hooks/custom/useDarkMode';
import {
  apiService,
  useGetData,
} from '@services/base';
import type {
  IRequest,
  IYear,
} from '@services/com/year/type';
import { setDefaultConfig } from '@slice/config';
import { createCookie } from '@utils/cookie';

import type { IDefaultConfigProps } from '../type';

const DefaultYear = ({ ...props }: IDefaultConfigProps) => {
  const { onChange, setOpenModal, setContent } = props;
  const { mode = "light" } = useDarkMode();
  const { YearId, PlaceId, role } = useAppSelector((state) => {
    const YearId = state.withPersist.config.defaultConfigs?.YearId;
    const PlaceId = state.withPersist.config.defaultConfigs?.PlaceId;
    const role = state.withPersist.config.userSession?.RoleDto?.find(
      (item) => item.isActiveRole
    );

    return { YearId, PlaceId, role };
  }, shallowEqual);

  const t = useTranslations();
  const [isHovered, setIsHovered] = useState(false);

  const getStrokeColor = (mode, isHovered) => {
    if (mode === "dark" && isHovered) return "#FBFBFB";
    if (mode === "dark") return "#cccc";
    if (mode === "light" && isHovered) return "black";
    return;
  };

  const strokeColor = getStrokeColor(mode, isHovered);

  const year = {
    key: "year",
    title: (
      <div className="flex gap-1 font-[700] !text-black-black3 dark:!text-white text-lg">
        <ListCheck />
        {t("title.imposingDuties")}
      </div>
    ),
    content: <YearContent setOpenModal={setOpenModal} onChange={onChange} />,
  };
  const openYearModal = () => {
    setOpenModal(true);
    setContent(year);
  };
  if (role == undefined || role.IsSupporter === true) {
    return null;
  } else {
    return (
      <CustomTooltip title={YearId?.desc ?? t("general.financialYear")}>
        <CustomButton
          className="flex justify-start !items-center hover:!bg-transparent ps-1 w-full text-gray-gray8"
          type="text"
          onClick={openYearModal}
          disabled={!PlaceId}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div>
            <FinancialYearIcon config={{ stroke: strokeColor }} />
          </div>
          <div className="max-w-28 overflow-hidden text-ellipsis text-nowrap whitespace-nowrap">
            {YearId?.desc ?? t("general.financialYear")}
          </div>
        </CustomButton>
      </CustomTooltip>
    );
  }
};

export const YearContent = ({
  setOpenModal = null,
  onChange,
}: IDefaultConfigProps) => {
  const { YearId } = useAppSelector((state) => {
    const YearId = state.withPersist.config.defaultConfigs?.YearId;
    return { YearId };
  }, shallowEqual);
  const scrollRef = useRef(null);

  const handleWheel = (event) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += event.deltaY * 2;
    }
  };
  const { data, isLoading } = useGetData<IYear[], IRequest>({
    url: "/api/com/Select/YearSelect4Default",
    body: {
      RepoViewId: 30061,
      ShowMode: 10,
    },
  });
  const dispatch = useDispatch();
  const handleButtonClick = async (item: IYear) => {
    onChange?.();
    dispatch(
      setDefaultConfig({ YearId: { id: item.YearId, desc: item.YearDesc } })
    );
    createCookie("YearId", item.YearId.toString());
    dispatch(apiService.util.resetApiState());
    if (setOpenModal) {
      setOpenModal(false);
    }
  };
  const t = useTranslations();
  const sortedData = [...(data?.Data ?? [])].sort((a, b) =>
    a.YearDesc === YearId?.desc ? -1 : b.YearDesc === YearId?.desc ? 1 : 0
  );
  return (
    <div
      key="year"
      className={`flex flex-col gap-3 p-4 px-8 py-5 w-full h-fit lg:h-full`}
    >
      <div className="flex gap-2">
        <FinancialYearIcon config={{stroke:"#939393"}} />
        {t("general.financialYear")}
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
            {sortedData?.map((item, index) => {
              return (
                <CustomButton
                  key={index}
                  className={`border-gray-gray9 px-4 py-1 border rounded-[4px] hover:!text-gray-gray9 hover:!border-gray-gray9 focus:!border-gray-gray9 text-gray-gray9 focus:!text-gray-gray9 
                    dark:bg-black-black5  dark:hover:!bg-black-black5   
                    dark:text-gray-200 dark:hover:!text-gray-200 dark:hover:!border-gray-gray9 dark:focus:!border-gray-gray9
                    ${
                      item.YearDesc == YearId?.desc
                        ? "bg-gray-gray5 flex hover:!bg-gray-gray5 focus:!bg-gray-gray5 dark:bg-black-black3  focus:dark:bg-black-black3 dark:hover:!bg-black-black3 dark:!border-gray-gray6"
                        : ""
                    }`}
                  onClick={() => handleButtonClick(item)}
                >
                  {item?.YearDesc == YearId?.desc && (
                    <>
                      <div className="flex !self-center pe-1 !item-center !align-center">
                        <TickIcon />
                      </div>
                    </>
                  )}
                  {item.YearDesc}
                </CustomButton>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default DefaultYear;
