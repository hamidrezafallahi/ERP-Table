import { PageStateEnum } from "@slice/pages/enum";
import { SystemEnum } from "@type/enum";

export const mainCardConfig = [
  {
    label: "جمع فاکتور های دریافتی امروز",
    id: "جمع فاکتور های دریافتی امروز",
    value: -18.24,
    price: 76500200,
  },
  {
    label: "جمع فاکتور های پرداختی امروز",
    id: "جمع فاکتور های پرداختی امروز",
    value: +18.24,
    price: 1749000,
  },
  {
    label: "کل پرداخت ورودی",
    id: "کل پرداخت ورودی",
    value: 0,
    price: 53247500,
  },
  {
    label: "کل پرداخت خروجی",
    id: "کل پرداخت خروجی",
    value: 18.24,
    price: 32754000,
  },
];

export const documentInfoConfig = {
  title: "عملیات اسناد",
  actions: [
    {
      // icon: Icons["ChequeIssuing"],
      label: "chequeReceipt",
      record: 179,
      formUrl: `trh/chequeReceipt`,
      formRepoId: 3025,
      formSystemId: SystemEnum.trh,
      listUrl: `trh/chequeReceiptList`,
      listRepoId: 3025,
      listSystemId: SystemEnum.trh,
      recordUrl: `recordUrl`,
    },
    {
      // icon: Icons["ChequeReceive"],
      label: "chequeIssuance",
      record: 179,
      formUrl: `trh/chequeIssuance`,
      formRepoId: 3023,
      formSystemId: SystemEnum.trh,
      listUrl: `trh/chequeIssuanceList`,
      listRepoId: 3023,
      listSystemId: SystemEnum.trh,
      recordUrl: `recordUrl`,
    },
    {
      // icon: Icons["PromissoryIssuing"],
      label: "receivedChequeAction",
      record: 179,
      formUrl: null,
      formRepoId: 3024,
      formSystemId: SystemEnum.trh,
      listUrl: `trh/receivedChequeAction`,
      listRepoId: 3024,
      listSystemId: SystemEnum.trh,
      recordUrl: `recordUrl`,
    },
    {
      // icon: Icons["PromissoryIssuing"],
      label: "notRegisteredReceivedCheque",
      record: 179,
      formUrl: null,
      formRepoId: 3026,
      formSystemId: SystemEnum.trh,
      listUrl: `trh/notRegisteredReceivedChequeList`,
      listRepoId: 3026,
      listSystemId: SystemEnum.trh,
      recordUrl: `recordUrl`,
    },
    {
      // icon: Icons["PromissoryIssuing"],
      label: "notRegisteredIssuanceCheque",
      record: 179,
      formUrl: null,
      formRepoId: 3022,
      formSystemId: SystemEnum.trh,
      listUrl: `trh/notRegisteredIssuanceChequeList`,
      listRepoId: 3022,
      listSystemId: SystemEnum.trh,
      recordUrl: `recordUrl`,
    },
  ],
};

export const cashFundInfoConfig = {
  title: "عملیات تنخواه",
  actions: [
    {
      //   icon: Icons["TransferToBank"],
      label: "cashFundWithdrawal",
      record: 179,
      formUrl: `trh/cashFundWithdrawal`,
      formRepoId: 3017,
      formSystemId: SystemEnum.trh,
      listUrl: `trh/cashFundWithdrawalList`,
      listRepoId: 3017,
      listSystemId: SystemEnum.trh,
      recordUrl: `recordUrl`,
      // type: ProfileImg,
      url: "https://cdn.balkan.app/shared/2.jpg",
    },
    {
      // icon: Icons["TransferToBank"],
      label: "cashFundDeposit",
      record: 248,
      formUrl: `trh/cashFundDeposit`,
      formRepoId: 3016,
      formSystemId: SystemEnum.trh,
      listUrl: `trh/cashFundDepositList`,
      listRepoId: 3016,
      listSystemId: SystemEnum.trh,
      recordUrl: `recordUrl`,
    },
  ],
};
export const cashInfoConfig = {
  title: "عملیات نقد و صندوق",
  actions: [
    {
      //   icon: Icons["PaymentFromTheFund"],
      label: "cashWithdrawal",
      record: 179,
      formUrl: `trh/cashWithdrawal`,
      formRepoId: 3019,
      formSystemId: SystemEnum.trh,
      listUrl: `trh/cashWithdrawalList`,
      listRepoId: 3019,
      listSystemId: SystemEnum.trh,
      recordUrl: `recordUrl`,
    },
    {
      //   icon: Icons["CashReceipt"],
      label: "cashDeposit",
      record: 248,
      formUrl: `trh/cashDeposit`,
      formRepoId: 3018,
      formSystemId: SystemEnum.trh,
      listUrl: `trh/cashDepositList`,
      listRepoId: 3018,
      listSystemId: SystemEnum.trh,
      recordUrl: `recordUrl`,
    },
  ],
};
export const bankInfoConfig = {
  title: "عملیات بانکی",
  actions: [
    {
      //   icon: Icons["Withdrawal"],
      label: "bankWithdrawal",
      record: 179,
      formUrl: `trh/bankWithdrawal`,
      formRepoId: 3020,
      formSystemId: SystemEnum.trh,
      listUrl: `trh/bankWithdrawalList`,
      listRepoId: 3020,
      listSystemId: SystemEnum.trh,
      recordUrl: `recordUrl`,
    },
    {
      //   icon: Icons["Deposit"],
      label: "bankDeposit",
      record: 248,
      formUrl: `trh/bankDeposit`,
      formRepoId: 3012,
      formSystemId: SystemEnum.trh,
      listUrl: `trh/bankDepositList`,
      listRepoId: 3012,
      listSystemId: SystemEnum.trh,
      recordUrl: `recordUrl`,
    },
    {
      label: "bankStatementInfo",
      // icon: Icons["Deposit"],
      record: 248,
      listUrl: `trh/bankStatementInfo`,
      // listRepoId: 3012,
      recordUrl: `recordUrl`,
      listRepoId: 12,
      listSystemId: SystemEnum.trh,
      data: {},
      originalPageState: PageStateEnum.Opened,
      pageState: PageStateEnum.Opened,
      caption: "caption",
      captionII: `captionII`,
    },
  ],
};

export const stateConfig = [
  {
    title: "نزد بانک",
    value: 1,
  },
  {
    title: "نزد صندوق",
    value: 2,
  },
  {
    title: "وصول شده",
    value: 3,
  },
  {
    title: "نزد شخص",
    value: 4,
  },
  {
    title: "نزد تنخواه",
    value: 5,
  },
  {
    title: "استرداد شده",
    value: 6,
  },
];

export const isRegisteredConfig = [
  {
    title: "✘",
    value: 0,
  },
  {
    title: "✔",
    value: 1,
  },
];
