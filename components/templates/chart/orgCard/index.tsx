import { useEffect, useRef, useState } from "react";

import { Avatar, Image } from "antd";
import { shallowEqual } from "react-redux";

import {
  CircleConnectionIcon,
  CircleEditIcon,
  CloseCircle,
  ProfileIcon,
} from "@components/atoms/iconComponents";
import { useDarkMode } from "@hooks/custom";
import { useAppSelector } from "@redux/index";
import { useCUDDataMutation, useGetData } from "@services/base";

import { IOrganization, IProps, IRequest } from "../type";
import AddChild from "./AddChild";
import DeleteChildren from "./deleteChildren";
import ImagesChildren from "./imagesChildren";
import UpdateChildren from "./updateChildren";

interface IImageLoader {
  item: string;
  index?: number;
  width?: number;
  height?: number;
}

export default function OrgCard({ ...props }: IProps) {
  const { mode = "light" } = useDarkMode();

  const { nodeData } = props;

  const { refetch } = useGetData<IOrganization[], IRequest>({
    url: "api/hr/select/organizationChart",
    body: { RepoViewId: 9002 },
  });
  const { name, images } = nodeData;
  const [openModalAddItem, setOpenModalAddItem] = useState(false);
  const [openModalDeleteItem, setOpenModalDeleteItem] = useState(false);
  const [openModalUpdateItem, setOpenModalUpdateItem] = useState(false);
  const [openModalImagesItem, setOpenModalImagesItem] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const { lang } = useAppSelector((state) => {
    const lang = state.withPersist.config.lang;
    return { lang };
  }, shallowEqual);
  const [fetchApi] = useCUDDataMutation();

  const toggleActionButtons = () => {
    setShowButtons((prev) => !prev);
  };
  const { direction } = useAppSelector((state) => state.withPersist.config);
  const cardRef = useRef<HTMLDivElement>(null);
  const isRoot = nodeData.realId === 1;

  useEffect(() => {
    if (isRoot && cardRef.current) {
      const el = cardRef.current;

      const preventDrag = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
      };

      el.addEventListener("dragstart", preventDrag);

      return () => {
        el.removeEventListener("dragstart", preventDrag);
      };
    }
  }, [isRoot]);
  useEffect(() => {
    if (isRoot) {
      const el = document.getElementById(nodeData.id);
      if (el) {
        el.setAttribute("draggable", "false");

        el.querySelectorAll("*").forEach((child) =>
          child.setAttribute("draggable", "false")
        );
      }
    }
  }, []);

  return (
    <div
      id={nodeData.id}
      ref={cardRef}
      className="relative"
      dir={lang === "fa" ? "rtl" : "ltr"}
      draggable
      onDragStart={(e) => {
        if (isRoot) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }

        e.dataTransfer.setData("application/node-id", nodeData.id);
      }}
      onDrop={(e) => {
        const sourceId = e.dataTransfer.getData("application/node-id");
        if (!sourceId || sourceId === nodeData.id) return;

        window.dispatchEvent(
          new CustomEvent("orgchart-drop", {
            detail: {
              sourceId,
              targetId: nodeData.id,
            },
          })
        );
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      {showButtons && (
        <div className="top-0 -right-8 absolute flex flex-col gap-1">
          <button
            aria-label="ویرایش"
            tabIndex={0}
            className="cursor-pointer"
            onClick={() => setOpenModalUpdateItem(true)}
          >
            <CircleEditIcon
              config={{
                width: 24,
                height: 24,
              }}
            />
          </button>
          <button
            className="cursor-pointer"
            onClick={() => setOpenModalAddItem(true)}
          >
            <CircleConnectionIcon
              config={{
                width: 24,
                height: 24,
              }}
            />
          </button>
          <button
            className="cursor-pointer"
            onClick={() => setOpenModalDeleteItem(true)}
          >
            <CloseCircle
              config={{
                width: 24,
                height: 24,
              }}
            />
          </button>
        </div>
      )}

      <div
        onClick={toggleActionButtons}
        className={`flex flex-col justify-between bg-white dark:bg-gray-gray12   p-2 border border-gray-gray85 rounded-lg !min-w-[217px] max-w-[217px] h-20 !overflow-hidden cursor-pointer ${
          showButtons &&
          " border-black-black6 dark:border-gray-gray95 border-4 dark:bg-black-black6"
        }`}
      >
        <div className="flex justify-between">
          <div className="flex justify-between items-start gap-3">
            <div className="relative w-11">
              {images?.length === 0 ? (
                <div className="top-0 right-0 absolute">
                  <ProfileIcon
                    config={{
                      width: 33,
                      height: 33,
                    }}
                  />
                </div>
              ) : (
                <>
                  <Avatar.Group
                    size="large"
                    max={{
                      popover: { style: { display: "none" } },
                    }}
                  >
                    {images?.map((item, index) => {
                      const dir = direction == "rtl" ? 1 : -1;
                      const offset = Number(index) * 24 * dir;
                      if (index > 1) {
                        return null;
                      }
                      return (
                        <Avatar
                          key={index}
                          style={{
                            transform: `translateX(${offset}px)`,
                            backgroundColor: mode == "dark" && "#767676",
                            borderColor: mode == "dark" && "#b1b1b1",
                          }}
                          src={<ImageLoader item={item} index={index} />}
                        />
                      );
                    })}

                    {images?.length > 2 && (
                      <Avatar
                        onClick={() => setOpenModalImagesItem(true)}
                        className={`top-1  absolute flex justify-center items-center bg-gray-gray3 dark:bg-gray-gray9    black mx-auto border border-gray-500  dark:border-gray-gray7   rounded-full w-8 h-8 text-gray-gray8  dark:text-white text-xs text-center ${
                          direction === "rtl" ? "-left-2" : "-right-2"
                        }`}
                      >
                        {images?.length - 2} +
                      </Avatar>
                    )}
                  </Avatar.Group>
                </>
              )}
            </div>
            <div className="py-1 max-w-36 h-14 overflow-hidden">
              <p className="text-main-black dark:text-white text-xs text-ellipsis leading-[17px]">
                {nodeData.name}
              </p>
            </div>
          </div>
        </div>
      </div>
      <DeleteChildren
        data={{ name, id: nodeData.realId }}
        refetchChart={refetch}
        fetchApi={fetchApi}
        openModalDeleteItem={openModalDeleteItem}
        setOpenModalDeleteItem={setOpenModalDeleteItem}
      />
      <UpdateChildren
        data={{ name, id: nodeData.realId, images }}
        refetchChart={refetch}
        fetchApi={fetchApi}
        setOpenModalUpdateItem={setOpenModalUpdateItem}
        openModalUpdateItem={openModalUpdateItem}
      />
      <AddChild
        data={{ name, id: nodeData.realId, images }}
        refetchChart={refetch}
        fetchApi={fetchApi}
        openModalAddItem={openModalAddItem}
        setOpenModalAddItem={setOpenModalAddItem}
      />
      <ImagesChildren
        refetchChart={refetch}
        data={{ name, id: nodeData.realId, images }}
        fetchApi={fetchApi}
        openModalImagesItem={openModalImagesItem}
        setOpenModalImagesItem={setOpenModalImagesItem}
      />
    </div>
  );
}

export const ImageLoader = ({ ...props }: IImageLoader) => {
  const [errorLoading, setErrorLoading] = useState(false);
  const { index = 0, item, width = 32, height = 32 } = props;
  const imgBugHandler = () => {
    setErrorLoading(true);
  };
  return (
    <>
      {errorLoading ? (
        <div className="bg-gray-100 rounded-full dark:text-gray-gray95">
          <ProfileIcon config={{ width, height }} />
        </div>
      ) : (
        <Image
          preview={false}
          alt={`image-${index}`}
          src={item}
          width={width}
          height={height}
          className="rounded-full"
          onError={imgBugHandler}
        />
      )}
    </>
  );
};
