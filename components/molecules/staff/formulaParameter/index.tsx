import { useEffect, useRef, useState } from "react";

import { Divider, Pagination } from "antd";
import { useTranslations } from "next-intl";
import { shallowEqual } from "react-redux";

import { CustomButton, CustomModal } from "@components/atoms/defaultElements";
import {
  FormulaIcon,
  LeftChevron,
  RightChevron,
} from "@components/atoms/iconComponents";
import Confirmation from "@components/molecules/confirmation";
import {
  CardDynamicModal,
  TableDynamicModal,
} from "@components/molecules/dynamicModal";
import { ActionLabelsEnum } from "@components/organisms/list/enum";
import { useAppSelector } from "@redux/index";
import { useCUDDataMutation, useGetData, useGetInfinite } from "@services/base";
import type {
  IRequest,
  IStaffSpecialServices,
} from "@services/hr/staffSpecialServices/type";
import type { IToolbarMenu } from "@type/toolbar";
import { showSuccessToast } from "@utils/core";

import { config } from "./config";
import { FormulaParameterForm } from "./form";
import FormulaValues from "./formulaValues";
import type { IProps } from "./type";

export const FormulaParameter = ({ id }: IProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormulaValuesModalOpen, setIsFormulaValuesModalOpen] =
    useState(false);

  const [selectedItem, setSelectedItem] = useState<number>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  }, shallowEqual);
  const perPageCount = 5;
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  const getUrl = "api/hr/select/ActParamFormula";
  const createUrl = "api/hr/insert/ActParamFormula";
  const updateUrl = "api/hr/update/ActParamFormula";
  const deleteUrl = "api/hr/delete/ActParamFormula";
  const repoViewId = 60012;
  const fieldKey = "ActParamFormulaId";
  const staticKey = "ActParamFormulaId";

  const { data: tableData, isLoading: tableIsLoading } = useGetData<
    IStaffSpecialServices[],
    IRequest
  >({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
      ActParamId: id,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: perPageCount,
      },
    },
    skip: !match,
  });
  const { data: tableTotalCount } = useGetData<null, null>({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
      ActParamId: id,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: perPageCount,
        OnlyTotalCount: true,
      },
    },
    skip: !match,
  });

  const { data: cardData, isFetching: cardIsFetching } = useGetInfinite<
    IStaffSpecialServices[],
    IRequest
  >({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
      ActParamId: id,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: perPageCount,
      },
    },
    skip: match,
  });

  useEffect(() => {
    if (
      !match &&
      cardData?.Data?.length > 0 &&
      cardData?.ReturnCount === perPageCount
    ) {
      const observerCallback = (entries: IntersectionObserverEntry[]) => {
        if (entries[0].isIntersecting && !cardIsFetching) {
          setPageNumber((prevState) => prevState + 1);
        }
      };

      observer.current = new IntersectionObserver(observerCallback);
      const currentLastItem = lastItemRef.current;

      if (currentLastItem) observer.current.observe(currentLastItem);

      return () => {
        if (observer.current && currentLastItem)
          observer.current.unobserve(currentLastItem);
      };
    }
  }, [cardIsFetching, match, cardData?.Data?.length]);

  const [triggerItem, { isLoading: triggerIsLoading }] = useCUDDataMutation();

  const locale = useAppSelector((state) => state.withPersist.config.lang);
  const t = useTranslations();

  const handleActionClick = async (
    action: IToolbarMenu,
    item: number,
    PendingStatusId: number | null
  ) => {
    setSelectedItem(item);
    try {
      switch (action.MenuDesc) {
        case ActionLabelsEnum.Edit as string:
          break;

        case ActionLabelsEnum.Delete as string:
          setIsDeleteModalOpen(true);
          break;

        case ActionLabelsEnum.FormulaValues as string:
          setIsFormulaValuesModalOpen(true);
          break;

        default:
          null;
          break;
      }
    } catch (error) {
      null;
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const deleteResult = await triggerItem({
        url: deleteUrl,
        body: { Id: selectedItem },
      }).unwrap();

      if (deleteResult.DeleteResults[0].IsDelete === true) {
        showSuccessToast(t("toast.successTitle"));
        setSelectedItem(null);
      }
      setIsDeleteModalOpen(false);
    } catch (error) {
      null;
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 m-2">
        <FormulaParameterForm
          locale={locale}
          getUrl={getUrl}
          createUrl={createUrl}
          updateUrl={updateUrl}
          repoViewId={repoViewId}
          id={selectedItem}
          clearId={() => setSelectedItem(null)}
          sourceId={id}
          sourceKey="ActParamId"
          fieldKey={fieldKey}
        />
        <Divider className="m-2" />

        {!match ? (
          <CardDynamicModal
            actions={config.actions}
            columnsList={config.listConfig}
            data={cardData?.Data}
            onActionClick={handleActionClick}
            fieldKey={fieldKey}
            staticKey={staticKey}
            ref={lastItemRef}
          />
        ) : (
          <TableDynamicModal
            isLoading={tableIsLoading}
            actions={config.actions}
            columnsList={config.listConfig}
            data={tableData?.Data}
            handleAction={handleActionClick}
            locale={locale}
            fieldKey={fieldKey}
          />
        )}

        {tableData &&
          tableData?.Data?.length > 0 &&
          tableTotalCount?.TotalCount > perPageCount && (
            <Pagination
              className=""
              prevIcon={
                <CustomButton className="m-0 p-0 rounded w-fit">
                  <RightChevron />
                </CustomButton>
              }
              nextIcon={
                <CustomButton className="m-0 p-0 w-fit">
                  <LeftChevron />
                </CustomButton>
              }
              current={pageNumber}
              jumpNextIcon={<span>...</span>}
              jumpPrevIcon={<span>...</span>}
              pageSize={perPageCount}
              total={tableTotalCount?.TotalCount}
              showSizeChanger={false}
              onChange={(page) => setPageNumber(page)}
              showTitle={false}
            />
          )}
      </div>
      {isDeleteModalOpen && (
        <CustomModal
          width={300}
          disableTitle
          centered
          closeModal={() => setIsDeleteModalOpen(false)}
          isModalOpen={isDeleteModalOpen}
          content={
            <Confirmation
              itemsToConfirm={selectedItem}
              onCancel={() => setIsDeleteModalOpen(false)}
              onConfirm={handleDeleteConfirm}
              onLoading={triggerIsLoading}
            />
          }
        />
      )}
      {isFormulaValuesModalOpen && (
        <CustomModal
          contentClassName={`${match ? "w-[700px] !h-full " : ""}`}
          headerName={"تعریف فرمول"}
          headerIcon={<FormulaIcon />}
          headerDescription={selectedItem?.toString()}
          closeModal={() => setIsFormulaValuesModalOpen(false)}
          isModalOpen={isFormulaValuesModalOpen}
          content={
            <FormulaValues
              id={selectedItem}
              closeModal={() => setIsFormulaValuesModalOpen(false)}
            />
          }
        />
      )}
    </>
  );
};
