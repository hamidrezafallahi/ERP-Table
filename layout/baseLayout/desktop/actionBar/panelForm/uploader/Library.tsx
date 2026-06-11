import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { Empty } from 'antd';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { CustomButton } from '@components/atoms/defaultElements';
import InputText from '@components/atoms/defaultElements/inputText';
import {
  Magnifier,
  RightArrow,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetData } from '@services/base';

import { IconByFileExtension } from './IconByFileExtension';
import { getFileType } from './util';

const Library = ({
  setShowLibrary,
  setModalTitle,
  selectedFromLibrary,
  setSelectedFromLibrary,
}) => {
  const containerRef = useRef(null);
  const activePage = useAppSelector((state) => {
    return state.withPersist.pages?.find((page) => page.isActive);
  });
  const t = useTranslations();
  const [searchCommand, setSearchCommand] = useState("");
  const [libFiles, setLibFiles] = useState([]);
  const [libFilesCount, setLibFilesCount] = useState(0);
  const { direction } = useAppSelector((state) => ({
    direction: state.withPersist.config.direction,
  }));
  const debounceTimeoutRef = useRef(null);
  const [pageNumber, setPageNumber] = useState(1);
  //TODO: add type
  const {
    data: dataLibrary,
    isSuccess: isSuccessLibrary,
    isLoading: isLoadingLibrary,
  } = useGetData<any, any>({
    url: `/api/file/select/file`, 
    body: {
      RepoId: activePage.RepoId,
      PagingInfo: { PageRecordCount: 6, PageNumber: pageNumber },
      SearchCommand: searchCommand.length === 0 ? null : searchCommand,
    },
  });

  const handleDrop = (e) => {
    e.preventDefault();
  };

  const handleToggleFileFromLibrary = (file) => {
    setSelectedFromLibrary((prevFiles) => {
      const fileExists = prevFiles?.some((f) => f.FileId === file.FileId);
      if (fileExists) {
        return prevFiles.filter((f) => f.FileId !== file.FileId);
      } else {
        return [...(prevFiles || []), file];
      }
    });
  };

  const handleAddFromLibrary = () => {
    setShowLibrary(false);
    setModalTitle(t("sidebar.drag"));
  };

  const handleSearchDebounce = (e) => {
    const value = e.target.value;
    clearTimeout(debounceTimeoutRef.current);
    if (value.length === 0) {
      setPageNumber(1);
      setSearchCommand("");
      setLibFiles([]);
    } else if (value.length > 2) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(async () => {
        setLibFiles([]);
        setPageNumber(1);
        setSearchCommand(value);
      }, 1000);
    }
  };
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = containerRef.current.scrollTop;
      const scrollHeight = containerRef.current.scrollHeight;
      const clientHeight = containerRef.current.clientHeight;
      const scrollBottom = scrollHeight - clientHeight - scrollTop;
      if (scrollBottom == 0) {
        let LibFilesCount;
        let LibFiles;
        setLibFilesCount((prevCount) => {
          LibFilesCount = prevCount;
          return LibFilesCount;
        });
        setLibFiles((prevFiles) => {
          LibFiles = prevFiles;
          return LibFiles;
        });
        if (LibFilesCount > libFiles.length + 1) {
          setPageNumber((prevPageNumber) => prevPageNumber + 1);
        }
      }
    };
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [containerRef]);
  useEffect(() => {
    if (dataLibrary?.Data) {
      setLibFiles(libFiles.concat(dataLibrary.Data));
      setLibFilesCount(dataLibrary.TotalCount);
    }
  }, [dataLibrary]);
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
          className="z-50 relative m-0 p-0 w-fit h-7"
          onClick={() => {
            setShowLibrary(false);
            setModalTitle(t("sidebar.drag"));
          }}
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
            prefix={<Magnifier />}
            name="FullSearchPhrase"
            placeholder={t("general.search")}
            allowClear
            className="flex items-center !bg-gray-gray5 dark:bg-gray-gray12rounded w-full text-xs"
            onChange={handleSearchDebounce}
          />
        </div>
        <div
          ref={containerRef}
          className="flex flex-wrap justify-center items-start gap-8 mt-1 py-3 w-full h-[calc(100%-70px)] overflow-y-auto"
        >
          {libFiles && libFiles.length > 0 ? (
            libFiles.map((file, index) => {
              return (
                <LibraryButton
                  file={file}
                  key={index}
                  url={file.Url}
                  selectable
                  isSelected={
                    selectedFromLibrary.filter(
                      (temp) => temp.FileId == file.FileId
                    ).length > 0
                  }
                  Title={file.FileName}
                  onClick={() => handleToggleFileFromLibrary(file)}
                />
              );
            })
          ) : (
            <Empty />
          )}
        </div>
      </div>
      <div className="-bottom-[20px] z-30 relative w-full h-[60px] overflow-hidden">
        <div className="flex justify-end items-center bg-main-white dark:bg-gray-gray12 w-full h-full">
          <CustomButton
            onClick={handleAddFromLibrary}
            type="text"
            className={`text-xs w-[89px] h-9 rounded bg-main-black text-main-white`}
          >
            {t("general.choice")}
          </CustomButton>
        </div>
      </div>
    </>
  );
};
export default Library;

function LibraryButton({
  file = null,
  Title = null,
  Icon = null,
  isSelected = null,
  url = null,
  ...props
}) {
  const { selectable } = props;
  const [selected, setSelected] = useState(isSelected);
  const handelClick = (e) => {
    props.onClick(e);
    setSelected(!selected);
  };
  return (
    <CustomButton
      type="text"   
      className={`flex flex-col  w-48 h-[150px] dark:bg-gray-gray10 bg-gray-gray3 hover:!bg-gray-gray3 dark:hover:bg-darkHover relative rounded overflow-hidden 
            ${
              selectable && selected
                ? "border border-main-black"
                : "border-none"
            }
            `}
      onClick={handelClick}
    >
      <RenderFile file={file} />
      {file.FileName && (
        <div
          className={`text-gray-gray9 dark:text-white overflow-hidden text-xs whitespace-break-spaces
              ${selectable && selected ? "font-semibold" : "font-normal"}
              `}
        >
          {file.FileName}
        </div>
      )}
    </CustomButton>
  );
}

const RenderFile = ({ file }) => {
  const [fileUrl, setFileUrl] = useState("");
  const type = file ? getFileType(file.FileType).split(":")[0] : "unknown";
  useEffect(() => {
    if (file) {
      setFileUrl(file.Url);
    }
  }, [file]);
  console.log(file, type);

  switch (type) {
    case "Image":
      return (
        <Image
          src={file.Url}
          // src="https://picsum.photos/200/300"
          alt="img"
          fill
          style={{
            objectFit: "cover",
            zIndex: 10,
            position: "absolute",
            inset: 0,
          }}
        />
      );
    case "Video":
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
    case "Audio":
      return (
        <>
          <audio
            className="right-[50%] z-10 absolute inset-0 w-5/6 h-10 translate-x-[50%]"
            preload="auto"
            controls
          >
            <source src={fileUrl} type={file.fileType} />
            Your browser does not support the audio element.
          </audio>
        </>
      );

    default:
      return <IconByFileExtension fileName={file.FileName} />;
  }
};
