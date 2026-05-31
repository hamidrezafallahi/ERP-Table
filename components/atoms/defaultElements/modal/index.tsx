import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Divider,
  Modal,
} from 'antd';
import type {
  DraggableData,
  DraggableEvent,
} from 'react-draggable';
import Draggable from 'react-draggable';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CloseModalIcon,
  Expand,
  MenuArrowBack,
  Shrink,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { setModalIsFullScreen } from '@slice/config';

import { CustomButton } from '../button';
import type { IProps } from './type';

export const CustomModal = ({
  headerIcon,
  headerName,
  headerDescription,
  disableTitle = false,
  contentClassName,
  withFullscreen = false,
  isModalOpen,
  closeModal,
  content,
  title,
  ...rest
}: IProps) => {
  const dispatch = useDispatch();
  const getModalContainer = () => document.getElementById("docBody");
  const [disabled, setDisabled] = useState(true);

  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const draggleRef = useRef<HTMLDivElement>(null!);

  const onStart = (_event: DraggableEvent, uiData: DraggableData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) {
      return;
    }
    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

  const { lang, modalIsFullScreen, match } = useAppSelector(
    (state) => ({
      lang: state.withPersist.config.lang,
      modalIsFullScreen: state.withPersist.config.modalIsFullscreen,
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual,
  );

  useEffect(() => {
    if (modalIsFullScreen) {
      dispatch(setModalIsFullScreen({ fullScreen: false }));
    }
  }, [isModalOpen]);

  return (
    <Modal
      modalRender={(modal) => (
        <Draggable
          disabled={disabled}
          bounds={bounds}
          nodeRef={draggleRef}
          onStart={(event, uiData) => onStart(event, uiData)}
        >
          <div ref={draggleRef}>{modal}</div>
        </Draggable>
      )}
      zIndex={1002}
      {...rest}
      closeIcon={false}
      getContainer={(!match || modalIsFullScreen) && getModalContainer}
      title={
        disableTitle ? null : (
          <div
            style={{ width: "100%", cursor: "move" }}
            onMouseOver={() => {
              if (disabled) {
                setDisabled(false);
              }
            }}
            onMouseOut={() => {
              setDisabled(true);
            }}
            onFocus={() => {}}
            onBlur={() => {}}
            className={`flex ps-4 pe-2 py-4 items-center rounded-lg bg-gray-gray1 ${
              !match ? "justify-start" : "justify-between"
            }`}
          >
            <div className="flex justify-center items-center gap-2">
              {!match && (
                <CustomButton
                  className={`${lang !== "fa" ? "rotate-180" : ""} m-0 p-0`}
                  type="link"
                  onClick={closeModal}
                >
                  <MenuArrowBack
                    config={{ width: 24, height: 24, stroke: "#585858" }}
                  />
                </CustomButton>
              )}

              {title ? (
                title
              ) : (
                <div className="flex flex-col justify-between gap-1">
                  {(headerIcon || headerName) && (
                    <div className="flex items-center gap-2">
                      {headerIcon}
                      {headerName && (
                        <span className="font-bold text-gray-gray10 dark:text-white lg:text-lg">
                          {headerName}
                        </span>
                      )}
                    </div>
                  )}
                  {headerDescription && (
                    <div className="flex gap-2">
                      {/* {headerIcon} */}
                      <span className="font-light text-gray-gray85 text-sm">
                        {headerDescription}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {match && (
              <div className="flex gap-2">
                {withFullscreen && (
                  <CustomButton
                    className="hover:!bg-transparent px-0"
                    type="text"
                    onClick={() => {
                      dispatch(
                        setModalIsFullScreen({
                          fullScreen: !modalIsFullScreen,
                        }),
                      );
                    }}
                  >
                    {modalIsFullScreen ? <Shrink /> : <Expand />}
                  </CustomButton>
                )}
                <CustomButton
                  className="hover:!bg-transparent px-0"
                  type="text"
                  onClick={closeModal}
                >
                  <CloseModalIcon config={{ stroke: "#585858" }} />
                </CustomButton>
              </div>
            )}
          </div>
        )
      }
      open={isModalOpen}
      footer={null}
      destroyOnHidden
      onCancel={closeModal}
      wrapClassName={`${(!match || modalIsFullScreen) && "full-screen-modal"}`}
      classNames={{
        content: "overflow-x-hidden overflow-y-hidden",
        header: "h-auto !bg-[#FBFBFB]",
      }}
    >
      <Divider className="hidden lg:block !m-0 border-gray-gray6 border-t-[0.063rem] h-0" />
      <div
        className={`
          ${
            !match || modalIsFullScreen
              ? "!h-[calc(100dvh-64px)]"
              : "max-h-[80dvh]"
          }
           ${contentClassName} hidden-show-scrollBar overflow-y-auto`}
      >
        {content}
      </div>
    </Modal>
  );
};
