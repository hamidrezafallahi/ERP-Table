import React, {
  useEffect,
  useState,
} from 'react';

import {
  Select,
  Table,
} from 'antd';
import { ColumnsType } from 'antd/es/table';

import { CustomButton } from '@components/atoms/defaultElements';
import { PlusIcon } from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import {
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import {
  showErrorToast,
  showSuccessToast,
} from '@utils/toast';

import {
  IRequest,
  ISPlanFormulaItemMinimal,
  PayloadBody,
  SPlanModel,
} from './type';

const FormulaMakerContent = ({ disabled, onCloseModal }: any) => {
  const [base, setBase] = useState<SPlanModel | null>(null);
  const [versions, setVersions] = useState<SPlanModel[]>([]);
  const [formulaData, setFormulaData] = useState<any>({});
  const [OriginalPayload, setOriginalPayload] = useState<PayloadBody>({
    commands: [],
  });

  const [triggerItem] = useCUDDataMutation();

  const selectedGoodId = useAppSelector(
    (state) =>
      state.withPersist.pages
        .find((p) => p.isActive)
        ?.pageData?.find((pd) => pd.name === "selectedGoodId")?.value
  );

  const {
    data,
    isLoading: isLoadingFormula,
    refetch: refetchFormula,
  } = useGetData<SPlanModel[], IRequest>({
    url: "/api/prd/select/splanFormula",
    body: { GoodId: selectedGoodId },
    skip: !selectedGoodId,
  });

  const {
    data: formulaResponse,
    isLoading: isLoadingItems,
    refetch: refetchItems,
  } = useGetData<ISPlanFormulaItemMinimal[], IRequest>({
    url: "/api/prd/select/getformula",
    body: { GoodsId: selectedGoodId },
    skip: !selectedGoodId,
  });

  const isLoadingAll = isLoadingFormula || isLoadingItems;

  useEffect(() => {
    if (!data || data.Result !== "Success") return;

    const list: SPlanModel[] = data.Data.map((item) => ({
      SPlanId: item.SPlanId,
      GoodId: item.GoodId,
      Version: item.Version,
      IsBase: item.IsBase,
      SPlanOpcs: (item.SPlanOpcs ?? []).map((x: any, index: number) => ({
        SPlanOpcId: x.SPlanOpcId,
        OperationName: x.OprationName,
        Order: index,
      })),
    }));

    const baseRow = list.find((x) => x.IsBase) || list[0];
    const versionRows = list.filter((x) => !x.IsBase);

    setBase(baseRow);
    setVersions(versionRows);

    const initial: any = {};
    (baseRow?.SPlanOpcs ?? []).forEach((op) => {
      initial[op.SPlanOpcId] = { SPlanOpcFormulaId: null, Items: {} };
      versionRows.forEach((v) => {
        initial[op.SPlanOpcId].Items[v.SPlanId] = {
          SPlanOpcFormulaItemId: null,
          SPlanOpcId: null,
          SPlanId: v.SPlanId,
        };
      });
    });

    if (formulaResponse?.Data) {
      formulaResponse.Data.forEach((item: any) => {
        const baseOpcId = item.SPlanOpcId;
        if (!initial[baseOpcId])
          initial[baseOpcId] = {
            SPlanOpcFormulaId: item.SPlanOpcFormulaId,
            Items: {},
          };
        initial[baseOpcId].SPlanOpcFormulaId =
          item.SPlanOpcFormulaId ?? initial[baseOpcId].SPlanOpcFormulaId;

        item.SplanFormulas.forEach((f: any) => {
          initial[baseOpcId].Items[f.SPlanId] = {
            SPlanOpcFormulaItemId: f.SPlanOpcFormulaItemId,
            SPlanOpcId: f.SPlanOpcId,
            SPlanId: f.SPlanId,
          };
        });
      });
    }

    setFormulaData(initial);

    const payload: PayloadBody = {
      commands: baseRow?.SPlanOpcs.map((i) => ({
        SPlanOpcFormulaId: initial[i.SPlanOpcId]?.SPlanOpcFormulaId ?? null,
        SPlanOpcId: i.SPlanOpcId,
        SPlanId: baseRow.SPlanId,
        Items: versionRows.map((v) => initial[i.SPlanOpcId].Items[v.SPlanId]),
      })),
    };
    setOriginalPayload(payload);
  }, [data, formulaResponse]);

  const handleSelect = (OpcId: number, verId: number, value: number | null) => {
    setFormulaData((prev: any) => ({
      ...prev,
      [OpcId]: {
        ...prev[OpcId],
        Items: {
          ...prev[OpcId].Items,
          [verId]: {
            ...prev[OpcId].Items[verId],
            SPlanOpcId: value,
          },
        },
      },
    }));
  };

  const columns: ColumnsType<any> = [
    {
      title: base?.Version,
      dataIndex: "baseOperation",
      width: 200,
      align: "center",
      onHeaderCell: () => ({
        className: "custom-header-cell",
        style: {
          height: 55,
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        } as React.CSSProperties,
      }),
    },
    ...versions.map((v, index) => ({
      title: v.Version,
      dataIndex: `version-${v.SPlanId}`,
      width: 180,
      onHeaderCell: () => ({
        className: "custom-header-cell",
        style: {
          height: 55,
          textAlign: "center",
        } as React.CSSProperties,
      }),
      onCell: () => ({
        style: {
          height: 55,
          position: "relative",
          paddingRight: 32,
        } as React.CSSProperties,
      }),
      render: (_: any, row: any) => (
        <div className="relative">
          <Select
            suffixIcon={false}
            className="flex justify-center text-center"
            placeholder="انتخاب عملیات"
            value={formulaData[row.opId]?.Items[v.SPlanId]?.SPlanOpcId ?? null}
            options={[
              { value: null },
              ...(v.SPlanOpcs ?? []).map((o) => ({
                label: o.OperationName,
                value: o.SPlanOpcId,
              })),
            ]}
            onChange={(value) => handleSelect(row.opId, v.SPlanId, value)}
          />

          {index !== 0 && (
            <span className="top-1/2 -right-1 z-10 absolute -translate-y-1/2 translate-x-1/2 cursor-pointer">
              <PlusIcon config={{ width: 20, height: 20 }} />
            </span>
          )}
        </div>
      ),
    })),
  ];

  const dataSource = (base?.SPlanOpcs ?? [])
    .sort((a, b) => a.Order - b.Order)
    .map((op) => ({
      key: op.SPlanOpcId,
      opId: op.SPlanOpcId,
      baseOperation: op.OperationName,
    }));

  const createDiffPayload = (original: PayloadBody, updated: PayloadBody) => {
    const result: PayloadBody["commands"] = [];

    updated.commands.forEach((newCmd) => {
      const oldCmd = original.commands.find(
        (c) => c.SPlanOpcId === newCmd.SPlanOpcId
      );
      if (!oldCmd) return;

      const changedItems = newCmd.Items.filter((newItem) => {
        const oldItem = oldCmd.Items.find((i) => i.SPlanId === newItem.SPlanId);
        return oldItem && oldItem.SPlanOpcId !== newItem.SPlanOpcId;
      });

      if (changedItems.length > 0) {
        result.push({
          SPlanOpcFormulaId: newCmd.SPlanOpcFormulaId,
          SPlanOpcId: newCmd.SPlanOpcId,
          SPlanId: newCmd.SPlanId,
          Items: changedItems,
        });
      }
    });

    return { commands: result };
  };

  const handleSave = async () => {
    const payload: PayloadBody = {
      commands: Object.keys(formulaData).map((opId) => ({
        SPlanOpcFormulaId: formulaData[Number(opId)].SPlanOpcFormulaId ?? null,
        SPlanOpcId: Number(opId),
        SPlanId: base!.SPlanId,
        Items: Object.values(formulaData[Number(opId)].Items),
      })),
    };

    const diffPayload = createDiffPayload(OriginalPayload, payload);

    const res: any = await triggerItem({
      url: "/api/prd/insert/splanopcformula",
      body: diffPayload,
    });

    if (res?.data?.Result === "Success") {
      showSuccessToast("با موفقیت ذخیره شد");
      await Promise.all([refetchFormula(), refetchItems()]);
    } else {
      showErrorToast(res?.data?.Message);
    }

    onCloseModal();
  };

  return (
    <div className="relative rounded-lg w-full h-full overflow-hidden">
      {isLoadingAll ? (
        <div className="rounded-lg !w-[1000px] !max-w-[1000px] lg:h-[500px]">
          <span className="flex justify-center items-center w-full h-full">
            در حال بارگذاری...
          </span>
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          bordered
          scroll={{ x: "max-content", y: 390 }}
          className="my-custom-table no-top-border w-full"
          tableLayout="fixed"
          footer={() => (
            <div className="flex justify-end rounded-lg">
              {" "}
              <CustomButton
                onClick={handleSave}
                disabled={disabled}
                className="bg-main-black disabled:opacity-40 px-12 py-2 rounded text-white"
              >
                {" "}
                ثبت{" "}
              </CustomButton>{" "}
            </div>
          )}
        />
      )}
    </div>
  );
};

export default FormulaMakerContent;
