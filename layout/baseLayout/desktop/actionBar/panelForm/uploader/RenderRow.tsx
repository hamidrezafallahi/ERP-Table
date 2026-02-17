import { useEffect, useRef, useState } from "react";

import Image from "next/image";

import { CustomButton } from "@components/atoms/defaultElements";
import {
  PauseVideo,
  PlayVideo,
  TrashBin,
} from "@components/atoms/iconComponents";
import { useAppSelector } from "@redux/index";
import { formatBytes, removeExtensionFromFileName } from "@utils/core";

import { IconByFileExtension } from "./IconByFileExtension";
import Loader from "./Loader";

const RenderRow = ({ file, handleDeleteFile, isLast, isFirst }) => {
  const [fileUrl, setFileUrl] = useState("");
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const handleOpenFile = (imageUrl) => {
    window.open(imageUrl);
  };
  const type = file.type.split("/")[0];
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
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url); // Cleanup on unmount
    }
  }, [file]);
  return (
    <div
      className={`flex p-2 w-full relative z-30 bg-main-white dark:bg-gray-gray10 ${
        isLast ? "" : "border-b"
      } ${isFirst ? "border-t-2 border-dashed" : ""}`}
    >
      <div className="!w-16 !h-14">
        <CustomButton
          onClick={() => {
            handleOpenFile(fileUrl);
          }}
          className="relative flex justify-center items-center bg-gray-gray3 hover:!bg-gray-gray1 dark:bg-gray-gray10 !m-0 !p-0 !border !border-gray-gray3 w-full h-full overflow-hidden"
        >
          <div className="absolute inset-0 flex justify-center items-center">
            <IconByFileExtension fileName={file.name} />
          </div>

          {type == "image" ? (
            <Image src={fileUrl} alt="img" fill className="object-cover" />
          ) : type == "video" && fileUrl ? (
            <video
              preload="auto"
              ref={videoRef}
              className="top-0 left-0 absolute w-full h-full object-cover"
              onEnded={() => setIsPlaying(false)}
            >
              <source src={fileUrl} type={file.type} />
              Your browser does not support the video tag.
            </video>
          ) : type == "audio" && fileUrl ? (
            <audio
              preload="auto"
              ref={audioRef}
              className="top-0 left-0 absolute w-full h-full object-cover"
              onEnded={() => setIsPlaying(false)}
            >
              <source src={fileUrl} type={file.type} />
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
            {removeExtensionFromFileName(file.name)}
          </div>
          <div className="text-gray-gray8 dark:text-white">
            {formatBytes(file.size)}
          </div>
        </div>
        <div className="relative flex justify-center items-center">
          <Loader id={file.name} />
          <PlayButton
            file={file}
            isPlaying={isPlaying}
            togglePlayPause={getTogglePlayPause()}
          />
        </div>
      </div>
      <div className="flex justify-center items-center">
        <CustomButton
          onClick={() => handleDeleteFile(file)}
          type="text"
          className="p-1"
        >
          <TrashBin config={{ width: 26, height: 26, stroke: "#767676" }} />
          <div className="z-50 absolute"></div>
        </CustomButton>
      </div>
    </div>
  );
};
export default RenderRow;
const PlayButton = ({ file, isPlaying, togglePlayPause }) => {
  const type = file.type.split("/")[0];
  const { percent } = useAppSelector((state) => ({
    percent:
      state.withPersist.config.progressItems.find(
        (item) => item.id === file.name
      )?.percent || 0,
  }));
  return (
    <>
      {percent == 100 && (type == "video" || type == "audio") && (
        <span
          onClick={togglePlayPause}
          className="z-20 absolute flex justify-center items-center rounded-full transition-all animate-fadeIn duration-1000 cursor-pointer"
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
