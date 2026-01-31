"use client";

import { useEffect, useState } from "react";

import { Dropdown } from "antd";

import { CustomButton, CustomSelect } from "@components/atoms/defaultElements";
import CustomInputNumber from "@components/atoms/defaultElements/inputNumber";
import {
  AddFormulaIcon,
  ClosePageIcon,
  DivisionIcon,
  LeftParenthesisIcon,
  MinusIcon,
  MultipleIcon,
  OperatorIcon,
  PlusIcon,
  RightParenthesisIcon,
} from "@components/atoms/iconComponents";
import { useCUDDataMutation, useGetData } from "@services/base";
import { showSuccessToast } from "@utils/core";

import { IRequest, Item } from "../type";
import { FormulaValuesTypeEnum } from "./enum";

export default function FormulaValues({ id, closeModal }) {
  const [items, setItems] = useState<Item[]>([
    { id: `tmp-0-${Date.now()}`, type: null, closeModal },
  ]);

  const [triggerItem] = useCUDDataMutation();

  const { data: paramOptions, isLoading: isOptionsLoading } = useGetData<
    Item,
    IRequest
  >({
    url: "api/hr/Select/ActBaseParam4SelectOption",
    body: { RepoViewId: 60020 },
  });

  const { data: formulaData, isLoading: isFormulaLoading } = useGetData<
    Item,
    IRequest
  >({
    url: "api/hr/select/ActParamFormulaItem",
    body: {
      RepoViewId: 60013,
      ActParamFormulaId: id,
    } as any,
  });

  useEffect(() => {
    if (
      formulaData?.Data &&
      Array.isArray(formulaData.Data) &&
      formulaData.Data.length > 0
    ) {
      const sortedData = [...formulaData.Data].sort(
        (a: any, b: any) => a.ActParamFormulaItemId - b.ActParamFormulaItemId
      );

      const mappedItems: Item[] = sortedData.map((i, index) => ({
        id: i.ActParamFormulaItemId ?? `tmp-${index}-${Date.now()}`,
        closeModal,
        type: i.ActBaseParamId ? "parameter" : "constant",
        value: i.ActBaseParamId ?? i.FixNumber,
        operator: i.Operator ? String(i.Operator) : null,
      }));

      setItems(mappedItems);
    }
  }, [formulaData, closeModal]);

  const handleSave = async () => {
    if (!id) return;

    const commands = items
      .filter((it) => it.type && it.value !== null && it.value !== "")
      .map((it) => {
        const isRealId = typeof it.id === "number";

        return {
          ActParamFormulaId: id,
          ActParamFormulaItemId: isRealId ? it.id : 0,
          ActBaseParamId: it.type === "parameter" ? Number(it.value) : null,
          FixNumber: it.type === "constant" ? Number(it.value) : null,
          Operator: it.operator ? Number(it.operator) : null,
          OpMode: isRealId
            ? FormulaValuesTypeEnum.emUpdate
            : FormulaValuesTypeEnum.emInsert,
        };
      });

    if (!commands.length) return;

    await triggerItem({
      url: "/api/hr/insert/ActParamFormulaItem",
      body: { ActFormulaCommand: commands },
    });

    showSuccessToast("عملیات با موفقیت ذخیره شد");
    closeModal?.();
  };

  const updateItem = (index: number, key: keyof Item, value: any) => {
    setItems((prev) => {
      const arr = [...prev];
      arr[index] = { ...arr[index], [key]: value };
      return arr;
    });
  };

  const handleDeleteItem = async (index: number) => {
    const item = items[index];
    if (!item) return;

    setItems((prev) => {
      const next = prev.filter((_, i) => i !== index);

      if (next.length === 0) {
        return [
          {
            id: `tmp-${Date.now()}`,
            type: null,
            closeModal,
          },
        ];
      }

      return next;
    });

    if (typeof item.id !== "number") return;

    await triggerItem({
      url: "/api/hr/insert/ActParamFormulaItem",
      body: {
        ActFormulaCommand: [
          {
            ActParamFormulaId: id,
            ActParamFormulaItemId: item.id,
            ActBaseParamId:
              item.type === "parameter" ? Number(item.value) : null,
            FixNumber: item.type === "constant" ? Number(item.value) : null,
            Operator: item.operator ? Number(item.operator) : null,
            OpMode: FormulaValuesTypeEnum.emDelete,
          },
        ],
      },
    });

    showSuccessToast("رکورد حذف شد");
  };
  const addNewItem = (index: number, type: "constant" | "parameter") => {
    setItems((prev) => {
      const newItem: Item = {
        id: `tmp-${index}-${Date.now()}`,
        type,
        value: null,
        operator: null,
        closeModal,
      };

      if (prev[index]?.type) {
        const copy = [...prev];
        copy.splice(index, 0, newItem);

        return copy;
      }

      const copy = [...prev];
      copy[index] = { ...copy[index], type };
      return copy;
    });
  };

  const showTypeMenu = (index: number) => ({
    items: [
      {
        key: "constant",
        label: (
          <div
            className="cursor-pointer"
            onClick={() => addNewItem(index, "constant")}
          >
            عدد ثابت
          </div>
        ),
      },
      {
        key: "parameter",
        label: (
          <div
            className="cursor-pointer"
            onClick={() => addNewItem(index, "parameter")}
          >
            پارامتر
          </div>
        ),
      },
    ],
  });

  const operatorMenu = (index: number) => ({
    items: [
      {
        key: "1",
        label: (
          <div
            className="flex justify-center items-center p-1 px-2 cursor-pointer"
            onClick={() => updateItem(index, "operator", "1")}
          >
            <PlusIcon config={{ width: 24, height: 16 }} />
          </div>
        ),
      },
      {
        key: "2",
        label: (
          <div
            className="flex justify-center items-center p-1 px-2 cursor-pointer"
            onClick={() => updateItem(index, "operator", "2")}
          >
            <MinusIcon config={{ width: 24, height: 16 }} />
          </div>
        ),
      },
      {
        key: "3",
        label: (
          <div
            className="flex justify-center items-center p-1 px-2 cursor-pointer"
            onClick={() => updateItem(index, "operator", "3")}
          >
            <MultipleIcon config={{ width: 24, height: 16 }} />
          </div>
        ),
      },
      {
        key: "4",
        label: (
          <div
            className="flex justify-center items-center p-1 px-2 cursor-pointer"
            onClick={() => updateItem(index, "operator", "4")}
          >
            <DivisionIcon config={{ width: 24, height: 16 }} />
          </div>
        ),
      },
      {
        key: "5",
        label: (
          <div
            className="flex justify-center items-center p-1 px-2 cursor-pointer"
            onClick={() => updateItem(index, "operator", "5")}
          >
            <LeftParenthesisIcon config={{ width: 24, height: 16 }} />
          </div>
        ),
      },
      {
        key: "6",
        label: (
          <div
            className="flex justify-center items-center p-1 px-2 cursor-pointer"
            onClick={() => updateItem(index, "operator", "6")}
          >
            <RightParenthesisIcon config={{ width: 24, height: 16 }} />
          </div>
        ),
      },
    ],
  });

  if (isFormulaLoading)
    return <div className="p-5 text-center">Loading...</div>;

  const isLastItem = (index: number) => index === items.length - 1;

  return (
    <div className="relative flex flex-wrap w-full h-[300px]">
      <div className="w-full h-full overflow-auto">
        {items.map((item, index) => (
          <div
            className="flex items-end gap-3 p-2 min-w-[120px] max-w-[calc(100% - 40px)]"
            key={item.id}
          >
            {!item.type && (
              <Dropdown trigger={["click"]} menu={showTypeMenu(index)}>
                <CustomButton className="flex justify-center items-center bg-main-white m-0 p-0 border-2 border-main-black rounded-sm w-12 h-9 cursor-pointer">
                  <AddFormulaIcon config={{ width: 22, height: 36 }} />
                </CustomButton>
              </Dropdown>
            )}

            {item.type === "constant" && (
              <div className="relative">
                <div
                  onClick={() => handleDeleteItem(index)}
                  className="-top-2 -left-2 z-10 absolute p-0.5 border rounded-full cursor-pointer"
                >
                  <ClosePageIcon config={{ width: 12, height: 12 }} />
                </div>
                <CustomInputNumber
                  className="flex !w-64"
                  placeholder="1234"
                  value={item.value ?? ""}
                  onChange={(val) => updateItem(index, "value", val)}
                />
              </div>
            )}

            {item.type === "parameter" && (
              <div className="relative">
                <div
                  onClick={() => handleDeleteItem(index)}
                  className="-top-2 -left-2 z-10 absolute p-0.5 border rounded-full cursor-pointer"
                >
                  <ClosePageIcon config={{ width: 12, height: 12 }} />
                </div>
                <CustomSelect
                  className="flex !w-64"
                  placeholder={
                    isOptionsLoading ? "در حال بارگذاری..." : "پارامتر"
                  }
                  options={
                    Array.isArray(paramOptions?.Data)
                      ? paramOptions.Data.map((p) => ({
                          label: p._SelectDisplay,
                          value: p._SelectId,
                        }))
                      : []
                  }
                  loading={isOptionsLoading}
                  onChange={(v) => updateItem(index, "value", v)}
                  value={item.value}
                />
              </div>
            )}

            {item.type && (
              <div className="relative">
                {item.operator && isLastItem(index) && (
                  <div
                    onClick={() => updateItem(index, "operator", null)}
                    className="-top-2 -left-2 z-10 absolute bg-white p-0.5 border rounded-full cursor-pointer"
                  >
                    <ClosePageIcon config={{ width: 12, height: 12 }} />
                  </div>
                )}

                <Dropdown trigger={["click"]} menu={operatorMenu(index)}>
                  <CustomButton className="flex justify-center items-center bg-gray-gray5 border rounded-sm w-12 h-9 cursor-pointer">
                    {item.operator === "1" ? (
                      <PlusIcon config={{ width: 24, height: 24 }} />
                    ) : item.operator === "2" ? (
                      <MinusIcon config={{ width: 24, height: 24 }} />
                    ) : item.operator === "3" ? (
                      <MultipleIcon />
                    ) : item.operator === "4" ? (
                      <DivisionIcon />
                    ) : item.operator === "5" ? (
                      <LeftParenthesisIcon />
                    ) : item.operator === "6" ? (
                      <RightParenthesisIcon />
                    ) : (
                      <OperatorIcon />
                    )}
                  </CustomButton>
                </Dropdown>
              </div>
            )}

            {item.operator && (
              <Dropdown trigger={["click"]} menu={showTypeMenu(index + 1)}>
                <CustomButton className="flex justify-center items-center bg-main-white m-0 p-0 border-2 border-main-black rounded-sm w-12 h-9 cursor-pointer">
                  <AddFormulaIcon config={{ width: 22, height: 36 }} />
                </CustomButton>
              </Dropdown>
            )}
          </div>
        ))}
      </div>
      <div className="bottom-3 left-3 absolute rounded-lg">
        <CustomButton
          onClick={handleSave}
          className="bg-main-black disabled:opacity-40 px-8 py-2 rounded text-white"
        >
          ثبت
        </CustomButton>
      </div>
    </div>
  );
}
