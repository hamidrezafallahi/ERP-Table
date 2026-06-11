import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { CustomButton } from '@components/atoms/defaultElements';
import {
  Camera,
  FolderOpen,
  LinkHorizontal,
  Monitor,
} from '@components/atoms/iconComponents';

const ButtonsRow = ({
  fileInputRef,
  selectedForUpload,
  setShowLibrary,
  setShowLinkShared,
  setShowCapture,
  setModalTitle,
  selectedFromLibrary,
  onlyAcceptImage,
}) => {
  const t = useTranslations();
  const captureInput = useRef(null);

  const handleSelectFile = (e) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };
  const handleShowLibrary = (e) => {
    e.stopPropagation();
    setModalTitle(t("sidebar.attachmentLibrary"));
    setShowLibrary(true);
  };
  const handleShowLinkShared = (e) => {
    e.stopPropagation();
    setShowLinkShared(true);
    setModalTitle("");
  };
  const handleUseCamera = (e) => {
    e.stopPropagation();
    setShowCapture(true);
    setModalTitle("");
  };
  return (
    <div
      className={`w-full md:flex-wrap   flex justify-center items-center md:gap-x-8  pb-3 `}
    >
      <TemplateButton
        Icon={<Monitor config={{ width: 21, height: 20 }} />}
        Title={t("general.myDevice")}
        onClick={handleSelectFile}
      />
      <TemplateButton
        Icon={<FolderOpen />}
        Title={t("general.library")}
        badge={
          (selectedFromLibrary?.length ?? 0) > 0
            ? selectedFromLibrary.length
            : false
        }
        onClick={handleShowLibrary}
      />
      <TemplateButton
        Icon={<LinkHorizontal />}
        Title={t("general.link")}
        onClick={handleShowLinkShared}
      />
      <TemplateButton
        Icon={<Camera />}
        Title={t("general.camera")}
        onClick={handleUseCamera}
      />
    </div>
  );
};
export default ButtonsRow;

function TemplateButton({
  file = null,
  Title = null,
  Icon = null,
  isSelected = null,
  badge = null,
  url = null,
  ...props
}) {
  const [imageUrl, setImageUrl] = useState("");

  const { selectable } = props;
  const [selected, setSelected] = useState(isSelected);
  const handelClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    props.onClick(e);
    setSelected(!selected);
  };
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);
  return (
    <div className="relative">
      {badge && (
        <span
          className={`top-0  rtl:right-0 left-0  z-10 absolute flex justify-center items-center bg-main-black rounded-full w-5 h-5 text-main-white`}
        >
          {badge}
        </span>
      )}
      <CustomButton
        type="text"       
        className="flex flex-col hover:!bg-transparent !p-1 w-fit h-20"
        onClick={handelClick}
      >
        <span
          className={`bg-gray-gray3 dark:bg-gray-gray10 hover:!bg-gray-gray3  dark:hover:!bg-darkHover p-3 flex justify-center items-center rounded w-11 h-11 relative overflow-hidden
                ${
                  selectable && selected
                    ? "border border-main-black"
                    : "border-none"
                }
                `}
        >
          {Icon}
          {url && (
            <Image
              src={url}
              alt=""
              fill
              className="z-10 bg-main-black object-cover text-main-white"
            />
          )}
        </span>
        {Title && (
          <span
            className={`text-gray-gray9 dark:text-white w-14 overflow-hidden flex justify-center items-center text-xs
                ${selectable && selected ? "font-semibold" : "font-normal"}
                `}
          >
            {Title}
          </span>
        )}
      </CustomButton>
    </div>
  );
}
