import { useRef } from 'react';

import {
  Dropdown,
  Menu,
} from 'antd';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import {
  LeftChevron,
  RightChevron,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { setLevelFromNavbar } from '@slice/pages';

function Navbar({ active }) {
  const { direction } = useAppSelector(
    (state) => ({
      direction: state.withPersist.config.direction,
    }),
    shallowEqual
  );
  const t = useTranslations();
  const { steps, fullScreen } = useAppSelector(
    (state) => ({
      steps: state.withPersist.pages?.find((item) => item.isActive)?.viewData?.[
        active ? "steps" : "lastSteps"
      ],
      fullScreen: state.withPersist.config.fullScreen,
    }),
    shallowEqual
  );
  const dispatch = useDispatch();
  const scrollRef = useRef(null);

  const handleWheel = (event) => {
    if (scrollRef.current) {
      event.preventDefault();
      scrollRef.current.scrollLeft += event.deltaY;
    }
  };
  const handleLevelItem = (step, item, index) => {
    if (active) {
      dispatch(setLevelFromNavbar({ Level: step.Level, index: index }));
    }
  };

  return (
    <div
      ref={scrollRef}
      onWheel={handleWheel}
      className={`${
        active
          ? fullScreen
            ? "w-[1154px] lg:w-[1250px]"
            : "lg:w-[884px] "
          : fullScreen
          ? "w-[1280px] lg:w-[1378px]"
          : "w-[1012px] lg:w-[1108px]"
      } transition-all duration-500 !h-10 overflow-x-auto  bg-main-white dark:text-white dark:bg-gray-gray10 text-xs text-gray-gray10 flex items-center gap-x-4 m-1 mb-[2px]`}
    >
      {steps?.length > 0 &&
        [...steps]
          // .sort((a, b) => a.Level - b.Level)
          .map((step, index) => {
            const isLastIndex = index === steps.length - 1;
            return (
              <div key={index} className="flex items-center">
                {step.Items.length === 1 ? (
                  <CustomButton
                    onClick={() => handleLevelItem(step, step.Items[0], index)}
                    type="text"
                    className="m-0 px-1 h-6 text-xs"
                  >
                    {t(`report.sidebar.level${step.Level + 1}`)}
                    {" : "}
                    <div className="max-w-40 overflow-hidden text-xs text-ellipsis whitespace-nowrap">
                      {step.Items[0].AccDesc}
                    </div>

                    {!isLastIndex ? (
                      direction == "rtl" ? (
                        <LeftChevron />
                      ) : (
                        <RightChevron />
                      )
                    ) : null}
                  </CustomButton>
                ) : (
                  <>
                    <Dropdown
                      overlay={
                        <Menu>
                          {step.Items.map((item, index) => (
                            <Menu.Item key={item.AccId}>
                              <CustomButton
                                onClick={() =>
                                  handleLevelItem(step, item, index)
                                }
                                className="m-0 px-1 text-xs"
                                type="text"
                              >
                                {direction == "rtl" ? (
                                  <RightChevron />
                                ) : (
                                  <LeftChevron />
                                )}
                                {item.AccCode}
                                {" - "}
                                {item.AccDesc}
                              </CustomButton>
                            </Menu.Item>
                          ))}
                        </Menu>
                      }
                      destroyOnHidden
                      placement={
                        direction == "rtl" ? "bottomRight" : "bottomLeft"
                      }
                      overlayClassName="[&>ul>li]:!px-1 [&>ul>li]:hover:!bg-main-white "
                    >
                      <CustomButton className="m-0 px-1 h-6" type="text">
                        {t(`report.sidebar.level${step.Level + 1}`)}
                        {" : . . ."}
                        {!isLastIndex ? (
                          direction == "rtl" ? (
                            <LeftChevron />
                          ) : (
                            <RightChevron />
                          )
                        ) : null}
                      </CustomButton>
                    </Dropdown>
                  </>
                )}
              </div>
            );
          })}
    </div>
  );
}

export default Navbar;
