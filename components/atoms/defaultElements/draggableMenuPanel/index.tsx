"use client";

import React, { Dispatch, SetStateAction, useEffect, useRef } from "react";

import { useTranslations } from "next-intl";

import {
  ActionPanelIcon,
  DragIcon,
  ListOrdered,
  PanelChangePositionIcon,
  PanelMinimizeIcon,
} from "@components/atoms/iconComponents";

interface Props {
  initialPosition: { x: number; y: number };
  children: React.ReactNode;
  isDragged: boolean;
  setIsDragged: (value: boolean) => void;
  handleShowMenu: () => void;
  minimize?: boolean;
  setMinimize?: Dispatch<SetStateAction<boolean>>;
  setShowMenu: (value: boolean) => void;
  showMenu?: boolean;
  disableDragging: boolean;
}

const DraggableMenuPanel: React.FC<Props> = ({
  initialPosition,
  children,
  isDragged,
  setIsDragged,
  handleShowMenu,
  minimize = false,
  setMinimize,
  setShowMenu,
  disableDragging = false,
}) => {
  const t = useTranslations();
  const isDraggingRef = useRef(false);
  const positionRef = useRef(initialPosition);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const panelWidth = minimize ? 80 : 300;
        const panelHeight = panelRef.current?.clientHeight || 200;

        const maxX = document.documentElement.clientWidth - panelWidth;
        const maxY = document.documentElement.clientHeight - panelHeight;

        const newX = Math.min(Math.max(e.clientX - 50, 0), maxX);
        const newY = Math.min(Math.max(e.clientY - 20, 0), maxY);

        positionRef.current = { x: newX, y: newY };
        if (panelRef.current) {
          panelRef.current.style.left = `${newX}px`;
          panelRef.current.style.top = `${newY}px`;
        }

        setIsDragged(true);
        setShowMenu(true);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [minimize, setIsDragged, setShowMenu]);

  const handleMouseDown = () => {
    isDraggingRef.current = true;
  };

  const resetPosition = () => {
    positionRef.current = initialPosition;
    if (panelRef.current) {
      panelRef.current.style.left = `${initialPosition.x}px`;
      panelRef.current.style.top = `${initialPosition.y}px`;
    }
    setIsDragged(false);
    setMinimize?.(false);
    handleShowMenu();
    setShowMenu(false);
  };

  return (
    <section
      ref={panelRef}
      className={`${
        isDragged
          ? `fixed z-10 !bg-white shadow-lg p-4 rounded dark:!bg-black-black5 ${
              minimize ? "w-[80px]" : "w-[300px]"
            }`
          : "relative"
      }`}
      style={
        isDragged
          ? {
              top: positionRef.current.y,
              left: positionRef.current.x,
              transition: "none",
            }
          : { transition: "0.3s ease" }
      }
    >
      <div
        className={` ${
          isDragged
            ? `flex ${
                minimize
                  ? "flex-col"
                  : "justify-between items-center gap-2 py-3 px-2 bg-white rounded text-gray-gray9 dark:!bg-black-black5 dark:text-white"
              }`
            : "items-center gap-y-4 grid bg-main-white  dark:!bg-gray-gray13  py-2  pl-2 pr-1  text-sm cursor-pointer"
        }`}
      >
        {isDragged ? (
          <button
            title={t(
              "general.fromThisSectionYouCanDragAndMoveTheOperationsPanel"
            )}
            className="w-10 text-sm text-center text-ellipsis text-nowrap cursor-pointer"
            onMouseDown={handleMouseDown}
          >
            {!minimize && t("sidebar.filterPanel")}
          </button>
        ) : (
          <div
            className="flex items-center gap-2"
            onMouseEnter={handleShowMenu}
          >
            <ListOrdered />
            {t("sidebar.showMenu")}
          </div>
        )}

        <div
          className={`${
            isDragged
              ? `flex ${
                  minimize
                    ? "flex-col gap-10 items-center mb-12"
                    : "items-center gap-2"
                }`
              : "flex justify-between  items-center gap-2 !bg-white dark:!bg-gray-gray13 dark:text-white shadow-2xl px-0 rounded text-gray-gray9"
          }`}
        >
          {isDragged ? (
            <>
              <button
                onMouseDown={handleMouseDown}
                title={t(
                  "general.fromThisSectionYouCanDragAndMoveTheOperationsPanel"
                )}
                className={`${!minimize && "hidden"} cursor-grab`}
              >
                <DragIcon
                  config={{
                    width: 28,
                    height: 28,
                  }}
                />
              </button>
              <button
                onClick={() => setMinimize?.((prev) => !prev)}
                className="cursor-pointer"
                title={
                  minimize ? t("general.toBeOpen") : t("general.toBeClosed")
                }
              >
                {minimize ? (
                  <PanelMinimizeIcon
                    config={{
                      width: 28,
                      height: 28,
                    }}
                  />
                ) : (
                  <div className="rotate-180">
                    <PanelMinimizeIcon />
                  </div>
                )}
              </button>
              <button
                className="cursor-pointer"
                onClick={resetPosition}
                title={t("general.returnToTheOriginalPlace")}
              >
                {minimize ? (
                  <PanelChangePositionIcon
                    config={{
                      width: 28,
                      height: 28,
                    }}
                  />
                ) : (
                  <PanelChangePositionIcon
                    config={{
                      width: 19,
                      height: 19,
                    }}
                  />
                )}
              </button>
            </>
          ) : (
            <div className="flex justify-between w-full">
              {!disableDragging && (
                <>
                  <div className="flex justify-start items-center gap-2">
                    <ActionPanelIcon
                      config={{
                        width: 17,
                        height: 17,
                      }}
                    />
                    {t("sidebar.filterPanel")}
                  </div>

                  <div
                    onMouseDown={handleMouseDown}
                    className="cursor-grab"
                    title={t("general.drag")}
                  >
                    <DragIcon
                      config={{
                        width: 18,
                        height: 18,
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <div>{children}</div>
    </section>
  );
};

export default DraggableMenuPanel;
