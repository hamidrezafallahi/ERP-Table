"use client";

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

import { Spin, Table, TableColumnsType } from "antd";
import moment from "moment-jalaali";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";

import {
  CustomButton,
  CustomDropdownButton,
  CustomSelect,
  CustomTooltip,
  NewDatePicker,
} from "@components/atoms/defaultElements";
import CustomInputNumber from "@components/atoms/defaultElements/inputNumber";
import InputText from "@components/atoms/defaultElements/inputText";
import {
  Dots,
  NoData,
  SpinIcon,
  TrashBin,
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
import { useCUDDataMutation } from "@services/base";
import { RowStateEnum } from "@services/generalType/type";
import { setPageData } from "@slice/pages";
import { findNearestTrueValue, showSuccessToast } from "@utils/core";

import { RenderSelectField } from "./renderSelectField";
import type {
  IActions,
  IDetailCondition,
  IProps,
  IState,
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

export const WithdrawalDataGrid: FC<IProps> = ({
  detailInitialData,
  isEdit,
  accountData,
  rpWayData,
  fieldKey,
}) => {
  let detailKey: string;
  let detailCaption: string;

  const detailMap: Record<string, { key: string; caption: string }> = {
    BankStatementId: { key: "BankStatements", caption: "حساب بانکی" },
    TankhahStatementId: { key: "TankhahStatements", caption: "تنخواه" },
    CashStatementId: { key: "CashStatements", caption: "صندوق" },
    TafsiliStatementId: { key: "TafsiliStatements", caption: "افراد" },
  };

  if (detailMap[fieldKey]) {
    detailKey = detailMap[fieldKey].key;
    detailCaption = detailMap[fieldKey].caption;
  } else {
    detailKey = "";
    detailCaption = "";
  }
  const t = useTranslations();
  const params = useSearchParams();
  const headerId = params.get("id");
  const pageDataDispatch = useDispatch();

  const [trigger] = useCUDDataMutation();

  const reducer = (state: IState[], action: IActions): IState[] => {
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
              : { ...item, ...action.payload.data, RowState: RowStateEnum.Add }
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
  const [editState, setEditState] = useState<{
    key: number;
    field: keyof IDetailCondition;
  }>({ key: 0, field: "VoucherDate" });
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [renderCondition, setRenderCondition] = useState<IDetailCondition[]>(
    []
  );
  const [selectedRows, setSelectedRows] = useState<IState[]>();
  const [allowCopy, setAllowCopy] = useState(false);

  const [detailData, dispatchDetailData] = useReducer(
    reducer,
    detailInitialData
  );

  const realDetailData = detailData?.filter(
    (item) => item.RowState !== RowStateEnum.Delete
  );

  const columns: TableColumnsType<IState> = dynamicColumns?.map((config) => {
    const { fieldName, fieldCaption, fieldType, dynamicValue } = config;
    switch (fieldType) {
      case "index":
        return {
          title: fieldCaption,
          width: 90,
          // fixed: "right" as const,
          dataIndex: fieldName,
          key: fieldName,
          render: (_: any, record: IState, index: number) => (
            <div className="flex justify-between items-center">
              <DragHandle index={index + 1} />
              {renderActionButton(record, index)}
            </div>
          ),
        };
      case "rpWaySelect":
        return {
          title: fieldCaption,
          width: 170,
          ellipsis: true,
          dataIndex: fieldName,
          key: fieldName,
          render: (_: any, record: IState, index: number) =>
            renderSelect(record, index, fieldName),
        };
      case "selectOption":
        return {
          title: fieldCaption,
          width: 170,
          ellipsis: true,
          dataIndex: fieldName,
          key: fieldName,
          render: (_: any, record: IState, index: number) => (
            <RenderSelectField
              defaultData={detailInitialData[index] ?? null}
              realDetailData={realDetailData}
              dynamicValue={dynamicValue}
              editState={editState}
              field={fieldName}
              handleEdit={handleEdit}
              index={index}
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
          width: fieldName === "FishNumber" ? 90 : 170,
          key: fieldName,
          render: (_: any, record: IState, index: number) =>
            renderInputText(record, index, fieldName),
        };
      case "number":
        return {
          title: fieldCaption,
          width: 110,
          dataIndex: fieldName,
          key: fieldName,
          render: (_: any, record: IState, index: number) =>
            renderInputNumber(record, index, fieldName),
        };
      case "price":
        return {
          title: fieldCaption,
          width: 140,
          dataIndex: fieldName,
          key: fieldName,
          render: (_: any, record: IState, index: number) =>
            renderInputPrice(record, index, fieldName),
        };
      case "date":
        return {
          title: fieldCaption,
          width: 140,
          dataIndex: fieldName,
          key: fieldName,
          render: (_: any, record: IState, index: number) =>
            renderInputDate(record, index, fieldName),
        };
      default:
        return null;
    }
  });

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

  const onTextChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: keyof IDetailCondition,
    index: number
  ) => {
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
  };

  const onDateChange = (
    value: string,
    field: keyof IDetailCondition,
    index: number
  ) => {
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
  };

  const onNumberChange = (
    value,
    field: keyof IDetailCondition,
    index: number
  ) => {
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
  };
  const onSelectChange = (
    newValue,
    field: keyof IDetailCondition,
    index: number,
    rowData: IState
  ) => {
    let updatedRow;
    if (newValue) {
      const selectedAccountId = rpWayData.find(
        (item) => item._SelectId === newValue
      )?.AccountId;

      const account = accountData.find(
        (item) => item.AccountId === selectedAccountId
      );

      updatedRow = {
        index,
        data: {
          [field]: newValue,
          RpWay: {
            RPWayId: newValue,
            VoucherTypeId: undefined,
            AccountId: selectedAccountId,
          },
          TafsiliId: account?.HasTafsili ? rowData.TafsiliId : undefined,
          FifthId: account?.HasFifth ? rowData.FifthId : undefined,
          SixthId: account?.HasSixth ? rowData.SixthId : undefined,
          SeventhId: account?.HasSeventh ? rowData.SeventhId : undefined,
          EightId: account?.HasEight ? rowData.EightId : undefined,
          NineId: account?.HasNine ? rowData.NineId : undefined,
          TenId: account?.HasTen ? rowData.TenId : undefined,
          ElevenId: account?.HasEleven ? rowData.ElevenId : undefined,
          TwelveId: account?.HasTwelve ? rowData.TwelveId : undefined,
          ThirteenId: account?.HasThirteen ? rowData.ThirteenId : undefined,
        },
      };
    } else {
      updatedRow = {
        index,
        data: {
          [field]: newValue,
          RpWay: {
            RPWayId: undefined,
            VoucherTypeId: undefined,
            AccountId: undefined,
          },
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

    if (field === "RpWayId") {
      dispatchDetailData({
        type: "UPDATE_ROW",
        payload: updatedRow,
      });
    }
  };

  const handleMoveOldItem = async ({ activeData, overIndex }) => {
    try {
      const moveResult = await trigger({
        url: "api/acc/changeRowNumber/voucherDetail",
        body: {
          HeaderId: headerId,
          DetailId: activeData[fieldKey],
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
    const activeData = realDetailData.find(
      (item) => item[fieldKey] === active.id
    );
    const overIndex = realDetailData.findIndex((item) => item.key === over.id);

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
    const newRow: IState = {
      RowNum: index + 1,
      RowState: RowStateEnum.Add,
      key: Math.floor(Math.random() * 100000),
      [fieldKey]: undefined,
      VoucherDate: undefined,
      VoucherDesc: undefined,
      Price: undefined,
      FishNumber: undefined,
      RpWayId: undefined,
      RpWay: {
        AccountId: undefined,
        RPWayId: undefined,
        VoucherTypeId: undefined,
      },
    };

    dispatchDetailData({
      type: "ADD_DATA_SOURCE",
      payload: [newRow],
      insertAfterIndex: index,
    });
  };
  const handleEdit = (index: number, field: keyof IDetailCondition) => {
    setEditState({ key: index, field });
  };
  const handleDelete = (index: number, record: IState) => {
    dispatchDetailData({
      type: "DELETE_ROW",
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
    ] as keyof IDetailCondition;

    if (currentFieldIndex < fieldKeys.length - 1) {
      handleEdit(editState.key, nextField);
    } else {
      handleAdd(index);
      handleEdit(index + 1, "VoucherDate");
    }
  };

  const handleReplicateRow = (record: IState, index: number) => {
    const copyRecord = {
      ...record,
      RowState: RowStateEnum.Add,
      [fieldKey]: undefined,
      key: Math.floor(Math.random() * 1000),
      RowNum: index + 1,
    };
    handleEdit(index + 1, "VoucherDate");
    dispatchDetailData({
      type: "ADD_DATA_SOURCE",
      payload: [copyRecord],
      insertAfterIndex: index,
    });
  };

  const handleGroupPasteRow = (index: number) => {
    let newDetailsData = [...realDetailData];
    selectedRows.forEach((selectedRow) => {
      newDetailsData = newDetailsData.filter(
        (row) => row.key !== selectedRow.key
      );
    });
    newDetailsData.splice(index + 1, 0, ...selectedRows);

    setSelectedRows([]);
    setAllowCopy(false);
    dispatchDetailData({
      type: "RESET_DATA",
      payload: newDetailsData,
    });
  };

  const handleGroupPasteRowAsNew = (index: number) => {
    const copyRecords = selectedRows.map((item, idx) => {
      return {
        ...item,
        RowState: RowStateEnum.Add,
        key: Math.floor(Math.random() * 1000),
        [fieldKey]: undefined,
        RowNum: index + idx + 1,
      };
    });

    setSelectedRows([]);
    setAllowCopy(false);
    dispatchDetailData({
      type: "ADD_DATA_SOURCE",
      payload: copyRecords,
      insertAfterIndex: index,
    });
  };

  const handleGroupDelete = () => {
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
  };

  const handleDuplicateFromUpperRow = (
    index: number,
    field: keyof IDetailCondition
  ) => {
    const targetValue = realDetailData[index - 1];

    if (targetValue && targetValue[field]) {
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
  // console.log("realDetailData", realDetailData);
  // console.log("selectedRows", selectedRows);
  // console.log("columns", columns);
  // console.log("detailKey", detailKey);
  // console.log("fieldKey", fieldKey);
  // console.log("detailCaption", detailCaption);

  const handleKeyAction = (
    event: KeyboardEvent<any>,
    record: IState,
    index: number
  ) => {
    let focusedKey = editState.key !== null ? editState.key : index;
    let focusedField = editState.field || "VoucherDate";

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
            ] as keyof IDetailCondition;
          } else if (index < realDetailData.length - 1) {
            focusedKey = index + 1;
            focusedField = "VoucherDate";
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
          if (index < realDetailData.length - 1) focusedKey = index + 1;
          break;
        case "ArrowRight":
          if (currentFieldIndex > 0) {
            focusedField = fieldKeys[
              currentFieldIndex - 1
            ] as keyof IDetailCondition;
          }
          break;
        case "ArrowLeft":
          if (currentFieldIndex < fieldKeys.length - 1) {
            focusedField = fieldKeys[
              currentFieldIndex + 1
            ] as keyof IDetailCondition;
          }
          break;
        case "c":
          if (event.ctrlKey) {
            event.preventDefault();
            handleReplicateRow(record, index);
            return;
          }
          break;

        case "d":
          if (event.ctrlKey) {
            event.preventDefault();
            handleDuplicateFromUpperRow(index, editState.field);
            return;
          }
          break;
        case "Enter":
          if (event.ctrlKey) {
            handleAdd(index);
            handleEdit(index + 1, "VoucherDate");
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
        handleEdit(focusedKey, newFocusedField as keyof IDetailCondition);
      } else {
        handleEdit(focusedKey, "FishNumber");
      }
    }
  };

  const selectRpWayData = rpWayData.map((item) => {
    return {
      key: item._SelectId,
      title: item._SelectDisplay,
      value: item._SelectId,
      label: `${item._SelectId} - ${item._SelectDisplay}`,
    };
  });

  const renderActionButton = (record: IState, index: number) => {
    return (
      <div className="flex items-center">
        <CustomButton
          className="p-0"
          type="text"
          onClick={() => handleDelete(index, record)}
        >
          <TrashBin config={{ width: 16, height: 16 }} />
        </CustomButton>
        <CustomDropdownButton
          placement="bottom"
          className="flex m-0 p-0 rounded"
          items={[
            {
              key: "1",
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
              key: "2",
              label: (
                <span
                  className="flex text-sm"
                  onClick={() => {
                    handleAdd(index);
                    handleEdit(index + 1, "VoucherDate");
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
              key: "3",
              disabled: selectedRows && selectedRows?.length > 0 ? false : true,
              label: (
                <span
                  className="flex text-sm"
                  onClick={() => {
                    setAllowCopy(true);
                  }}
                >
                  {t("general.copy")}
                </span>
              ),
              // extra: "Ctrl + Enter",
            },
            {
              key: "4",
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
              key: "5",
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
              key: "6",
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
      </div>
    );
  };

  const renderSelect = (
    record: IState,
    index: number,
    field: keyof IDetailCondition
  ) => {
    const rowData = realDetailData[index];
    const value =
      typeof rowData[field] === "number" ? rowData[field] : undefined;

    const selectedData = selectRpWayData.find((item) => item.value === value);

    const isEditing = editState.key === index && editState.field === field;

    return isEditing ? (
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
        options={selectRpWayData}
        onChange={(newValue) => onSelectChange(newValue, field, index, rowData)}
        onSearch={(value) => {
          const correctOption = findOptionWithTitle(selectRpWayData, value);

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
    record: IState,
    index: number,
    field: keyof IDetailCondition
  ) => {
    const rowData = realDetailData[index];
    const isEditing = editState.key === index && editState.field === field;
    const value =
      typeof rowData[field] === "string" ? rowData[field] : undefined;

    return isEditing ? (
      <InputText
        id={field}
        className={`${
          field === "FishNumber" ? "!w-[90px]" : "!w-[170px]"
        } !bg-white !h-fit`}
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
          className={`${
            field === "FishNumber" ? "!w-[90px]" : "!w-[170px]"
          } flex items-center rounded  h-[2.1rem]`}
          onClick={() => handleEdit(index, field)}
        >
          {value}
        </div>
      </CustomTooltip>
    );
  };
  const renderInputDate = (
    record: IState,
    index: number,
    field: keyof IDetailCondition
  ) => {
    const rowData = realDetailData[index];
    const isEditing = editState.key === index && editState.field === field;
    const value =
      typeof rowData[field] === "string" ? rowData[field] : undefined;

    const defaultValue = moment(value).locale("fa").format("jYYYY/jMM/jDD");
    // const date = new Date(
    //   moment(value, "jYYYY-jMM-jDD").format()
    // ).toISOString();

    return isEditing ? (
      <NewDatePicker
        className="!bg-white rounded !w-[120px] !h-fit"
        onChange={(date) => onDateChange(date as string, field, index)}
        // defaultValue={dayjs(date)}
      />
    ) : (
      <CustomTooltip title={rowData && value && defaultValue}>
        <div
          id={field}
          className="flex items-center rounded !w-[120px] h-[2.1rem]"
          onClick={() => handleEdit(index, field)}
        >
          {defaultValue}
        </div>
      </CustomTooltip>
    );
  };
  const renderInputNumber = (
    record: IState,
    index: number,
    field: keyof IDetailCondition
  ) => {
    const rowData = realDetailData[index];
    const isEditing = editState.key === index && editState.field === field;
    const value =
      typeof rowData[field] === "number" ? rowData[field] : undefined;

    return isEditing ? (
      <CustomInputNumber
        controls={false}
        prefix=""
        min={0}
        id={field}
        keyboard={false}
        className="!bg-white !rounded !w-[110px] !h-fit"
        value={rowData && value !== null ? value : 0}
        onChange={(value) => {
          onNumberChange(value, field, index);
        }}
        autoFocus={isEditing}
      />
    ) : (
      <div
        id={field}
        className="flex items-center rounded !w-[110px] h-[2.1rem]"
        onClick={() => handleEdit(index, field)}
      >
        <span className="ps-2">
          {rowData ? value?.toLocaleString("fa-IR") : ""}
        </span>
      </div>
    );
  };
  const renderInputPrice = (
    record: IState,
    index: number,
    field: keyof IDetailCondition
  ) => {
    const rowData = realDetailData[index];
    const isEditing = editState.key === index && editState.field === field;
    const value =
      typeof rowData[field] === "number" ? rowData[field] : undefined;

    return isEditing ? (
      <CustomInputNumber
        controls={false}
        prefix=""
        min={0}
        id={field}
        keyboard={false}
        className="!bg-white !rounded !w-[140px] !h-fit"
        parser={(value) =>
          value?.replace(/\$\s?|(,*)/g, "") as unknown as number
        }
        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        value={rowData && value !== null ? value : 0}
        onChange={(value) => {
          onNumberChange(value, field, index);
        }}
        autoFocus={isEditing}
      />
    ) : (
      <div
        id={field}
        className="flex items-center rounded !w-[140px] h-[2.1rem]"
        onClick={() => handleEdit(index, field)}
      >
        <span className="ps-2">
          {rowData ? value?.toLocaleString("fa-IR") : ""}
        </span>
      </div>
    );
  };

  useEffect(() => {
    const details: IState[] = detailInitialData.map((item: IState) => {
      return {
        ...item,
        key: item[fieldKey]
          ? item[fieldKey]
          : Math.floor(Math.random() * 100000),
      };
    });

    dispatchDetailData({ type: "RESET_DATA", payload: details });
  }, [fieldKey]);

  useEffect(() => {
    const realData = detailData.filter(
      (item) => item.RowState !== RowStateEnum.Delete
    );

    if (realData.length === 0) {
      handleAdd(0);
    }

    if (renderCondition) {
      setRenderCondition([]);
    }
    realData?.map((item: IState) => {
      if (item?.RpWay && item?.RpWay?.AccountId) {
        const account = accountData.find(
          (el) => el.AccountId === item?.RpWay?.AccountId
        );

        account &&
          setRenderCondition((prev) => [
            ...prev,
            {
              VoucherDate: true,
              FishNumber: true,
              TankhahdarId: fieldKey === "TankhahStatementId" ? true : false,
              BankAccountId: fieldKey === "BankStatementId" ? true : false,
              CashierId: fieldKey === "CashStatementId" ? true : false,
              RpWayId: true,
              TafsiliId: account?.HasTafsili ? true : false,
              FifthId: account?.HasFifth ? true : false,
              SixthId: account?.HasSixth ? true : false,
              SeventhId: account?.HasSeventh ? true : false,
              EightId: account?.HasEight ? true : false,
              NineId: account?.HasNine ? true : false,
              TenId: account?.HasTen ? true : false,
              ElevenId: account?.HasEleven ? true : false,
              TwelveId: account?.HasTwelve ? true : false,
              ThirteenId: account?.HasThirteen ? true : false,
              Price: true,
              VoucherDesc: true,

              // BankStatementId: fieldKey === "BankStatementId" ? true : false,
              // CashStatementId: fieldKey === "CashStatementId" ? true : false,
              // TafsiliStatementId:
              //   fieldKey === "TafsiliStatementId" ? true : false,
              // TankhahStatementId:
              //   fieldKey === "TankhahStatementId" ? true : false,
            },
          ]);
      } else {
        setRenderCondition((prev) => [
          ...prev,
          {
            VoucherDate: true,
            FishNumber: true,
            TankhahdarId: fieldKey === "TankhahStatementId" ? true : false,
            CashierId: fieldKey === "CashStatementId" ? true : false,
            BankAccountId: fieldKey === "BankStatementId" ? true : false,
            RpWayId: true,
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
            Price: true,
            VoucherDesc: true,

            // BankStatementId: fieldKey === "BankStatementId" ? true : false,
            // CashStatementId: fieldKey === "CashStatementId" ? true : false,
            // TafsiliStatementId:
            //   fieldKey === "TafsiliStatementId" ? true : false,
            // TankhahStatementId:
            //   fieldKey === "TankhahStatementId" ? true : false,
          },
        ]);
      }
    });

    if (!isEdit) {
      pageDataDispatch(
        setPageData({
          caption: detailCaption,
          name: detailKey,
          type: "array",
          value: detailData.map((item) => {
            return {
              TafsiliId: item.TafsiliId,
              FifthId: item.FifthId,
              SixthId: item.SixthId,
              SeventhId: item.SeventhId,
              EightId: item.EightId,
              NineId: item.NineId,
              TenId: item.TenId,
              ElevenId: item.ElevenId,
              TwelveId: item.TwelveId,
              ThirteenId: item.ThirteenId,
              BankAccountId: item.BankAccountId,
              CashierId: item.CashierId,
              FishNumber: item.FishNumber,
              Price: item.Price,
              RpWayId: item.RpWayId,
              TankhahdarId: item.TankhahdarId,
              VoucherDate: item.VoucherDate,
              VoucherDesc: item.VoucherDesc,

              [fieldKey]: item[fieldKey],
            };
          }),
        })
      );
    } else {
      const updatedExistData = detailData.map((item, idx) => {
        const previousItem = detailInitialData.find(
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
              key !== "RpWay" &&
              key !== "Tafsili" &&
              key !== "Fifth" &&
              key !== "Sixth" &&
              key !== "Seventh" &&
              key !== "Eight" &&
              key !== "Nine" &&
              key !== "Ten" &&
              key !== "Eleven" &&
              key !== "Twelve" &&
              key !== "Thirteen" &&
              key !== "BankAccount" &&
              key !== "Cashier" &&
              key !== "TankhahDar"
            ) {
              changeFields.push(key);
            }
          });
        }
        return {
          TafsiliId: item.TafsiliId,
          FifthId: item.FifthId,
          SixthId: item.SixthId,
          SeventhId: item.SeventhId,
          EightId: item.EightId,
          NineId: item.NineId,
          TenId: item.TenId,
          ElevenId: item.ElevenId,
          TwelveId: item.TwelveId,
          ThirteenId: item.ThirteenId,
          BankAccountId: item.BankAccountId,
          CashierId: item.CashierId,
          FishNumber: item.FishNumber,
          Price: item.Price,
          RpWayId: item.RpWayId,
          RpWay: item.RpWay,
          TankhahdarId: item.TankhahdarId,
          VoucherDate: item.VoucherDate,
          VoucherDesc: item.VoucherDesc,
          RowNum: idx + 1,
          RowState: item.RowState,
          [fieldKey]: item[fieldKey],
          ChangeFields: changeFields.length > 0 ? changeFields : [],
          // BankStatementId: item.BankStatementId,
          // CashStatementId: item.CashStatementId,
          // TafsiliStatementId: item.TafsiliStatementId,
          // TankhahStatementId: item.TankhahStatementId,
        };
      });
      pageDataDispatch(
        setPageData({
          caption: detailCaption,
          name: detailKey,
          type: "array",
          value: updatedExistData,
        })
      );
    }
    const condition = [
      {
        fieldName: "index",
        fieldCaption: `${t("general.row")} - ${t("general.action")}`,
        fieldType: "index",
        order: 1,
      },
      {
        fieldName: "VoucherDate",
        fieldCaption: t("general.voucherDate"),
        fieldType: "date",
        order: 2,
      },
      {
        fieldName: "FishNumber",
        fieldCaption: "شماره فیش",
        fieldType: "text",
        order: 3,
      },
      // {
      // fieldName: "",
      // fieldCaption: "دستور پرداخت",
      // fieldType: "selectOption",
      // order: 5,
      // dynamicValue: {
      //     endpoint: "/api/acc/select/tafsiliLevel4",
      //   },
      // },
      {
        fieldName: "RpWayId",
        fieldCaption: "نحوه دریافت و پرداخت",
        fieldType: "rpWaySelect",
        order: 6,
        dynamicValue: {
          endpoint: "api/trh/select/rpWay4voucher",
          repoViewId: null,
        },
      },
    ];

    if (fieldKey === "BankStatementId") {
      condition.push({
        fieldName: "BankAccountId",
        fieldCaption: "حساب بانکی",
        fieldType: "selectOption",
        dynamicValue: {
          endpoint: "api/com/select/bankAccount4SelectOption",
          repoViewId: 106081,
        },
        order: 4,
      });
    }
    if (fieldKey === "CashStatementId") {
      condition.push({
        fieldName: "CashierId",
        fieldCaption: "صندوقدار",
        fieldType: "selectOption",
        dynamicValue: {
          endpoint: "/api/trh/Select/Cashier4SelectOption",
          repoViewId: 140002,
        },
        order: 4,
      });
    }
    if (fieldKey === "TankhahStatementId") {
      condition.push({
        fieldName: "TankhahdarId",
        fieldCaption: "تنخواه دار",
        fieldType: "selectOption",
        dynamicValue: {
          endpoint: "/api/trh/Select/TankhahDar4SelectOption",
          repoViewId: 140002,
        },
        order: 4,
      });
    }
    if (fieldKey === "TafsiliStatementId") {
      // condition.push({
      //   fieldName: "CashierId",
      //   fieldCaption: "صندوقدار",
      //   fieldType: "selectOption",
      //   dynamicValue: {
      //     endpoint: "api/com/select/person",
      //     repoViewId: 106069,
      //   },
      //   order: 4,
      // });
    }

    if (realDetailData.length > 0) {
      realDetailData.map((item) => {
        const accountId = item?.RpWay?.AccountId;

        if (accountId) {
          const account = accountData.find(
            (item) => item.AccountId === accountId
          );

          if (account?.HasTafsili) {
            const index = condition.findIndex(
              (item) => item.fieldName === "TafsiliId"
            );
            index === -1 &&
              condition.push({
                fieldName: "TafsiliId",
                fieldCaption: t("general.level4"),
                fieldType: "selectOption",
                order: 7,
                dynamicValue: {
                  endpoint: "/api/acc/select/tafsiliLevel4",
                  repoViewId: 10017,
                },
              });
          }
          if (account?.HasFifth) {
            const index = condition.findIndex(
              (item) => item.fieldName === "FifthId"
            );
            index === -1 &&
              condition.push({
                fieldName: "FifthId",
                fieldCaption: t("general.level5"),
                fieldType: "selectOption",
                order: 8,
                dynamicValue: {
                  endpoint: "/api/acc/select/tafsiliLevel5",
                  repoViewId: null,
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
                fieldCaption: t("general.level6"),
                fieldType: "selectOption",
                order: 9,
                dynamicValue: {
                  endpoint: "/api/acc/select/tafsiliLevel6",
                  repoViewId: null,
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
                fieldCaption: t("general.level7"),
                fieldType: "selectOption",
                order: 10,
                dynamicValue: {
                  endpoint: "/api/acc/select/tafsiliLevel7",
                  repoViewId: null,
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
                fieldCaption: t("general.level8"),
                fieldType: "selectOption",
                order: 11,
                dynamicValue: {
                  endpoint: "/api/acc/select/tafsiliLevel8",
                  repoViewId: null,
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
                fieldCaption: t("general.level9"),
                fieldType: "selectOption",
                order: 12,
                dynamicValue: {
                  endpoint: "/api/acc/select/tafsiliLevel9",
                  repoViewId: null,
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
                fieldCaption: t("general.level10"),
                fieldType: "selectOption",
                order: 13,
                dynamicValue: {
                  endpoint: "/api/acc/select/tafsiliLevel10",
                  repoViewId: null,
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
                fieldCaption: t("general.level11"),
                fieldType: "selectOption",
                order: 14,
                dynamicValue: {
                  endpoint: "/api/acc/select/tafsiliLevel11",
                  repoViewId: null,
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
                fieldCaption: t("general.level12"),
                fieldType: "selectOption",
                order: 15,
                dynamicValue: {
                  endpoint: "/api/acc/select/tafsiliLevel12",
                  repoViewId: null,
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
                fieldCaption: t("general.level13"),
                fieldType: "selectOption",
                order: 16,
                dynamicValue: {
                  endpoint: "/api/acc/select/tafsiliLevel13",
                  repoViewId: null,
                },
              });
          }
        }
      });
    }
    condition.push(
      {
        fieldName: "Price",
        fieldCaption: "مبلغ",
        fieldType: "price",
        order: 17,
      },
      {
        fieldName: "VoucherDesc",
        fieldCaption: "شرح",
        fieldType: "text",
        order: 18,
      }
    );

    const orderedCondition = condition.sort((a, b) => a.order - b.order);

    setDynamicColumns(orderedCondition);
  }, [detailData, fieldKey]);

  return (
    <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={handleDrag}>
      <SortableContext
        items={realDetailData?.map((i) => i.key)}
        strategy={verticalListSortingStrategy}
      >
        <Table
          loading={{
            spinning: false,
            indicator: <Spin size="large" indicator={<SpinIcon />} />,
          }}
          tableLayout="fixed"
          onRow={(record, index) => ({
            onKeyDown: (event) => {
              handleKeyAction(event, record, index);
            },
          })}
          scroll={{ x: "max-content", y: "calc(100dvh - 445px)" }}
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
          rowKey={(record) => (record.key ? record.key : record[fieldKey])}
          columns={columns}
          dataSource={realDetailData}
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
              disabled: record?.key?.toString() === "Disabled User",
              name: record?.key?.toString(),
            }),
          }}
        />
      </SortableContext>
    </DndContext>
  );
};
