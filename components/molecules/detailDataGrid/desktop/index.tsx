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
  useRef,
  useState,
} from 'react';

import {
  Spin,
  Table,
  TableColumnsType,
} from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { ItemType } from 'antd/es/menu/interface';
import moment from 'moment-jalaali';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomButton,
  CustomDropdownButton,
  CustomTooltip,
  NewDatePicker,
} from '@components/atoms/defaultElements';
import CustomCheckbox from '@components/atoms/defaultElements/checkbox';
import CustomInputNumber from '@components/atoms/defaultElements/inputNumber';
import InputText from '@components/atoms/defaultElements/inputText';
import {
  ApplyIcon,
  Dots,
  NoData,
  SpinIcon,
  TrashBin,
  Undo,
} from '@components/atoms/iconComponents';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useCUDDataMutation } from '@services/base';
import {
  type IDetail,
  type IDetailColumnConfig,
  RowStateEnum,
} from '@services/generalType/type';
import { setPageData } from '@slice/pages';
import {
  checkShortcutMatch,
  findNearestTrueValue,
} from '@utils/core';
import { showSuccessToast } from '@utils/toast';

import type { IActions } from '../type';
import {
  RenderSelectField,
  RenderStaticValue,
  RenderTreeField,
} from './renderField';
import type {
  IProps,
  RowContextProps,
  RowProps,
} from './type';

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
    [setActivatorNodeRef, listeners],
  );

  return (
    <RowContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  );
};

