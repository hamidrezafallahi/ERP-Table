import { FC } from "react";

import {
  EndYearOperationsPage,
  FinalizeVoucherPage,
  SortingVoucherPage,
  TafsiliType,
  Voucher,
} from "@components/organisms/accounting";
import { InventoryVoucherForm } from "@components/organisms/inventoryVoucher/form";
import { Patterns, ReportForm } from "@components/organisms/managementSystem";
import {
  AdvancedBankDeposit,
  AdvancedBankWithdrawal,
} from "@components/organisms/receiptAndPayment/bank";
import {
  AdvancedCashDeposit,
  AdvancedCashWithdrawal,
} from "@components/organisms/receiptAndPayment/cash";
import {
  AdvancedCashFundDeposit,
  AdvancedCashFundWithdrawal,
} from "@components/organisms/receiptAndPayment/cashFund";
import {
  ChequeIssuance,
  ChequeReceipt,
} from "@components/organisms/receiptAndPayment/cheque";
import {
  BillsSalesInvoice,
  BuyRequest,
  ContractingAgreementSalesInvoice,
  Discount,
  ExportSalesInvoice,
  InsuranceServiceWithBuyerSalesInvoice,
  InsuranceServiceWithoutBuyerSalesInvoice,
  JewelryWithBuyerSalesInvoice,
  JewelryWithoutBuyerSalesInvoice,
  LandingBillSalesInvoice,
  PlaneTicketSalesInvoice,
  PricingCircular,
  ReturnSalesInvoice,
  SalesCircular,
  SellingCurrencySalesInvoice,
  SellWithCustomerSalesInvoice,
  SellWithoutCustomerSalesInvoice,
  StandardSalesInvoice,
  StockExchangeSalesInvoice,
} from "@components/organisms/salesAndPurchase";
import { YearPlan } from "@components/organisms/yearPlan";
import SaleFactorCheckout from "@components/templates/saleFactorCheckout";
import TypeOfInventoryVoucher from "@components/templates/typeOfInventoryVoucher";

export const componentsMap: Record<string, FC<any>> = {
  TypeOfInventoryVoucher,
  Voucher,
  AdvancedBankDeposit,
  AdvancedBankWithdrawal,
  AdvancedCashDeposit,
  AdvancedCashWithdrawal,
  AdvancedCashFundDeposit,
  AdvancedCashFundWithdrawal,
  TafsiliType,
  ChequeReceipt,
  ChequeIssuance,
  SaleFactorCheckout,
  ReturnSalesInvoice,
  InventoryVoucherForm,
  Discount,
  PricingCircular,
  SalesCircular,
  ReportForm,
  StandardSalesInvoice,
  BillsSalesInvoice,
  ContractingAgreementSalesInvoice,
  ExportSalesInvoice,
  InsuranceServiceWithoutBuyerSalesInvoice,
  InsuranceServiceWithBuyerSalesInvoice,
  JewelryWithBuyerSalesInvoice,
  JewelryWithoutBuyerSalesInvoice,
  LandingBillSalesInvoice,
  PlaneTicketSalesInvoice,
  SellWithoutCustomerSalesInvoice,
  SellingCurrencySalesInvoice,
  StockExchangeSalesInvoice,
  SellWithCustomerSalesInvoice,
  BuyRequest,
  YearPlan,
  Patterns,
  FinalizeVoucherPage,
  SortingVoucherPage,
  EndYearOperationsPage,
};
