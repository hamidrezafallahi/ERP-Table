import {
  ChangeEvent,
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { Input } from 'antd';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CloseCircle,
  Magnifier,
} from '@components/atoms/iconComponents';
import { useInvalidateTag } from '@hooks/custom';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { setViewData } from '@slice/pages';

import type {
  IProps,
  QuickFilterRef,
} from './type';

const InputSearch = forwardRef<QuickFilterRef, IProps>(
  ({ onFocus, isActive }, ref) => {
    const { match, active } = useAppSelector((state) => {
      const match = state.withPersist.config.initMatch;
      const active = state.withPersist.pages?.find((i) => i.isActive);
      return { match, active };
    }, shallowEqual);
    const t = useTranslations();
    const dispatch = useDispatch();
    const { invalidate } = useInvalidateTag();

    const [searchTerm, setSearchTerm] = useState(
      active?.viewData?.FullSearchPhrase || "",
    );
    const prevViewDataRef = useRef(active?.viewData);
    const inputRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      clearInput: () => {
        setSearchTerm("");
      },
    }));

    useEffect(() => {
      if (active?.viewData) {
        setSearchTerm(active?.viewData.FullSearchPhrase || "");
      }
    }, [active?.viewData]);

    useEffect(() => {
      const handler = setTimeout(() => {
        if (prevViewDataRef.current?.FullSearchPhrase !== searchTerm) {
          dispatch(
            setViewData({
              ...active?.viewData,
              FullSearchPhrase: searchTerm,
              PagingInfo: {
                ...active?.viewData?.PagingInfo,
                PageNumber: 1,
              },
            }),
          );

          invalidate(active?.viewData?.url);
        }
      }, 500);

      prevViewDataRef.current = active?.viewData;

      return () => {
        clearTimeout(handler);
      };
    }, [searchTerm, dispatch, active?.viewData]);

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setSearchTerm(value);
    };

    return (
      <Input
        ref={inputRef}
        prefix={
          match ? (
            <Magnifier
              config={{
                stroke: "#585858",
              }}
            />
          ) : isActive ? null : (
            <Magnifier
              config={{
                stroke: "#585858",
              }}
            />
          )
        }
        name="FullSearchPhrase"
        value={searchTerm}
        placeholder={t("general.search")}
        allowClear={
          !match
            ? false
            : {
                clearIcon: <CloseCircle />,
              }
        }
        className={`  dark:!bg-gray-gray135 dark:!text-white ${
          match ? "!bg-gray-gray5" : "!bg-white"
        } @apply focus:!border-none justify-center focus:!outline-0 hover:!border-none hover:!outline-0 @apply blur:!outline-0 flex items-center rounded w-full text-xs !h-[2.125rem]`}
        onChange={handleSearchChange}
        onFocus={onFocus}
        autoFocus={isActive}
      />
    );
  },
);

InputSearch.displayName = "InputSearch";
export const QuickSearch = memo(InputSearch);
