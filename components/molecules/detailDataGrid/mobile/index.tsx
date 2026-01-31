import "./table.css";

import {
  ForwardedRef,
  forwardRef,
  ReactElement,
  Ref,
  useEffect,
  useImperativeHandle,
  useReducer,
  useState,
} from "react";

import { Menu, MenuProps, Spin, Table, TableColumnsType } from "antd";
import moment from "moment-jalaali";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { shallowEqual, useDispatch } from "react-redux";

import { CustomModal } from "@components/atoms/defaultElements";
import { CustomDrawer } from "@components/atoms/defaultElements/drawer";
import {
  Dots,
  Edit,
  NoData,
  SpinIcon,
  TrashBin,
  Undo,
  VoucherItemsIcon,
} from "@components/atoms/iconComponents";
import { arrayMove } from "@dnd-kit/sortable";
import { useDarkMode } from "@hooks/custom";
import { useAppSelector } from "@redux/index";
import { useCUDDataMutation } from "@services/base";
import {
  type IDetail,
  type IDetailColumnConfig,
  RowStateEnum,
} from "@services/generalType/type";
import { setPageData } from "@slice/pages";
import { getColoredIcon } from "@utils/core";

import * as Icons from "@components/atoms/iconComponents";
import type { IActions } from "../type";
import {
  EditRowForm,
  RenderSelectField,
  RenderStaticField,
} from "./renderField";
import type { IChildHandle, IProps } from "./type";

type PropsWithGeneric<T> = IProps<T>;

