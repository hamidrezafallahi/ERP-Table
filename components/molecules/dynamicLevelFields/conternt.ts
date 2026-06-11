import { Level4TypeEnum } from "./enum";

export const voucherTypeToLevel4Type: Record<number, Level4TypeEnum> = {
  70001: Level4TypeEnum.Person,
  70002: Level4TypeEnum.BankAccount,
  70003: Level4TypeEnum.Tankhahdar,
  6037: Level4TypeEnum.Cashier,
};

interface levelFieldMapProps {
  level4Type: Level4TypeEnum;
  voucherTypeId?: number;
}

export const levelFieldMap = (props: levelFieldMapProps) => {
  const { level4Type, voucherTypeId } = props;

  const resolvedLevel4Type =
    voucherTypeId !== undefined
      ? (voucherTypeToLevel4Type[voucherTypeId] ?? level4Type)
      : level4Type;

  const titles: Record<Level4TypeEnum, string> = {
    [Level4TypeEnum.BankAccount]: "حساب بانکی",
    [Level4TypeEnum.Cashier]: "صندوق",
    [Level4TypeEnum.Person]: "اشخاص/شرکت",
    [Level4TypeEnum.Tankhahdar]: "تنخواه دار",
  };
  const dynamicTitle =
    resolvedLevel4Type !== undefined
      ? titles[resolvedLevel4Type]
      : "انتخاب سطح 4";

  return [
    {
      conditionKey: "HasTafsili",
      name: "TafsiliId",
      label: `${dynamicTitle}`,
      caption: "سطح 4",
      configKey: "level4Config",
    },
    {
      conditionKey: "HasFifth",
      name: "FifthId",
      label: "سطح 5",
      caption: "سطح 5",
      configKey: "level5Config",
    },
    {
      conditionKey: "HasSixth",
      name: "SixthId",
      label: "سطح 6",
      caption: "سطح 6",
      configKey: "level6Config",
    },
    {
      conditionKey: "HasSeventh",
      name: "SeventhId",
      label: "سطح 7",
      caption: "سطح 7",
      configKey: "level7Config",
    },
    {
      conditionKey: "HasEight",
      name: "EightId",
      label: "سطح 8",
      caption: "سطح 8",
      configKey: "level8Config",
    },
    {
      conditionKey: "HasNine",
      name: "NineId",
      label: "سطح 9",
      caption: "سطح 9",
      configKey: "level9Config",
    },
    {
      conditionKey: "HasTen",
      name: "TenId",
      label: "سطح 10",
      caption: "سطح 10",
      configKey: "level10Config",
    },
    {
      conditionKey: "HasEleven",
      name: "ElevenId",
      label: "سطح 11",
      caption: "سطح 11",
      configKey: "level11Config",
    },
    {
      conditionKey: "HasTwelve",
      name: "TwelveId",
      label: "سطح 12",
      caption: "سطح 12",
      configKey: "level12Config",
    },
    {
      conditionKey: "HasThirteen",
      name: "ThirteenId",
      label: "سطح 13",
      caption: "سطح 13",
      configKey: "level13Config",
    },
  ] as const;
};
