"use client";
import {
  useEffect,
  useState,
} from 'react';

import { Form } from 'antd';
import { useSearchParams } from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import Title from '@components/atoms/Title';
import FormToolbar from '@components/organisms/formToolbar';
import PriceComponent from '@components/organisms/priceComponent';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetData } from '@services/base';
import type {
  IPrice,
  IRequest,
} from '@services/sale/price/type';
import type { IPriceDetail } from '@services/sale/priceDetails/type';
import { addNewPage } from '@slice/pages';
import { PageStateEnum } from '@slice/pages/enum';
import { PageTypeEnum } from '@type/enum';
import { IToolbar } from '@type/toolbar';

import { priceConfig } from './config';

export default function PriceFormPage() {
  const { initPage, activePage } = useAppSelector(
    (state) => ({
      initPage: state.withPersist.init,
      activePage: state?.withPersist?.pages?.find(
        (item) => item.isActive === true,
      ),
    }),
    shallowEqual,
  );
  const params = useSearchParams();
  const id = params.get("id");

  const dispatch = useDispatch();

  const [totalCount, setTotalCount] = useState(null);
  const isEdit = id ? true : false;
  const pageType = PageTypeEnum.Form;
  const pageId = initPage.pageId;
  const repoId = initPage.RepoId;
  const systemId = initPage.SystemId;
  const BaseUrl = initPage.url;
  const listPageId = initPage?.listPageId;
  const pageState = initPage.pageState;
  const originalPageState = initPage.originalPageState;
  const [form] = Form.useForm();

  const { data: dataToolbar } = useGetData<IToolbar, IRequest>({
    url: "/api/menu/getToolbarData",
    body: { RepoId: repoId, SystemId: systemId, Type: pageType },
  });

  const detailInitialData = activePage?.pageData?.find(
    (item) => item.name === "Details",
  )?.originalValue;

  const recordHeight = 33;
  const TableHeight = 280;
  const recordsPerPage = Math.floor(TableHeight / recordHeight);

  const { data: formData, isSuccess: formIsSuccess } = useGetData<
    IPrice[],
    IRequest
  >({
    url: priceConfig.getUrl,
    body: {
      RepoViewId: priceConfig.repoViewId,
      Id: Number(id),
    },
    skip: !id,
    id: id,
  });

  const {
    data: detailsData,
    isSuccess: detailsDataIsSuccess,
    isFetching: isLoading,
  } = useGetData<IPriceDetail[], IRequest>({
    url: priceConfig.getDetailUrl,
    body: {
      RepoViewId: priceConfig.detailsRepoViewId,
      HeaderId: Number(id),
      PagingInfo: {
        PageNumber: activePage?.viewData?.PagingInfo?.PageNumber
          ? activePage?.viewData?.PagingInfo?.PageNumber
          : 1,
        PageRecordCount: activePage?.viewData?.PagingInfo?.PageRecordCount
          ? activePage?.viewData?.PagingInfo?.PageRecordCount
          : 8,
      },
    },
    skip: !id,
    id: id,
  });
  const { data: detailsTotal } = useGetData<null, null>({
    url: priceConfig.getDetailUrl,
    body: {
      RepoViewId: priceConfig.detailsRepoViewId,
      HeaderId: Number(id),
      PagingInfo: {
        PageNumber: activePage?.viewData?.PagingInfo?.PageNumber
          ? activePage?.viewData?.PagingInfo?.PageNumber
          : 1,
        PageRecordCount: activePage?.viewData?.PagingInfo?.PageRecordCount
          ? activePage?.viewData?.PagingInfo?.PageRecordCount
          : 8,
      },
    },
    skip: !id,
    id: id,
  });

  useEffect(() => {
    let initialFormData;

    if (id) {
      if (formIsSuccess && detailsDataIsSuccess) {
        const formDefaultVal = formData?.Data?.[0];
        const detailsDefaultVal = detailsData?.Data;
        setTotalCount(detailsTotal?.TotalCount);

        initialFormData = priceConfig.formData.map((item) => {
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
            isTitleField: item.name === priceConfig.titleField,
            value,
            originalValue,
          };
        });
        initialFormData.push({
          name: priceConfig.info.formIdField,
          type: "text",
          caption: "MainIdField",
          value: id,
          originalValue: id,
          isTitleField: false,
        });
      }
    } else {
      initialFormData = priceConfig.formData.map((item) => {
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
          isTitleField: item.name === priceConfig.titleField,
          value,
          originalValue,
        };
      });
    }

    if (!id || (formIsSuccess && detailsDataIsSuccess)) {
      dispatch(
        addNewPage({
          pageId: pageId,
          caption: priceConfig.caption,
          pageState: pageState ? pageState : PageStateEnum.Opened,
          originalPageState: originalPageState
            ? originalPageState
            : PageStateEnum.Opened,
          type: pageType,
          RepoId: repoId,
          SystemId: systemId,
          url: BaseUrl,
          pageData: initialFormData,
          pageInfo: priceConfig.info,
          toolbarData: dataToolbar?.Data,
          listUrl: priceConfig.listUrl,
          viewData: {
            PagingInfo: {
              PageNumber: 1,
              PageRecordCount: recordsPerPage,
            },
          },
          listPageId: listPageId,
        }),
      );
    }
  }, [formIsSuccess, detailsDataIsSuccess, pageId]);

  return (
    <>
      <Title caption={priceConfig.caption} />
      {(!id || (formIsSuccess && detailsDataIsSuccess)) && (
        <div className="relative">
          <div
            className={`lg:absolute lg:-top-[60px] lg:rtl:-left-[10px] -right-[10px] `}
          >
            {dataToolbar?.Result && (
              <FormToolbar
                listUrl={priceConfig.listUrl}
                toolbarData={dataToolbar?.Data}
                isEdit={isEdit}
                id={Number(id)}
                fieldKey={priceConfig.info.formIdField}
                form={form}
              />
            )}
          </div>
          <div>
            {detailInitialData && (
              <PriceComponent
                columnsConfig={priceConfig.columnsConfig}
                detailCaption="اقلام لیست"
                detailInitialData={detailInitialData}
                isEdit={isEdit}
                totalCount={totalCount}
                isLoading={isLoading}
                form={form}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
