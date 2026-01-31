"use client";

import React from "react";

import CardSelect from "@components/molecules/cardSelect";
import { useAppSelector } from "@redux/index";

export interface LicensePackage {
  id: number;
  title: string;
  description: string;
  price: number;
  button?: React.ReactNode;
  AccountingSoftware: boolean;
  SalesSoftware: boolean;
  TaxpayerSystem: boolean;
  TreasurySoftware: boolean;
  WarehousingSoftware: boolean;
  PayrollSoftware: boolean;
  PropertyAndAssetSoftware: boolean;
  ProductionSoftware: boolean;
  maxWarehouses: number;
}

interface CardsProps {
  selectedDuration: string;
}

const Cards: React.FC<CardsProps> = ({ selectedDuration }) => {
  const packageId = useAppSelector(
    (state) => state.withPersist.account.packageId
  );

  const durationMultipliers: Record<string, number> = {
    "یک ماهه": 1,
    "سه ماهه": 3,
    "شش ماهه": 6,
    "یک ساله": 12,
  };

  const fallbackPackages: LicensePackage[] = [
    {
      id: 1,
      title: "رایگان",
      description: "۱۰ فاکتور روزانه",
      price: 0,
      AccountingSoftware: true,
      SalesSoftware: false,
      TaxpayerSystem: false,
      TreasurySoftware: false,
      WarehousingSoftware: false,
      PayrollSoftware: false,
      PropertyAndAssetSoftware: false,
      ProductionSoftware: false,
      maxWarehouses: 3,
    },
    {
      id: 2,
      title: "لایت",
      description: "کسب و کارهای کوچک",
      price: 590000,
      AccountingSoftware: true,
      SalesSoftware: true,
      TaxpayerSystem: true,
      TreasurySoftware: true,
      WarehousingSoftware: true,
      PayrollSoftware: false,
      PropertyAndAssetSoftware: false,
      ProductionSoftware: true,
      maxWarehouses: 5,
    },
    {
      id: 3,
      title: "حرفه‌ای",
      description: "کسب و کارهای متوسط",
      price: 880000,
      AccountingSoftware: false,
      SalesSoftware: true,
      TaxpayerSystem: false,
      TreasurySoftware: true,
      WarehousingSoftware: true,
      PayrollSoftware: false,
      PropertyAndAssetSoftware: false,
      ProductionSoftware: true,
      maxWarehouses: 7,
    },
    {
      id: 4,
      title: "پیشرفته",
      description: "سازمان‌ها و کسب‌وکارهای بزرگ",
      price: 1180000,
      AccountingSoftware: true,
      SalesSoftware: true,
      TaxpayerSystem: false,
      TreasurySoftware: true,
      WarehousingSoftware: true,
      PayrollSoftware: false,
      PropertyAndAssetSoftware: false,
      ProductionSoftware: false,
      maxWarehouses: 10,
    },
  ];

  const packages = fallbackPackages.map((pkg) => ({
    ...pkg,
    price:
      pkg.price > 0 ? pkg.price * durationMultipliers[selectedDuration] : 0,
    description: `صورتحساب ${selectedDuration} / به‌ازای هر کاربر`,
  }));

  return (
    <section className="flex flex-col items-center gap-6 w-full">
      <div className="flex flex-wrap justify-center gap-4 w-full">
        {packages.map((item) => (
          <CardSelect
            key={item.id}
            item={{ ...item, ActiveCard: item.id === packageId }}
            showCheckbox
          />
        ))}
      </div>
    </section>
  );
};

export default Cards;
