import { ChangeEvent, useEffect, useState } from "react";

import { useTranslations } from "next-intl";

import { CustomSelect, DynamicSelect } from "@components/atoms/defaultElements";
import CustomInputNumber from "@components/atoms/defaultElements/inputNumber";
import InputText from "@components/atoms/defaultElements/inputText";
import { IVoucherDetails } from "@services/acc/voucherDetails/type";
import { RowStateEnum } from "@services/generalType/type";

export const EditRowForm = ({
  index,
  dispatchDetailData,
  detailData,
  findOptionWithTitle,
  selectAccountData,
  accountData,
  handleSave,
}) => {
  const t = useTranslations();
  const [account, setAccount] = useState(null);

  const data = detailData[index];

  const onSelectChange = (
    newValue,
    field: string,
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
  const onTextChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: string,
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
    value: any,
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

  const onDynamicSelectChange = (newValue, field: string, index: number) => {
    const updatedRow = {
      index,
      data: {
        [field]: newValue,
      },
    };

    dispatchDetailData({
      type: "UPDATE_ROW",
      payload: updatedRow,
    });
  };

  useEffect(() => {
    if (data.AccountId) {
      const correctAccount = accountData.find(
        (item) => item.AccountId === data?.AccountId
      );
      setAccount(correctAccount);
    }
  }, [data?.AccountId]);

  return (
    <div className="flex flex-col justify-between gap-2 p-2 w-full h-[95%]">
      <div className="flex flex-col justify-center gap-2 w-full overflow-auto">
        <div className="flex flex-col gap-2">
          <span>سرفصل حساب</span>
          <CustomSelect
            className="w-fit"
            showSearch
            allowClear
            popupMatchSelectWidth={400}
            value={data?.AccountId ?? undefined}
            placeholder={t("general.search")}
            filterOption={(input, option) => {
              const label = option?.label;
              return (
                typeof label === "string" &&
                label.toLowerCase().includes(input.toLowerCase())
              );
            }}
            options={selectAccountData}
            onChange={(newValue) =>
              onSelectChange(newValue, "AccountId", index, data)
            }
            onSearch={(value) => {
              const correctOption = findOptionWithTitle(
                selectAccountData,
                value
              );

              if (correctOption.length === 1) {
                onSelectChange(
                  correctOption[0].value,
                  "AccountId",
                  index,
                  data
                );
              }
            }}
          />
        </div>

        {data.AccountId && (
          <>
            {account?.HasTafsili && (
              <div className="flex flex-col gap-2">
                <span>سطح 4</span>
                <DynamicSelect
                  showId
                  infinite
                  dynamicValue={{
                    endpoint: "/api/acc/select/tafsiliLevel4",
                    repoViewId: 10017,
                    AccountId: data.AccountId,
                  }}
                  showSearch
                  allowClear
                  popupMatchSelectWidth={400}
                  value={data.TafsiliId ? data.TafsiliId : undefined}
                  onChange={(newValue) =>
                    onDynamicSelectChange(newValue, "TafsiliId", index)
                  }
                  onSearchPhrase={(correctOption) =>
                    onDynamicSelectChange(correctOption, "TafsiliId", index)
                  }
                />
              </div>
            )}
            {account?.HasFifth && (
              <div className="flex flex-col gap-2">
                <span>سطح 5</span>
                <DynamicSelect
                  showId
                  infinite
                  dynamicValue={{
                    endpoint: "/api/acc/select/tafsiliLevel5",
                    AccountId: data.AccountId,
                  }}
                  showSearch
                  allowClear
                  popupMatchSelectWidth={400}
                  value={data.FifthId ? data.FifthId : undefined}
                  onChange={(newValue) =>
                    onDynamicSelectChange(newValue, "FifthId", index)
                  }
                  onSearchPhrase={(correctOption) =>
                    onDynamicSelectChange(correctOption, "FifthId", index)
                  }
                />
              </div>
            )}
            {account?.HasSixth && (
              <div className="flex flex-col gap-2">
                <span>سطح 6</span>
                <DynamicSelect
                  showId
                  infinite
                  dynamicValue={{
                    endpoint: "/api/acc/select/tafsiliLevel6",
                    AccountId: data.AccountId,
                  }}
                  showSearch
                  allowClear
                  popupMatchSelectWidth={400}
                  value={data.SixthId ? data.SixthId : undefined}
                  onChange={(newValue) =>
                    onDynamicSelectChange(newValue, "SixthId", index)
                  }
                  onSearchPhrase={(correctOption) =>
                    onDynamicSelectChange(correctOption, "SixthId", index)
                  }
                />
              </div>
            )}
            {account?.HasSeventh && (
              <div className="flex flex-col gap-2">
                <span>سطح 7</span>
                <DynamicSelect
                  showId
                  infinite
                  dynamicValue={{
                    endpoint: "/api/acc/select/tafsiliLevel7",
                    AccountId: data.AccountId,
                  }}
                  showSearch
                  allowClear
                  popupMatchSelectWidth={400}
                  value={data.SeventhId ? data.SeventhId : undefined}
                  onChange={(newValue) =>
                    onDynamicSelectChange(newValue, "SeventhId", index)
                  }
                  onSearchPhrase={(correctOption) =>
                    onDynamicSelectChange(correctOption, "SeventhId", index)
                  }
                />
              </div>
            )}
            {account?.HasEight && (
              <div className="flex flex-col gap-2">
                <span>سطح 8</span>
                <DynamicSelect
                  showId
                  infinite
                  dynamicValue={{
                    endpoint: "/api/acc/select/tafsiliLevel8",
                    AccountId: data.AccountId,
                  }}
                  showSearch
                  allowClear
                  popupMatchSelectWidth={400}
                  value={data.EightId ? data.EightId : undefined}
                  onChange={(newValue) =>
                    onDynamicSelectChange(newValue, "EightId", index)
                  }
                  onSearchPhrase={(correctOption) =>
                    onDynamicSelectChange(correctOption, "EightId", index)
                  }
                />
              </div>
            )}
            {account?.HasNine && (
              <div className="flex flex-col gap-2">
                <span>سطح 9</span>
                <DynamicSelect
                  showId
                  infinite
                  dynamicValue={{
                    endpoint: "/api/acc/select/tafsiliLevel9",
                    AccountId: data.AccountId,
                  }}
                  showSearch
                  allowClear
                  popupMatchSelectWidth={400}
                  value={data.NineId ? data.NineId : undefined}
                  onChange={(newValue) =>
                    onDynamicSelectChange(newValue, "NineId", index)
                  }
                  onSearchPhrase={(correctOption) =>
                    onDynamicSelectChange(correctOption, "NineId", index)
                  }
                />
              </div>
            )}
            {account?.HasTen && (
              <div className="flex flex-col gap-2">
                <span>سطح 10</span>
                <DynamicSelect
                  showId
                  infinite
                  dynamicValue={{
                    endpoint: "/api/acc/select/tafsiliLevel10",
                    AccountId: data.AccountId,
                  }}
                  showSearch
                  allowClear
                  popupMatchSelectWidth={400}
                  value={data.TenId ? data.TenId : undefined}
                  onChange={(newValue) =>
                    onDynamicSelectChange(newValue, "TenId", index)
                  }
                  onSearchPhrase={(correctOption) =>
                    onDynamicSelectChange(correctOption, "TenId", index)
                  }
                />
              </div>
            )}
            {account?.HasEleven && (
              <div className="flex flex-col gap-2">
                <span>سطح 11</span>
                <DynamicSelect
                  showId
                  infinite
                  dynamicValue={{
                    endpoint: "/api/acc/select/tafsiliLevel11",
                    AccountId: data.AccountId,
                  }}
                  showSearch
                  allowClear
                  popupMatchSelectWidth={400}
                  value={data.ElevenId ? data.ElevenId : undefined}
                  onChange={(newValue) =>
                    onDynamicSelectChange(newValue, "ElevenId", index)
                  }
                  onSearchPhrase={(correctOption) =>
                    onDynamicSelectChange(correctOption, "ElevenId", index)
                  }
                />
              </div>
            )}
            {account?.HasTwelve && (
              <div className="flex flex-col gap-2">
                <span>سطح 12</span>
                <DynamicSelect
                  showId
                  infinite
                  dynamicValue={{
                    endpoint: "/api/acc/select/tafsiliLevel12",
                    AccountId: data.AccountId,
                  }}
                  showSearch
                  allowClear
                  popupMatchSelectWidth={400}
                  value={data.TwelveId ? data.TwelveId : undefined}
                  onChange={(newValue) =>
                    onDynamicSelectChange(newValue, "TwelveId", index)
                  }
                  onSearchPhrase={(correctOption) =>
                    onDynamicSelectChange(correctOption, "TwelveId", index)
                  }
                />
              </div>
            )}
            {account?.HasThirteen && (
              <div className="flex flex-col gap-2">
                <span>سطح 13</span>
                <DynamicSelect
                  showId
                  infinite
                  dynamicValue={{
                    endpoint: "/api/acc/select/tafsiliLevel13",
                    AccountId: data.AccountId,
                  }}
                  showSearch
                  allowClear
                  popupMatchSelectWidth={400}
                  value={data.ThirteenId ? data.ThirteenId : undefined}
                  onChange={(newValue) =>
                    onDynamicSelectChange(newValue, "ThirteenId", index)
                  }
                  onSearchPhrase={(correctOption) =>
                    onDynamicSelectChange(correctOption, "ThirteenId", index)
                  }
                />
              </div>
            )}
          </>
        )}

        <div className="flex flex-col gap-2">
          <span>شرح سند</span>
          <InputText
            value={data.DetailDesc !== null ? data.DetailDesc : ""}
            onChange={(e) => {
              onTextChange(e, "DetailDesc", index);
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span>بستانکار</span>
          <CustomInputNumber
            controls={false}
            prefix=""
            min={0}
            keyboard={false}
            parser={(value) =>
              value?.replace(/\$\s?|(,*)/g, "") as unknown as number
            }
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            value={data.Bed !== null ? data.Bed : 0}
            onChange={(value) => {
              onNumberChangeDebtorCreditor(value, "Bed", index);
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span>بدهکار</span>
          <CustomInputNumber
            controls={false}
            prefix=""
            min={0}
            keyboard={false}
            parser={(value) =>
              value?.replace(/\$\s?|(,*)/g, "") as unknown as number
            }
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            value={data.Bes !== null ? data.Bes : 0}
            onChange={(value) => {
              onNumberChangeDebtorCreditor(value, "Bes", index);
            }}
          />
        </div>
      </div>
      <div className="flex justify-center">
        <span
          onClick={() => handleSave()}
          className="bg-black-black95 p-2 border rounded w-full text-white text-center"
        >
          ذخیره
        </span>
      </div>
    </div>
  );
};
