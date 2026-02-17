import { useEffect, useRef, useState } from "react";

import { Skeleton } from "antd";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { shallowEqual, useDispatch } from "react-redux";

import { CustomButton } from "@components/atoms/defaultElements";
import { useAppSelector } from "@redux/index";
import { useCUDFormDataMutation, useGetData } from "@services/base";
import { setProgressbar } from "@slice/config";
import { showSuccessToast } from "@utils/core";

import RenderAttachmentsRow from "./RenderAttachmentsRow";

const RenderRow = dynamic(() => import("./RenderRow"), {
  loading: () => <Skeleton active className="p-5 w-full h-full" />,
});
const Library = dynamic(() => import("./Library"), {
  loading: () => <Skeleton active className="p-5 w-full h-full" />,
});
const ButtonsRow = dynamic(() => import("./ButtonsRow"), {
  loading: () => <Skeleton active className="p-5 w-full h-full" />,
});
const LinkShared = dynamic(() => import("./LinkShared"), {
  loading: () => <Skeleton active className="p-5 w-full h-full" />,
});
const CaptureByCamera = dynamic(() => import("./captureByCamera"), {
  loading: () => <Skeleton active className="p-5 w-full h-full" />,
});
interface IUpload {
  setModalTitle: any;
  RefId: number;
  RepoId: number;
  counterRefetch?: () => void;
  width?: number;
  height?: number;
  onlyAcceptImage?: boolean;
}

