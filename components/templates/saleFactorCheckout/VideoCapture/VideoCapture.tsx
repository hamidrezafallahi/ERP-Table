import '../../../../dynamsoft.config';
import './VideoCapture.css';

import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import { Image } from 'antd';
import { message } from 'antd/lib';
import {
  CameraEnhancer,
  CameraView,
} from 'dynamsoft-camera-enhancer';
import { CaptureVisionRouter } from 'dynamsoft-capture-vision-router';
import { MultiFrameResultCrossFilter } from 'dynamsoft-utility';
import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import { useGetConditionallyMutation } from '@services/base';
import type { IBaseQueryResponse } from '@services/base/type';
import { setPageData } from '@slice/pages';
import { IFactorItem } from '@slice/pages/factors/type';
import {
  formatCurrency,
  getCookie,
} from '@utils/core';

const componentDestroyedErrorMsg = "VideoCapture Component Destroyed";

function VideoCapture() {
  const cameraViewContainer = useRef<HTMLDivElement>(null);
  const [barCode, setBarCode] = useState(null);
  const [product, setProduct] = useState<IFactorItem>(null);
  const t = useTranslations();
  const [getGood] = useGetConditionallyMutation();
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();
  const handleFetchGood = async (barcode) => {
    if (!barcode || barcode.length <= 0) return;
    try {
      // TODO: add type ---- cleaning code
      const response: IBaseQueryResponse<any> = await getGood({
        url: "api/com/select/goods/barcode",
        body: {
          RepoViewId: 106023,
          BarCode: barcode,
        },
      }).unwrap();

      if (response?.Result === "Success") {
        const good = response?.Data[0];
        playSuccessSound();
        const product: IFactorItem = {
          GoodsCategoryDesc: good.GoodsDesc,
          GoodsCategoryId: good.GoodsId,
          GoodsImage: "https://picsum.photos/200/300",
          GoodsPrice: 52000000,
          GoodsDiscount: 2300000,
          GoodsCount: 1,
          GoodsId: good.MeasureUnit,
          unitId: good.MeasureUnit.MeasureUnitId,
          unitDesc: good.MeasureUnit.MeasureUnitDesc,
          type: "product",
        };
        setProduct(product);
      } else {
        message.error("Failed to fetch good.");
      }
    } catch (error) {
      message.error(error, 3000);
      console.log(error);
    }
  };

  useEffect(() => {
    if (barCode) {
      handleFetchGood(barCode);
    }
  }, [barCode]);

  const playSuccessSound = () => {
    const audio = new Audio("/sounds/successScan.mp3");
    audio.play().catch((error) => {
      message.error(error);
    });
  };

  const handleAddProduct = () => {
    dispatch(setPageData({ name: "product", value: "Increment" }));

    setProduct(null);
    setBarCode(null);
    return;
  };
  useEffect((): any => {
    let resolveInit: () => void;
    const pInit: Promise<void> = new Promise((r) => {
      resolveInit = r;
    });
    let isDestroyed = false;

    let cvRouter: CaptureVisionRouter;
    let cameraEnhancer: CameraEnhancer;
    let uiElement: HTMLElement; // Define uiElement here

    (async () => {
      try {
        // Create a `CameraView` instance for UI control.
        const cameraView = await CameraView.createInstance();
        uiElement = cameraView.getUIElement(); // Initialize uiElement
        if (isDestroyed) {
          throw Error(componentDestroyedErrorMsg);
        }

        // Remove the camera and resolution selection dropdowns from the UI element
        const shadowRoot = uiElement.shadowRoot;
        if (shadowRoot) {
          const poweredby = shadowRoot.querySelector(".dce-msg-poweredby");
          const cameraSelector = shadowRoot.querySelector(".dce-sel-camera");
          const resolutionSelector = shadowRoot.querySelector(
            ".dce-sel-resolution"
          );
          if (cameraSelector) cameraSelector.remove();
          if (resolutionSelector) resolutionSelector.remove();
          poweredby.remove();
        }

        // Create a `CameraEnhancer` instance for camera control.
        cameraEnhancer = await CameraEnhancer.createInstance(cameraView);
        if (isDestroyed) {
          throw Error(componentDestroyedErrorMsg);
        }

        // Get default UI and append it to DOM.
        cameraViewContainer.current!.append(uiElement);

        // Create a `CaptureVisionRouter` instance and set `CameraEnhancer` instance as its image source.
        cvRouter = await CaptureVisionRouter.createInstance();
        if (isDestroyed) {
          throw Error(componentDestroyedErrorMsg);
        }
        cvRouter.setInput(cameraEnhancer);

        // Define a callback for results.
        cvRouter.addResultReceiver({
          onDecodedBarcodesReceived: (result) => {
            console.log("result is :", result);
            if (!result.barcodeResultItems.length) return;

            let _resultText = "";
            for (let item of result.barcodeResultItems) {
              // _resultText += `${item.formatString}: ${item.text}\n\n`;
              _resultText = item.text;
              // console.log(item.text);
            }
            setBarCode(_resultText);
          },
        });

        // Filter out unchecked and duplicate results.
        const filter = new MultiFrameResultCrossFilter();
        filter.enableResultCrossVerification("barcode", true);
        filter.enableResultDeduplication("barcode", true);
        await cvRouter.addResultFilter(filter);
        if (isDestroyed) {
          throw Error(componentDestroyedErrorMsg);
        }

        // Open camera and start scanning single barcode.
        await cameraEnhancer.open();
        cameraView.setScanLaserVisible(false);

        cameraView._renderCamerasInfo(
          {
            deviceId: "1",
            label: "string",
          },
          [
            {
              deviceId: "2",
              label: "string2",
            },
          ]
        );

        cameraView.setVideoFit("cover");

        let temp = cameraView._divScanLight;

        console.log(temp);

        if (isDestroyed) {
          throw Error(componentDestroyedErrorMsg);
        }
        await cvRouter.startCapturing("ReadSingleBarcode");

        if (isDestroyed) {
          throw Error(componentDestroyedErrorMsg);
        }
      } catch (ex: any) {
        if ((ex as Error)?.message === componentDestroyedErrorMsg) {
          console.log(componentDestroyedErrorMsg);
        } else {
          let errMsg = ex.message || ex;
          console.error(errMsg);
        }
      }
    })();

    // Resolve pInit promise once initialization is complete.
    resolveInit!();

    // componentWillUnmount. dispose cvRouter when it's no longer needed
    return async () => {
      isDestroyed = true;
      try {
        // Wait for the pInit to complete before disposing resources.
        await pInit;
        cvRouter?.dispose();
        cameraEnhancer?.dispose();
      } catch (err) {
        console.log(err);
      }
    };
  }, []);

  useEffect(() => {
    const videoElement = cameraViewContainer.current?.querySelector("video");
    if (videoElement) {
      videoElement.classList.add("video-cover");
      videoElement.classList.add("dbrScanner-existingVideo"); // Add the class to the video element
    }
  }, [cameraViewContainer]);

  return (
    <div className="flex flex-col justify-between w-full h-full">
      <div className="flex justify-center items-center bg-main-black p-1 border border-white border-dashed w-full !overflow-hidden">
        <div
          className="relative bg-main-black w-full h-[51vh]"
          ref={cameraViewContainer}
        >
          <div className="top-0 right-0 left-0 z-[999] absolute bg-[#32B149] w-full h-[4px] animate-scan transform"></div>
        </div>
      </div>

      <div className="flex flex-col items-center mx-auto p-5 w-full !h-[260px]">
        {!product ? (
          <div className="relative flex flex-col items-center w-full h-full">
            <p className="flex items-center my-auto h-full font-medium text-main-white text-xl text-center">
              {t("general.scanProduct")}
            </p>
            <div className="flex justify-center mx-auto mt-auto w-full">
              <CustomButton
                type="text"
                disabled
                onClick={handleAddProduct}
                className="justify-center items-center !bg-gray-gray55 mx-auto w-full h-9 font-medium !text-gray-gray85 text-md"
              >
                {t("general.add")}
              </CustomButton>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col justify-start items-center w-full h-full">
            <div className="flex flex-col justify-center items-center gap-2">
              <Image
                src={product?.GoodsImage}
                preview={false}
                width={102}
                height={86}
                className="rounded-lg"
                alt={product?.GoodsCategoryDesc}
              />
              <div className="flex items-center font-medium text-main-white text-xl">
                {product?.GoodsCategoryDesc}
              </div>
              <div className="flex gap-1 font-medium text-gray-50 text-lg text-nowrap">
                {formatCurrency(product?.GoodsPrice)}
                <span className="font-normal text-2xs text-gray-50">
                  {" "}
                  {getCookie("CurrencyId").split("/")[1]}
                </span>
              </div>
            </div>
            <div className="bottom-0 !z-50 absolute flex justify-center mx-auto mt-auto w-full">
              <button
                onClick={handleAddProduct}
                className="justify-center bg-main-white mx-auto rounded w-full h-9 font-medium text-main-black text-md"
              >
                {t("general.add")}
              </button>
            </div>
          </div>
        )}
      </div>

      {contextHolder}
    </div>
  );
}

export default VideoCapture;
