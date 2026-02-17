import { memo, useEffect, useState } from "react";

import { useTranslations } from "next-intl";
import { shallowEqual, useDispatch } from "react-redux";

import { CustomButton } from "@components/atoms/defaultElements";
import { MinimizeIcon } from "@components/atoms/iconComponents";
import { PinIcon } from "@components/atoms/iconComponents/icons/PinIcon";
import { UnPinIcon } from "@components/atoms/iconComponents/icons/UnPinIcon";
import { useMediaQuery } from "@hooks/custom";
import PanelForm from "@layout/baseLayout/desktop/actionBar/panelForm";
import { useAppSelector } from "@redux/index";
import { setMinimize as setMinimizeAction } from "@slice/container/index";
import { PageTypeEnum } from "@type/enum";

import PanelList from "./panelList";

function ActionBar() {
  const [float, setFloat] = useState(false);
  const { match: minDesktop } = useMediaQuery("XLUP");
  const { match: maxDesktop } = useMediaQuery("XXLUP");

  const t = useTranslations();
  const { type, fullScreen, minimize, ShowTags } = useAppSelector((state) => {
    const type = state.withPersist.pages.find((item) => item.isActive)?.type;
    const fullScreen = state.withPersist.config.fullScreen;
    const minimize = state.withoutPersist.container.minimize;
    const ShowTags = state.withPersist.pages.find((item) => item.isActive)
      ?.viewData?.ShowTags;
    return { type, fullScreen, minimize, ShowTags };
  }, shallowEqual);

  const dispatch = useDispatch();

  const renderPanel = (type: number) => {
    switch (type) {
      case PageTypeEnum.Form:
        return <PanelForm />;
      case PageTypeEnum.List:
        return <PanelList />;
      default:
        return <>nothing to show</>;
    }
  };

  const toggleMinimize = (value: boolean) => {
    dispatch(setMinimizeAction(value));
  };

  const minimizeHandler = () => {
    if (!minimize) {
      setFloat(false);
    }
    toggleMinimize(!minimize);
  };

  useEffect(() => {
    if (minDesktop === undefined || maxDesktop === undefined) return;

    const newMinimize = minDesktop && !maxDesktop;
    if (newMinimize !== minimize) {
      dispatch(setMinimizeAction(newMinimize));
    }
    setFloat(false);
  }, [minDesktop, maxDesktop]);

  return (
    <div
      className={` ${
        fullScreen ? "h-full" : "h-[calc(100dvh-65px)]"
      } transition-all duration-200 overflow-hidden ${
        minimize
          ? "!min-w-12 !w-12 items-center "
          : "!min-w-[170px] w-[170px] xxl:!min-w-64 xxl:w-64"
      } px-3 bg-main-white dark:bg-gray-gray13 flex flex-col gap-4 ${
        float ? "absolute  left-3" : ""
      }
        
        `}
    >
      <CustomButton
        shape="circle"
        type="text"
        className={`w-8 ${minimize && "rotate-180"}`}
        onClick={minimizeHandler}
      >
        {
          <MinimizeIcon
            config={{
              width: 24,
              height: 24,
            }}
          />
        }
      </CustomButton>
      <div className={`flex justify-between items-center  relative h-9 `}>
        {!minimize && (
          <>
            <div className="flex gap-2 font-bold text-gray-gray10 dark:text-gray-gray4 text-sm">
              {" "}
              {t("sidebar.actionPanel")}
            </div>
            <div className="top-0 absolute items-center h-full end-0">
              <CustomButton
                type="text"
                shape="circle"
                onClick={() => {
                  setFloat(!float);
                }}
              >
                {float ? <PinIcon /> : <UnPinIcon />}
              </CustomButton>
            </div>
          </>
        )}
      </div>

      {renderPanel(type)}
    </div>
  );
}

export default memo(ActionBar);
