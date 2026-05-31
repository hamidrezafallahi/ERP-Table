"use client";

import React from 'react';

import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import {
  LeftChevron,
  WonderIcon,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import {
  setIsEditing,
  setStep,
} from '@slice/account';

interface Props {
  onSave: () => void;
}

const FinalReviewStep: React.FC<Props> = ({ onSave }) => {
  const dispatch = useDispatch();

const {
  mobile,
  password,
  packageType,
  industryType,
  warehouses,
  funds,
  companies,
  currency,
  name,
  fullName,
} = useAppSelector(
  (state) => ({
    mobile: state.withPersist.account.mobile,
    password: state.withPersist.account.password,
    packageType: state.withPersist.account.packageType,
    industryType: state.withPersist.account.industryType,
    warehouses: state.withPersist.account.warehouses,
    funds: state.withPersist.account.funds,
    companies: state.withPersist.account.companies,
    currency: state.withPersist.account.currency,
    name: state.withPersist.account.name,
    fullName: state.withPersist.account.fullName,
  }),
  shallowEqual
);

  const handleEdit = (step: number, editing: number) => {
    dispatch(setIsEditing(editing));
    dispatch(setStep(step));
  };

  return (
    <div
      className="bg-white shadow-md mx-auto p-6 rounded-xl max-w-3xl max-h-screen"
      dir="rtl"
    >
      <h2 className="mb-3 font-bold text-xl text-center">
        بررسی و تأیید اطلاعات
      </h2>

      <div className="flex justify-center items-center gap-1">
        <WonderIcon />
        <p className="mb-1 text-gray-500 text-sm text-center">
          در صورت نیاز به اصلاح می‌توانید با کلیک بر روی هر ردیف، اطلاعات مربوط
          به همان قسمت را ویرایش کرده
        </p>
      </div>
      <p className="mb-2 text-gray-500 text-sm text-center">
        و سپس به این صفحه بازگردید.
      </p>

      <div className="space-y-2">
        <ReviewItem
          label="شماره موبایل"
          value={mobile}
          onEdit={() => handleEdit(1, 1)}
        />
        <ReviewItem
          label="نام و نام خانوادگی"
          value={`${name} ${fullName}`}
          onEdit={() => handleEdit(3, 3)}
          isArray
        />
        <ReviewItem
          label="رمز عبور"
          value={password ? "•".repeat(password.length) : ""}
          onEdit={() => handleEdit(4, 4)}
        />
        <ReviewItem
          label="نوع پکیج"
          value={packageType}
          onEdit={() => handleEdit(5, 5)}
        />
        <ReviewItem
          label="نوع صنعت"
          value={industryType}
          onEdit={() => handleEdit(6, 6)}
        />
        <ReviewItem
          label="شرکت‌ها"
          value={companies}
          onEdit={() => handleEdit(7, 7)}
          isArray
          styled
        />
        <ReviewItem
          label="مدیریت انبارها"
          value={warehouses}
          onEdit={() => handleEdit(8, 8)}
          isArray
          styled
        />
        <ReviewItem
          label="صندوق‌ها"
          value={funds}
          onEdit={() => handleEdit(9, 9)}
          isArray
          styled
        />
        <ReviewItem
          label="مدیریت ارز"
          value={currency}
          onEdit={() => handleEdit(10, 10)}
          isArray
          styled
        />
      </div>

      <div className="flex justify-center w-full">
        <CustomButton
          className="flex justify-center bg-blue-blue mt-5 px-5 py-5 rounded-lg w-1/3 font-medium text-white text-nowrap"
          onClick={onSave}
        >
          ذخیره
        </CustomButton>
      </div>
    </div>
  );
};

interface ReviewItemProps {
  label: string;
  value?: string | string[];
  onEdit: () => void;
  styled?: boolean;
  isArray?: boolean;
}

const ReviewItem: React.FC<ReviewItemProps> = ({
  label,
  value,
  onEdit,
  styled = false,
  isArray = false,
}) => {
  const renderValue = () => {
    if (Array.isArray(value) && isArray) {
      return value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <span
              key={index}
              className={`rounded-lg text-gray-gray95 text-sm ${
                styled ? "bg-gray-gray5 px-2 py-1" : ""
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-gray-400">—</span>
      );
    }

    return (
      <span
        className={`rounded-lg text-gray-gray95 text-sm ${
          styled ? "bg-gray-gray5 px-2 py-1" : ""
        }`}
      >
        {value || "—"}
      </span>
    );
  };

  return (
    <div className="flex justify-center w-full">
      <div
        className="flex justify-between items-center bg-gray-gray5 px-4 py-3 rounded-lg w-3/4"
        dir="rtl"
      >
        <div className="flex justify-between items-start gap-7 w-full">
          <span className="font-medium text-gray-gray7 text-l whitespace-nowrap">
            {label}
          </span>
          <div className="flex flex-wrap flex-1 gap-2">{renderValue()}</div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onEdit} className="flex justify-end items-center">
            <LeftChevron />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalReviewStep;
