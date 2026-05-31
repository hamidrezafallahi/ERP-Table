"use client";
import {
  useEffect,
  useState,
} from 'react';

import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import Title from '@components/atoms/Title';
import FormToolbar from '@components/organisms/formToolbar';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetData } from '@services/base';
import { addNewPage } from '@slice/pages';
import { PageStateEnum } from '@slice/pages/enum';
import { PageTypeEnum } from '@type/enum';

import DynamicLoaderComponent from '../dynamicLoaderComponent';
import type { IProps } from './type';

export default function SemiDynamicForm({
  listUrl,
  caption,
  getUrl,
  getDetailUrl,
  detailsRepoViewId,
  repoViewId,
  info,
  titleKey,
  componentName,
  toolbarData,
  formData,
  columnsConfig,
  detailKey,
  detailCaption,
  id,
  fieldKey,
}: IProps) {
  const { initPage, activePage } = useAppSelector(
    (state) => ({
      initPage: state.withPersist.init,
      activePage: state?.withPersist?.pages?.find(
        (item) => item.isActive === true
      ),
    }),
    shallowEqual
  );

  const dispatch = useDispatch();
  const [totalCount, setTotalCount] = useState(null);
  const isEdit = id ? true : false;
  const pageType = PageTypeEnum.Form;
  const pageId = initPage.pageId;
  const repoId = initPage.RepoId;
  const systemId = initPage.SystemId;
  const BaseUrl = initPage.url;
  const pageState = initPage.pageState;
  const originalPageState = initPage.originalPageState;

  const detailInitialData = activePage?.pageData?.find(
    (item) => item.name === "Details"
  )?.originalValue;

  const recordHeight = 33;
  const TableHeight = 280;
  const recordsPerPage = Math.floor(TableHeight / recordHeight);

  const { data: form, isSuccess: formIsSuccess } = useGetData<any, any>({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
      Id: Number(id),
    },
    skip: !id,
    id: id,
  });

  const { data: detailsData, isSuccess: detailsDataIsSuccess } = useGetData<
    any,
    any
  >({
    url: getDetailUrl,
    body: {
      RepoViewId: detailsRepoViewId,
      HeaderId: Number(id),
      PagingInfo: {
        PageNumber: activePage?.viewData?.PagingInfo?.PageNumber
          ? activePage?.viewData?.PagingInfo?.PageNumber
          : 1,
        PageRecordCount: activePage?.viewData?.PagingInfo?.PageRecordCount
          ? activePage?.viewData?.PagingInfo?.PageRecordCount
          : 8,
        // WithTotalCount: activePage?.viewData?.PagingInfo?.WithTotalCount
        //   ? activePage?.viewData?.PagingInfo?.WithTotalCount
        //   : true,
      },
    },
    skip: !id,
    id: id,
  });

  useEffect(() => {
    let initialFormData;

    if (id) {
      if (formIsSuccess && detailsDataIsSuccess) {
        const formDefaultVal = form?.Data[0];
        const detailsDefaultVal = detailsData?.Data;
        setTotalCount(detailsData?.TotalCount);
        initialFormData = formData.map((item) => {
          let value = undefined;
          let originalValue = undefined;

          if (item.name === "Details") {
            value = detailsDefaultVal || [];
            originalValue = detailsDefaultVal || [];
          } else {
            value = formDefaultVal ? formDefaultVal[item.name] : undefined;
            originalValue = formDefaultVal
              ? formDefaultVal[item.name]
              : undefined;
          }

          return {
            ...item,
            isTitleField: item.name === titleKey,
            value,
            originalValue,
          };
        });

        initialFormData.push({
          name: info.formIdField,
          type: "text",
          caption: "MainIdField",
          value: id,
          originalValue: id,
          isTitleField: false,
        });
      }
    } else {
      initialFormData = formData.map((item) => {
        let value = undefined;
        let originalValue = undefined;

        if (item.name === "Details") {
          value = [];
          originalValue = [];
        } else {
          value = item.value;
          originalValue = item.originalValue;
        }

        return {
          ...item,
          isTitleField: item.name === titleKey,
          value,
          originalValue,
        };
      });
    }
    if (!id || (formIsSuccess && detailsDataIsSuccess)) {
      dispatch(
        addNewPage({
          pageId: pageId,
          caption: caption,
          pageState: pageState ? pageState : PageStateEnum.Opened,
          originalPageState: originalPageState
            ? originalPageState
            : PageStateEnum.Opened,
          type: pageType,
          RepoId: repoId,
          SystemId: systemId,
          url: BaseUrl,
          pageData: initialFormData,
          pageInfo: info,
          toolbarData: toolbarData,
          listUrl: listUrl,
          viewData: {
            PagingInfo: {
              PageNumber: 1,
              PageRecordCount: recordsPerPage,
            },
          },
        })
      );
    }
  }, [formIsSuccess, detailsDataIsSuccess, pageId]);

  return (
    <>
      <Title caption={caption} />
      {(!id || (formIsSuccess && detailsDataIsSuccess)) && (
        <div className="relative">
          <div
            className={`min-w-fit h-9 lg:absolute lg:-top-[60px] lg:-left-[10px]`}
          >
            <FormToolbar
              listUrl={listUrl}
              toolbarData={toolbarData}
              isEdit={isEdit}
              id={Number(id)}
              fieldKey={fieldKey}
            />
          </div>
          <div>
            {detailInitialData && (
              <DynamicLoaderComponent
                componentName={componentName}
                props={{
                  isEdit,
                  detailInitialData,
                  columnsConfig,
                  detailKey,
                  detailCaption,
                  totalCount,
                  id,
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