function MobileDetailDataGridInner<T extends IDetail>(
  {
    detailInitialData,
    columnsConfig,
    fieldKey,
    alternateKey,
    detailCaption,
    detailKey,
    isEdit,
    conditionRenderer,
    contentHeight,
    additionalActions = [],
    additionalFunction,
    calcIndependentValue,
    isLoading = false,
    currentPage = 1,
    setPage = null,
    totalCount,
    setShowForm,
  }: PropsWithGeneric<T>,
  ref: ForwardedRef<IChildHandle>
) {
  const { mode = "light" } = useDarkMode();

  const t = useTranslations();
  const params = useSearchParams();
  const headerId = params.get("id");
  const pageDataDispatch = useDispatch();
  const deviceHeight = window.innerHeight;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(null);
  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages.find(
        (item) => item.isActive === true
      ),
    }),
    shallowEqual
  );
  const storedDetails: any = activePage?.pageData?.find(
    (item) => item.name === detailKey
  )?.value;

  const [trigger] = useCUDDataMutation();

  const reducer = (state: T[], action: IActions<T>): T[] => {
    switch (action.type) {
      case "ADD_DATA_SOURCE": {
        const { payload, insertAfterIndex } = action;

        if (
          typeof insertAfterIndex === "number" &&
          insertAfterIndex >= 0 &&
          insertAfterIndex < state.length
        ) {
          return [
            ...state.slice(0, insertAfterIndex + 1),
            ...payload,
            ...state.slice(insertAfterIndex + 1),
          ];
        }

        return [...state, ...payload];
      }
      case "UPDATE_ROW":
        return state.map((item, index) =>
          index === action.payload.index
            ? item[fieldKey] !== undefined
              ? {
                  ...item,
                  ...action.payload.data,
                  RowState: RowStateEnum.Update,
                }
              : {
                  ...item,
                  ...action.payload.data,
                  RowState: RowStateEnum.Add,
                }
            : item
        );
      case "DELETE_ROW":
        if (state[action.payload.index][fieldKey]) {
          return state.map((item) =>
            item[fieldKey] === action.payload.data[fieldKey]
              ? {
                  ...item,
                  RowState: RowStateEnum.Delete,
                }
              : item
          );
        } else {
          return state.filter((_, index) => index !== action.payload.index);
        }
      case "UNDO_DELETE_ROW":
        if (state[action.payload.index][fieldKey]) {
          return state.map((item) =>
            item[fieldKey] === action.payload.data[fieldKey]
              ? {
                  ...item,
                  RowState: RowStateEnum.Update,
                }
              : item
          );
        } else {
          return null;
        }

      case "RESET_DATA":
        return action.payload;
      case "MOVE": {
        const { activeId, overId } = action.payload;
        const activeIndex = state.findIndex(
          (record) => record[fieldKey] === activeId
        );
        const overIndex = state.findIndex(
          (record) => record[fieldKey] === overId
        );
        return arrayMove(state, activeIndex, overIndex);
      }

      default:
        return state;
    }
  };

  const [selectedRows, setSelectedRows] = useState<T[]>();
  const [openMobileActionDrawer, setOpenMobileActionDrawer] = useState(false);

  const [detailData, dispatchDetailData] = useReducer(
    reducer,
    detailInitialData
  );

  const columns: TableColumnsType<T> = columnsConfig
    ?.filter((item) => item.mobileRender)
    ?.map((config) => {
      const { fieldName, fieldCaption, fieldType, staticConfig } = config;
      switch (fieldType) {
        // case "index":
        //   return {
        //     title: fieldCaption,
        //     width: 90,
        //     // fixed: "right" as const,
        //     dataIndex: fieldName,
        //     key: fieldName,
        //     render: (_: any, record: IVoucherDetails, index: number) =>
        //       renderActionButton(record, index),
        //   };
        case "price":
          return {
            title: fieldCaption,
            width: 120,
            dataIndex: fieldName,
            key: fieldName,
            render: (_: any, record: T) => {
              return (
                <div
                  id={fieldName}
                  className="flex items-center rounded !w-[120px] h-[2.1rem] cursor-default"
                >
                  {record[fieldName]
                    ? record[fieldName]?.toLocaleString("fa-IR")
                    : ""}
                </div>
              );
            },
          };
        case "changeablePrice":
          return {
            title: fieldCaption,
            width: 120,
            dataIndex: fieldName,
            key: fieldName,
            render: (_: any, record: T) => {
              return (
                <div
                  id={fieldName}
                  className="flex items-center rounded !w-[120px] h-[2.1rem] cursor-default"
                >
                  {record[fieldName]
                    ? record[fieldName]?.toLocaleString("fa-IR")
                    : ""}
                </div>
              );
            },
          };
        case "unChangeablePrice":
          return {
            title: fieldCaption,
            width: 120,
            dataIndex: fieldName,
            key: fieldName,
            render: (_: any, record: T) => {
              return (
                <div
                  id={fieldName}
                  className="flex items-center rounded !w-[120px] h-[2.1rem] cursor-default"
                >
                  {record[fieldName]
                    ? record[fieldName]?.toLocaleString("fa-IR")
                    : ""}
                </div>
              );
            },
          };
        case "selectOption":
          return {
            title: fieldCaption,
            width: 200,
            dataIndex: fieldName,
            key: fieldName,
            render: (_: any, record: T) => {
              return (
                <RenderSelectField config={config} value={record[fieldName]} />
              );
            },
          };
        case "treeOption":
          return {
            title: fieldCaption,
            width: 200,
            dataIndex: fieldName,
            key: fieldName,
            render: (_: any, record: T) => {
              return (
                <RenderSelectField config={config} value={record[fieldName]} />
              );
            },
          };
        case "static":
          return {
            title: fieldCaption,
            width: 120,
            dataIndex: fieldType,
            key: fieldName,
            render: (_: any, record: T) => (
              <RenderStaticField
                record={record}
                field={fieldName}
                staticConfig={staticConfig}
              />
            ),
          };

        case "boolean":
          return {
            title: fieldCaption,
            width: 90,
            dataIndex: fieldType,
            key: fieldName,
            render: (_: any, record: T) => {
              const fieldValues = record[fieldName] ? "✔" : "✘";

              return (
                <div
                  id={fieldName}
                  className="flex items-center rounded !w-[90px] h-[2.1rem] cursor-default"
                >
                  <span className="ps-6">{fieldValues}</span>
                </div>
              );
            },
          };
        case "date":
          return {
            title: fieldCaption,
            width: 120,
            dataIndex: fieldType,
            key: fieldName,
            render: (_: any, record: T) => {
              const fieldValues = record[fieldName]
                ? moment(record[fieldName]).locale("fa").format("jYYYY/jMM/jDD")
                : "-";

              return (
                <div
                  id={fieldName}
                  className="flex items-center rounded !w-[120px] h-[2.1rem] cursor-default"
                >
                  {fieldValues}
                </div>
              );
            },
          };

        default:
          return {
            title: fieldCaption,
            dataIndex: fieldName,
            ellipsis: true,
            width: 170,
            key: fieldName,
          };
      }
    });

  const editableKeys =
    columns &&
    columns
      .filter(
        (i: any) =>
          i.dataIndex !== "index" &&
          i.dataIndex !== fieldKey &&
          i.dataIndex !== "static"
      )
      .map((i) => i.key as string);

  const createNewRow = (rowNumber: number): T => {
    const newRow = editableKeys.reduce((acc, key) => {
      if (key === "RowNum") {
        acc[key] = rowNumber;
      } else {
        acc[key] = undefined;
      }
      return acc;
    }, {} as Record<string, any>);

    newRow.key = Math.floor(Math.random() * 100000);
    newRow.RowState = RowStateEnum.Add;
    newRow.RowNum = rowNumber;
    newRow[fieldKey] = undefined;
    newRow.addedPage = currentPage;
    return newRow as T;
  };
  const handleAdd = (index: number) => {
    const rowNumber = detailData[index]?.RowNum
      ? detailData[index].RowNum + 1
      : 1;

    const newRow = createNewRow(rowNumber);

    dispatchDetailData({
      type: "ADD_DATA_SOURCE",
      payload: [newRow],
      insertAfterIndex: index,
    });
  };

  useImperativeHandle(ref, () => ({
    mobileHandleAdd,
  }));

  const mobileHandleAdd = () => {
    const newIndex = detailData.length - 1;
    handleAdd(newIndex);
    setSelectedRowIndex(newIndex + 1);
    setIsEditModalOpen(true);
  };

  const handleDelete = (index: number, record: T) => {
    record.RowState !== RowStateEnum.Delete
      ? dispatchDetailData({
          type: "DELETE_ROW",
          payload: {
            data: record,
            index: index,
          },
        })
      : dispatchDetailData({
          type: "UNDO_DELETE_ROW",
          payload: {
            data: record,
            index: index,
          },
        });
  };

  const handleReplicateRow = (record: T, index: number) => {
    const rowData = detailData[index];
    if (rowData.RowState !== RowStateEnum.Delete) {
      const currentRowNum = rowData.RowNum;
      const copyRecord = {
        ...record,
        RowState: RowStateEnum.Add,
        VoucherDetailId: undefined,
        key: Math.floor(Math.random() * 1000),
        RowNum: currentRowNum ? currentRowNum : index + 1,
        addedPage: currentPage,
      };
      // handleEdit(index + 1, "AccountId");
      dispatchDetailData({
        type: "ADD_DATA_SOURCE",
        payload: [copyRecord],
        insertAfterIndex: index,
      });
    }
  };

  const additionalActionItems = additionalActions?.map((action, i) => {
    const Icon = Icons[action.icon];
    return {
      key: String(i + 7),
      icon: Icon ? <Icon config={{ width: 18, height: 18 }} /> : undefined,
      disabled:
        typeof action.disabled === "function"
          ? action.disabled()
          : action.disabled,
      label: (
        <span
          className="flex ps-2 text-sm"
          onClick={() =>
            action.handler({
              record: detailData[selectedRowIndex],
              index: selectedRowIndex,
              field: "",
              helpers: {
                detailData: detailData,
                dispatchDetailData: dispatchDetailData,
              },
            })
          }
        >
          {action.label}
        </span>
      ),
    };
  });

  const mobileActions: MenuProps["items"] = [
    {
      key: "0",
      type: "item",
      className: "py-4",
      label: (
        <span
          className="flex ps-2 text-sm"
          onClick={() => {
            setIsEditModalOpen(true);
          }}
        >
          {t("general.showAndEditDetail")}
        </span>
      ),
      icon: <Edit config={{ width: 18, height: 18 }} />,
    },
    {
      key: "4",
      type: "item",
      className: "py-4",
      label: (
        <span
          className="flex ps-2 text-sm"
          onClick={() =>
            handleReplicateRow(detailData[selectedRowIndex], selectedRowIndex)
          }
        >
          {t("general.replicateRow")}
        </span>
      ),
      icon: <VoucherItemsIcon config={{ width: 18, height: 18 }} />,
    },
    ...additionalActionItems,
    {
      key: "10",
      type: "item",
      className: "py-4",
      label: (
        <span
          className="flex ps-2 font-bold text-red-400 text-sm"
          onClick={() => {
            handleDelete(selectedRowIndex, detailData[selectedRowIndex]);
          }}
        >
          {t("general.delete")}
        </span>
      ),
      icon: <TrashBin config={{ width: 18, height: 18, stroke: "#f00" }} />,
    },
  ];

  // console.log("editState", editState);
  // console.log("renderCondition", renderCondition);
  // console.log("detailData", detailData);
  // console.log("storedDetails", storedDetails);
  // console.log("currentPage", currentPage);
  // console.log("selectedRows", selectedRows);
  // console.log("columns", columns);

  useEffect(() => {
    const details: T[] = detailInitialData.map((item: T) => {
      return {
        ...item,
        RowState: item.RowState ? item.RowState : RowStateEnum.None,
        key: item[fieldKey]
          ? item[fieldKey]
          : Math.floor(Math.random() * 100000),
      };
    });

    if (storedDetails) {
      const storedMap = Object?.fromEntries(
        storedDetails?.map((item) => [item.key, item])
      );
      const result = details.map((detail) => {
        if (storedMap[detail.key]) {
          return { ...detail, ...storedMap[detail.key] };
        }
        return detail;
      });

      const finalResult: T[] = Object.values(
        Object.assign({}, ...result.map((item) => ({ [item.key]: item })))
      );

      const addedRows = storedDetails.filter(
        (item) =>
          // item.RowState === RowStateEnum.Add && item.addedPage === currentPage
          item.RowState === RowStateEnum.Add
      );

      const finalOutput = addedRows
        ? [...finalResult, ...addedRows]
        : finalResult;
      const sortedFinalOutput = finalOutput.sort((a, b) => a.RowNum - b.RowNum);

      const uniqueFinalOutput = [
        ...new Map(sortedFinalOutput.map((item) => [item.key, item])).values(),
      ];

      dispatchDetailData({ type: "RESET_DATA", payload: uniqueFinalOutput });
    } else {
      dispatchDetailData({ type: "RESET_DATA", payload: details });
    }
  }, [detailInitialData]);

  useEffect(() => {
    if (detailData.length === 0) {
      handleAdd(0);
    }

    if (detailData?.length > 0) {
      additionalFunction && additionalFunction(detailData);
    }

    if (!isEdit) {
      pageDataDispatch(
        setPageData({
          caption: detailCaption,
          name: detailKey,
          type: "array",
          value: detailData,
        })
      );
    } else {
      const previousDetailStoreData = detailInitialData?.map((item) => ({
        ...item,
      }));
      const cleanedData = detailData?.filter((item) =>
        editableKeys?.some((key) => item[key] !== undefined)
      );
      const updatedExistData = cleanedData
        ?.filter(
          (item) =>
            item.RowState === RowStateEnum.Add ||
            item.RowState === RowStateEnum.Delete ||
            item.RowState === RowStateEnum.Update
        )
        ?.map((item) => {
          const previousItem = previousDetailStoreData.find(
            (prev) => prev[fieldKey] === item[fieldKey]
          );
          const changeFields = [];
          if (previousItem) {
            Object.entries(item).forEach(([key, value]) => {
              if (
                key !== "ChangeFields" &&
                previousItem[key] !== value &&
                key !== "key" &&
                key !== "RowState" &&
                key !== "TaxItems" &&
                key !== "AddElement" &&
                key !== "DiscountItems" &&
                key !== "MoadianCode" &&
                key !== "LegalFunds" &&
                key !== "TaxFunds" &&
                key !== "LegalFundsAmount" &&
                key !== "TaxFundsAmount" &&
                key !== "AddElementDetailItems" &&
                key !== "IsPriceApply" &&
                key !== "IsPriceChange"
              ) {
                changeFields.push(key);
              }
            });
          }
          const filteredChangeFields =
            changeFields.length > 0 &&
            changeFields.filter((field) => {
              if (field.endsWith("Id")) return true;
              if (changeFields.includes(field + "Id")) return false;
              return true;
            });
          return changeFields.length > 0
            ? {
                ...item,
                ChangeFields: filteredChangeFields ?? [],
              }
            : {
                ...item,
              };
        });
      if (updatedExistData) {
        const uniqueStoredData = storedDetails?.filter(
          (item) =>
            item.addedPage !== currentPage &&
            !updatedExistData?.some((el) => el.key === item.key)
        );

        pageDataDispatch(
          setPageData({
            caption: detailCaption,
            name: detailKey,
            type: "array",
            value:
              storedDetails && storedDetails.length > 0
                ? [...uniqueStoredData, ...updatedExistData]
                : updatedExistData,
          })
        );
      }
    }
  }, [detailData]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (scrollTop + clientHeight >= scrollHeight - 10 && !isLoading) {
      const receivedDataCount = detailInitialData?.length;
      if (totalCount > receivedDataCount) {
        setPage && setPage((prev) => prev + 1);
      }
    }
    if (scrollTop === 0) {
      setShowForm(true);
    }
  };

  return (
    <>
      <Table
        className="customTable"
        loading={{
          spinning: isLoading,
          indicator: <Spin size="large" indicator={<SpinIcon />} />,
        }}
        tableLayout="auto"
        onRow={(record, index) => ({
          className: `${
            record.RowState === RowStateEnum.Delete
              ? "line-through text-xl text-gray-gray8"
              : record.RowState === RowStateEnum.Add
              ? "bg-blue-blue11"
              : ""
          }`,
        })}
        scroll={{
          x: "max-content",
          y: contentHeight ? deviceHeight - contentHeight - 40 : 110,
        }}
        locale={{
          emptyText: (
            <div className="flex flex-col justify-center items-center gap-2">
              <NoData config={{ width: 60, height: 60 }} />

              <span className="text-gray-gray9 text-sm">
                {t("general.noData")}
              </span>
              <span
                onClick={() => handleAdd(0)}
                className="bg-black-black95 hover:bg-gray-gray5 p-2 border-1 rounded text-white hover:text-black-black95"
              >
                {t("general.addNew")}
              </span>
            </div>
          ),
        }}
        size="large"
        pagination={false}
        rowKey={(record) => (record.key ? record.key : record[fieldKey])}
        columns={columns}
        dataSource={detailData}
        onScroll={handleScroll}
        rowSelection={{
          renderCell: (_value, _record, _index, originNode) => {
            return (
              <div className="flex gap-2">
                <div className="flex justify-between items-center">
                  {originNode}
                </div>
                {_record?.RowState !== RowStateEnum.Delete ? (
                  <div
                    onClick={() => {
                      setSelectedRowIndex(_index);
                      setSelectedRows([detailData[_index]]);
                      setOpenMobileActionDrawer(true);
                    }}
                  >
                    <Dots config={{ width: 22, height: 22 }} />
                  </div>
                ) : (
                  <div onClick={() => handleDelete(_index, _record)}>
                    <Undo config={{ width: 22, height: 22 }} />
                  </div>
                )}
              </div>
            );
          },
          type: "checkbox",
          selectedRowKeys: selectedRows?.map((items) => items.key),
          onChange: (selectedRowKeys, selectedRows) => {
            selectedRowKeys && setSelectedRows(selectedRows);
          },
          getCheckboxProps: (record) => ({
            disabled: record?.RowState === RowStateEnum.Delete,
            name: record?.key?.toString(),
          }),
        }}
      />

      <CustomDrawer
        isOpen={openMobileActionDrawer}
        onClose={() => {
          setOpenMobileActionDrawer(false);
          setSelectedRowIndex(null);
          setSelectedRows([]);
        }}
        content={
          <Menu
            onClick={() => setOpenMobileActionDrawer(false)}
            style={{ width: "100%", border: "none" }}
            defaultSelectedKeys={["1"]}
            defaultOpenKeys={["1"]}
            mode="inline"
            items={mobileActions}
          />
        }
      />
      {isEditModalOpen && (
        <CustomModal
          headerName={t("general.rowEdit")}
          // contentClassName="h-full"
          closeModal={() => {
            setIsEditModalOpen(false);
            setSelectedRowIndex(null);
          }}
          isModalOpen={isEditModalOpen}
          content={
            <EditRowForm
              recordIndex={selectedRowIndex}
              alternateKey={alternateKey}
              configs={columnsConfig.filter(
                (item) => item.fieldName !== "index"
              )}
              handleSave={() => {
                setIsEditModalOpen(false);
                setSelectedRowIndex(null);
              }}
              detailData={detailData}
              dispatchDetailData={dispatchDetailData}
              conditionRenderer={conditionRenderer}
              calcIndependentValue={calcIndependentValue}
            />
          }
        />
      )}
    </>
  );
}

export const MobileDetailDataGrid = forwardRef(MobileDetailDataGridInner) as <
  T extends IDetail
>(
  props: IProps<T> & { ref?: Ref<IChildHandle> }
) => ReactElement;
