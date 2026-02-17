import { useRef, useState } from "react";

import Image from "next/image";

import { CustomButton } from "@components/atoms/defaultElements";
import {
  PauseVideo,
  PlayVideo,
  TrashBin,
} from "@components/atoms/iconComponents";
import { formatBytes, removeExtensionFromFileName } from "@utils/core";

import { IconByFileExtension } from "./IconByFileExtension";
import { typeByExtension } from "./util";

const RenderAttachmentsRow = ({
  file,
  handleDeleteAttachmentsFile,
  isLast,
  isFirst,
  isDeleteLoading = false,
}) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const type = typeByExtension(file.FileName);
  const handleOpenFile = (file) => {
    window.open(file.Url);
  };
  const togglePlayPauseVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  const togglePlayPauseAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  const getTogglePlayPause = () => {
    if (type === "video") {
      return togglePlayPauseVideo;
    } else if (type === "audio") {
      return togglePlayPauseAudio;
    }
    return null;
  };

  return (
    <div
      className={`flex p-2 w-full relative z-30 bg-main-white dark:bg-gray-gray10 ${
        isLast ? "border-b-2 border-dashed" : ""
      } ${isFirst ? "border-t-2 border-dashed" : ""}`}
    >
      <div className="!w-16 !h-14">
        <CustomButton
          onClick={() => {
            handleOpenFile(file);
          }}
          className="relative flex justify-center items-center !gap-0 bg-gray-gray3 hover:!bg-gray-gray1 dark:bg-gray-gray10 !m-0 !p-0 !border !border-gray-gray3 w-full h-full overflow-hidden"
        >
          <IconByFileExtension fileName={file.FileName} />
          {type === "image" ? (
            <Image
              src={file.Url}
              alt="Descriptive alt text"
              fill
              className="object-cover"
              onError={(e) => {
                console.log(e);
              }}
            />
          ) : type === "video" && file.Url ? (
            <video
              preload="auto"
              ref={videoRef}
              onEnded={() => setIsPlaying(false)}
              className="top-0 left-0 absolute w-full h-full object-cover"
            >
              <source src={file.Url} type="video/mp4" /> Your browser does not
              support the video tag.
            </video>
          ) : type == "audio" && file.Url ? (
            <audio
              preload="auto"
              ref={audioRef}
              className="top-0 left-0 absolute w-full h-full object-cover"
              onEnded={() => setIsPlaying(false)}
            >
              <source src={file.Url} type={file.type} />
              Your browser does not support the audio tag.
            </audio>
          ) : (
            <></>
          )}
        </CustomButton>
      </div>
      <div className="flex w-full">
        <div className="flex flex-col p-2 w-full">
          <div className="text-gray-gray8 dark:text-white">
            {removeExtensionFromFileName(file.FileName)}
          </div>
          <div className="text-gray-gray8 dark:text-white">
            {formatBytes(file.size)}
          </div>
        </div>
      </div>
      <div className="relative flex justify-center items-center">
        <PlayButton
          type={type}
          isPlaying={isPlaying}
          togglePlayPause={getTogglePlayPause()}
        />
      </div>
      <div className="flex justify-center items-center">
        <CustomButton
          onClick={() => handleDeleteAttachmentsFile(file)}
          type="text"
          className="p-1"
          loading={isDeleteLoading}
        >
          {!isDeleteLoading && (
            <TrashBin config={{ width: 26, height: 26, stroke: "#767676" }} />
          )}
          <div className="z-50 absolute"></div>
        </CustomButton>
      </div>
    </div>
  );
};
export default RenderAttachmentsRow;

const PlayButton = ({ type, isPlaying, togglePlayPause }) => {
  return (
    <>
      {(type == "video" || type == "audio") && (
        <span
          onClick={togglePlayPause}
          className="z-20 flex justify-center items-center rounded-full transition-all animate-fadeIn duration-1000 cursor-pointer"
        >
          {isPlaying ? (
            <PauseVideo config={{ width: 26, height: 26, fill: "#939393" }} />
          ) : (
            <PlayVideo config={{ width: 26, height: 26, fill: "#939393" }} />
          )}
        </span>
      )}
    </>
  );
};
