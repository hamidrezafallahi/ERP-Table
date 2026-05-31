import { useState } from 'react';

import {
  AutoComplete,
  Skeleton,
} from 'antd';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomTag } from '@components/atoms/defaultElements';
import { PlusOutline } from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import {
  useCUDDataMutation,
  useGetConditionallyMutation,
  useGetData,
} from '@services/base';
import type {
  IBaseQueryResponse,
  ITagInfo,
} from '@services/base/type';
import { addSpecificTags } from '@slice/container';
import type { ISelectOption } from '@type/elementType';
import { getSystemNameById } from '@utils/core';

import type { IProps } from './type';

export const TagManagement = ({ refIds, minimize }: IProps) => {
  const refId = Number(refIds[0]);
  const t = useTranslations();
  const dispatch = useDispatch();
  const [newTagValue, setNewTagValue] = useState("");
  const [isDeleted, setIsDeleted] = useState(null);
const { systemId, repoId, repoTags, match } = useAppSelector((state) => {
  const activePage = state.withPersist.pages?.find((item) => item.isActive);
  const match = state.withPersist.config.initMatch;

  return {
    repoId: activePage?.RepoId,
    systemId: activePage?.SystemId,
    repoTags: state.withoutPersist.container.recordsTags.find(
      (item) =>
        item.RefId === Number(refId) && item.RepoId === activePage?.RepoId
    )?.tags,
    match, 
  };
}, shallowEqual);



  const [trigger, { isLoading }] = useCUDDataMutation();
  const [getTags] = useGetConditionallyMutation();
  const { data: tagOptions, isLoading: tagOptionIsLoading } = useGetData<
    ISelectOption[],
    null
  >({
    url: `/api/${getSystemNameById(systemId)}/select/tag`,
    body: {
      RepoViewId: 11,
    },
  });

  const handleGet = async () => {
    try {
      const repoTagsResponse: IBaseQueryResponse<ITagInfo[]> = await getTags({
        url: `/api/${getSystemNameById(systemId)}/select/repoTag`,
        body: {
          RepoId: repoId,
          RefId: refId,
        },
      }).unwrap();

      if (repoTagsResponse?.Result == "Success" && repoTagsResponse?.Data) {
        dispatch(
          addSpecificTags({
            RepoId: repoId,
            RefId: refId,
            tags: repoTagsResponse.Data,
            revalidated: true,
          })
        );
      }
    } catch (err) {
      null;
    }
  };
  const handleDelete = async (removeTag) => {
    if (isLoading) return;
    setIsDeleted(removeTag);
    try {
      const removingTagResponse = await trigger({
        url: `/api/${getSystemNameById(systemId)}/delete/tag`,
        body: {
          Id: removeTag.RepoTagId,
          RefId: refId,
          RepoId: repoId,
        },
      }).unwrap();

      if (removingTagResponse?.Result == "Success") {
        handleGet();
      }
    } catch (err) {
      null;
    }
    setIsDeleted(null);
  };
  const handleAdd = async (newTagValue) => {
    try {
      const addingTagResponse = await trigger({
        url: `/api/${getSystemNameById(systemId)}/insert/tag`,
        body: {
          Title: newTagValue,
          RepoId: repoId,
          RefId: refId,
        },
      }).unwrap();

      if (addingTagResponse?.Result == "Success") {
        handleGet();
      }
    } catch (err) {
      null;
    }
    setNewTagValue("");
  };

  return (
    <div
      className={`${minimize && "  hidden"} flex flex-col gap-4 px-2 h-full `}
    >
      <div className="relative flex flex-col gap-2">
        {tagOptionIsLoading ? (
          <Skeleton.Input active={true} block className="z-50 relative" />
        ) : (
          <AutoComplete
            placeholder={t("general.placeholder")}
            className="bg-gray-gray3 dark:bg-gray-gray10 rounded w-full text-start"
            options={tagOptions?.Data?.filter(
              (item) =>
                !repoTags?.some((tag) => tag.Title === item._SelectValue)
            ).map((item) => ({
              value: item._SelectValue,
              label: item._SelectDisplay,
            }))}
            onChange={(value) => setNewTagValue(value)}
            onInputKeyDown={(e) => {
              if (e.key === "Enter" && newTagValue.trim().length > 0) {
                handleAdd(newTagValue);
              }
            }}
            filterOption
            value={newTagValue}
            maxLength={63}
            disabled={isLoading}
          />
        )}
        {match && newTagValue?.length > 0 && (
          <div className="flex text-3xs text-blue-blue4">
            {t("sidebar.enterToSave")}
          </div>
        )}
        <div className="flex flex-wrap justify-start items-start gap-2 gap-x-1 w-full overflow-x-hidden overflow-y-auto">
          {repoTags?.length > 0 &&
            repoTags.map((tag, index) => {
              return (
                <CustomTag
                  key={index}
                  tag={tag}
                  deleteTagHandler={handleDelete}
                  Loading={isDeleted?.Title == tag.Title}
                  className="max-h-6 text-[10px]"
                />
              );
            })}
        </div>
      </div>
      {newTagValue?.length > 0 && (
        <div
          className={`${
            !match ? "left-6" : "left-4"
          }  absolute flex justify-center items-center rounded-full w-8 h-8 text-white cursor-pointer`}
          onClick={() => {
            newTagValue?.trim()?.length > 0 && handleAdd(newTagValue);
          }}
        >
          <div className="flex justify-center items-center bg-black-black95 rounded-full w-5 h-5">
            <PlusOutline />
          </div>
        </div>
      )}
    </div>
  );
};
