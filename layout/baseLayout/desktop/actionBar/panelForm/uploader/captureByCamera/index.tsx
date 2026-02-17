import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { Input } from 'antd';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import {
  CameraUnavailable,
  RecordingCamera,
  RightArrow,
  StopRecording,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@redux/index';
import { setProgressbar } from '@slice/config';
import {
  dataURLtoFile,
  generateGUID,
  getFileTypeFromBase64,
  showErrorToast,
} from '@utils/core';

import CaptureCarousel from './captureCarousel';

const CaptureByCamera = ({
  setShowCapture,
  setModalTitle,
  setSelectedForUpload,
  setProgress,
  onlyAcceptImage,
}) => {
  const t = useTranslations();
  const dispatch = useDispatch();
  const captureCanvas = useRef(null);
  const captureInput = useRef(null);
  const videoRef = useRef(null);
  const [capturedFile, setCapturedFile] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [showCounter, setShowCounter] = useState(false);
  const [showRecordingTimer, setShowRecordingTimer] = useState(false);
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);
  const [cameraIsFind, setCameraIsFind] = useState(false);

  
const { direction, match } = useAppSelector(
  (state) => ({
    direction: state.withPersist.config.direction,
    match: state.withPersist.config.initMatch,
  }),
  shallowEqual
);

  const carouselContainer = useRef(null);
  let scrollTop;
  let scrollHeight;
  let clientHeight;
  let scrollBottom;

  const handleCapture = () => {
    const canvas = captureCanvas.current;
    const video = videoRef.current;
    if (canvas && video) {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataURL = canvas.toDataURL("image/jpeg", 1);
      const fileExt = getFileTypeFromBase64(imageDataURL);
      const file = dataURLtoFile(
        `${imageDataURL}`,
        `${generateGUID()}.${fileExt}`
      );

      setCapturedFile((prevFiles) => [...(prevFiles || []), file]);
    }
  };
  const handleToggleRecording = () => {
    if (mediaRecorder) {
      setShowCounter(!showCounter);
      if (mediaRecorder.state == "recording") {
        mediaRecorder.stop();
        setShowRecordingTimer(false);
      }
    }
  };
  const startRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "inactive") {
      mediaRecorder.start();
      setShowRecordingTimer(true);
    }
  };
  const handleAddToList = () => {
    handleCloseCapturing();
    if (capturedFile && capturedFile.length > 0) {
      setSelectedForUpload((prevFiles) => {
        return [...prevFiles, ...capturedFile];
      });
      capturedFile.forEach((element) => {
        dispatch(setProgressbar({ id: element.name, percent: 100 }));
      });
      setProgress(false);
    }
  };
  const handleCloseCapturing = () => {
    setShowCapture(false);
    setModalTitle(t("sidebar.drag"));
  };
  const logScrollPosition = () => {
    if (carouselContainer.current) {
      scrollTop = carouselContainer.current.scrollTop; // Get the current scroll position
      scrollHeight = carouselContainer.current.scrollHeight; // Total height of the content
      clientHeight = carouselContainer.current.clientHeight; // Height of the visible area
      scrollBottom = scrollHeight - clientHeight - scrollTop; // Calculate scroll bottom
      if (scrollTop < 50) {
        setShowTopShadow(false);
      } else {
        setShowTopShadow(true);
      }

      if (scrollBottom < 50) {
        setShowBottomShadow(false);
      } else {
        setShowBottomShadow(true);
      }
    }
  };
  useEffect(() => {
    let mediaStream;
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        setCameraIsFind(true);
        mediaStream = stream;
        let temp = [];
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          const recorder = new MediaRecorder(stream);
          setMediaRecorder(recorder);
          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              temp = [...temp, event.data];
            }
          };
          recorder.onstop = async () => {
            const blob = new Blob(temp, { type: "video/webm" });
            const videoFile = new File([blob], `${generateGUID()}.webm`, {
              type: "video/webm",
            });
            temp = [];
            setCapturedFile((prevFiles) => [...(prevFiles || []), videoFile]);
          };
        }
      })
      .catch((error) => {
        const errorMessage = error.message || t("general.fail");
        showErrorToast(t("general.fail"), errorMessage);
        setCameraIsFind(false);
      });
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => {
          track.stop();
        });
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);
  // const handleChange = (e) => {
  //   console.log(e);
  // };

  // useEffect(() => {
  //   let mediaStream;

  //   if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  //     navigator.mediaDevices
  //       .getUserMedia({ video: true })
  //       .then((stream) => {
  //         setCameraIsFind(true);
  //         mediaStream = stream;
  //         if (videoRef.current) {
  //           videoRef.current.srcObject = stream;
  //           const recorder = new MediaRecorder(stream);
  //           setMediaRecorder(recorder);
  //           // سایر کدها...
  //         }
  //       })
  //       .catch((error) => {
  //         const errorMessage = error.message || t("general.fail");
  //         showErrorToast(t("general.fail"), errorMessage);
  //         setCameraIsFind(false);
  //       });
  //   } else {
  //     showErrorToast(
  //       t("general.fail"),
  //       "getUser Media is not supported in this browser."
  //     );
  //     setCameraIsFind(false);
  //   }

  //   return () => {
  //     if (videoRef.current && videoRef.current.srcObject) {
  //       videoRef.current.srcObject.getTracks().forEach((track) => {
  //         track.stop();
  //       });
  //     }
  //     if (mediaStream) {
  //       mediaStream.getTracks().forEach((track) => {
  //         track.stop();
  //       });
  //     }
  //   };
  // }, []);

  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        className="z-30 relative flex flex-col gap-3 px-2 md:px-5 h-full overflow-hidden transition-all duration-100"
      >
        {!cameraIsFind && (
          <div className="z-50 absolute inset-0 flex flex-col justify-center items-center bg-main-white dark:bg-gray-gray12">
            <CameraUnavailable />
            {t("sidebar.cameraUnavailable")}
          </div>
        )}

        <CustomButton
          type="text"
          ghost
          className="z-50 relative m-0 p-0 w-fit h-7"
          onClick={handleCloseCapturing}
        >
          {direction === "rtl" ? (
            <RightArrow />
          ) : (
            <span className="rotate-180">
              <RightArrow />
            </span>
          )}
          {t("sidebar.backToUpload")}
        </CustomButton>

        <div className="relative flex md:flex-row flex-col items-start gap-2 h-[calc(100%-30px)] overflow-hidden">
          <div
            className={`relative flex justify-center border border-dashed w-full md:w-4/5 ${
              !match ? "h-screen" : "h-full"
            }`}
          >
            {showRecordingTimer && (
              <div className="top-2 right-[50%] z-50 absolute translate-x-[50%]">
                <RecordingTimer />
              </div>
            )}
            <Input
              ref={captureInput}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
            />
            {showCounter && <CustomCountdown onFinish={startRecording} />}
            <canvas ref={captureCanvas} className="w-[0px] h-[0px]"></canvas>
            <video
              ref={videoRef}
              className={` ${!match && "w-full h-full object-cover"}`}
              autoPlay
              muted
              playsInline
            />

            {!match && (
              <div className="bottom-5 left-1/2 z-30 absolute flex gap-5 -translate-x-1/2 transform">
                <CustomButton
                  onClick={handleCapture}
                  type="text"
                  className="flex justify-center items-center bg-main-black hover:!bg-main-black px-1 rounded-full w-12 h-12 text-xs"
                >
                  <RecordingCamera />
                </CustomButton>
                {!onlyAcceptImage && (
                  <CustomButton
                    onClick={handleToggleRecording}
                    type="text"
                    className="flex justify-center items-center bg-main-black hover:!bg-main-black p-0 rounded-full w-12 h-12"
                  >
                    {showCounter ? (
                      <StopRecording />
                    ) : (
                      <div className="flex justify-center items-center gap-1">
                        <span className="!h-3 text-[11px] text-main-white leading-4">
                          REC
                        </span>
                        <span className="bg-red-800 rounded-full !w-[6px] !h-[6px]"></span>
                      </div>
                    )}
                  </CustomButton>
                )}
              </div>
            )}

            {match && (
              <div className="right-[50%] bottom-5 z-30 absolute flex gap-5 translate-x-[50%]">
                <CustomButton
                  onClick={handleCapture}
                  type="text"
                  className={`text-xs h-10 w-10 rounded-full bg-main-black hover:!bg-main-black px-1 flex justify-center items-center `}
                >
                  <RecordingCamera />
                </CustomButton>
                {!onlyAcceptImage && (
                  <CustomButton
                    onClick={handleToggleRecording}
                    type="text"
                    className={`h-10 w-10 rounded-full bg-main-black hover:!bg-main-black p-0 `}
                  >
                    {showCounter ? (
                      <StopRecording />
                    ) : (
                      <div className="flex justify-center items-center gap-1">
                        <span className="!h-3 text-[11px] text-main-white leading-4">
                          REC
                        </span>
                        <span className="bg-red-800 rounded-full !w-[6px] !h-[6px]"></span>
                      </div>
                    )}
                  </CustomButton>
                )}
              </div>
            )}
          </div>

          <div
            ref={carouselContainer}
            onScroll={logScrollPosition}
            className={`md:block flex flex-col md:flex-col w-full md:w-1/5 hidden-show-scrollBar ${
              !match
                ? "flex-row overflow-x-auto overflow-y-hidden h-[120px]"
                : "overflow-y-scroll h-full"
            } hidden-show-scrollBar scroll-smooth`}
          >
            <CaptureCarousel
              capturedFile={capturedFile}
              setCapturedFile={setCapturedFile}
              showTopShadow={showTopShadow}
              showBottomShadow={showBottomShadow}
            />
          </div>
        </div>
      </div>

      <div className="z-30 relative flex justify-end items-center bg-main-white dark:bg-gray-gray12 mt-4 w-full md:w-full h-[60px] overflow-hidden">
        <CustomButton
          onClick={handleAddToList}
          type="text"
          className="bg-main-black rounded w-full md:w-[89px] h-9 text-main-white text-xs"
        >
          {t("general.accept")}
        </CustomButton>
      </div>
    </>
  );
};
export default CaptureByCamera;

export const CustomCountdown = ({ onFinish }) => {
  const [count, setCount] = useState(3);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (count > 0) {
      const timer = setInterval(() => {
        setCount((prevCount) => prevCount - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setIsFinished(true);
      if (onFinish) {
        onFinish();
      }
    }
  }, [count]);
  return (
    <>
      {!isFinished && (
        <div className="top-[50%] right-[50%] absolute !font-Arimo text-[96px] text-gray-gray5 -translate-y-[50%] translate-x-[50%]">
          {count}
        </div>
      )}
    </>
  );
};

export const RecordingTimer = () => {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer((prevTemp) => prevTemp + 0.5);
    }, 500);

    return () => clearInterval(intervalId);
  }, []);
  const formatTime = (totalSeconds) => {
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
      2,
      "0"
    );
    const seconds = String(Math.floor(totalSeconds % 60)).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="flex justify-center items-center gap-1 bg-main-black bg-opacity-55 px-2 rounded-2xl font-Arimo text-main-white">
      {formatTime(timer)}
      <span
        className={`!w-2 !h-2 flex ${
          timer % 1 === 0 && "bg-state-error1 "
        } rounded-full`}
      ></span>
    </div>
  );
};
