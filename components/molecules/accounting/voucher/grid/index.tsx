import {
  ChangeEvent,
  createContext,
  CSSProperties,
  FC,
  KeyboardEvent,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";

import { InputNumber, Spin, Table, TableColumnsType } from "antd";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { shallowEqual, useDispatch } from "react-redux";

import {
  CustomButton,
  CustomDropdownButton,
  CustomSelect,
  CustomTooltip,
} from "@components/atoms/defaultElements";
import InputText from "@components/atoms/defaultElements/inputText";
import {
  Dots,
  NoData,
  SpinIcon,
  TrashBin,
  Undo,
} from "@components/atoms/iconComponents";
import type { DragEndEvent } from "@dnd-kit/core";
import { DndContext } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAppSelector } from "@redux/index";
import type { IVoucherDetails } from "@services/acc/voucherDetails/type";
import { useCUDDataMutation } from "@services/base";
import { RowStateEnum } from "@services/generalType/type";
import { setPageData } from "@slice/pages";
import { findNearestTrueValue, showSuccessToast } from "@utils/core";

import { RenderSelectField } from "./renderSelectField";
import type {
  IActions,
  IProps,
  IVoucherDetailCondition,
  RowContextProps,
  RowProps,
} from "./type";

const RowContext = createContext<RowContextProps>({});

const DragHandle = ({ index }) => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);
  return (
    <span style={{ cursor: "move" }} ref={setActivatorNodeRef} {...listeners}>
      {index}
    </span>
  );
};

const Row: FC<RowProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props["data-row-key"] });

  const style: CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging
      ? {
          position: "relative",
          zIndex: 9999,
          backgroundColor: "dark:bg-gray-gray85",
        }
      : {}),
  };

  const contextValue = useMemo<RowContextProps>(
    () => ({ setActivatorNodeRef, listeners }),
    [setActivatorNodeRef, listeners]
  );

  return (
    <RowContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  );
};

