import { useEffect, useState } from "react";

import { Dropdown, MenuProps } from "antd";
import { useTranslations } from "next-intl";
import { shallowEqual } from "react-redux";

import { CustomBadge } from "@components/atoms/defaultElements";
import { SideFooterIcon } from "@components/atoms/iconComponents";
import DefaultCash from "@components/molecules/defaultParameterModal/cash";
import DefaultCompany from "@components/molecules/defaultParameterModal/company";
import DefaultCurrency from "@components/molecules/defaultParameterModal/currency";
import DefaultLanguage from "@components/molecules/defaultParameterModal/language";
import DefaultYear from "@components/molecules/defaultParameterModal/year";
import { useDarkMode } from "@hooks/custom";
import { useAppSelector } from "@redux/index";
import { IDefaultConfigs } from "@slice/config/type";

import HelperDelay from "./helperDelay";
import { IRequiredStep } from "./type";

function DefaultConfigs({ ...props }) {
  const { setOpenModal, setContent } = props;
  const { mode = "light" } = useDarkMode();
  const [openDropdown, setOpenDropdown] = useState(false);
  const [tourOpen, setTourOpen] = useState<boolean>(false);
  const { CashierId, CurrencyId, LanguageId, PlaceId, YearId, role } =
    useAppSelector((state) => {
      const CashierId = state.withPersist.config.defaultConfigs?.CashierId;
      const CurrencyId = state.withPersist.config.defaultConfigs?.CurrencyId;
      const LanguageId = state.withPersist.config.defaultConfigs?.LanguageId;
      const PlaceId = state.withPersist.config.defaultConfigs?.PlaceId;
      const YearId = state.withPersist.config.defaultConfigs?.YearId;
      const role = state.withPersist.config.userSession?.RoleDto?.find(
        (item) => item.isActiveRole,
      );

      return {
        CashierId,
        CurrencyId,
        LanguageId,
        PlaceId,
        YearId,
        role,
      };
    }, shallowEqual);
  const [tourConditionalClose, setTourConditionalClose] =
    useState<boolean>(false);
  const [requiredSteps, setRequiredSteps] = useState<IRequiredStep[]>();
  const t = useTranslations();

  const handleOpenDropdown = () => {
    setOpenDropdown(!openDropdown);
  };

  const allRequiredSteps: IRequiredStep[] = [
    {
      title: "تنظیمات اولیه برنامه",
      description: (
        <p>
          از این قسمت وارد تنظیمات اولیه میشوید
          <br />
          <strong>کلیک کنید</strong>
        </p>
      ),
      id: "initialSettings",
      target: () => document.getElementById("initialSettings"),
    },
    {
      title: t("guide.default", {
        path: t("general.company"),
      }),
      id: "PlaceId",
      description: (
        <p>
          {t("guide.defaultSystem", {
            path: t("general.company"),
          })}
          <br />
          <strong>{t("guide.required")}</strong>
        </p>
      ),
      target: () => document.getElementById("PlaceId"),
    },
    {
      title: t("guide.default", {
        path: t("sidebar.language"),
      }),
      description: (
        <p>
          {t("guide.defaultSystem", {
            path: t("sidebar.language"),
          })}

          <br />
          <strong>{t("guide.required")}</strong>
        </p>
      ),
      id: "LanguageId",
      target: () => document.getElementById("LanguageId"),
    },
    {
      title: t("guide.default", {
        path: t("sidebar.currency"),
      }),
      description: (
        <p>
          {t("guide.defaultSystem", {
            path: t("sidebar.currency"),
          })}
          <br />
          <strong>{t("guide.required")}</strong>
        </p>
      ),
      id: "CurrencyId",

      target: () => document.getElementById("CurrencyId"),
    },
    {
      title: t("guide.default", {
        path: t("general.financialYear"),
      }),
      description: (
        <p>
          {t("guide.defaultSystem", {
            path: t("general.financialYear"),
          })}
          <br />
          <strong>{t("guide.required")}</strong>
        </p>
      ),
      id: "YearId",
      target: () => document.getElementById("YearId"),
    },
    {
      title: t("guide.default", {
        path: t("general.fund"),
      }),
      description: (
        <p>
          {t("guide.defaultSystem", {
            path: t("general.fund"),
          })}
          <br />
          <strong>{t("guide.required")}</strong>
        </p>
      ),
      id: "CashierId",
      target: () => document.getElementById("CashierId"),
    },
  ];
  const globals: IDefaultConfigs = {
    CurrencyId,
    CashierId,
    PlaceId,
    YearId,
    LanguageId,
  };
  const undefinedList = Object.values(globals).filter((item) => !item).length;

  const filteredSteps = allRequiredSteps.filter((step) => {
    switch (step.id) {
      case "LanguageId":
        return !LanguageId;
      case "CurrencyId":
        return !CurrencyId;
      case "YearId":
        return !YearId;
      case "CashierId":
        return !CashierId;
      case "PlaceId":
        return !PlaceId;
      case "initialSettings":
        return undefinedList == 5;
      default:
        return true;
    }
  });
  const handleSetDefaults = () => {
    setRequiredSteps(filteredSteps);
    if (undefinedList > 0 && openDropdown === false) {
      setOpenDropdown(true);
      setTourOpen(true);
      setTourConditionalClose(true);
    } else {
      setTourConditionalClose(false);
    }
    if (undefinedList == 0) {
      setOpenDropdown(false);
    }
  };
  const items: MenuProps["items"] = [
    {
      key: "0",
      label: (
        <div id="PlaceId">
          <DefaultCompany setOpenModal={setOpenModal} setContent={setContent} />
        </div>
      ),
    },
    {
      key: "1",
      label: (
        <div id="LanguageId">
          <DefaultLanguage
            setOpenModal={setOpenModal}
            setContent={setContent}
          />
        </div>
      ),
    },
    {
      key: "2",
      disabled: !PlaceId,
      label: (
        <div id="CurrencyId">
          <DefaultCurrency
            setOpenModal={setOpenModal}
            setContent={setContent}
          />
        </div>
      ),
    },

    {
      key: "3",
      disabled: !PlaceId,
      label: (
        <div id="YearId">
          <DefaultYear setOpenModal={setOpenModal} setContent={setContent} />
        </div>
      ),
    },
    {
      key: "4",
      disabled: !PlaceId,
      label: (
        <div id="CashierId">
          <DefaultCash setOpenModal={setOpenModal} setContent={setContent} />
        </div>
      ),
    },
  ];
  useEffect(() => {
    handleSetDefaults();
  }, [CashierId, CurrencyId, LanguageId, PlaceId, YearId]);
  if (role == undefined || role.IsSupporter === true) {
    return null;
  } else {
    return (
      <>
        <Dropdown
          rootClassName="[&>ul>li]:!p-0"
          forceRender={
            Object.values(globals).filter((item) => !item).length !== 0
          }
          trigger={[
            Object.values(globals).filter((item) => !item).length !== 0
              ? "click"
              : "hover",
          ]}
          open={
            Object.values(globals).filter((item) => !item).length !== 0
              ? openDropdown
              : undefined
          }
          menu={{ items }}
        >
          <button
            onClick={handleOpenDropdown}
            className="relative flex justify-center items-center rounded w-8 h-8"
          >
            <span
              id="initialSettings"
              className="top-20 fixed h-0 end-72"
            ></span>
            <CustomBadge
              count={Object.values(globals).filter((item) => !item).length}
              size="small"
              className="absolute top-0 rtl: right-0  left-0 [&>sup]:!shadow-none [&>sup]:!bg-redBadge"
            />
            <SideFooterIcon
              config={{
                width: 20,
                height: 20,
                stroke: mode === "dark" ? "#FBFBFB" : "#086EDC",
              }}
            />
          </button>
        </Dropdown>
        <HelperDelay
          tourOpen={tourOpen}
          conditionalCloseFunction={tourConditionalClose}
          requiredSteps={requiredSteps}
          setTourOpen={setTourOpen}
        />
      </>
    );
  }
}

export default DefaultConfigs;
