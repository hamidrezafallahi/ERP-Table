"use client";
import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@redux/index";
import { setVerifyExpireTime } from "@slice/account";

interface StopWatchProps {
  onFinish: () => void;
}

const StopWatch = ({ onFinish }: StopWatchProps) => {
  const dispatch = useAppDispatch();
  const verifyExpireTime = useAppSelector(
    (state) => state.withPersist.account.verifyExpireTime
  );
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  const DURATION = 2 * 60 * 1000; // 2 دقیقه

  useEffect(() => {
    let expireTime = verifyExpireTime;

    if (typeof expireTime !== "number" || isNaN(expireTime)) {
      expireTime = Date.now() + DURATION;
      dispatch(setVerifyExpireTime(expireTime));
    }

    const timer = setInterval(() => {
      const diff = Math.floor((expireTime! - Date.now()) / 1000);
      if (diff <= 0) {
        setRemainingSeconds(0);
        onFinish();
        clearInterval(timer);
      } else {
        setRemainingSeconds(diff);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [verifyExpireTime, dispatch, onFinish]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return <span>{formatTime(remainingSeconds)} تا ارسال مجدد کد</span>;
};

export default StopWatch;