export function DesktopDetailDataGrid<T extends IDetail>({
  detailInitialData,
  columnsConfig,
  fieldKey,
  alternateKey,
  dragUrl,
  detailCaption,
  detailKey,
  isEdit,
  contentHeight,
  conditionRenderer,
  currentPage = 1,
  additionalActions = [],
  additionalFunction,
  calcIndependentValue,
}: IProps<T>) {
  const t = useTranslations();
  const params = useSearchParams();
  const headerId = params.get("id");
  const pageDataDispatch = useDispatch();
  const deviceHeight = window.innerHeight;
  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages?.find(
        (item) => item.isActive === true,
      ),
    }),
    shallowEqual,
  );
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const skipSyncRef = useRef(false);

  const storedDetails: any = activePage?.pageData?.find(
    (item) => item.name === detailKey,
  )?.value;

  const [trigger] = useCUDDataMutation();

  const reducer = (state: T[], action: IActions<T>): T[] => {
    const normalizeRowNumbers = (arr: T[]) =>
      arr.map((item, idx) => ({ ...item, RowNum: idx + 1 }) as T);

    switch (action.type) {
      case "ADD_DATA_SOURCE": {
        const { payload, insertAfterIndex } = action;

        // create new state with payload inserted or appended
        let newState: T[];
        if (
          typeof insertAfterIndex === "number" &&
          insertAfterIndex >= 0 &&
          insertAfterIndex < state.length
        ) {
          newState = [
            ...state.slice(0, insertAfterIndex + 1),
            ...payload,
            ...state.slice(insertAfterIndex + 1),
          ];
        } else {
          newState = [...state, ...payload];
        }

        // ensure RowNum values are unique and sequential after insertion
        return normalizeRowNumbers(newState);
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
            : item,
        );
      case "DELETE_ROW":
        if (state[action.payload.index]?.[fieldKey]) {
          return state.map((item) =>
            item[fieldKey] === action.payload.data?.[fieldKey]
              ? {
                  ...item,
                  RowState: RowStateEnum.Delete,
                }
              : item,
          );
        } else {
          return state.filter((i) => i.key !== action.payload.data.key);
        }
      case "UNDO_DELETE_ROW":
        if (state[action.payload.index][fieldKey]) {
          return state.map((item) =>
            item[fieldKey] === action.payload.data[fieldKey]
              ? {
                  ...item,
                  RowState: RowStateEnum.Update,
                }
              : item,
          );
        } else {
          return null;
        }

      case "RESET_DATA":
        return normalizeRowNumbers(action.payload as T[]);
      case "MOVE": {
        const { activeId, overId } = action.payload;
        const activeIndex = state.findIndex(
          (record) => record[fieldKey] === activeId,
        );
        const overIndex = state.findIndex(
          (record) => record[fieldKey] === overId,
        );
        const moved = arrayMove(state, activeIndex, overIndex);
        return normalizeRowNumbers(moved);
      }
      default:
        return state;
    }
  };

  const [selectedRows, setSelectedRows] = useState<T[]>();
  const [allowCopy, setAllowCopy] = useState(false);

  const [detailData, dispatchDetailData] = useReducer(
    reducer,
    detailInitialData,
  );

  useEffect(() => {
    if (skipSyncRef.current) return;
    try {
      const newData = storedDetails ?? detailInitialData ?? [];

      const isDifferent =
        JSON.stringify(newData) !== JSON.stringify(detailData);

      if (isDifferent) {
        dispatchDetailData({ type: "RESET_DATA", payload: newData });
      }
    } catch (err) {
      dispatchDetailData({ type: "RESET_DATA", payload: storedDetails ?? [] });
    }
  }, [storedDetails, detailInitialData]);

  const staticColumns = columnsConfig?.filter((item) => !item.conditionKey);
  const conditionalColumns = columnsConfig?.filter((item) => item.conditionKey);

  const [dynamicColumns, setDynamicColumns] = useState<IDetailColumnConfig[]>(
    [],
  );
  const [renderCondition, setRenderCondition] = useState<
    Record<string, boolean>[]
  >([]);

  const columns: TableColumnsType<T> = dynamicColumns.map((config) => {
    const {
      fieldName,
      isChangeField,
      isApplyField,
      applyTooltip,
      fieldCaption,
      fieldType,
      dynamicValue,
      conditionKey,
      staticConfig,
      calcIndependent,
      independentValue,
      width,
      limitation,
      showIdInDesc,
    } = config;
    switch (fieldType) {
      case "index":
        return {
          title: fieldCaption,
          width: width ?? 90,
          // fixed: "right" as const,
          dataIndex: fieldType,
          key: fieldName,
          render: (_: any, record: T, index: number) => (
            <div className="flex justify-between items-center w-[90px]">
              <DragHandle index={record?.RowNum} />
              {renderActionButton(record, index)}
            </div>
          ),
        };
      case "treeOption":
        return {
          title: fieldCaption,
          width: width ?? 140,
          ellipsis: true,
          dataIndex: fieldType,
          key: fieldName,
          render: (_: any, record: T, index: number) => (
            <RenderTreeField<T>
              defaultData={detailInitialData[index] ?? null}
              detailData={detailData}
              dynamicValue={dynamicValue}
              editState={editState}
              field={fieldName}
              handleEdit={handleEdit}
              index={index}
              alternateKey={alternateKey}
              conditionalKey={conditionKey}
              dispatchDetailData={dispatchDetailData}
              renderCondition={renderCondition}
              calcIndependent={calcIndependent}
              independentValue={independentValue}
              calcIndependentValue={calcIndependentValue}
              width={width}
              showIdInDesc={showIdInDesc}
            />
          ),
        };
      case "selectOption":
        return {
          title: fieldCaption,
          width: width ?? 140,
          ellipsis: true,
          dataIndex: fieldType,
          key: fieldName,
          render: (_: any, record: T, index: number) => (
            // renderSelect(record, index, fieldName, dynamicValue),
            <RenderSelectField<T>
              defaultData={detailInitialData[index] ?? null}
              detailData={detailData}
              dynamicValue={dynamicValue}
              editState={editState}
              field={fieldName}
              handleEdit={handleEdit}
              index={index}
              alternateKey={alternateKey}
              conditionalKey={conditionKey}
              dispatchDetailData={dispatchDetailData}
              renderCondition={renderCondition}
              calcIndependent={calcIndependent}
              independentValue={independentValue}
              calcIndependentValue={calcIndependentValue}
              width={width}
              showIdInDesc={showIdInDesc}
            />
          ),
        };
      case "text":
        return {
          title: fieldCaption,
          dataIndex: fieldType,
          ellipsis: true,
          width: width ?? 140,
          key: fieldName,
          render: (_: any, record: T, index: number) =>
            renderInputText(
              record,
              index,
              fieldName,
              independentValue,
              calcIndependent,
              width,
            ),
        };
      case "number":
        return {
          title: fieldCaption,
          width: width ?? 120,
          dataIndex: fieldType,
          key: fieldName,
          render: (_: any, record: T, index: number) =>
            renderInputNumber(
              record,
              index,
              fieldName,
              independentValue,
              calcIndependent,
              width,
              limitation,
            ),
        };
      case "price":
        return {
          title: fieldCaption,
          width: width ?? 120,
          dataIndex: fieldType,
          key: fieldName,
          render: (_: any, record: T, index: number) =>
            renderInputPrice(
              record,
              index,
              fieldName,
              independentValue,
              calcIndependent,
              width,
            ),
        };
      case "changeablePrice":
        return {
          title: fieldCaption,
          width: width ?? 120,
          dataIndex: fieldType,
          key: fieldName,
          render: (_: any, record: T, index: number) =>
            renderChangeableInputPrice(
              record,
              index,
              fieldName,
              isChangeField,
              isApplyField,
              applyTooltip,
              independentValue,
              calcIndependent,
              width,
            ),
        };
      case "unChangeablePrice":
        return {
          title: fieldCaption,
          width: width ?? 120,
          dataIndex: fieldType,
          key: fieldName,
          render: (_: any, record: T, index: number) =>
            renderUnChangeablePrice(index, fieldName, width),
        };
      case "date":
        return {
          title: fieldCaption,
          width: 150,
          dataIndex: fieldType,
          key: fieldName,
          render: (_: any, record: T, index: number) =>
            renderInputDate(
              record,
              index,
              fieldName,
              independentValue,
              calcIndependent,
              width,
            ),
        };
      case "boolean":
        return {
          title: fieldCaption,
          width: width ?? 120,
          dataIndex: fieldType,
          key: fieldName,
          render: (_: any, record: T, index: number) =>
            renderInputBoolean(
              record,
              index,
              fieldName,
              independentValue,
              calcIndependent,
              width,
            ),
        };
      case "static":
        return {
          title: fieldCaption,
          width: width ?? 120,
          dataIndex: fieldType,
          key: fieldName,
          render: (_: any, record: T, index: number) => (
            // renderStaticValue(record, index, fieldName, staticConfig),
            <RenderStaticValue
              detailData={detailData}
              field={fieldName}
              index={index}
              staticConfig={staticConfig}
              width={width}
            />
          ),
        };

      default:
        return null;
    }
  });

  const initialRenderCondition = columnsConfig
    ?.filter(
      (i) =>
        i.fieldType !== "index" &&
        i.fieldType !== fieldKey &&
        i.fieldType !== "static",
    )
    ?.sort((a, b) => a.order - b.order)
    ?.reduce(
      (acc, item) => {
        acc[item.fieldName] = item.conditionKey ? false : true;
        return acc;
      },
      {} as Record<string, boolean>,
    );

  const editableKeys =
    columns &&
    columns
      .filter(
        (i: any) =>
          i.dataIndex !== "index" &&
          i.dataIndex !== fieldKey &&
          i.dataIndex !== "static" &&
          i.dataIndex !== "array",
      )
      .map((i) => i.key as string);

  const [editState, setEditState] = useState<{
    key: number | null;
    field: string | null;
  }>({ key: null, field: null });

  const createNewRow = (): T => {
    const newRow = editableKeys.reduce(
      (acc, key) => {
        // skip RowNum — reducer will normalize it
        if (key !== "RowNum") {
          acc[key] = undefined;
        }
        return acc;
      },
      {} as Record<string, any>,
    );

    newRow.key = Math.floor(Math.random() * 100000);
    newRow.RowState = RowStateEnum.Add;
    // do NOT set RowNum here — reducer will normalize RowNum values
    newRow[fieldKey] = undefined;
    newRow.addedPage = currentPage;
    return newRow as T;
  };

  const onTextChange = async (
    e: ChangeEvent<HTMLInputElement>,
    field: string,
    index: number,
    independentValue: boolean,
    calcIndependent: boolean,
  ) => {
    const rowData = detailData[index];
    const value = e.target.value;

    let independentParameter = {};

    if (calcIndependent) {
      try {
        const result = await calcIndependentValue(rowData, field, value);
        if (result) {
          independentParameter = result;
        }
      } catch (error) {
        null;
      }
    }

    if (rowData?.RowState !== RowStateEnum.Delete) {
      const updatedRow = {
        index,
        data: {
          [field]: value,
          ...independentParameter,
        },
      };

      dispatchDetailData({
        type: "UPDATE_ROW",
        payload: updatedRow as { index: number; data: Partial<T> },
      });
    }
  };
  const onDateChange = async (
    value: string,
    field: string,
    index: number,
    independentValue: boolean,
    calcIndependent: boolean,
  ) => {
    const rowData = detailData[index];
    let independentParameter = {};

    if (calcIndependent) {
      try {
        const result = await calcIndependentValue(rowData, field, value);
        if (result) {
          independentParameter = result;
        }
      } catch (error) {
        null;
      }
    }
    if (rowData?.RowState !== RowStateEnum.Delete) {
      const updatedRow = {
        index,
        data: {
          [field]: value,
          ...independentParameter,
        },
      };

      dispatchDetailData({
        type: "UPDATE_ROW",
        payload: updatedRow as { index: number; data: Partial<T> },
      });
    }
  };
  const onNumberChange = async (
    value,
    field: string,
    index: number,
    independentValue: boolean,
    calcIndependent: boolean,
  ) => {
    const rowData = detailData[index];
    let independentParameter = {};

    if (calcIndependent) {
      try {
        const result = await calcIndependentValue(rowData, field, value);
        if (result) {
          independentParameter = result;
        }
      } catch (error) {
        null;
      }
    }
    if (rowData?.RowState !== RowStateEnum.Delete) {
      const updatedRow = {
        index,
        data: {
          [field]: +value,
          ...independentParameter,
        },
      };

      dispatchDetailData({
        type: "UPDATE_ROW",
        payload: updatedRow as { index: number; data: Partial<T> },
      });
    }
  };
  const onPriceChange = async (
    value,
    field: string,
    isChangeField: string,
    isApplyField: string,
    index: number,
    independentValue: boolean,
    calcIndependent: boolean,
  ) => {
    const rowData = detailData[index];
    let independentParameter = {};

    if (calcIndependent) {
      try {
        const result = await calcIndependentValue(rowData, field, value);
        if (result) {
          independentParameter = result;
        }
      } catch (error) {
        null;
      }
    }
    if (rowData?.RowState !== RowStateEnum.Delete) {
      const updatedRow = {
        index,
        data: {
          [field]: +value,
          [isChangeField]: true,
          ...independentParameter,
        },
      };

      dispatchDetailData({
        type: "UPDATE_ROW",
        payload: updatedRow as { index: number; data: Partial<T> },
      });
    }
  };
  const handleApply = (index: number, field: string, value: boolean) => {
    const rowData = detailData[index];
    if (rowData?.RowState !== RowStateEnum.Delete) {
      const updatedRow = {
        index,
        data: {
          [field]: !value,
        },
      };

      dispatchDetailData({
        type: "UPDATE_ROW",
        payload: updatedRow as { index: number; data: Partial<T> },
      });
    }
  };

  const onBooleanChange = async (
    e: CheckboxChangeEvent,
    field: string,
    index: number,
    independentValue: boolean,
    calcIndependent: boolean,
  ) => {
    const rowData = detailData[index];
    const value = e.target.checked;
    let independentParameter = {};

    if (calcIndependent) {
      try {
        const result = await calcIndependentValue(
          rowData,
          field,
          value ? true : false,
        );
        if (result) {
          independentParameter = result;
        }
      } catch (error) {
        null;
      }
    }
    if (rowData?.RowState !== RowStateEnum.Delete) {
      const updatedRow = {
        index,
        data: {
          [field]: value ? true : false,
          ...independentParameter,
        },
      };

      dispatchDetailData({
        type: "UPDATE_ROW",
        payload: updatedRow as { index: number; data: Partial<T> },
      });
    }
  };
  const handleMoveOldItem = async ({ activeData, overIndex }) => {
    try {
      const moveResult = await trigger({
        url: dragUrl,
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
    const activeData = detailData.find((item) => item[fieldKey] === active.id);
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
    // createNewRow no longer needs rowNumber; reducer will normalize RowNum
    const newRow = createNewRow();

    dispatchDetailData({
      type: "ADD_DATA_SOURCE",
      payload: [newRow],
      insertAfterIndex: index,
    });
  };
  const handleEdit = (index: number, field: string) => {
    setEditState({ key: index, field });
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
  const handleSave = (index: number) => {
    const targetItem = renderCondition[index];
    const fieldKeys = Object.keys(targetItem).filter((key) => targetItem[key]);

    const currentFieldIndex = fieldKeys.indexOf(editState.field);
    const nextField = fieldKeys[currentFieldIndex + 1];

    if (currentFieldIndex < fieldKeys.length - 1) {
      handleEdit(editState.key, nextField);
    } else {
      handleAdd(index);
      handleEdit(index + 1, fieldKeys[0]);
    }
  };
  const handleReplicateRow = (record: T, index: number) => {
    const rowData = detailData[index];
    if (rowData.RowState !== RowStateEnum.Delete) {
      const copyRecord = {
        ...record,
        RowState: RowStateEnum.Add,
        [fieldKey]: undefined,
        // generate a new key; keep it large to reduce collision chance
        key: Math.floor(Math.random() * 100000),
        // do NOT set RowNum here — reducer will normalize RowNum values
        addedPage: currentPage,
      };
      handleEdit(index + 1, editableKeys[0]);
      dispatchDetailData({
        type: "ADD_DATA_SOURCE",
        payload: [copyRecord],
        insertAfterIndex: index,
      });
    }
  };
  const handleGroupPasteRow = (index: number) => {
    let newDetailsData = [...detailData];
    selectedRows.forEach((selectedRow) => {
      newDetailsData = newDetailsData.filter(
        (row) => row.key !== selectedRow.key,
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
    const copyRecords = selectedRows.map((item) => {
      return {
        ...item,
        RowState: RowStateEnum.Add,
        key: Math.floor(Math.random() * 100000),
        [fieldKey]: undefined,

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
  };
  const handleGroupDelete = () => {
    setSelectedRows([]);
    setAllowCopy(false);

    selectedRows.forEach((item) => {
      const index = detailData.findIndex((el) => el.key === item.key);
      dispatchDetailData({
        type: "DELETE_ROW",
        payload: {
          index: index,
          data: item,
        },
      });
    });
  };
  const handleKeyAction = (
    event: KeyboardEvent<any>,
    record: T,
    index: number,
  ) => {
    let focusedKey = editState.key !== null ? editState.key : index;
    let focusedField = editState.field || editableKeys[0];

    const targetItem = renderCondition[index];

    if (targetItem) {
      const fieldKeys = Object?.keys(targetItem).filter(
        (key) => targetItem[key],
      );
      const currentFieldIndex = fieldKeys.indexOf(editState.field);

      switch (event.key) {
        case "Tab":
          event.preventDefault();
          event.stopPropagation();

          if (currentFieldIndex < fieldKeys.length - 1) {
            focusedField = fieldKeys[currentFieldIndex + 1];
          } else if (index < detailData.length - 1) {
            focusedKey = index + 1;
            focusedField = fieldKeys[0];
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
            focusedField = fieldKeys[currentFieldIndex - 1];
          }
          break;
        case "ArrowLeft":
          if (currentFieldIndex < fieldKeys.length - 1) {
            focusedField = fieldKeys[currentFieldIndex + 1];
          }
          break;
        case "c":
          if (event.ctrlKey) {
            event.preventDefault();
            handleReplicateRow(record, index);
            return;
          }
          break;

        case "Enter":
          handleSave(index);
          return;

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
        handleEdit(focusedKey, newFocusedField);
      } else {
        handleEdit(focusedKey, fieldKey[fieldKey.length - 1]);
      }
    }
  };
  const renderActionButton = (record: T, index: number) => {
    const additionalActionItems: ItemType[] = additionalActions?.map(
      (action, i) => ({
        key: String(i + 7),
        disabled:
          typeof action.disabled === "function"
            ? action.disabled()
            : action.disabled,
        label: (
          <span
            className="flex text-sm"
            onClick={() =>
              action.handler({
                record,
                index,
                field: editState.field,
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
        extra: action.shortcutKey,
      }),
    );

    return (
      <div className="flex items-center">
        <CustomTooltip
          title={
            record?.RowState !== RowStateEnum.Delete
              ? t("general.delete")
              : t("general.recovery")
          }
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
                      handleEdit(index + 1, editableKeys[0]);
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
                disabled:
                  selectedRows && selectedRows?.length > 0 ? false : true,
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
              {
                type: "divider",
              },

              ...additionalActionItems,
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
  const renderInputText = (
    record: T,
    index: number,
    field: string,
    independentValue: boolean,
    calcIndependent: boolean,
    width: number,
  ) => {
    const rowData = detailData[index];
    const isEditing = editState.key === index && editState.field === field;

    const value =
      typeof rowData?.[field] === "string" ? rowData?.[field] : undefined;

    const condition = renderCondition?.find((item, idx) => idx === index);

    if (condition && !condition[field]) {
      return (
        <div
          className={`${width ? "" : "!w-[140px]"}`}
          style={width ? { width: `${width}px` } : undefined}
        >
          -
        </div>
      );
    }
    return isEditing ? (
      <InputText
        id={field}
        className={`!bg-white ${width ? "" : "!w-[140px]"} !h-fit`}
        style={width ? { width: `${width}px` } : undefined}
        value={rowData && value !== null ? value : ""}
        // onChange={(e) => {
        //   const key = `${index}-${field}`;

        //   if (debounceTimers.current[key]) {
        //     clearTimeout(debounceTimers.current[key]);
        //   }

        //   debounceTimers.current[key] = setTimeout(() => {
        //     onTextChange(e, field, index, independentValue, calcIndependent);
        //   }, 500);
        // }}
        onChange={(e) => {
          onTextChange(e, field, index, independentValue, calcIndependent);
        }}
        autoFocus={isEditing}
      />
    ) : (
      <CustomTooltip title={rowData && value}>
        <div
          id={field}
          className={`flex items-center rounded ${
            width ? "" : "!w-[140px]"
          }  h-[2.1rem]`}
          style={width ? { width: `${width}px` } : undefined}
          onClick={() => handleEdit(index, field)}
        >
          {value}
        </div>
      </CustomTooltip>
    );
  };
  const renderInputDate = (
    record: T,
    index: number,
    field: string,
    independentValue: boolean,
    calcIndependent: boolean,
    width: number,
  ) => {
    const rowData = detailData[index];
    const isEditing = editState.key === index && editState.field === field;
    const value =
      typeof rowData[field] === "string" ? rowData[field] : undefined;

    const defaultValue = value
      ? moment(value).locale("fa").format("jYYYY/jMM/jDD")
      : "-";
    // const date = new Date(
    //   moment(value, "jYYYY-jMM-jDD").format()
    // ).toISOString();
    const condition = renderCondition?.find((item, idx) => idx === index);

    if (condition && !condition[field]) {
      return (
        <div
          className={`${width ? "" : "!w-[150px]"}`}
          style={width ? { width: `${width}px` } : undefined}
        >
          -
        </div>
      );
    }

    return isEditing ? (
      <div
        className={`${width ? "" : "!w-[150px]"}`}
        style={width ? { width: `${width}px` } : undefined}
      >
        <NewDatePicker
          className={`rounded-none `}
          showMask
          onChange={(date) =>
            onDateChange(
              date as string,
              field,
              index,
              independentValue,
              calcIndependent,
            )
          }
          value={value}
        />
      </div>
    ) : (
      <CustomTooltip title={rowData && value && defaultValue}>
        <div
          id={field}
          className={`flex items-center rounded ${
            width ? "" : "!w-[150px]"
          }  h-[2.1rem]`}
          style={width ? { width: `${width}px` } : undefined}
          onClick={() => handleEdit(index, field)}
        >
          {defaultValue}
        </div>
      </CustomTooltip>
    );
  };
  const renderInputPrice = (
    record: T,
    index: number,
    field: string,
    independentValue: boolean,
    calcIndependent: boolean,
    width: number,
  ) => {
    const rowData = detailData[index];
    const isEditing = editState.key === index && editState.field === field;
    const value =
      typeof rowData[field] === "number" ? rowData[field] : undefined;

    const condition = renderCondition?.find((item, idx) => idx === index);

    if (condition && !condition[field]) {
      return (
        <div
          className={`${width ? "" : "!w-[120px]"}`}
          style={width ? { width: `${width}px` } : undefined}
        >
          -
        </div>
      );
    }

    return isEditing ? (
      <CustomInputNumber
        controls={false}
        prefix=""
        min={0}
        id={field}
        keyboard={false}
        className={`!bg-white !rounded ${width ? "" : "!w-[120px]"} !h-fit`}
        style={width ? { width: `${width}px` } : undefined}
        parser={(value) =>
          value?.replace(/\$\s?|(,*)/g, "") as unknown as number
        }
        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        value={rowData && value ? value : 0}
        onChange={(value) => {
          const key = `${index}-${field}`;

          if (debounceTimers.current[key]) {
            clearTimeout(debounceTimers.current[key]);
          }

          debounceTimers.current[key] = setTimeout(() => {
            onNumberChange(
              value,
              field,
              index,
              independentValue,
              calcIndependent,
            );
          }, 500);
        }}
        // onChange={(value) => {
        //   onNumberChange(
        //     value,
        //     field,
        //     index,
        //     independentValue,
        //     calcIndependent
        //   );
        // }}
        autoFocus={isEditing}
      />
    ) : (
      <div
        id={field}
        className={`flex items-center rounded ${
          width ? "" : "!w-[120px]"
        }  h-[2.1rem]`}
        style={width ? { width: `${width}px` } : undefined}
        onClick={() => handleEdit(index, field)}
      >
        <span className="ps-2">
          {rowData ? (value ? value?.toLocaleString("fa-IR") : 0) : ""}
        </span>
      </div>
    );
  };
  const renderChangeableInputPrice = (
    record: T,
    index: number,
    field: string,
    isChangeField: string,
    isApplyField: string,
    applyTooltip: string,
    independentValue: boolean,
    calcIndependent: boolean,
    width: number,
  ) => {
    const rowData = detailData[index];
    const isEditing = editState.key === index && editState.field === field;
    const value =
      typeof rowData[field] === "number" ? rowData[field] : undefined;

    const condition = renderCondition?.find((item, idx) => idx === index);

    if (condition && !condition[field]) {
      return (
        <div
          className={`${width ? "" : "!w-[120px]"}`}
          style={width ? { width: `${width}px` } : undefined}
        >
          -
        </div>
      );
    }

    return (
      <div
        className={`${isEditing ? "!bg-white" : ""} !rounded ${
          width ? "" : "!w-[120px]"
        } !h-fit flex gap-2 items-center`}
        style={width ? { width: `${width}px` } : undefined}
      >
        {rowData?.[isChangeField] && (
          <CustomTooltip title={applyTooltip}>
            <div
              onClick={() =>
                handleApply(index, isApplyField, rowData?.[isApplyField])
              }
            >
              <ApplyIcon
                config={{ apply: rowData?.[isApplyField] ? true : false }}
              />
            </div>
          </CustomTooltip>
        )}
        {isEditing ? (
          <CustomInputNumber
            controls={false}
            prefix=""
            min={0}
            id={field}
            keyboard={false}
            className={`!bg-white !rounded !h-fit`}
            parser={(value) =>
              value?.replace(/\$\s?|(,*)/g, "") as unknown as number
            }
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            value={rowData && value ? value : 0}
            onChange={(value) => {
              const key = `${index}-${field}`;

              if (debounceTimers.current[key]) {
                clearTimeout(debounceTimers.current[key]);
              }

              debounceTimers.current[key] = setTimeout(() => {
                onPriceChange(
                  value,
                  field,
                  isChangeField,
                  isApplyField,
                  index,
                  independentValue,
                  calcIndependent,
                );
              }, 500);
            }}
            // onChange={(value) => {
            //   onNumberChange(
            //     value,
            //     field,
            //     index,
            //     independentValue,
            //     calcIndependent
            //   );
            // }}
            autoFocus={isEditing}
          />
        ) : (
          <div
            id={field}
            className={`flex items-center rounded ${
              width ? "" : "!w-[120px]"
            }  h-[2.1rem]`}
            style={width ? { width: `${width}px` } : undefined}
            onClick={() => handleEdit(index, field)}
          >
            <span className="ps-2">
              {rowData ? (value ? value?.toLocaleString("fa-IR") : 0) : ""}
            </span>
          </div>
        )}
      </div>
    );
  };
  const renderUnChangeablePrice = (
    index: number,
    field: string,
    width: number,
  ) => {
    const rowData = detailData[index];
    const isEditing = editState.key === index && editState.field === field;
    const value =
      typeof rowData[field] === "number" ? rowData[field] : undefined;

    const condition = renderCondition?.find((item, idx) => idx === index);

    if (condition && !condition[field]) {
      return (
        <div
          className={`${width ? "" : "!w-[120px]"}`}
          style={width ? { width: `${width}px` } : undefined}
        >
          -
        </div>
      );
    }

    return isEditing ? (
      <div
        id={field}
        className={`flex items-center rounded bg-gray-gray3 ${
          width ? "" : "!w-[120px]"
        }  h-[2.1rem]`}
        style={width ? { width: `${width}px` } : undefined}
        onClick={() => handleEdit(index, field)}
      >
        <span className="ps-2">
          {rowData ? (value ? value?.toLocaleString("fa-IR") : 0) : ""}
        </span>
      </div>
    ) : (
      <div
        id={field}
        className={`flex items-center rounded ${
          width ? "" : "!w-[120px]"
        }  h-[2.1rem]`}
        style={width ? { width: `${width}px` } : undefined}
        onClick={() => handleEdit(index, field)}
      >
        <span className="ps-2">
          {rowData ? (value ? value?.toLocaleString("fa-IR") : 0) : ""}
        </span>
      </div>
    );
  };
  const renderInputNumber = (
    record: T,
    index: number,
    field: string,
    independentValue: boolean,
    calcIndependent: boolean,
    width: number,
    limitation: {
      max: number;
    },
  ) => {
    const rowData = detailData[index];
    const isEditing = editState.key === index && editState.field === field;
    const value =
      typeof rowData?.[field] === "number" ? rowData?.[field] : undefined;

    const condition = renderCondition?.find((item, idx) => idx === index);

    if (condition && !condition[field]) {
      return (
        <div
          className={`!w-[120px] ${width ? `w-[${width}px]` : "!w-[120px]"}`}
        >
          -
        </div>
      );
    }

    return isEditing ? (
      <CustomInputNumber
        controls={false}
        prefix=""
        min={0}
        max={limitation?.max}
        id={field}
        keyboard={false}
        className={`!bg-white !rounded ${
          width ? `!w-[${width}px]` : "!w-[120px]"
        }  !h-fit`}
        value={rowData && value !== null ? value : 0}
        // onChange={(value) => {
        //   const timer = setTimeout(() => {
        //     onNumberChange(
        //       value,
        //       field,
        //       index,
        //       independentValue,
        //       calcIndependent
        //     );
        //   }, 1000);
        //   return () => clearTimeout(timer);
        // }}
        onChange={(value) => {
          const key = `${index}-${field}`;

          if (debounceTimers.current[key]) {
            clearTimeout(debounceTimers.current[key]);
          }

          debounceTimers.current[key] = setTimeout(() => {
            onNumberChange(
              value,
              field,
              index,
              independentValue,
              calcIndependent,
            );
          }, 500);
        }}
        autoFocus={isEditing}
      />
    ) : (
      <div
        id={field}
        className={`flex items-center rounded ${
          width ? `!w-[${width}px]` : "!w-[120px]"
        } h-[2.1rem]`}
        onClick={() => handleEdit(index, field)}
      >
        <span className="ps-2">{rowData ? value : ""}</span>
      </div>
    );
  };
  const renderInputBoolean = (
    record: T,
    index: number,
    field: string,
    independentValue: boolean,
    calcIndependent: boolean,
    width: number,
  ) => {
    const rowData = detailData[index];
    const isEditing = editState.key === index && editState.field === field;
    const value =
      typeof rowData[field] === "boolean" ? rowData[field] : undefined;

    const condition = renderCondition?.find((item, idx) => idx === index);

    if (condition && !condition[field]) {
      return (
        <div
          className={`${width ? "" : "!w-[120px]"}`}
          style={width ? { width: `${width}px` } : undefined}
        >
          -
        </div>
      );
    }

    return isEditing ? (
      <div className="ps-8">
        <CustomCheckbox
          id={field}
          checked={value}
          onChange={(e) => {
            onBooleanChange(e, field, index, independentValue, calcIndependent);
          }}
          autoFocus={isEditing}
        />
      </div>
    ) : (
      <div
        id={field}
        className={`flex items-center rounded ${
          width ? "" : "!w-[100px]"
        }  h-[2.1rem]`}
        style={width ? { width: `${width}px` } : undefined}
        onClick={() => handleEdit(index, field)}
      >
        <span className="ps-8">{value ? "✔" : "✘"}</span>
      </div>
    );
  };

  // console.log("editState", editState);
  // console.log("detailData", detailData);
  // console.log("storedDetails", storedDetails);
  // console.log("selectedRows", selectedRows);
  // console.log("columns", columns);
  // console.log("dynamicColumns", dynamicColumns);
  // console.log("staticColumns", staticColumns);
  // console.log("columnsConfig", columnsConfig);
  // console.log("detailCaption", detailCaption);
  // console.log("editableKeys", editableKeys);
  // console.log("renderCondition", renderCondition);

  useEffect(() => {
    const details: T[] = detailInitialData.map((item: T, idx) => {
      return {
        ...item,
        RowNum: item.RowNum ? item.RowNum : idx + 1,
        RowState: item.RowState ? item.RowState : RowStateEnum.None,
        key: item[fieldKey]
          ? item[fieldKey]
          : Math.floor(Math.random() * 100000),
      };
    });

    if (storedDetails) {
      const storedMap = Object?.fromEntries(
        storedDetails?.map((item) => [item.key, item]),
      );
      const result = details.map((detail) => {
        if (storedMap[detail.key]) {
          return { ...detail, ...storedMap[detail.key] };
        }
        return detail;
      });

      const finalResult: T[] = Object.values(
        Object.assign({}, ...result.map((item) => ({ [item.key]: item }))),
      );
      const addedRows = storedDetails.filter(
        (item) =>
          item.RowState === RowStateEnum.Add && item.addedPage === currentPage,
      );

      const finalOutput = addedRows
        ? [...finalResult, ...addedRows]
        : finalResult;

      const uniqueByRowNum = [];
      const seenRowNum = new Set();

      for (const item of finalOutput) {
        if (!seenRowNum.has(item.RowNum)) {
          seenRowNum.add(item.RowNum);
          uniqueByRowNum.push(item);
        }
      }
      const sortedFinalOutput = uniqueByRowNum.sort(
        (a, b) => a.RowNum - b.RowNum,
      );

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
    if (!isEdit) {
      const cleanedData = detailData?.filter((item) =>
        editableKeys?.some((key) => item[key] !== undefined),
      );

      skipSyncRef.current = true;
      pageDataDispatch(
        setPageData({
          caption: { detailCaption },
          name: detailKey,
          type: "array",
          value: cleanedData,
        }),
      );

      setTimeout(() => {
        skipSyncRef.current = false;
      }, 0);
    } else {
      const previousDetailStoreData = detailInitialData?.map((item) => ({
        ...item,
      }));
      const cleanedData = detailData?.filter((item) =>
        editableKeys?.some((key) => item[key] !== undefined),
      );

      const updatedExistData = cleanedData
        ?.filter(
          (item) =>
            item.RowState === RowStateEnum.Add ||
            item.RowState === RowStateEnum.Delete ||
            item.RowState === RowStateEnum.Update,
        )
        ?.map((item) => {
          const previousItem = previousDetailStoreData.find(
            (prev) => prev[fieldKey] === item[fieldKey],
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
            !updatedExistData?.some((el) => el.key === item.key),
        );

        skipSyncRef.current = true;
        pageDataDispatch(
          setPageData({
            caption: detailCaption,
            name: detailKey,
            type: "array",
            value:
              storedDetails && storedDetails.length > 0
                ? [...uniqueStoredData, ...updatedExistData]
                : updatedExistData,
          }),
        );
        setTimeout(() => {
          skipSyncRef.current = false;
        }, 0);
      }
    }
    if (detailData.length > 0) {
      additionalFunction && additionalFunction(detailData);
      if (conditionalColumns?.length > 0) {
        const currentColumns = staticColumns;

        conditionalColumns?.map((config) => {
          const {
            fieldCaption,
            fieldName,
            fieldType,
            conditionKey,
            order,
            mobileRender,
            dynamicValue,
            staticConfig,

            calcIndependent,
            fieldIcon,
            independentValue,
            width,
            limitation,
            applyTooltip,
            isApplyField,
            isChangeField,
          } = config;
          if (renderCondition) {
            setRenderCondition([]);
          }
          detailData.map((record) => {
            const conditionValue = record?.[conditionKey];

            if (conditionValue) {
              if (conditionRenderer) {
                const condition = conditionRenderer(
                  conditionValue,
                  fieldName,
                  initialRenderCondition,
                );

                setRenderCondition((prevState) => [...prevState, condition]);
                if (condition?.[fieldName]) {
                  const index = currentColumns.findIndex(
                    (item) => item.fieldName === fieldName,
                  );
                  index === -1 &&
                    currentColumns.push({
                      fieldName: fieldName,
                      fieldCaption: fieldCaption,
                      conditionKey: conditionKey,
                      mobileRender: mobileRender,
                      fieldType: fieldType,
                      order: order,
                      staticConfig: staticConfig,
                      dynamicValue: dynamicValue,
                      calcIndependent: calcIndependent,
                      fieldIcon: fieldIcon,
                      independentValue: independentValue,
                      width: width,
                      limitation: limitation,
                      applyTooltip: applyTooltip,
                      isApplyField: isApplyField,
                      isChangeField: isChangeField,
                    });
                }
              } else {
                const index = currentColumns.findIndex(
                  (item) => item.fieldName === fieldName,
                );
                index === -1 &&
                  currentColumns.push({
                    fieldName: fieldName,
                    fieldCaption: fieldCaption,
                    conditionKey: conditionKey,
                    mobileRender: mobileRender,
                    fieldType: fieldType,
                    order: order,
                    staticConfig: staticConfig,
                    dynamicValue: dynamicValue,

                    calcIndependent: calcIndependent,
                    fieldIcon: fieldIcon,
                    independentValue: independentValue,
                    width: width,
                    limitation: limitation,
                    applyTooltip: applyTooltip,
                    isApplyField: isApplyField,
                    isChangeField: isChangeField,
                  });
              }
            } else {
              setRenderCondition((prevState) => [
                ...prevState,
                initialRenderCondition,
              ]);
            }
          });
        });
        const orderedCondition = currentColumns?.sort(
          (a, b) => a?.order - b?.order,
        );

        setDynamicColumns(orderedCondition);
      } else {
        if (renderCondition) {
          setRenderCondition([]);
        }
        detailData?.map((record) => {
          setRenderCondition((prevState) => [
            ...prevState,
            initialRenderCondition,
          ]);
        });
      }
    }
  }, [detailData]);

  useEffect(() => {
    if (dynamicColumns.length === 0) {
      setDynamicColumns(staticColumns);
      handleEdit(0, editableKeys[0]);
    }
  }, [columnsConfig]);

  const additionalActionWithKeyShortcut = additionalActions?.filter(
    (action) => action?.shortcutKey,
  );

  return (
    <>
      <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={handleDrag}>
        <SortableContext
          items={detailData?.map((i) => i[fieldKey])}
          strategy={verticalListSortingStrategy}
        >
          <Table
            loading={{
              spinning: false,
              indicator: <Spin size="large" indicator={<SpinIcon />} />,
            }}
            tableLayout="auto"
            onRow={(record, index) => ({
              onKeyDown: (event) => {
                handleKeyAction(event, record, index);
                if (additionalActionWithKeyShortcut?.length > 0) {
                  for (const action of additionalActionWithKeyShortcut) {
                    if (!action.shortcutKey) continue;
                    const isMatch = checkShortcutMatch(
                      event,
                      action.shortcutKey,
                    );
                    if (isMatch) {
                      event.preventDefault();
                      action.handler({
                        record,
                        index,
                        field: editState.field,
                        helpers: {
                          detailData: detailData,
                          dispatchDetailData: dispatchDetailData,
                        },
                      });
                      return;
                    }
                  }
                }
              },
              className: `${
                record.RowState === RowStateEnum.Delete
                  ? "line-through text-xl text-gray-gray8"
                  : record.RowState === RowStateEnum.Add
                    ? "bg-blue-blue11"
                    : ""
              }`,
            })}
            scroll={{
              x: "fit-content",
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
            size="small"
            pagination={false}
            rowKey={(record) => (record.key ? record.key : record[fieldKey])}
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
    </>
  );
}
