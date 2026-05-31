import {
  useEffect,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useDispatch } from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import InputText from '@components/atoms/defaultElements/inputText';
import {
  ArrowCircleUpLeft,
  CloseCircle,
  Monitor,
  RightArrow,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { setProgressbar } from '@slice/config';
import { showErrorToast } from '@utils/toast';

import Loader from './Loader';
import { typeByExtension } from './util';

const LinkShared = ({
  setShowLinkShared,
  setModalTitle,
  setSelectedForUpload,
}) => {
  const t = useTranslations();
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");
  const [fileName, setFileName] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadedFiles, setDownloadedFile] = useState([]);
  const { direction } = useAppSelector((state) => ({
    direction: state.withPersist.config.direction,
  }));
  const handleSearchText = (e) => {
    setSearchText(e.target.value);
  };
  const handleDrop = (e) => {
    e.preventDefault();
  };
  const downloadHandler = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(searchText, {
        method: "GET",
        // headers: {
        //   "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        //   "Content-Type": "application/octet-stream",
        // },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentLength = response.headers.get("Content-Length");
      const reader = response.body.getReader();
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;

      const chunks = [];
      const steps = Array.from({ length: 20 }, (_, i) => (i + 1) * 5);
      let lastDispatchedPercent = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        chunks.push(value);
        loaded += value.length;
        const percentComplete = (loaded / total) * 100;
        const urlParts = searchText.split("/");
        if (urlParts.length > 0) {
          let lastPart = urlParts[urlParts.length - 1];
          if (lastPart) {
            setFileName(decodeURIComponent(lastPart));
            for (let step of steps) {
              if (percentComplete >= step && lastDispatchedPercent < step) {
                dispatch(
                  setProgressbar({
                    id: decodeURIComponent(lastPart),
                    percent: percentComplete,
                  })
                );
                lastDispatchedPercent = step;
                break;
              }
            }
          }
          const blob = new Blob(chunks);
          const file = new File([blob], decodeURIComponent(lastPart), {
            type: blob.type,
          });
          setDownloadedFile((prevFiles) => {
            const fileExists = prevFiles.some(
              (prevFile) => prevFile.name === file.name
            );
            if (!fileExists) {
              return [...prevFiles, file];
            }
            return prevFiles;
          });
        }
      }
      const blob = new Blob(chunks);
      const file = new File([blob], fileName, { type: blob.type });
      setDownloadedFile((prevFiles) => [...prevFiles, file]);
    } catch (error) {
      showErrorToast(error.message, t("general.fail"));
      setIsDownloading(false);
    }
  };
  const handleClearField = () => {
    setSearchText("");
    setIsDownloading(false);
  };
  const handleAddFilesFromDownload = () => {
    if (downloadedFiles && downloadedFiles.length > 0) {
      setSelectedForUpload((prevFiles) => {
        return [...prevFiles, ...downloadedFiles];
      });
      downloadedFiles.forEach((element) => {
        dispatch(setProgressbar({ id: element.name, percent: 100 }));
      });
    }
    handleCloseLinkShared();
  };

  const handleCloseLinkShared = () => {
    setShowLinkShared(false);
    setModalTitle(t("sidebar.drag"));
  };
  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onDrop={handleDrop}
        className={`relative h-full bg-main-white dark:bg-gray-gray12 transition-all duration-100 overflow-hidden`}
      >
        <CustomButton
          type="text"
          ghost
          className="z-50 relative m-0 p-0 w-fit h-7"
          onClick={handleCloseLinkShared}
        >
          {direction == "rtl" ? (
            <RightArrow />
          ) : (
            <span className="rotate-180">
              <RightArrow />
            </span>
          )}
          {t("sidebar.backToUpload")}
        </CustomButton>
        <div>
          <InputText
            onPressEnter={downloadHandler}
            suffix={
              <>
                {searchText.length !== 0 && (
                  <CustomButton
                    disabled={searchText.length == 0}
                    type="text"
                    ghost
                    className="opacity-0 hover:opacity-100 m-0 p-0"
                    onClick={handleClearField}
                  >
                    <CloseCircle />
                  </CustomButton>
                )}
                <CustomButton
                  disabled={searchText.length < 4}
                  type="text"
                  ghost
                  className="m-0 p-0"
                  onClick={downloadHandler}
                >
                  {!isDownloading ? (
                    <ArrowCircleUpLeft />
                  ) : (
                    <Loader id={fileName} />
                  )}
                </CustomButton>
              </>
            }
            value={searchText}
            placeholder={t("sidebar.attachmentLinkShared")}
            className="flex items-center !bg-gray-gray5 dark:bg-gray-gray10 rounded w-full text-xs"
            onChange={handleSearchText}
          />
        </div>
        <div className="flex flex-wrap gap-8 py-3 w-full h-[calc(100%-70px)] overflow-y-auto">
          {downloadedFiles.length > 0 &&
            downloadedFiles.map((file, index) => (
              <div
                className={`flex flex-col justify-center items-center  w-48 h-[150px] bg-gray-gray3 hover:!bg-gray-gray3 dark:hover:bg-darkHover relative rounded overflow-hidden dark:bg-gray-gray10`}
                key={index}
              >
                <RenderFile file={file} />
              </div>
            ))}
        </div>
      </div>
      <div className="-bottom-[18px] z-30 relative bg-main-white dark:bg-gray-gray12 w-full h-[60px] overflow-hidden">
        <div className="flex justify-end items-center w-full h-full">
          <CustomButton
            onClick={handleAddFilesFromDownload}
            type="text"
            disabled={downloadedFiles.length === 0}
            className={`text-xs w-[89px] h-9 rounded ${
              downloadedFiles.length !== 0 &&
              "bg-main-black dark:bg-white dark:text-main-black text-main-white"
            } `}
          >
            {t("general.choice")}
          </CustomButton>
        </div>
      </div>
    </>
  );
};

export default LinkShared;

const RenderFile = ({ file }) => {
  console.log(file);
  const [fileUrl, setFileUrl] = useState("");
  const type = typeByExtension(file.name);
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);
  switch (type) {
    case "image":
      return (
        <Image
          src={fileUrl}
          alt="img"
          className="z-10 absolute inset-0 w-full h-full"
        />
      );
    case "video":
      return (
        <>
          <video
            preload="auto"
            className="z-10 absolute inset-0 w-full h-full"
            controls
          >
            <source src={fileUrl} type={file.fileType} />
            Your browser does not support the video tag.
          </video>
        </>
      );
    case "audio":
      return (
        <>
          <audio
            className="right-[50%] z-10 absolute inset-0 w-5/6 h-10 translate-x-[50%]"
            controls
          >
            <source src={fileUrl} type={file.fileType} />
            Your browser does not support the audio element.
          </audio>
        </>
      );

    default:
      return <Monitor config={{ width: 21, height: 20 }} />;
  }
};
