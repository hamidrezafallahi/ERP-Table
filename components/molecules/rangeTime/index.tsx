import React, { useState } from 'react';

import { MenuProps } from 'antd';
import moment from 'moment-jalaali';
import { Mask } from 'react-persian-range-picker';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomDropdownButton } from '@components/atoms/defaultElements';
import { ArrowDownIcon } from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { setDuration } from '@slice/container';

interface RangeMenuItem {
  key: string;
  label: string;
  defaultValue?: {
    from: number | string | Date;
    to: number | string | Date;
  };
}

export default function RangeTime() {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState("هفتگی");

  const { match, duration, locale } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    const duration = state.withoutPersist.container.duration;
    const locale = state.withPersist.config.lang;
    return { match, duration, locale };
  }, shallowEqual);
  const items: RangeMenuItem[] = [
    {
      key: "weekly",
      label: "هفتگی",
      defaultValue: {
        from:
          locale === "fa"
            ? moment()
                .locale(locale)
                .clone()
                .startOf("day")
                .subtract(6, "day")
                .valueOf()
            : moment()
                .utc()
                .clone()
                .startOf("day")
                .subtract(6, "day")
                .valueOf(),
        to:
          locale === "fa"
            ? moment().locale(locale).clone().endOf("day").valueOf()
            : moment().utc().clone().endOf("day").valueOf(),
      },
    },
    {
      key: "monthly",
      label: "ماهانه",
      defaultValue: {
        from:
          locale === "fa"
            ? moment()
                .locale(locale)
                .clone()
                .startOf("day")
                .subtract(1, "jMonth")
                .valueOf()
            : moment()
                .utc()
                .clone()
                .startOf("day")
                .subtract(1, "month")
                .valueOf(),
        to:
          locale === "fa"
            ? moment().locale(locale).clone().endOf("day").valueOf()
            : moment().utc().clone().endOf("day").valueOf(),
      },
    },
    {
      key: "yearly",
      label: "سالانه",
      defaultValue: {
        from:
          locale === "fa"
            ? moment()
                .locale(locale)
                .clone()
                .startOf("day")
                .subtract(1, "jYear")
                .valueOf()
            : moment()
                .utc()
                .clone()
                .startOf("day")
                .subtract(1, "year")
                .valueOf(),
        to:
          locale === "fa"
            ? moment().locale(locale).clone().endOf("day").valueOf()
            : moment().utc().clone().endOf("day").valueOf(),
      },
    },
  ];

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    const found = items.find((it) => it.key === e.key);
    if (found) {
      setSelected(found.label);
      dispatch(
        setDuration({
          from: found.defaultValue.from,
          to: found.defaultValue.to,
        })
      );
    }
  };

  return (
    <>
      {match ? (
        <div className="flex justify-between items-center w-full h-full">
          <h3 className="font-medium text-gray-gray10 text-sm truncate">
            انتخاب بازه زمانی داده ها
          </h3>

          <MaskPicker />
          <CustomDropdownButton
            items={items.map((it) => ({
              key: it.key,
              label: it.label,
              onClick: handleMenuClick,
            }))}
            trigger={["click"]}
          >
            <div className="flex justify-center items-center gap-2 bg-gray-gray3 p-2 border border-none rounded-3xl w-[105px] h-9 text-gray-gray10 text-xs">
              <span>{selected}</span>
              <ArrowDownIcon />
            </div>
          </CustomDropdownButton>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-gray10 text-sm whitespace-nowrap">
              انتخاب بازه زمانی داده ها
            </h3>
            <CustomDropdownButton
              items={items.map((it) => ({
                key: it.key,
                label: it.label,
                onClick: handleMenuClick,
              }))}
              trigger={["click"]}
            >
              <div className="flex justify-center items-center gap-2 bg-gray-gray3 p-2 border-none rounded-3xl w-[105px] h-9 text-gray-gray10 text-xs">
                <span>{selected}</span>
                <ArrowDownIcon />
              </div>
            </CustomDropdownButton>
          </div>

          <div className="flex justify-center">
            <MaskPicker />
          </div>
        </div>
      )}
    </>
  );
}

const MaskPicker: React.FC = () => {
  const dispatch = useDispatch();
  const duration = useAppSelector(
    (state) => state.withoutPersist.container.duration
  );

  const handleChange = (val: number | string, name: "from" | "to") => {
    if (duration[name] !== val) {
      dispatch(setDuration({ ...duration, [name]: val }));
    }
  };

  return (
    <div className="flex justify-center items-center gap-3 px-2 py-1 rounded-3xl w-[250px] h-9 overflow-hidden">
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="text-gray-gray9 text-xs whitespace-nowrap">از</span>
        <Mask
          MaskFontStyle={{ color: "#6BA8EA", fontSize: 12 }}
          defaultValue={duration.from as any}
          onMaskChange={(e: number | string) => handleChange(e, "from")}
          Style={{ width: 70, background: "none" }}
        />
      </div>
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="text-gray-gray9 text-xs whitespace-nowrap">تا</span>
        <Mask
          MaskFontStyle={{ color: "#6BA8EA", fontSize: 12 }}
          defaultValue={duration.to as any}
          onMaskChange={(e: number | string) => handleChange(e, "to")}
          Style={{ width: 70, background: "none" }}
        />
      </div>
    </div>
  );
};