export const VoucherDataGrid: FC<IProps> = ({
  detailInitialData,
  isEdit,
  accountData,
  setVoucherTotal,
  isLoading,
  currentPage,
}) => {
  const t = useTranslations();
  const params = useSearchParams();
  const headerId = params.get("id");
  const pageDataDispatch = useDispatch();
  const { activePage, lang } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages.find(
        (item) => item.isActive === true
      ),
      lang: state.withPersist.config.lang,
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
  const [editState, setEditState] = useState<{
    key: number;
    field: keyof IVoucherDetailCondition;
  }>({ key: 0, field: "AccountId" });
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [renderCondition, setRenderCondition] = useState<
    IVoucherDetailCondition[]
  >([]);
  const [selectedRows, setSelectedRows] = useState<IVoucherDetails[]>();
  const [allowCopy, setAllowCopy] = useState(false);

  const [detailData, dispatchDetailData] = useReducer(
    reducer,
    detailInitialData
  );

  const realDetailData = detailData.filter(
    (item) => item.RowState !== RowStateEnum.Delete
  );

  const columns: TableColumnsType<IVoucherDetails> = dynamicColumns?.map(
    (config) => {
      const { fieldName, fieldCaption, fieldType, dynamicValue, level } =
        config;
      switch (fieldType) {
        case "index":
          return {
            title: fieldCaption,
            width: 90,
            // fixed: "right" as const,
            dataIndex: fieldName,
            key: fieldName,
            render: (_: any, record: IVoucherDetails, index: number) => (
              <div className="flex justify-between items-center">
                {/* <DragHandle index={index + 1} /> */}
                <DragHandle index={record.RowNum} />
                {renderActionButton(record, index)}
              </div>
            ),
          };
        case "accountSelect":
          return {
            title: fieldCaption,
            width: 170,
            ellipsis: true,
            dataIndex: fieldName,
            key: fieldName,
            render: (_: any, record: IVoucherDetails, index: number) =>
              renderSelect(record, index, fieldName),
          };
        case "selectOption":
          return {
            title: fieldCaption,
            width: 170,
            ellipsis: true,
            dataIndex: fieldName,
            key: fieldName,
            render: (_: any, record: IVoucherDetails, index: number) => (
              <RenderSelectField
                realDetailData={detailData}
                dynamicValue={dynamicValue}
                editState={editState}
                field={fieldName}
                handleEdit={handleEdit}
                index={index}
                level={level}
                dispatchDetailData={dispatchDetailData}
                renderCondition={renderCondition}
              />
            ),
          };
        case "text":
          return {
            title: fieldCaption,
            dataIndex: fieldName,
            ellipsis: true,
            width: 170,
            key: fieldName,
            render: (_: any, record: IVoucherDetails, index: number) =>
              renderInputText(record, index, fieldName),
          };
        case "number":
          return {
            title: fieldCaption,
            width: 150,
            dataIndex: fieldName,
            key: fieldName,
            render: (_: any, record: IVoucherDetails, index: number) =>
              renderInputNumber(record, index, fieldName),
          };
        default:
          return null;
      }
    }
  );

  // const transformDataToTree = (data: IAccount[]) => {
  //   return data?.map((item) => {
  //     return {
  //       key: item.AccountId,
  //       title: `${item.AccountFullCode} - ${item.AccountDesc}`,
  //       value: item.AccountId,
  //       disabled: item.Accounts && item.Accounts.length > 0 ? true : false,
  //       children:
  //         item.Accounts && item.Accounts.length > 0
  //           ? transformDataToTree(item.Accounts)
  //           : undefined,
  //     };
  //   });
  // };
  // const findNodeInTree = (tree, value: number) => {
  //   if (!Array.isArray(tree)) return null;
  //   for (let node of tree) {
  //     if (node.value === value) return node;
  //     const found = findNodeInTree(node.children, value);
  //     if (found) return found;
  //   }
  //   return null;
  // };
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

  const onTextChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: keyof IVoucherDetailCondition,
    index: number
  ) => {
    const rowData = detailData[index];
    if (rowData?.RowState !== RowStateEnum.Delete) {
      const value = e.target.value;
      const updatedRow = {
        index,
        data: {
          [field]: value,
        },
      };

      dispatchDetailData({
        type: "UPDATE_ROW",
        payload: updatedRow,
      });
    }
  };
  const onNumberChangeDebtorCreditor = (
    value: number,
    field: "Bes" | "Bed",
    index: number
  ) => {
    const rowData = detailData[index];
    if (rowData.RowState !== RowStateEnum.Delete) {
      let data = {
        Bes: 0,
        Bed: 0,
      };
      data[field] = +value;
      const updatedRow = {
        index,
        data,
      };

      dispatchDetailData({
        type: "UPDATE_ROW",
        payload: updatedRow,
      });
    }
  };
  const onNumberChange = (
    value,
    field: keyof IVoucherDetailCondition,
    index: number
  ) => {
    const rowData = detailData[index];
    if (rowData?.RowState !== RowStateEnum.Delete) {
      const updatedRow = {
        index,
        data: {
          [field]: +value,
        },
      };

      dispatchDetailData({
        type: "UPDATE_ROW",
        payload: updatedRow,
      });
    }
  };
  const onSelectChange = (
    newValue,
    field: keyof IVoucherDetailCondition,
    index: number,
    rowData: IVoucherDetails
  ) => {
    if (rowData?.RowState !== RowStateEnum.Delete) {
      let updatedRow;
      if (newValue) {
        const account = accountData.find((item) => item.AccountId === newValue);
        // const account =
        //   tree?.Data &&
        //   findItemInNestedData<IAccount>(tree?.Data, "AccountId", newValue);
        updatedRow = {
          index,
          data: {
            [field]: newValue,
            TafsiliId: account.HasTafsili ? rowData.TafsiliId : undefined,
            FifthId: account.HasFifth ? rowData.FifthId : undefined,
            SixthId: account.HasSixth ? rowData.SixthId : undefined,
            SeventhId: account.HasSeventh ? rowData.SeventhId : undefined,
            EightId: account.HasEight ? rowData.EightId : undefined,
            NineId: account.HasNine ? rowData.NineId : undefined,
            TenId: account.HasTen ? rowData.TenId : undefined,
            ElevenId: account.HasEleven ? rowData.ElevenId : undefined,
            TwelveId: account.HasTwelve ? rowData.TwelveId : undefined,
            ThirteenId: account.HasThirteen ? rowData.ThirteenId : undefined,
          },
        };
      } else {
        updatedRow = {
          index,
          data: {
            [field]: newValue,
            TafsiliId: undefined,
            FifthId: undefined,
            SixthId: undefined,
            SeventhId: undefined,
            EightId: undefined,
            NineId: undefined,
            TenId: undefined,
            ElevenId: undefined,
            TwelveId: undefined,
            ThirteenId: undefined,
          },
        };
      }

      if (field === "AccountId") {
        // const selectedAccount = findNodeInTree(treeData, newValue);
        // if (selectedAccount && selectedAccount.disabled) {
        //   return;
        // }

        dispatchDetailData({
          type: "UPDATE_ROW",
          payload: updatedRow,
        });
      }
    }
  };

  const handleMoveOldItem = async ({ activeData, overIndex }) => {
    try {
      const moveResult = await trigger({
        url: "api/acc/changeRowNumber/voucherDetail",
        body: {
          HeaderId: headerId,
          DetailId: activeData.VoucherDetailId,
          NewRowNum: overIndex + 1,
        },
        id: null,
      }).unwrap();

      if (moveResult?.Result === "Success") {
        showSuccessToast(t("toast.save"));
      }
    } catch (error) {
      null;
    }
  };

  const handleDrag = ({ active, over }: DragEndEvent) => {
    const activeData = detailData.find(
      (item) => item.VoucherDetailId === active.id
    );
    const overIndex = detailData.findIndex((item) => item.key === over.id);

    if (active.id !== over?.id) {
      if (isEdit && activeData) {
        handleMoveOldItem({ activeData, overIndex });
      }

      dispatchDetailData({
        type: "MOVE",
        payload: { activeId: Number(active.id), overId: Number(over.id) },
      });
    }
  };

  const handleAdd = (index: number) => {
    const currentRowNum = detailData.find((item, idx) => idx === index)?.RowNum;
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
      insertAfterIndex: index,
    });
  };
  const handleEdit = (index: number, field: keyof IVoucherDetailCondition) => {
    setEditState({ key: index, field });
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
  const handleSave = (index: number) => {
    const targetItem = renderCondition[index];
    const fieldKeys = Object.keys(targetItem).filter((key) => targetItem[key]);
    const currentFieldIndex = fieldKeys.indexOf(editState.field);
    const nextField = fieldKeys[
      currentFieldIndex + 1
    ] as keyof IVoucherDetailCondition;

    if (currentFieldIndex < fieldKeys.length - 1) {
      handleEdit(editState.key, nextField);
    } else {
      handleAdd(index);
      handleEdit(index + 1, "AccountId");
    }
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
  const handleSwapDebtorCreditor = (record: IVoucherDetails, index: number) => {
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
      handleEdit(index + 1, "AccountId");
      dispatchDetailData({
        type: "ADD_DATA_SOURCE",
        payload: [copyRecord],
        insertAfterIndex: index,
      });
    }
  };

  const handleGroupPasteRow = (index: number) => {
    let newDetailsData = [...detailData];
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach((selectedRow) => {
        newDetailsData = newDetailsData.filter(
          (row) => row.key !== selectedRow.key
        );
      });
      newDetailsData?.splice(index + 1, 0, ...selectedRows);

      setSelectedRows([]);
      setAllowCopy(false);
      dispatchDetailData({
        type: "RESET_DATA",
        payload: newDetailsData,
      });
    }
  };

  const handleGroupPasteRowAsNew = (index: number) => {
    if (selectedRows && selectedRows.length > 0) {
      const copyRecords = selectedRows?.map((item, idx) => {
        const currentRowNum = detailData.find(
          (item, idxx) => idxx === index
        )?.RowNum;
        return {
          ...item,
          RowState: RowStateEnum.Add,
          key: Math.floor(Math.random() * 1000),
          VoucherDetailId: undefined,
          RowNum: currentRowNum ? currentRowNum : index + idx + 1,
          addedPage: currentPage,
        };
      });

      setSelectedRows([]);
      setAllowCopy(false);
      dispatchDetailData({
        type: "ADD_DATA_SOURCE",
        payload: copyRecords,
        insertAfterIndex: index,
      });
    }
  };

  const handleGroupDelete = () => {
    if (selectedRows && selectedRows.length > 0) {
      setSelectedRows([]);
      setAllowCopy(false);
      selectedRows.map((item) => {
        dispatchDetailData({
          type: "DELETE_ROW",
          payload: {
            index: detailData.findIndex((el) => el.key === item.key),
            data: item,
          },
        });
      });
    }
  };

  const handleDuplicateFromUpperRow = (
    index: number,
    field: keyof IVoucherDetailCondition
  ) => {
    const targetValue = detailData[index - 1];

    if (
      targetValue.RowState !== RowStateEnum.Delete &&
      targetValue &&
      targetValue[field]
    ) {
      const updatedRow = {
        index,
        data: {
          [field]: targetValue[field],
        },
      };

      dispatchDetailData({
        type: "UPDATE_ROW",
        payload: updatedRow,
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

  const handleKeyAction = (
    event: KeyboardEvent<any>,
    record: IVoucherDetails,
    index: number
  ) => {
    let focusedKey = editState.key !== null ? editState.key : index;
    let focusedField = editState.field || "AccountId";

    const targetItem = renderCondition[index];
    if (targetItem) {
      const fieldKeys = Object?.keys(targetItem).filter(
        (key) => targetItem[key]
      );
      const currentFieldIndex = fieldKeys.indexOf(editState.field);

      switch (event.key) {
        case "Tab":
          event.preventDefault();
          event.stopPropagation();

          if (currentFieldIndex < fieldKeys.length - 1) {
            focusedField = fieldKeys[
              currentFieldIndex + 1
            ] as keyof IVoucherDetailCondition;
          } else if (index < detailData.length - 1) {
            focusedKey = index + 1;
            focusedField = "AccountId";
          } else if (currentFieldIndex === fieldKeys.length - 1) {
            focusedKey = index + 1;
            handleSave(index);
            return;
          }
          break;
        case "ArrowUp":
          if (index > 0) focusedKey = index - 1;
          break;
        case "ArrowDown":
          if (index < detailData.length - 1) focusedKey = index + 1;
          break;
        case "ArrowRight":
          if (currentFieldIndex > 0) {
            focusedField = fieldKeys[
              currentFieldIndex - 1
            ] as keyof IVoucherDetailCondition;
          }
          break;
        case "ArrowLeft":
          if (currentFieldIndex < fieldKeys.length - 1) {
            focusedField = fieldKeys[
              currentFieldIndex + 1
            ] as keyof IVoucherDetailCondition;
          }
          break;
        case "c":
          if (event.ctrlKey) {
            event.preventDefault();
            event.stopPropagation();
            handleReplicateRow(record, index);
            return;
          }
          break;
        case "r":
          if (event.ctrlKey) {
            event.preventDefault();
            event.stopPropagation();
            handleSwapDebtorCreditor(record, index);
            return;
          }
          break;
        case "s":
          if (event.ctrlKey) {
            event.preventDefault();
            event.stopPropagation();
            handleAdjustToZeroBalance(index);
            return;
          }
          break;
        case "d":
          if (event.ctrlKey) {
            event.preventDefault();
            event.stopPropagation();
            handleDuplicateFromUpperRow(index, editState.field);
            return;
          }
          break;
        case "Enter":
          if (event.ctrlKey) {
            handleAdd(index);
            handleEdit(index + 1, "AccountId");
            return;
          } else {
            handleSave(index);
            return;
          }
          break;

        default:
          return;
      }
    }
    if (
      renderCondition[focusedKey] &&
      renderCondition[focusedKey][focusedField]
    ) {
      handleEdit(focusedKey, focusedField);
    } else {
      const condition = renderCondition[focusedKey];
      const newFocusedField = findNearestTrueValue(condition, focusedField);

      if (newFocusedField) {
        handleEdit(
          focusedKey,
          newFocusedField as keyof IVoucherDetailCondition
        );
      } else {
        handleEdit(focusedKey, "DetailDesc");
      }
    }
  };
  
  // const treeData = useMemo(() => transformDataToTree(tree?.Data), [tree]);

  const selectAccountData = accountData.map((item) => {
    return {
      key: item.AccountId,
      title: item.AccountDesc,
      value: item.AccountId,
      label: `${item.AccountId} - ${item.AccountDesc}`,
    };
  });

  const renderActionButton = (record: IVoucherDetails, index: number) => {
    return (
      <div className="flex items-center">
        <CustomTooltip
          title={record?.RowState !== RowStateEnum.Delete ? "حذف" : "بازگردانی"}
        >
          <CustomButton
            className="p-0"
            type="text"
            onClick={() => handleDelete(index, record)}
          >
            {record?.RowState !== RowStateEnum.Delete ? (
              <TrashBin config={{ width: 16, height: 16 }} />
            ) : (
              <Undo config={{ width: 16, height: 16 }} />
            )}
          </CustomButton>
        </CustomTooltip>
        {record?.RowState !== RowStateEnum.Delete && (
          <CustomDropdownButton
            placement={lang === "fa" ? "bottomRight" : "bottomLeft"}
            className="flex m-0 p-0 rounded"
            items={[
              {
                key: "1",
                label: (
                  <span
                    className="flex text-sm"
                    onClick={() => handleAdjustToZeroBalance(index)}
                  >
                    {t("general.adjustToZeroBalance")}
                  </span>
                ),
                extra: "Ctrl + S",
              },
              {
                key: "2",
                label: (
                  <span
                    className="flex text-sm"
                    onClick={() =>
                      handleDuplicateFromUpperRow(index, editState.field)
                    }
                  >
                    {t("general.duplicateFromUpperRow")}
                  </span>
                ),
                extra: "Ctrl + D",
              },
              {
                key: "3",
                label: (
                  <span
                    className="flex text-sm"
                    onClick={() => handleSwapDebtorCreditor(record, index)}
                  >
                    {t("general.swapDebtorCreditor")}
                  </span>
                ),
                extra: "Ctrl + R",
              },
              {
                key: "4",
                label: (
                  <span
                    className="flex text-sm"
                    onClick={() => handleReplicateRow(record, index)}
                  >
                    {t("general.replicateRow")}
                  </span>
                ),
                extra: "Ctrl + C",
              },
              {
                key: "5",
                label: (
                  <span
                    className="flex text-sm"
                    onClick={() => {
                      handleAdd(index);
                      handleEdit(index + 1, "AccountId");
                    }}
                  >
                    {t("general.addNewRow")}
                  </span>
                ),
                extra: "Ctrl + Enter",
              },
              {
                type: "divider",
              },
              {
                key: "6",
                disabled:
                  selectedRows && selectedRows?.length > 0 ? false : true,
                label: (
                  <span
                    className="flex text-sm"
                    onClick={() => {
                      if (selectedRows?.length > 0) {
                        setAllowCopy(true);
                      }
                    }}
                  >
                    {t("general.copy")}
                  </span>
                ),
                // extra: "Ctrl + Enter",
              },
              {
                key: "7",
                disabled: !allowCopy,
                label: (
                  <span
                    className="flex text-sm"
                    onClick={() => {
                      handleGroupPasteRow(index);
                    }}
                  >
                    {t("general.paste")}
                  </span>
                ),
                // extra: "Ctrl + Enter",
              },
              {
                key: "8",
                disabled: !allowCopy,
                label: (
                  <span
                    className="flex text-sm"
                    onClick={() => {
                      handleGroupPasteRowAsNew(index);
                    }}
                  >
                    {t("general.pasteAsNew")}
                  </span>
                ),
                // extra: "Ctrl + Enter",
              },
              {
                key: "9",
                label: (
                  <span
                    className="flex text-sm"
                    onClick={() => {
                      handleGroupDelete();
                    }}
                  >
                    {t("general.selectedGroupDelete")}
                  </span>
                ),
                // extra: "Ctrl + Enter",
              },
            ]}
          >
            <a className="cursor-pointer" onClick={(e) => e.preventDefault()}>
              <Dots config={{ width: 18, height: 18 }} />
            </a>
          </CustomDropdownButton>
        )}
      </div>
    );
  };

  const renderSelect = (
    record: IVoucherDetails,
    index: number,
    field: keyof IVoucherDetailCondition
  ) => {
    const rowData = detailData[index];
    const value =
      typeof rowData[field] === "number" ? rowData[field] : undefined;

    // const selectedData = findNodeInTree(treeData, value);
    const selectedData = selectAccountData.find((item) => item.value === value);

    const isEditing = editState.key === index && editState.field === field;

    return isEditing ? (
      // <TreeSelect
      //   className="!bg-white !m-0 !p-0 !border-[0.4px] !border-gray-gray7 rounded !w-[170px] !h-fit"
      //   id={field}
      //   showSearch
      //   treeNodeFilterProp="title"
      //   popupMatchSelectWidth={400}
      //   placement="bottomRight"
      //   value={rowData ? value : ""}
      //   dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
      //   placeholder={t("general.search")}
      //   allowClear
      //   treeData={treeData}
      //   onChange={(newValue) =>
      //     onTreeSelectChange(newValue, field, index, rowData)
      //   }
      //   onSearch={(value) => {
      //     const correctOption = findOptionWithTitle(treeData, value);
      //     if (correctOption.length === 1) {
      //       onTreeSelectChange(correctOption[0].value, field, index, rowData);
      //     }
      //   }}
      //   autoFocus={isEditing}
      // />
      <CustomSelect
        id={field}
        className="!bg-white !border-[0.4px] !border-gray-gray7 !w-[170px] !h-fit"
        showSearch
        allowClear
        popupMatchSelectWidth={400}
        value={rowData ? rowData[field] : undefined}
        placeholder={t("general.search")}
        filterOption={(input, option) => {
          const label = option?.label;
          return (
            typeof label === "string" &&
            label.toLowerCase().includes(input.toLowerCase())
          );
        }}
        options={selectAccountData}
        onChange={(newValue) => onSelectChange(newValue, field, index, rowData)}
        onSearch={(value) => {
          const correctOption = findOptionWithTitle(selectAccountData, value);

          if (correctOption.length === 1) {
            onSelectChange(correctOption[0].value, field, index, rowData);
          }
        }}
        autoFocus={isEditing}
      />
    ) : (
      <CustomTooltip title={selectedData?.title}>
        <span
          id={field}
          className="flex items-center rounded !w-[170px] h-[2.1rem]"
          onClick={() => handleEdit(index, field)}
        >
          {selectedData?.title}
        </span>
      </CustomTooltip>
    );
  };

  const renderInputText = (
    record: IVoucherDetails,
    index: number,
    field: keyof IVoucherDetailCondition
  ) => {
    const rowData = detailData[index];
    const isEditing = editState.key === index && editState.field === field;
    const value =
      typeof rowData[field] === "string" ? rowData[field] : undefined;

    return isEditing ? (
      <InputText
        id={field}
        className="!bg-white !w-[170px] !h-fit"
        value={rowData && value !== null ? value : ""}
        onChange={(e) => {
          onTextChange(e, field, index);
        }}
        autoFocus={isEditing}
      />
    ) : (
      <CustomTooltip title={rowData && value}>
        <div
          id={field}
          className="flex items-center rounded !w-[170px] h-[2.1rem]"
          onClick={() => handleEdit(index, field)}
        >
          {value}
        </div>
      </CustomTooltip>
    );
  };

  const renderInputNumber = (
    record: IVoucherDetails,
    index: number,
    field: keyof IVoucherDetailCondition
  ) => {
    const rowData = detailData[index];
    const isEditing = editState.key === index && editState.field === field;
    const value =
      typeof rowData[field] === "number" ? rowData[field] : undefined;

    return isEditing ? (
      <InputNumber
        controls={false}
        prefix=""
        min={0}
        id={field}
        keyboard={false}
        className="!bg-white !rounded !w-[150px] !h-fit"
        parser={(value) =>
          value?.replace(/\$\s?|(,*)/g, "") as unknown as number
        }
        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        value={rowData && value !== null ? value : 0}
        onChange={(value) => {
          if (field === "Bes" || field === "Bed") {
            if (!rowData.AccountId) {
              handleEdit(index, "AccountId");
            } else {
              onNumberChangeDebtorCreditor(value, field, index);
            }
          } else {
            onNumberChange(value, field, index);
          }
        }}
        autoFocus={isEditing}
      />
    ) : (
      // <CustomTooltip title={rowData ? rowData[field]?.toLocaleString("fa-IR") : ""}>
      <div
        id={field}
        className="flex items-center rounded !w-[150px] h-[2.1rem]"
        onClick={() => handleEdit(index, field)}
      >
        <span className="ps-2">
          {rowData ? value?.toLocaleString("fa-IR") : ""}
        </span>
      </div>
      // </CustomTooltip>
    );
  };

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
          item.RowState === RowStateEnum.Add && item.addedPage === currentPage
      );

      const finalOutput = addedRows
        ? [...finalResult, ...addedRows]
        : finalResult;
      const sortedFinalOutput = finalOutput.sort((a, b) => a.RowNum - b.RowNum);

      const uniqueFinalOutput = [
        ...new Map(sortedFinalOutput.map((item) => [item.key, item])).values(),
      ];
      dispatchDetailData({ type: "RESET_DATA", payload: finalOutput });
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
    if (renderCondition) {
      setRenderCondition([]);
    }
    detailData?.map((item: IVoucherDetails) => {
      if (item.AccountId) {
        const account = accountData.find(
          (el) => el.AccountId === item.AccountId
        );

        // const account =
        //   tree?.Data &&
        //   findItemInNestedData<IAccount>(
        //     tree?.Data,
        //     "AccountId",
        //     item.AccountId
        //   );
        account &&
          setRenderCondition((prev) => [
            ...prev,
            {
              AccountId: true,
              TafsiliId: account.HasTafsili ? true : false,
              FifthId: account.HasFifth ? true : false,
              SixthId: account.HasSixth ? true : false,
              SeventhId: account.HasSeventh ? true : false,
              EightId: account.HasEight ? true : false,
              NineId: account.HasNine ? true : false,
              TenId: account.HasTen ? true : false,
              ElevenId: account.HasEleven ? true : false,
              TwelveId: account.HasTwelve ? true : false,
              ThirteenId: account.HasThirteen ? true : false,
              DetailDesc: true,
              Bes: true,
              Bed: true,
            },
          ]);
      } else {
        setRenderCondition((prev) => [
          ...prev,
          {
            AccountId: true,
            TafsiliId: false,
            FifthId: false,
            SixthId: false,
            SeventhId: false,
            EightId: false,
            NineId: false,
            TenId: false,
            ElevenId: false,
            TwelveId: false,
            ThirteenId: false,
            DetailDesc: true,
            Bes: true,
            Bed: true,
          },
        ]);
      }
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
    const condition = [
      {
        fieldName: "index",
        fieldCaption: `${t("general.row")} - ${t("general.action")}`,
        fieldType: "index",
        order: 1,
      },
      {
        fieldName: "AccountId",
        fieldCaption: t("general.accountTitle"),
        fieldType: "accountSelect",
        order: 2,
      },
      {
        fieldName: "TafsiliId",
        level: 4,
        fieldCaption: t("general.tafsili"),
        fieldType: "selectOption",
        order: 3,
        dynamicValue: {
          endpoint: "/api/acc/select/tafsiliLevel4",
          repoViewId: 10017,
        },
      },
    ];

    if (detailData.length > 0) {
      detailData.map((item) => {
        const accountId = item.AccountId;
        if (accountId) {
          const account = accountData.find(
            (item) => item.AccountId === accountId
          );
          // const account =
          //   tree?.Data &&
          //   findItemInNestedData<IAccount>(tree?.Data, "AccountId", accountId);

          if (account?.HasFifth) {
            const index = condition.findIndex(
              (item) => item.fieldName === "FifthId"
            );
            index === -1 &&
              condition.push({
                fieldName: "FifthId",
                level: 5,
                fieldCaption: t("general.level5"),
                fieldType: "selectOption",
                order: 4,
                dynamicValue: {
                  endpoint: "/api/acc/select/tafsiliLevel5",
                  repoViewId: 10017,
                },
              });
          }
          if (account?.HasSixth) {
            const index = condition.findIndex(
              (item) => item.fieldName === "SixthId"
            );
            index === -1 &&
              condition.push({
                fieldName: "SixthId",
                level: 6,
                fieldCaption: t("general.level6"),
                fieldType: "selectOption",
                order: 5,
                dynamicValue: {
                  endpoint: "/api/acc/select/tafsiliLevel6",
                  repoViewId: 10017,
                },
              });
          }
          if (account?.HasSeventh) {
            const index = condition.findIndex(
              (item) => item.fieldName === "SeventhId"
            );
            index === -1 &&
              condition.push({
                fieldName: "SeventhId",
                level: 7,
                fieldCaption: t("general.level7"),
                fieldType: "selectOption",
                order: 6,
                dynamicValue: {
                  endpoint: "/api/acc/select/tafsiliLevel7",
                  repoViewId: 10017,
                },
              });
          }
          if (account?.HasEight) {
            const index = condition.findIndex(
              (item) => item.fieldName === "EightId"
            );
            index === -1 &&
              condition.push({
                fieldName: "EightId",
                level: 8,
                fieldCaption: t("general.level8"),
                fieldType: "selectOption",
                order: 7,
                dynamicValue: {
                  endpoint: "/api/acc/select/tafsiliLevel8",
                  repoViewId: 10017,
                },
              });
          }
          if (account?.HasNine) {
            const index = condition.findIndex(
              (item) => item.fieldName === "NineId"
            );
            index === -1 &&
              condition.push({
                fieldName: "NineId",
                level: 9,
                fieldCaption: t("general.level9"),
                fieldType: "selectOption",
                order: 8,
                dynamicValue: {
                  endpoint: "/api/acc/select/tafsiliLevel9",
                  repoViewId: 10017,
                },
              });
          }
          if (account?.HasTen) {
            const index = condition.findIndex(
              (item) => item.fieldName === "TenId"
            );
            index === -1 &&
              condition.push({
                fieldName: "TenId",
                level: 10,
                fieldCaption: t("general.level10"),
                fieldType: "selectOption",
                order: 9,
                dynamicValue: {
                  endpoint: "/api/acc/select/tafsiliLevel10",
                  repoViewId: 10017,
                },
              });
          }
          if (account?.HasEleven) {
            const index = condition.findIndex(
              (item) => item.fieldName === "ElevenId"
            );
            index === -1 &&
              condition.push({
                fieldName: "ElevenId",
                level: 11,
                fieldCaption: t("general.level11"),
                fieldType: "selectOption",
                order: 10,
                dynamicValue: {
                  endpoint: "/api/acc/select/tafsiliLevel11",
                  repoViewId: 10017,
                },
              });
          }
          if (account?.HasTwelve) {
            const index = condition.findIndex(
              (item) => item.fieldName === "TwelveId"
            );
            index === -1 &&
              condition.push({
                fieldName: "TwelveId",
                level: 12,
                fieldCaption: t("general.level12"),
                fieldType: "selectOption",
                order: 11,
                dynamicValue: {
                  endpoint: "/api/acc/select/tafsiliLevel12",
                  repoViewId: 10017,
                },
              });
          }
          if (account?.HasThirteen) {
            const index = condition.findIndex(
              (item) => item.fieldName === "ThirteenId"
            );
            index === -1 &&
              condition.push({
                fieldName: "ThirteenId",
                level: 13,
                fieldCaption: t("general.level13"),
                fieldType: "selectOption",
                order: 12,
                dynamicValue: {
                  endpoint: "/api/acc/select/tafsiliLevel13",
                  repoViewId: 10017,
                },
              });
          }
        }
      });
    }
    condition.push(
      {
        fieldName: "DetailDesc",
        fieldCaption: t("general.rowDescription"),
        fieldType: "text",
        order: 13,
      },
      {
        fieldName: "Bes",
        fieldCaption: t("general.debit"),
        fieldType: "number",
        order: 14,
      },
      {
        fieldName: "Bed",
        fieldCaption: t("general.credit"),
        fieldType: "number",
        order: 15,
      }
    );

    const orderedCondition = condition.sort((a, b) => a.order - b.order);

    setDynamicColumns(orderedCondition);
  }, [detailData]);

  return (
    <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={handleDrag}>
      <SortableContext
        items={detailData.map((i) => i.key)}
        strategy={verticalListSortingStrategy}
      >
        <Table
          loading={{
            spinning: isLoading,
            indicator: <Spin size="large" indicator={<SpinIcon />} />,
          }}
          tableLayout="auto"
          onRow={(record, index) => ({
            onKeyDown: (event) => {
              handleKeyAction(event, record, index);
            },
            className: `${
              record.RowState === RowStateEnum.Delete
                ? "line-through text-xl text-gray-gray8"
                : record.RowState === RowStateEnum.Add
                ? "bg-blue-blue11"
                : ""
            }`,
          })}
          scroll={{ x: "max-content", y: "calc(100dvh-425px)]" }}
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
          size="small"
          pagination={false}
          rowKey={(record) =>
            record.key ? record.key : record.VoucherDetailId
          }
          columns={columns}
          dataSource={detailData}
          components={{ body: { row: Row } }}
          rowSelection={{
            renderCell: (_value, _record, _index, originNode) => {
              return (
                <>
                  <div className="flex justify-between items-center">
                    {originNode}
                  </div>
                </>
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
      </SortableContext>
    </DndContext>
  );


};