export default function Uploader({
  setModalTitle,
  counterRefetch = null,
  width = 800,
  height = 430,
  RepoId,
  RefId,
  onlyAcceptImage = false,
}: IUpload) {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const modalContainer = useRef(null);
  const t = useTranslations();
  const [selectedForUpload, setSelectedForUpload] = useState([]);
  const [selectedFromLibrary, setSelectedFromLibrary] = useState([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showLinkShared, setShowLinkShared] = useState(false);
  const [showCapture, setShowCapture] = useState(false);
  const [progress, setProgress] = useState(false);
  const [attachmentsData, setAttachmentsData] = useState([]);
  const {
    data: dataStored,
    isSuccess: isSuccessStored,
    refetch: refetchStored,
  } = useGetData<any, any>({
    url: `/api/file/select/file`,
    body: {
      RepoId: RepoId,
      RefId: RefId,
      PagingInfo: {
        PageRecordCount: 10000,
        PageNumber: 1,
        OnlyTotalCount: false,
      },
    },
  });
  const [trigger, { isLoading }] = useCUDFormDataMutation();
  const handleDeleteFile = (file) => {
    setSelectedForUpload((prevState) =>
      prevState.filter((item) => item.name !== file.name)
    );
  };
  const handleDeleteAttachmentsFile = async (file) => {
    const deleteAttachmentsFileResponse = await trigger({
      url: "/api/file/delete/repoFile",
      body: {
        Id: file.RepoFileId,
      },
    }).unwrap();
    if (deleteAttachmentsFileResponse?.Result === "Success") {
      showSuccessToast(t("toast.removed"));
      refetchStored();
      if (counterRefetch) {
        counterRefetch();
      }
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).filter((item: File) =>
      onlyAcceptImage ? item.type.includes("image/") : item
    ) as File[];
    setSelectedForUpload((prevFiles) => {
      const existingFileNames = new Set(prevFiles.map((file) => file.name));
      const newFiles = files.filter(
        (file) => !existingFileNames.has(file.name)
      );
      return [...prevFiles, ...newFiles];
    });
    files.forEach(uploadFile);
  };

  const uploadFile = (file) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    xhr.upload.addEventListener("progress", (event) => {
      if (!progress) {
        setProgress(true);
      }
      const steps = Array.from({ length: 20 }, (_, i) => (i + 1) * 5);
      let lastDispatchedPercent = 0;

      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        for (let step of steps) {
          if (percentComplete >= step && lastDispatchedPercent < step) {
            dispatch(
              setProgressbar({ id: file.name, percent: percentComplete })
            );
            lastDispatchedPercent = step;
            break;
          }
        }
      }
      if (event.loaded == event.total) {
        setProgress(false);
      }
    });

    xhr.open("POST", "/upload", true);
    xhr.send(formData);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter((item: File) =>
      onlyAcceptImage ? item.type.includes("image/") : item
    ) as File[];
    setSelectedForUpload((prevFiles) => {
      const existingFileNames = new Set(prevFiles.map((file) => file.name));
      const newFiles = droppedFiles.filter(
        (file) => !existingFileNames.has(file.name)
      );
      return [...prevFiles, ...newFiles];
    });
    droppedFiles.forEach(uploadFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  }, shallowEqual);

  const handleUploading = async () => {
    const uploadFormData = new FormData();
    uploadFormData.append("ReferId", `${RefId}`);
    uploadFormData.append("RepoId", `${RepoId}`);
    uploadFormData.append("StorageBucket", "com");
    uploadFormData.append("IsFromConsumer", "false");
    uploadFormData.append("ReturnStaticUrl", "true");
    uploadFormData.append("ReturnInsertedRow", "true");
    uploadFormData.append("FileType", "1");
    selectedForUpload.forEach((element) => {
      uploadFormData.append("Files", element);
    });
    selectedFromLibrary.forEach((element) => {
      uploadFormData.append("FileIds", element.FileId);
    });
    const uploadResponse: any = await trigger({
      url: "/api/file/insert/file",
      body: uploadFormData,
    });

    if (uploadResponse.data?.Result === "Success") {
      showSuccessToast(t("toast.save"));
      setSelectedForUpload([]);
      setSelectedFromLibrary([]);
      refetchStored();
      if (counterRefetch) {
        counterRefetch();
      }
    }
  };
  if (selectedForUpload.length === 0 && fileInputRef.current) {
    fileInputRef.current.value = "";
  }
  useEffect(() => {
    if (isSuccessStored) {
      setAttachmentsData(dataStored.Data);
    }
  }, [dataStored]);
  return (
    <>
      <div
        ref={modalContainer}
        className={`relative ${
          !match && " !w-full !h-[85%]"
        } md:px-8 px-0 py-3  !bg-gray-gray05  dark:!bg-gray-gray12`}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {!showCapture && !showLinkShared && !showLibrary && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className={`  w-full h-full  overflow-auto flex flex-col justify-center items-center ${
              selectedForUpload?.length === 0 &&
              attachmentsData?.length === 0 &&
              "border border-dashed"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept={onlyAcceptImage ? "image/*" : ""}
            />
            <ButtonsRow
              fileInputRef={fileInputRef}
              selectedForUpload={selectedForUpload}
              setShowLibrary={setShowLibrary}
              setShowLinkShared={setShowLinkShared}
              setShowCapture={setShowCapture}
              setModalTitle={setModalTitle}
              selectedFromLibrary={selectedFromLibrary}
              onlyAcceptImage={onlyAcceptImage}
            />
            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              className="w-full overflow-y-auto"
            >
              {attachmentsData?.length > 0 &&
                attachmentsData.map((file, index) => (
                  <RenderAttachmentsRow
                    key={index}
                    file={file}
                    handleDeleteAttachmentsFile={handleDeleteAttachmentsFile}
                    isLast={index === attachmentsData?.length - 1}
                    isFirst={index === 0}
                  />
                ))}
              {selectedForUpload.length > 0 &&
                selectedForUpload.map((file, index) => (
                  <RenderRow
                    key={index}
                    file={file}
                    handleDeleteFile={handleDeleteFile}
                    isFirst={index === 0 && attachmentsData?.length === 0}
                    isLast={index === selectedForUpload?.length - 1}
                  />
                ))}
            </div>
          </div>
        )}
        {showLibrary && (
          <Library
            setShowLibrary={setShowLibrary}
            setModalTitle={setModalTitle}
            selectedFromLibrary={selectedFromLibrary}
            setSelectedFromLibrary={setSelectedFromLibrary}
          />
        )}
        {showLinkShared && (
          <LinkShared
            setShowLinkShared={setShowLinkShared}
            setModalTitle={setModalTitle}
            setSelectedForUpload={setSelectedForUpload}
          />
        )}
        {showCapture && (
          <CaptureByCamera
            setShowCapture={setShowCapture}
            setModalTitle={setModalTitle}
            setSelectedForUpload={setSelectedForUpload}
            setProgress={setProgress}
            onlyAcceptImage={onlyAcceptImage}
          />
        )}
      </div>
      <div className="flex justify-end items-center px-8 py-4 border-t w-full">
        <CustomButton
          loading={isLoading}
          onClick={handleUploading}
          type="text"
          disabled={
            (selectedForUpload.length === 0 &&
              selectedFromLibrary.length === 0) ||
            (selectedForUpload.length !== 0 && progress)
          }
          className={`text-xs w-[89px] h-9 rounded  dark:!bg-white dark:!text-main-black 
               ${
                 (selectedForUpload.length === 0 &&
                   selectedFromLibrary.length === 0) ||
                 (selectedForUpload.length !== 0 && progress)
                   ? "bg-gray-gray3 text-gray-gray8"
                   : "bg-main-black text-main-white"
               }
            `}
        >
          {t("general.send")}
        </CustomButton>
      </div>
    </>
  );
}
