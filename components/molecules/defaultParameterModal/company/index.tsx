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
  Buildings,
  ListCheck,
  TickIcon,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useDarkMode } from '@hooks/custom/useDarkMode';
import {
  apiService,
  useGetData,
} from '@services/base';
import type { IPlace } from '@services/mng/place/type';
import { setDefaultConfig } from '@slice/config';
import { createCookie } from '@utils/cookie';

import type { IDefaultConfigProps } from '../type';

const DefaultCompany = ({ ...props }: IDefaultConfigProps) => {
  const { onChange, setContent, setOpenModal } = props;
  const [isHovered, setIsHovered] = useState(false);
  const { PlaceId, role } = useAppSelector((state) => {
    const PlaceId = state.withPersist.config.defaultConfigs?.PlaceId;
    const role = state.withPersist.config.userSession?.RoleDto?.find(
      (item) => item.isActiveRole
    );

    return { PlaceId, role };
  }, shallowEqual);
  const { mode = "light" } = useDarkMode();
  const t = useTranslations();
  const Company = {
    key: "company",
    title: (
      <div className="flex gap-1 font-[700] !text-black-black3 dark:!text-white text-lg">
        <ListCheck />
        {t("title.imposingDuties")}
      </div>
    ),
    onClick: () => {},
    content: <CompanyContent setOpenModal={setOpenModal} onChange={onChange} />,
  };

  const openCompanyFormModal = () => {
    setOpenModal(true);
    setContent(Company);
  };

  const getStrokeColor = (mode, isHovered) => {
    if (mode === "dark" && isHovered) return "#FBFBFB";
    if (mode === "dark") return "#FBFBFB";
    if (mode === "light" && isHovered) return "black";
    return;
  };

  const strokeColor = getStrokeColor(mode, isHovered);
  if (role == undefined || role.IsSupporter === true) {
    return null;
  } else {
    return (
      <CustomTooltip title={PlaceId?.desc ?? t("sidebar.centralCompany")}>
        <CustomButton
          type="text"
          title={PlaceId?.desc}
          className="flex justify-start !items-center hover:!bg-transparent p-0 ps-1 w-full text-gray-gray8"
          onClick={openCompanyFormModal}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div>
            <Buildings config={{ stroke: strokeColor }} />
          </div>

          <div className="w-fit max-w-28 overflow-hidden text-ellipsis text-nowrap whitespace-nowrap">
            {PlaceId?.desc ?? t("sidebar.centralCompany")}
          </div>
        </CustomButton>
      </CustomTooltip>
    );
  }
};

export const CompanyContent = ({
  setOpenModal = null,
  onChange,
}: IDefaultConfigProps) => {
  const { role, PlaceId } = useAppSelector((state) => {
    const PlaceId = state.withPersist.config.defaultConfigs?.PlaceId;

    const role = state.withPersist.config.userSession?.RoleDto?.find(
      (item) => item.isActiveRole
    );
    return { role, PlaceId };
  }, shallowEqual);

  const scrollRef = useRef(null);

  const handleWheel = (event) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += event.deltaY * 2;
    }
  };

  const { data, isLoading } = useGetData<IPlace[], null>({
    url: "/api/mng/select/place",
    body: { RepoViewId: 207003 },
  });
  const dispatch = useDispatch();
  const handleButtonClick = async (item) => {
    onChange?.();
    dispatch(
      setDefaultConfig({ PlaceId: { id: item.PlaceId, desc: item.PlaceDesc } })
    );
    createCookie("PlaceId", item.PlaceId.toString());
    dispatch(apiService.util.resetApiState());
    if (setOpenModal) {
      setOpenModal(false);
    }
  };
  const t = useTranslations();
  const sortedData = [...(data?.Data ?? [])].sort((a, b) =>
    a.PlaceDesc === PlaceId?.desc ? -1 : b.PlaceDesc === PlaceId?.desc ? 1 : 0
  );
  if (role == undefined || role.IsSupporter === true) {
    return null;
  } else {
    return (
      <div
        key="company"
        className={`flex flex-col gap-3 p-4 px-8 py-5 w-full h-fit lg:h-full`}
      >
        <div className="flex gap-2">
          <Buildings />
          {t("general.company")}
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
              {sortedData?.map((item: IPlace, index) => {
                return (
                  <CustomButton
                    key={index}
                    className={`border-gray-gray9 px-4 py-1 border rounded-[4px] hover:!text-gray-gray9 hover:!border-gray-gray9 focus:!border-gray-gray9 text-gray-gray9 focus:!text-gray-gray9 
                      dark:bg-black-black5  dark:hover:!bg-black-black5   
                      dark:text-gray-200 dark:hover:!text-gray-200 dark:hover:!border-gray-gray9 dark:focus:!border-gray-gray9
                      ${
                        item?.PlaceDesc == PlaceId?.desc
                          ? "bg-gray-gray5 flex hover:!bg-gray-gray5 focus:!bg-gray-gray5 dark:bg-black-black3  focus:dark:bg-black-black3 dark:hover:!bg-black-black3 dark:!border-gray-gray6"
                          : ""
                      }`}
                    onClick={() => handleButtonClick(item)}
                  >
                    {item?.PlaceDesc == PlaceId?.desc && (
                      <>
                        <div className="flex !self-center pe-1 !item-center !align-center">
                          <TickIcon />
                        </div>
                      </>
                    )}
                    {item.PlaceDesc}
                  </CustomButton>
                );
              })}
            </>
          )}
        </div>
      </div>
    );
  }
};
export default DefaultCompany;
