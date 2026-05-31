import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import { message } from 'antd';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import InputText from '@components/atoms/defaultElements/inputText';
import { Magnifier } from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetConditionallyMutation } from '@services/base';
import type { IBaseQueryResponse } from '@services/base/type';
import { setPageData } from '@slice/pages';
import { setProducts } from '@slice/pages/factors';
import { IFactorItem } from '@slice/pages/factors/type';

interface IProps {
  setSearch?: (e: any) => void;
  closeModalHandler?: () => void;
}

function DebouncedQuickSearch({ ...props }: IProps) {
  const { setSearch, closeModalHandler } = props;
  const { activePageId } = useAppSelector((state) => {
    const activePageId = state.withPersist.pages?.find(
      (item) => item.isActive
    )?.pageId;
    return { activePageId };
  }, shallowEqual);
  const [barCode, setBarCode] = useState<string>("");
  const [getData] = useGetConditionallyMutation();

  const [inputValue, setInputValue] = useState("");
  const dispatch = useDispatch();
  const t = useTranslations();
  const debounceTimeoutRef = useRef(null);
  const barcodeRef = useRef("");

  const handleKeyPress = (event) => {
    if (event.key !== "Enter") {
      barcodeRef.current += event.key;
    } else {
      setBarCode(barcodeRef.current);
      barcodeRef.current = "";
    }
  };
  const handleFetchGoodByBarCode = async (barcode) => {
    if (barcode.trim().length > 0) {
      try {
        // TODO: add type
        const response: IBaseQueryResponse<any> = await getData({
          url: "api/com/select/goods/barcode",
          body: {
            BarCode: barcode,
            RepoViewId: 106023,
          },
        }).unwrap();

        if (response?.Result === "Success") {
          const good = response?.Data[0];
          playSuccessSound();
          const product: IFactorItem = {
            type: "product",
            GoodsCategoryDesc: good.GoodsDesc,
            GoodsCategoryId: good.GoodsId,
            GoodsImage: "https://picsum.photos/200/300",
            GoodsPrice: good.Price,
            GoodsDiscount: 10,
            GoodsCount: 1,
            GoodsId: good.GoodsId,
            unitId: good.MeasureUnit.MeasureUnitId,
            unitDesc: good.MeasureUnit.MeasureUnitDesc,
          };

          dispatch(setPageData({ name: "product", value: "Increment" }));
          setInputValue("");
          if (closeModalHandler) {
            closeModalHandler();
          }
          return true;
        } else {
          message.error("Failed to fetch good.");
          return false;
        }
      } catch (error) {
        message.error("An error occurred while fetching the good.");
        return false;
      }
    } else {
      setInputValue("");
    }
  };
  const playSuccessSound = () => {
    const audio = new Audio("/sounds/successScan.mp3");
    audio.play().catch((error) => {});
  };
  useEffect(() => {
    if (barCode?.length > 0) {
      handleFetchGoodByBarCode(barCode);
      setBarCode("");
    }
  }, [barCode]);
  const handleChangeInput = (e) => {
    setInputValue(e.target.value.trim());
  };
  const handleGetGoodList = async (inputValue) => {
    try {
      // TODO: add type
      const response: IBaseQueryResponse<any> = await getData({
        url: "/api/com/select/goods",
        body: {
          RepoViewId: 106023,
          FullSearchPhrase: inputValue,
        },
      }).unwrap();

      if (response?.Result === "Success" && response.Data.length > 0) {
        const products: IFactorItem[] = response.Data.map((item) => ({
          type: "product",
          GoodsCategoryDesc: item.GoodsDesc,
          GoodsImage: "https://picsum.photos/200/300",
          GoodsPrice: item.Price,
          GoodsDiscount: 2300000,
          GoodsCount: 1,
          discount: 1000,
          tax: 2000,
          GoodsId: item.GoodsId,
          unitDesc: item.MeasureUnit.MeasureUnitDesc,
          unitId: item.MeasureUnit.MeasureUnitId,
        }));
        dispatch(setProducts({ pageId: activePageId, products: products }));

        return true;
      } else {
        message.error("Failed to fetch goodList.");
        dispatch(setPageData({ name: "product", value: [] }));
        return false;
      }
    } catch (error) {
      message.error("An error occurred while fetching the good list.");
      return false;
    }
  };
  const disableScanner = () => {
    document.removeEventListener("keypress", handleKeyPress);
  };
  const enableScanner = () => {
    document.addEventListener("keypress", handleKeyPress);
  };

  useEffect(() => {
    clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(async () => {
      if (setSearch) {
        setSearch(inputValue);
      } else {
        if (inputValue.trim().length > 0) {
          const goodExist = await handleGetGoodList(inputValue);
          if (!goodExist) {
            const barcodeExist = await handleFetchGoodByBarCode(inputValue);
          }
        }
      }
    }, 808);
  }, [inputValue]);

  useEffect(() => {
    document.addEventListener("keypress", handleKeyPress);
    return () => {
      document.removeEventListener("keypress", handleKeyPress);
    };
  }, []);

  const onClearSearchInput = () => {
    dispatch(setPageData({ name: "product", value: [] }));
    setInputValue("");
  };

  return (
    <InputText
      allowClear
      onClear={() => onClearSearchInput()}
      onFocus={disableScanner}
      onBlur={enableScanner}
      className="!bg-main-white lg:!bg-gray-gray5"
      prefix={<Magnifier />}
      onChange={handleChangeInput}
      placeholder={t("general.search")}
      value={inputValue}
    />
  );
}

export default DebouncedQuickSearch;
