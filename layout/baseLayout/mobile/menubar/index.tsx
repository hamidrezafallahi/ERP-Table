import { cloneElement } from 'react';

import {
  Radio,
  RadioChangeEvent,
} from 'antd';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomBadge } from '@components/atoms/defaultElements';
import {
  Layers,
  ListCheck,
  MenuIcon,
  New,
  User,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { setMenuBar } from '@slice/config';

export default function Menubar() {
  const dispatch = useDispatch();
  const t = useTranslations();

  const { menuBar, pageLength } = useAppSelector((state) => {
    const menuBar = state.withPersist.config.menuBar;
    const pageLength = state.withPersist.pages?.length;

    return { menuBar, pageLength };
  }, shallowEqual);

  const radioButtons = [
    {
      value: 1,
      icon: (
        <MenuIcon
          config={{ stroke: ` ${menuBar.value === 1 ? "#0e0e0e" : "#939393"}` }}
        />
      ),
      label: t("sidebar.menu"),
    },
    {
      value: 2,
      icon: (
        <New
          config={{ stroke: ` ${menuBar.value === 2 ? "#0e0e0e" : "#939393"}` }}
        />
      ),
      label: t("general.new"),
    },
    {
      value: 3,
      icon: (
        <span className="relative">
          {pageLength > 0 && (
            <CustomBadge
              count={pageLength}
              color="#000"
              size="default"
              className={`rtl:-right-1  left-1 absolute top-0 `}
            />
          )}

          <Layers
            config={{
              stroke: ` ${menuBar.value === 3 ? "#0e0e0e" : "#939393"}`,
            }}
          />
        </span>
      ),
      label: t("sidebar.openPages"),
    },
    {
      value: 4,
      icon: (
        <ListCheck
          config={{ stroke: ` ${menuBar.value === 4 ? "#0e0e0e" : "#939393"}` }}
        />
      ),
      label: t("title.imposingDuties"),
    },
    {
      value: 5,
      icon: (
        <User
          config={{ stroke: ` ${menuBar.value === 5 ? "#0e0e0e" : "#939393"}` }}
        />
      ),
      label: t("general.account"),
    },
  ];
  const setMenuSide = (event: RadioChangeEvent) => {
    const selectedValue = event.target.value;
    const selectedButton = radioButtons.find(
      (button) => button.value === selectedValue
    );

    if (selectedButton) {
      if (selectedButton.value === menuBar.value) {
        dispatch(
          setMenuBar({
            menuBar: { label: null, value: null },
          })
        );
      } else {
        dispatch(
          setMenuBar({
            menuBar: {
              label: selectedButton.label,
              value: selectedButton.value,
            },
          })
        );
      }
    }
  };

  return (
    <div className="bottom-0 z-20 fixed flex justify-evenly items-center bg-white shadow-2xl pt-2 border-t rounded-t-xl w-full h-[71px]">
      <Radio.Group
        value={menuBar}
        onChange={(event) => {
          setMenuSide(event);
        }}
        className="flex justify-around items-start shadow-sm pt-1 w-full h-[71px]"
      >
        {radioButtons.map((button) => (
          <Radio.Button
            key={button.value}
            className="flex justify-center items-center !p-0 !border-none rounded w-[52px] h-[54px] text-lg text-center"
            value={button.value}
          >
            <div
              className={`flex  items-end justify-center transition-all duration-500`}
            >
              {cloneElement(button.icon, {})}
            </div>
            <div className="pt-1 text-[9px] leading-tight whitespace-nowrap">
              {button.label}
            </div>
          </Radio.Button>
        ))}
      </Radio.Group>
    </div>
  );
}
