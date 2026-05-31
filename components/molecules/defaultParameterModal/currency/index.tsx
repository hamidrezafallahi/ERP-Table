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
  ListCheck,
  MoneyLgIcon,
  TickIcon,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useDarkMode } from '@hooks/custom/useDarkMode';
import {
  apiService,
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import type { IAvailableCurrency } from '@services/com/currency/type';
import { setDefaultConfig } from '@slice/config';
import { createCookie } from '@utils/cookie';
import { showErrorToast } from '@utils/toast';

import type { IDefaultConfigProps } from '../type';

const DefaultCurrency = ({ ...props }: IDefaultConfigProps) => {
  const { mode = "light" } = useDarkMode();
  const { onChange, setOpenModal, setContent } = props;
  const { CurrencyId, PlaceId } = useAppSelector((state) => {
    const CurrencyId = state.withPersist.config.defaultConfigs?.CurrencyId;
    const PlaceId = state.withPersist.config.defaultConfigs?.PlaceId;
    return { CurrencyId, PlaceId };
  }, shallowEqual);
  const [isHovered, setIsHovered] = useState(false);
  const t = useTranslations();

  const currency = {
    key: "currency",
    title: (
      <div className="flex gap-1 font-[700] !text-black-black3 dark:!text-white text-lg">
        <ListCheck />
        {t("title.imposingDuties")}
      </div>
    ),
    content: (
      <CurrencyContent setOpenModal={setOpenModal} onChange={onChange} />
    ),
  };
  const openCurrencyModal = () => {
    setOpenModal(true);
    setContent(currency);
  };
  const getStrokeColor = (mode, isHovered) => {
    if (mode === "dark" && isHovered) return "#FBFBFB";
    if (mode === "dark") return "#cccc";
    if (mode === "light" && isHovered) return "black";
    return;
  };

  const strokeColor = getStrokeColor(mode, isHovered);

  return (
    <CustomTooltip title={CurrencyId?.desc ?? t("sidebar.currency")}>
      <CustomButton
        className="flex justify-start !items-center hover:!bg-transparent ps-1 w-full text-gray-gray8"
        type="text"
        onClick={openCurrencyModal}
        disabled={!PlaceId}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div>
          <MoneyLgIcon config={{ stroke: strokeColor }} />
        </div>
        <div className="max-w-28 overflow-hidden text-ellipsis text-nowrap whitespace-nowrap">
          {CurrencyId?.desc ?? t("sidebar.currency")}
        </div>
      </CustomButton>
    </CustomTooltip>
  );
};

export const CurrencyContent = ({
  setOpenModal = null,
  onChange,
}: IDefaultConfigProps) => {
  const { role, CurrencyId } = useAppSelector((state) => {
    const CurrencyId = state.withPersist.config.defaultConfigs?.CurrencyId;

    const role = state.withPersist.config.userSession?.RoleDto?.find(
      (item) => item.isActiveRole
    );
    return { role, CurrencyId };
  }, shallowEqual);

  const scrollRef = useRef(null);

  const handleWheel = (event) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += event.deltaY * 2;
    }
  };

  const { data, isLoading } = useGetData<IAvailableCurrency[], null>({
    url: "/api/com/select/availableCurrencies",
    body: {},
  });
  const [checkCurrency, { isLoading: isChecking }] = useCUDDataMutation();
  const dispatch = useDispatch();
  const handleButtonClick = async (item: IAvailableCurrency) => {
    const checkResult: any = await checkCurrency({
      url: "/api/com/select/checkCurrencyRateExist",
      body: {
        Id: item.CurrencyId,
      },
    }).unwrap();

    if (checkResult?.Result === true) {
      onChange?.();
      dispatch(
        setDefaultConfig({
          CurrencyId: {
            id: item.CurrencyId,
            desc: item?.Currency?.CurrencyDesc,
          },
        })
      );
      createCookie("CurrencyId", item.CurrencyId.toString());
      dispatch(apiService.util.resetApiState());
      if (setOpenModal) {
        setOpenModal(false);
      }
    } else {
      showErrorToast(t("toast.setCurrencyRate"));
    }
  };
  const t = useTranslations();
  const sortedData = [...(data?.Data ?? [])].sort((a, b) =>
    a.Currency.CurrencyDesc === CurrencyId?.desc
      ? -1
      : b.Currency.CurrencyDesc === CurrencyId?.desc
      ? 1
      : 0
  );

  
  if (role == undefined || role.IsSupporter === true) {
    return null;
  } else {
    return (
      <div
        key="currency"
        className={`flex flex-col gap-3 p-4 px-8 py-5 w-full h-fit lg:h-full`}
      >
        <div className="flex gap-2">
          <MoneyLgIcon /> {t("sidebar.currency")}
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
              {sortedData?.map((item: IAvailableCurrency, index) => {
                return (
                  <CustomButton
                    key={index}
                    className={`border-gray-gray9 px-4 py-1 border rounded-[4px] hover:!text-gray-gray9 hover:!border-gray-gray9 focus:!border-gray-gray9 text-gray-gray9 focus:!text-gray-gray9 
                      dark:bg-black-black5  dark:hover:!bg-black-black5   
                      dark:text-gray-200 dark:hover:!text-gray-200 dark:hover:!border-gray-gray9 dark:focus:!border-gray-gray9
                      ${
                        item.Currency.CurrencyDesc == CurrencyId?.desc
                          ? "bg-gray-gray5 flex hover:!bg-gray-gray5 focus:!bg-gray-gray5 dark:bg-black-black3  focus:dark:bg-black-black3 dark:hover:!bg-black-black3 dark:!border-gray-gray6"
                          : ""
                      }`}
                    onClick={() => handleButtonClick(item)}
                    disabled={isChecking}
                    loading={isChecking}
                  >
                    {item.Currency.CurrencyDesc == CurrencyId?.desc && (
                      <>
                        <div className="flex !self-center pe-1 !item-center !align-center">
                          <TickIcon />
                        </div>
                      </>
                    )}
                    {item.Currency.CurrencyDesc}
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

export default DefaultCurrency;
