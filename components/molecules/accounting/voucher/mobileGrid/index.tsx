import "./table.css";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useReducer,
  useState,
} from "react";

import { Menu, MenuProps, Spin, Table, TableColumnsType } from "antd";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { shallowEqual, useDispatch } from "react-redux";

import { CustomModal } from "@components/atoms/defaultElements";
import { CustomDrawer } from "@components/atoms/defaultElements/drawer";
import {
  Dots,
  Edit,
  MenuAlt,
  MenuArrowBack,
  NoData,
  SpinIcon,
  TrashBin,
  Undo,
  VoucherItemsIcon,
} from "@components/atoms/iconComponents";
import { arrayMove } from "@dnd-kit/sortable";
import { useAppSelector } from "@redux/index";
import type { IVoucherDetails } from "@services/acc/voucherDetails/type";
import { useCUDDataMutation } from "@services/base";
import { RowStateEnum } from "@services/generalType/type";
import { setPageData } from "@slice/pages";

import { EditRowForm } from "./editRowForm";
import type { IActions, IChildHandle, IProps } from "./type";

export const VoucherMobileGrid = forwardRef<IChildHandle, IProps>(
  (
    {
      detailInitialData,
      isEdit,
      accountData,
      setVoucherTotal,
      isLoading,
      currentPage,
      setPage,
      totalCount,
      setShowForm,
    },
    ref
  ) => {
    const t = useTranslations();
    const params = useSearchParams();
    const headerId = params.get("id");
    const pageDataDispatch = useDispatch();
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
      (item) => item.name === "Details"
    )?.value;

    const [trigger] = useCUDDataMutation();

    const reducer = (
      state: IVoucherDetails[],
      action: IActions
    ): IVoucherDetails[] => {
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
              ? item.VoucherDetailId !== undefined
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
          if (state[action.payload.index].VoucherDetailId) {
            return state.map((item) =>
              item.VoucherDetailId === action.payload.data.VoucherDetailId
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
          if (state[action.payload.index].VoucherDetailId) {
            return state.map((item) =>
              item.VoucherDetailId === action.payload.data.VoucherDetailId
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
            (record) => record.VoucherDetailId === activeId
          );
          const overIndex = state.findIndex(
            (record) => record.VoucherDetailId === overId
          );
          return arrayMove(state, activeIndex, overIndex);
        }

        default:
          return state;
      }
    };

    const [selectedRows, setSelectedRows] = useState<IVoucherDetails[]>();
    const [openMobileActionDrawer, setOpenMobileActionDrawer] = useState(false);
    const [detailData, dispatchDetailData] = useReducer(
      reducer,
      detailInitialData
    );

    const realDetailData = detailData.filter(
      (item) => item.RowState !== RowStateEnum.Delete
    );
    const columnConfig = [
      // {
      //   fieldName: "index",
      //   fieldCaption: "عملیات",
      //   fieldType: "index",
      // },
      {
        fieldName: "AccountId",
        fieldCaption: "سرفصل حساب",
        fieldType: "accountSelect",
      },
      {
        fieldName: "Bes",
        fieldCaption: "بدهکار",
        fieldType: "price",
      },
      {
        fieldName: "Bed",
        fieldCaption: "بستانکار",
        fieldType: "price",
      },
    ];
    const columns: TableColumnsType<IVoucherDetails> = columnConfig?.map(
      (config) => {
        const { fieldName, fieldCaption, fieldType } = config;
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
              width: 90,
              // fixed: "right" as const,
              dataIndex: fieldName,
              key: fieldName,
              render: (_: any, record: IVoucherDetails, index: number) => {
                return (
                  <span>
                    {record[fieldName]
                      ? record[fieldName]?.toLocaleString("fa-IR")
                      : ""}
                  </span>
                );
              },
            };
          case "accountSelect":
            return {
              title: fieldCaption,
              width: 170,
              ellipsis: true,
              dataIndex: fieldName,
              key: fieldName,
              render: (_: any, record: IVoucherDetails, index: number) =>
                renderAccount(record, index, fieldName),
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
      }
    );

    const findOptionWithTitle = (data, searchTerm) => {
      const results = [];
      const search = (items) => {
        items.forEach((item) => {
          if (
            item?.title?.includes(searchTerm) ||
            item?.label?.includes(searchTerm)
          ) {
            results.push(item);
          }
          if (item.children && item.children.length > 0) {
            search(item.children);
          }
        });
      };
      search(data);
      return results;
    };

    const calculateTotals = (realDetailData: IVoucherDetails[]) => {
      return realDetailData.reduce(
        (acc, item) => {
          acc.totalDebit += Number(item.Bes) || 0;
          acc.totalCredit += Number(item.Bed) || 0;
          return acc;
        },
        { totalDebit: 0, totalCredit: 0 }
      );
    };
    const { totalDebit, totalCredit } = calculateTotals(realDetailData);
    const balance = totalCredit - totalDebit;

    const handleAdd = (index: number) => {
      const currentRowNum = detailData.find(
        (item, idx) => idx === index
      )?.RowNum;
      const newRow: IVoucherDetails = {
        RowNum: currentRowNum ? currentRowNum : index + 1,
        RowState: RowStateEnum.Add,
        key: Math.floor(Math.random() * 100000),
        VoucherDetailId: undefined,
        AccountId: undefined,
        DetailDesc: undefined,
        Bed: 0,
        Bes: 0,
        addedPage: currentPage,
      };

      dispatchDetailData({
        type: "ADD_DATA_SOURCE",
        payload: [newRow],
        insertAfterIndex: detailData.length - 1,
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

    const handleDelete = (index: number, record: IVoucherDetails) => {
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

    const handleAdjustToZeroBalance = (index: number) => {
      const rowData = detailData[index];
      if (rowData?.RowState !== RowStateEnum.Delete) {
        let bes = 0;
        let bed = 0;
        const correctBalance =
          balance - detailData[index]?.Bed + detailData[index]?.Bes;
        if (correctBalance < 0) {
          bed = Math.abs(correctBalance);
        } else {
          bes = Math.abs(correctBalance);
        }

        const updatedRow = {
          index,
          data: {
            Bed: bed,
            Bes: bes,
          },
        };

        dispatchDetailData({
          type: "UPDATE_ROW",
          payload: updatedRow,
        });
      }
    };
    const handleSwapDebtorCreditor = (
      record: IVoucherDetails,
      index: number
    ) => {
      const rowData = detailData[index];
      if (rowData?.RowState !== RowStateEnum.Delete) {
        const oldBed = record.Bed;
        const oldBes = record.Bes;

        const updatedRow = {
          index,
          data: {
            Bed: oldBes,
            Bes: oldBed,
          },
        };

        dispatchDetailData({
          type: "UPDATE_ROW",
          payload: updatedRow,
        });
      }
    };
    const handleReplicateRow = (record: IVoucherDetails, index: number) => {
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

    // console.log("editState", editState);
    // console.log("renderCondition", renderCondition);
    // console.log("detailData", detailData);
    // console.log("storedDetails", storedDetails);
    // console.log("currentPage", currentPage);
    // console.log("realDetailData", realDetailData);
    // console.log("selectedRows", selectedRows);
    // console.log("columns", columns);

    // const treeData = useMemo(() => transformDataToTree(tree?.Data), [tree]);

    const selectAccountData = accountData.map((item) => {
      return {
        key: item.AccountId,
        title: item.AccountDesc,
        value: item.AccountId,
        label: `${item.AccountId} - ${item.AccountDesc}`,
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
            نمایش / ویرایش جزئیات
          </span>
        ),
        icon: <Edit config={{ width: 18, height: 18 }} />,
      },
      {
        key: "1",
        type: "item",
        className: "py-4",
        label: (
          <span
            className="flex ps-2 text-sm"
            onClick={() => handleAdjustToZeroBalance(selectedRowIndex)}
          >
            {t("general.adjustToZeroBalance")}
          </span>
        ),
        // extra: "Ctrl + S",
        icon: <MenuAlt config={{ width: 18, height: 18 }} />,
      },

      {
        key: "3",
        type: "item",
        className: "py-4",
        label: (
          <span
            className="flex ps-2 text-sm"
            onClick={() =>
              handleSwapDebtorCreditor(
                detailData[selectedRowIndex],
                selectedRowIndex
              )
            }
          >
            {t("general.swapDebtorCreditor")}
          </span>
        ),

        icon: <MenuArrowBack config={{ width: 18, height: 18 }} />,
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

    useEffect(() => {
      const details: IVoucherDetails[] = detailInitialData.map(
        (item: IVoucherDetails) => {
          return {
            ...item,
            RowState: RowStateEnum.None,
            key: item.VoucherDetailId
              ? item.VoucherDetailId
              : Math.floor(Math.random() * 100000),
          };
        }
      );

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

        const finalResult: IVoucherDetails[] = Object.values(
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
        const sortedFinalOutput = finalOutput.sort(
          (a, b) => a.RowNum - b.RowNum
        );

        const uniqueFinalOutput = [
          ...new Map(
            sortedFinalOutput.map((item) => [item.key, item])
          ).values(),
        ];

        dispatchDetailData({ type: "RESET_DATA", payload: uniqueFinalOutput });
      } else {
        dispatchDetailData({ type: "RESET_DATA", payload: details });
      }
    }, [detailInitialData]);

    useEffect(() => {
      // const realData = detailData.filter(
      //   (item) => item.RowState !== RowStateEnum.Delete
      // );

      if (detailData.length === 0) {
        handleAdd(0);
      }
      setVoucherTotal({
        balance: balance,
        credit: totalCredit,
        debit: totalDebit,
      });

      if (!isEdit) {
        pageDataDispatch(
          setPageData({
            caption: t("general.voucherDetail"),
            name: "Details",
            type: "array",
            value: detailData,
          })
        );
      } else {
        const updatedExistData = detailData
          .filter(
            (item) =>
              (item.RowState === RowStateEnum.Add && item.AccountId) ||
              item.RowState === RowStateEnum.Delete ||
              item.RowState === RowStateEnum.Update
          )
          ?.map((item, idx) => {
            const previousItem = detailInitialData.find(
              (prev) => prev.VoucherDetailId === item.VoucherDetailId
            );

            const changeFields = [];

            if (previousItem) {
              Object.entries(item).forEach(([key, value]) => {
                if (
                  key !== "ChangeFields" &&
                  previousItem[key] !== value &&
                  key !== "key" &&
                  key !== "RowState"
                ) {
                  changeFields.push(key);
                }
              });
            }
            return {
              AccountId: item.AccountId,
              TafsiliId: item.TafsiliId,
              FifthId: item.FifthId,
              SixthId: item.SixthId,
              SeventhId: item.SeventhId,
              EightId: item.EightId,
              NineId: item.NineId,
              TenId: item.TenId,
              DetailDesc: item.DetailDesc,
              Bed: item.Bed,
              Bes: item.Bes,
              RowNum: item.RowNum,
              RowState: item.RowState,
              VoucherDetailId: item.VoucherDetailId,
              ChangeFields: changeFields.length > 0 ? changeFields : [],
              key: item.key,
              addedPage: item.addedPage,
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
              caption: t("general.voucherDetail"),
              name: "Details",
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

    const renderAccount = (
      record: IVoucherDetails,
      index: number,
      field: string
    ) => {
      const rowData = detailData[index];
      const value =
        typeof rowData[field] === "number" ? rowData[field] : undefined;

      // const selectedData = findNodeInTree(treeData, value);
      const selectedData = selectAccountData.find(
        (item) => item.value === value
      );

      return (
        <span
          id={field}
          className="flex items-center rounded !w-[170px] h-[2.1rem]"
        >
          {selectedData?.title}
        </span>
      );
    };

    const handleScroll = (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

      if (scrollTop + clientHeight >= scrollHeight - 10 && !isLoading) {
        const receivedDataCount = detailInitialData?.length;
        if (totalCount > receivedDataCount) {
          setPage((prev) => prev + 1);
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
          scroll={{ x: "max-content", y: "calc(100dvh - 200px)" }}
          locale={{
            emptyText: (
              <div className="flex flex-col justify-center items-center gap-2 m-12">
                <NoData config={{ width: 60, height: 60 }} />
                <span className="text-gray-gray9 text-md">
                  {t("general.noData")}
                </span>
              </div>
            ),
          }}
          size="large"
          pagination={false}
          rowKey={(record) =>
            record.key ? record.key : record.VoucherDetailId
          }
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
                      className="z-10 w-2 h-2"
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
            headerName="ویرایش ردیف"
            contentClassName="h-full"
            closeModal={() => {
              setIsEditModalOpen(false);
              setSelectedRowIndex(null);
            }}
            isModalOpen={isEditModalOpen}
            content={
              <EditRowForm
                index={selectedRowIndex}
                findOptionWithTitle={findOptionWithTitle}
                handleSave={() => {
                  setIsEditModalOpen(false);
                  setSelectedRowIndex(null);
                }}
                selectAccountData={selectAccountData}
                accountData={accountData}
                detailData={detailData}
                dispatchDetailData={dispatchDetailData}
              />
            }
          />
        )}
      </>
    );
  }
);

VoucherMobileGrid.displayName = "VoucherMobileGrid";
