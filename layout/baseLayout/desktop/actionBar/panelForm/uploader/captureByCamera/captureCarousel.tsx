import {
  useEffect,
  useRef,
  useState,
} from 'react';

import Image from 'next/image';
import { shallowEqual } from 'react-redux';

import {
  DeleteVideo,
  PlayVideo,
} from '@components/atoms/iconComponents';
import { PauseVideo } from '@components/atoms/iconComponents/icons/PauseVideo';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import shadow from '@public/images/gradientShadow.png';
import filmBorderUrl from '@public/images/vertical film border.png';

export default function CaptureCarousel({
  capturedFile,
  setCapturedFile,
  showTopShadow,
  showBottomShadow,
}) {
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  }, shallowEqual);

  return (
    <div
      className={`flex md:flex-col-reverse flex-row ${
        !match ? "!w-max" : ""
      } justify-end items-center gap-3 min-h-full relative`}
    >
      {showBottomShadow && (
        <div className="bottom-0 z-10 sticky bg-transparent w-full h-3">
          <div className="relative w-full h-full">
            <Image
              src={shadow}
              alt="img"
              layout="fill"
              className="blur-sm object-cover filter"
            />
          </div>
        </div>
      )}
      {capturedFile?.map((file, index) => (
        <Slide key={index} file={file} setCapturedFile={setCapturedFile} />
      ))}
      {showTopShadow && (
        <div className="top-0 z-10 sticky bg-transparent w-full h-3">
          <div className="relative w-full h-full rotate-180">
            <Image
              src={shadow}
              alt="img"
              layout="fill"
              className="blur-sm object-cover filter"
            />
          </div>
        </div>
      )}
    </div>
  );
}

const Slide = ({ file, setCapturedFile }) => {
  const [fileUrl, setFileUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoDuration, setVideoDuration] = useState(null);
  const videoRef = useRef(null);
  const type = file.type.split("/")[0];

  const handleDeleteCapture = () => {
    setCapturedFile((prevFiles) => {
      return prevFiles.filter((x) => x.name !== file.name);
    });
  };
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  }, shallowEqual);

  return (
    <div
      className={`rounded relative  group  overflow-hidden border border-gray-gray3 ${
        !match && "w-full"
      } `}
    >
      {type == "image" ? (
        <Image
          src={fileUrl}
          alt="img"
          className="w-auto min-w-[100px] max-w-[120px] h-auto"
          width={135}
          height={101}
        />
      ) : (
        <>
          <Image
            src={filmBorderUrl}
            alt="img"
            layout="fill"
            className="opacity-80"
          />
          {fileUrl && (
            <video
              ref={videoRef}
              onEnded={handleVideoEnd}
              onLoadedMetadata={handleLoadedMetadata}
              className="w-auto min-w-[100px] max-w-[120px] h-auto"
            >
              <source src={fileUrl} type={file.type} />
              Your browser does not support the video tag.
            </video>
          )}
        </>
      )}

      <div className="absolute inset-0 flex justify-evenly items-center opacity-0 group-hover:opacity-100 group-hover:backdrop-blur-sm transition-all duration-300">
        {type == "image" ? (
          <span
            onClick={handleDeleteCapture}
            className="z-10 flex justify-center items-center rounded-full w-10 h-10 cursor-pointer"
          >
            <DeleteVideo />
          </span>
        ) : (
          <>
            <span
              onClick={handleDeleteCapture}
              className="z-10 flex justify-center items-center rounded-full w-10 h-10 cursor-pointer"
            >
              <DeleteVideo />
            </span>
            <span
              onClick={togglePlayPause}
              className="z-10 flex justify-center items-center rounded-full w-10 h-10 cursor-pointer"
            >
              {isPlaying ? <PauseVideo /> : <PlayVideo />}
            </span>
          </>
        )}
      </div>
    </div>
  );
};
